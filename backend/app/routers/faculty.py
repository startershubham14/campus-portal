from datetime import datetime, timezone, date as date_type
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.connection import get_db
from app.database.models import (
    User, FacultyProfile, StudentProfile, ClassGroup,
    CourseMaterial, Assignment, Submission, Attendance, Exam, ExamResult,
)
from app.auth.dependencies import require_faculty 
from app.s3 import generate_presigned_upload_url, get_file_url, delete_file
from app.routers.faculty_schemas import (
    FacultyProfileOut, CourseOut, CourseDetailOut,
    MaterialOut, AssignmentOut, SubmissionOut,
    UploadMaterialRequest, LinkMaterialRequest, CreateAssignmentRequest,
    GradeSubmissionRequest, PresignRequest, PresignResponse,
    AttendanceRosterResponse, AttendanceRosterItem, SaveAttendanceRequest,
    AttendanceRosterResponse, AttendanceRosterItem, SaveAttendanceRequest,
    StudentAttendanceStat, ClassAttendanceSummary,
)
from app.routers.exam_schemas import (
    CreateExamRequest, SaveResultsRequest,
    ExamListItem, ResultRosterItem, ExamAnalytics, ExamRosterResponse,
)

router = APIRouter(prefix="/faculty", tags=["Faculty"])


# Dependency to resolve the logged-in user to their FacultyProfile

async def get_faculty_profile(
    current_user: User = Depends(require_faculty),
    db: AsyncSession = Depends(get_db),
) -> FacultyProfile:
    """
    Derives the FacultyProfile from the cookie. Every faculty endpoint
    uses this , a faculty member can only manage their own classes.
    """
    result = await db.execute(
        select(FacultyProfile).where(FacultyProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return profile


# GET /faculty/profile

@router.get("/profile", response_model=FacultyProfileOut)
async def get_profile(
    profile: FacultyProfile = Depends(get_faculty_profile),
):
    return FacultyProfileOut(
        id=profile.id,
        full_name=profile.full_name,
        employee_id=profile.employee_id,
        department=profile.department,
    )


# GET /faculty/courses

@router.get("/courses", response_model=list[CourseOut])
async def get_courses(
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """Returns only the classes this faculty member is assigned to."""
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()

    courses = []
    for cls in faculty.classes:
        # Count enrolled students per class
        count_result = await db.execute(
            select(func.count())
            .select_from(StudentProfile)
            .join(StudentProfile.classes)
            .where(ClassGroup.id == cls.id)
        )
        student_count = count_result.scalar() or 0
        courses.append(CourseOut(
            id=cls.id,
            code=cls.code,
            name=cls.name,
            department=cls.department,
            semester=cls.semester,
            student_count=student_count,
        ))
    return courses


# GET /faculty/courses/{class_id}

@router.get("/courses/{class_id}", response_model=CourseDetailOut)
async def get_course_detail(
    class_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns one class with its materials and assignments.
    Verifies the faculty member actually teaches this class.
    """
    # Verify assignment
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    assigned_ids = {cls.id for cls in faculty.classes}
    if class_id not in assigned_ids:
        raise HTTPException(status_code=403, detail="Not assigned to this class")

    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(
            selectinload(ClassGroup.materials),
            selectinload(ClassGroup.assignments).selectinload(Assignment.submissions),
        )
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    student_count_result = await db.execute(
        select(func.count())
        .select_from(StudentProfile)
        .join(StudentProfile.classes)
        .where(ClassGroup.id == class_id)
    )
    student_count = student_count_result.scalar() or 0

    return CourseDetailOut(
        id=cls.id,
        code=cls.code,
        name=cls.name,
        department=cls.department,
        semester=cls.semester,
        student_count=student_count,
        materials=[
            MaterialOut(
                id=m.id,
                title=m.title,
                # For S3 uploads, regenerate a fresh presigned GET URL on every
                # read - the stored one expires after 7 days. For links, the
                # stored URL is permanent so we use it as-is.
                file_url=get_file_url(m.object_key) if m.source_type == "upload" and m.object_key else m.file_url,
                source_type=m.source_type,
                uploaded_at=m.uploaded_at.isoformat() if m.uploaded_at else None,
            )
            for m in cls.materials
        ],
        assignments=[
            AssignmentOut(
                id=a.id,
                title=a.title,
                description=a.description,
                due_date=a.due_date.isoformat(),
                submission_count=len(a.submissions),
            )
            for a in cls.assignments
        ],
    )

# POST /faculty/courses/{class_id}/materials/presign  - Step 1: get upload URL

@router.post("/courses/{class_id}/materials/presign", response_model=PresignResponse)
async def presign_material_upload(
    class_id: int,
    payload: PresignRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 1 of 2 for file upload.

    Returns a presigned S3 PUT URL. The browser uses this URL to upload
    the file directly to S3 - the file bytes never pass through this server.

    Flow:
      1. Frontend calls this endpoint with filename + content_type
      2. Frontend PUTs the file to presigned_url (direct to S3)
      3. Frontend calls POST /materials/confirm with title + object_key
    """
    # Verify the faculty member teaches this class
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    if class_id not in {cls.id for cls in faculty.classes}:
        raise HTTPException(status_code=403, detail="Not assigned to this class")

    try:
        presigned_url, object_key = generate_presigned_upload_url(
            folder=f"materials/{payload.class_code.lower()}",
            filename=payload.filename,
            content_type=payload.content_type,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return PresignResponse(presigned_url=presigned_url, object_key=object_key)


# POST /faculty/courses/{class_id}/materials/confirm  - Step 2: save to DB

@router.post("/courses/{class_id}/materials/confirm", status_code=201)
async def confirm_material_upload(
    class_id: int,
    payload: UploadMaterialRequest,   # title + object_key
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 2 of 2 for file upload.

    Called after the browser has successfully PUT the file to S3.
    Generates a presigned GET URL for immediate viewing and stores
    everything in the DB.
    """
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    if class_id not in {cls.id for cls in faculty.classes}:
        raise HTTPException(status_code=403, detail="Not assigned to this class")

    # Generate a presigned GET URL for immediate access
    try:
        view_url = get_file_url(payload.object_key)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    material = CourseMaterial(
        title=payload.title,
        file_url=view_url,
        source_type="upload",
        object_key=payload.object_key,
        class_id=class_id,
        faculty_id=profile.id,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(material)
    await db.commit()
    return {"message": "Material saved", "id": material.id}


# POST /faculty/courses/{class_id}/materials/link - attach an external link

@router.post("/courses/{class_id}/materials/link", status_code=201)
async def add_link_material(
    class_id: int,
    payload: LinkMaterialRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Attach an external link (Google Drive, YouTube, etc) as a material.
    No S3 involvement - the URL is stored as-is and served unchanged.
    """
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    if class_id not in {cls.id for cls in faculty.classes}:
        raise HTTPException(status_code=403, detail="Not assigned to this class")

    material = CourseMaterial(
        title=payload.title,
        file_url=payload.url,
        source_type="link",
        object_key=None,        # no S3 object for links
        class_id=class_id,
        faculty_id=profile.id,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(material)
    await db.commit()
    return {"message": "Link added", "id": material.id}


# DELETE /faculty/materials/{material_id}

@router.delete("/materials/{material_id}")
async def delete_material(
    material_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Only the faculty member who uploaded the material can delete it.
    Checking faculty_id prevents one faculty from deleting another's files.
    """
    result = await db.execute(
        select(CourseMaterial).where(
            CourseMaterial.id == material_id,
            CourseMaterial.faculty_id == profile.id,
        )
    )
    material = result.scalars().first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found or not yours")

    # Delete the file from S3 before removing the DB record.
    # delete_file() is non-fatal - if S3 delete fails, the DB record
    # is still removed (orphaned S3 objects are preferable to stuck DB records).
    if material.object_key:
        delete_file(material.object_key)

    await db.delete(material)
    await db.commit()
    return {"message": "Material deleted"}


# POST /faculty/courses/{class_id}/assignments  - create assignment

@router.post("/courses/{class_id}/assignments", status_code=201)
async def create_assignment(
    class_id: int,
    payload: CreateAssignmentRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    # Verify assignment
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    if class_id not in {cls.id for cls in faculty.classes}:
        raise HTTPException(status_code=403, detail="Not assigned to this class")

    try:
        due_date = datetime.fromisoformat(payload.due_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format e.g. 2025-12-01")

    assignment = Assignment(
        title=payload.title,
        description=payload.description,
        due_date=due_date,
        class_id=class_id,
        faculty_id=profile.id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(assignment)
    await db.commit()
    return {"message": "Assignment created", "id": assignment.id}

# GET /faculty/assignments/{assignment_id}/submissions

@router.get("/assignments/{assignment_id}/submissions", response_model=list[SubmissionOut])
async def get_submissions(
    assignment_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all submissions for an assignment with student info.
    Only the faculty member who created the assignment can view these.
    """
    # Verify ownership
    result = await db.execute(
        select(Assignment).where(
            Assignment.id == assignment_id,
            Assignment.faculty_id == profile.id,
        )
    )
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or not yours")

    result = await db.execute(
        select(Submission)
        .where(Submission.assignment_id == assignment_id)
        .options(selectinload(Submission.student))
    )
    submissions = result.scalars().all()

    return [
        SubmissionOut(
            id=s.id,
            student_name=s.student.full_name,
            enrollment_no=s.student.enrollment_no,
            file_url=s.file_url,
            submitted_at=s.submitted_at.isoformat() if s.submitted_at else None,
            marks_awarded=s.marks_awarded,
            feedback=s.feedback,
        )
        for s in submissions
    ]


# PATCH /faculty/submissions/{submission_id}/grade

@router.patch("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    payload: GradeSubmissionRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Grade a submission. Verifies the submission belongs to an assignment
    created by this faculty member before allowing the grade to be set.
    """
    result = await db.execute(
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.assignment))
    )
    submission = result.scalars().first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Make sure this faculty owns the assignment the submission belongs to
    if submission.assignment.faculty_id != profile.id:
        raise HTTPException(status_code=403, detail="Not your assignment")

    submission.marks_awarded = payload.marks_awarded
    submission.feedback = payload.feedback
    await db.commit()
    return {"message": "Submission graded"}

# Attendance - roster + bulk save

async def _verify_teaches_class(class_id: int, profile: FacultyProfile, db: AsyncSession):
    """Raise 403 unless this faculty member is assigned to the class."""
    result = await db.execute(
        select(FacultyProfile)
        .where(FacultyProfile.id == profile.id)
        .options(selectinload(FacultyProfile.classes))
    )
    faculty = result.scalars().first()
    if class_id not in {cls.id for cls in faculty.classes}:
        raise HTTPException(status_code=403, detail="Not assigned to this class")


@router.get(
    "/courses/{class_id}/attendance",
    response_model=AttendanceRosterResponse,
)
async def get_attendance_roster(
    class_id: int,
    date: str,   # required query param, ISO "YYYY-MM-DD"
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the full enrolled roster for a class plus any attendance already
    marked for the given date. is_present is None for students not yet marked,
    so the frontend can distinguish 'unmarked' from 'marked absent'.
    """
    await _verify_teaches_class(class_id, profile, db)

    try:
        target_date = date_type.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date. Use YYYY-MM-DD")

    # Enrolled students
    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    # Existing attendance for that date, keyed by student_id
    att_result = await db.execute(
        select(Attendance).where(
            Attendance.class_id == class_id,
            Attendance.date == target_date,
        )
    )
    marked = {a.student_id: a.is_present for a in att_result.scalars().all()}

    roster = [
        AttendanceRosterItem(
            student_id=s.id,
            full_name=s.full_name,
            enrollment_no=s.enrollment_no,
            is_present=marked.get(s.id),   # None if not marked
        )
        # Stable ordering so the list doesn't shuffle between loads
        for s in sorted(cls.students, key=lambda x: x.enrollment_no)
    ]

    return AttendanceRosterResponse(class_id=class_id, date=date, roster=roster)


@router.post("/courses/{class_id}/attendance", status_code=200)
async def save_attendance(
    class_id: int,
    payload: SaveAttendanceRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk upsert attendance for a class on a date. For each student in the
    payload: update the existing row if one exists for (student, class, date),
    otherwise insert. Lets faculty re-save to correct mistakes on any date.
    """
    await _verify_teaches_class(class_id, profile, db)

    try:
        target_date = date_type.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date. Use YYYY-MM-DD")

    # Load existing rows for this class+date once, keyed by student_id
    existing_result = await db.execute(
        select(Attendance).where(
            Attendance.class_id == class_id,
            Attendance.date == target_date,
        )
    )
    existing = {a.student_id: a for a in existing_result.scalars().all()}

    # Guard: only accept students actually enrolled in this class
    roster_result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = roster_result.scalars().first()
    enrolled_ids = {s.id for s in cls.students}

    updated, created = 0, 0
    for mark in payload.marks:
        if mark.student_id not in enrolled_ids:
            continue  # silently skip non-enrolled ids rather than failing whole batch
        row = existing.get(mark.student_id)
        if row:
            row.is_present = mark.is_present
            updated += 1
        else:
            db.add(Attendance(
                student_id=mark.student_id,
                class_id=class_id,
                date=target_date,
                is_present=mark.is_present,
            ))
            created += 1

    await db.commit()
    return {"message": "Attendance saved", "updated": updated, "created": created}

# Exams - create, enter results, analytics

async def _assert_owns_exam(exam_id: int, profile: FacultyProfile, db: AsyncSession) -> Exam:
    """Fetch the exam and ensure this faculty teaches its class."""
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    # Reuse the existing class-assignment guard
    await _verify_teaches_class(exam.class_id, profile, db)
    return exam


@router.post("/courses/{class_id}/exams", status_code=201)
async def create_exam(
    class_id: int,
    payload: CreateExamRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    await _verify_teaches_class(class_id, profile, db)
    if payload.max_marks <= 0:
        raise HTTPException(status_code=400, detail="max_marks must be positive")
    try:
        exam_date = date_type.fromisoformat(payload.exam_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date. Use YYYY-MM-DD")

    exam = Exam(
        class_id=class_id,
        faculty_id=profile.id,
        title=payload.title,
        exam_type=payload.exam_type,
        max_marks=payload.max_marks,
        exam_date=exam_date,
    )
    db.add(exam)
    await db.commit()
    return {"message": "Exam created", "id": exam.id}


@router.get("/courses/{class_id}/exams", response_model=list[ExamListItem])
async def list_exams(
    class_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    await _verify_teaches_class(class_id, profile, db)

    count_result = await db.execute(
        select(func.count())
        .select_from(StudentProfile)
        .join(StudentProfile.classes)
        .where(ClassGroup.id == class_id)
    )
    total_students = count_result.scalar() or 0

    result = await db.execute(
        select(Exam)
        .where(Exam.class_id == class_id)
        .options(selectinload(Exam.results))
        .order_by(Exam.exam_date.desc())
    )
    exams = result.scalars().all()

    return [
        ExamListItem(
            id=e.id,
            title=e.title,
            exam_type=e.exam_type,
            max_marks=e.max_marks,
            exam_date=e.exam_date.isoformat(),
            results_entered=len(e.results),
            total_students=total_students,
        )
        for e in exams
    ]


@router.delete("/exams/{exam_id}")
async def delete_exam(
    exam_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    exam = await _assert_owns_exam(exam_id, profile, db)
    await db.delete(exam)   # cascade deletes results
    await db.commit()
    return {"message": "Exam deleted"}


@router.get("/exams/{exam_id}/roster", response_model=ExamRosterResponse)
async def get_exam_roster(
    exam_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """Roster for entering marks: every enrolled student + their result if entered."""
    exam = await _assert_owns_exam(exam_id, profile, db)

    cls_result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == exam.class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = cls_result.scalars().first()

    res_result = await db.execute(
        select(ExamResult).where(ExamResult.exam_id == exam_id)
    )
    results = {r.student_id: r for r in res_result.scalars().all()}

    roster = [
        ResultRosterItem(
            student_id=s.id,
            full_name=s.full_name,
            enrollment_no=s.enrollment_no,
            marks_obtained=results[s.id].marks_obtained if s.id in results else None,
            remarks=results[s.id].remarks if s.id in results else None,
        )
        for s in sorted(cls.students, key=lambda x: x.enrollment_no)
    ]

    return ExamRosterResponse(
        exam_id=exam.id, title=exam.title, max_marks=exam.max_marks, roster=roster
    )


@router.post("/exams/{exam_id}/results", status_code=200)
async def save_results(
    exam_id: int,
    payload: SaveResultsRequest,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """Bulk upsert results. Rejects marks above max_marks or below zero."""
    exam = await _assert_owns_exam(exam_id, profile, db)

    existing_result = await db.execute(
        select(ExamResult).where(ExamResult.exam_id == exam_id)
    )
    existing = {r.student_id: r for r in existing_result.scalars().all()}

    cls_result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == exam.class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = cls_result.scalars().first()
    enrolled = {s.id for s in cls.students}

    updated, created = 0, 0
    for entry in payload.results:
        if entry.student_id not in enrolled:
            continue
        if entry.marks_obtained < 0 or entry.marks_obtained > exam.max_marks:
            raise HTTPException(
                status_code=400,
                detail=f"Marks must be between 0 and {exam.max_marks}",
            )
        row = existing.get(entry.student_id)
        if row:
            row.marks_obtained = entry.marks_obtained
            row.remarks = entry.remarks
            updated += 1
        else:
            db.add(ExamResult(
                exam_id=exam_id,
                student_id=entry.student_id,
                marks_obtained=entry.marks_obtained,
                remarks=entry.remarks,
            ))
            created += 1

    await db.commit()
    return {"message": "Results saved", "updated": updated, "created": created}


@router.get("/exams/{exam_id}/analytics", response_model=ExamAnalytics)
async def exam_analytics(
    exam_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    """Class performance stats for one exam: avg, high, low, pass/fail, distribution."""
    exam = await _assert_owns_exam(exam_id, profile, db)

    count_result = await db.execute(
        select(func.count())
        .select_from(StudentProfile)
        .join(StudentProfile.classes)
        .where(ClassGroup.id == exam.class_id)
    )
    total_students = count_result.scalar() or 0

    res_result = await db.execute(
        select(ExamResult).where(ExamResult.exam_id == exam_id)
    )
    results = res_result.scalars().all()
    marks = [r.marks_obtained for r in results]

    if not marks:
        return ExamAnalytics(
            exam_id=exam.id, title=exam.title, max_marks=exam.max_marks,
            total_students=total_students, results_entered=0,
        )

    pass_threshold = 0.4 * exam.max_marks   # 40% pass mark
    pass_count = sum(1 for m in marks if m >= pass_threshold)

    buckets = [(0, 20), (20, 40), (40, 60), (60, 80), (80, 100)]
    distribution = []
    for lo, hi in buckets:
        lo_m = lo / 100 * exam.max_marks
        hi_m = hi / 100 * exam.max_marks
        # Top bucket inclusive of max; others half-open [lo, hi)
        if hi == 100:
            count = sum(1 for m in marks if lo_m <= m <= hi_m)
        else:
            count = sum(1 for m in marks if lo_m <= m < hi_m)
        distribution.append({"bucket": f"{lo}-{hi}%", "count": count})

    return ExamAnalytics(
        exam_id=exam.id,
        title=exam.title,
        max_marks=exam.max_marks,
        total_students=total_students,
        results_entered=len(marks),
        average=round(sum(marks) / len(marks), 2),
        highest=max(marks),
        lowest=min(marks),
        pass_count=pass_count,
        fail_count=len(marks) - pass_count,
        distribution=distribution,
    )

# GET /faculty/courses/{class_id}/attendance/summary

def _stat_status(pct: float) -> str:
    if pct >= 85:
        return "safe"
    if pct >= 75:
        return "warning"
    return "critical"


@router.get(
    "/courses/{class_id}/attendance/summary",
    response_model=ClassAttendanceSummary,
)
async def class_attendance_summary(
    class_id: int,
    profile: FacultyProfile = Depends(get_faculty_profile),
    db: AsyncSession = Depends(get_db),
):
    
    await _verify_teaches_class(class_id, profile, db)

    cls_result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = cls_result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    att_result = await db.execute(
        select(Attendance).where(Attendance.class_id == class_id)
    )
    rows = att_result.scalars().all()

    # Distinct session dates (the denominator)
    session_dates = {r.date for r in rows}
    total_sessions = len(session_dates)

    present_by_student: dict = {}
    for r in rows:
        if r.is_present:
            present_by_student[r.student_id] = present_by_student.get(r.student_id, 0) + 1

    students: list[StudentAttendanceStat] = []
    for s in cls.students:
        present = present_by_student.get(s.id, 0)
        pct = round(present / total_sessions * 100, 1) if total_sessions else 0.0
        students.append(StudentAttendanceStat(
            student_id=s.id,
            full_name=s.full_name,
            enrollment_no=s.enrollment_no,
            present=present,
            total=total_sessions,
            percentage=pct,
            status=_stat_status(pct),
        ))

    # Sort worst-first so at-risk students are at the top
    students.sort(key=lambda x: x.percentage)

    class_average = (
        round(sum(s.percentage for s in students) / len(students), 1)
        if students else 0.0
    )
    at_risk_count = sum(1 for s in students if s.percentage < 75)

    return ClassAttendanceSummary(
        class_id=class_id,
        total_sessions=total_sessions,
        class_average=class_average,
        at_risk_count=at_risk_count,
        students=students,
    )