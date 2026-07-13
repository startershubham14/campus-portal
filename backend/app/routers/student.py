from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.connection import get_db
from app.database.models import (
    User, StudentProfile, ClassGroup,
    Attendance, Grade, CourseMaterial, Assignment, Submission,
    Exam, ExamResult,
)
from app.auth.dependencies import require_student
from app.s3 import generate_presigned_upload_url, get_file_url, delete_file
from app.routers.student_schemas import (
    StudentProfileOut, CourseOut, CourseDetailOut,
    MaterialOut, AssignmentOut, AttendanceOut, GradeOut,
    SubmissionPresignRequest, SubmissionPresignResponse, ConfirmSubmissionRequest,
    AttendanceOverallSummary, AttendanceSubjectSummary,
)
from app.routers.exam_schemas import StudentExamResult

router = APIRouter(prefix="/student", tags=["Student"])


# Dependency - resolve the logged-in user to their StudentProfile

async def get_student_profile(
    current_user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> StudentProfile:
    """
    Returns the StudentProfile for the authenticated student.
    Every student endpoint uses this so we never serve one student's
    data to another - the profile is always derived from the cookie,
    never from a URL parameter the client could tamper with.
    """
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return profile


# GET /student/profile

@router.get("/profile", response_model=StudentProfileOut)
async def get_profile(
    profile: StudentProfile = Depends(get_student_profile),
):
    return StudentProfileOut(
        id=profile.id,
        full_name=profile.full_name,
        enrollment_no=profile.enrollment_no,
        department=profile.department,
        current_semester=profile.current_semester,
    )



# GET /student/courses

@router.get("/courses", response_model=list[CourseOut])
async def get_courses(
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns only the classes this student is enrolled in.
    Uses the student_classes association table via the relationship.
    """
    result = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == profile.id)
        .options(selectinload(StudentProfile.classes))
    )
    student = result.scalars().first()

    return [
        CourseOut(
            id=cls.id,
            code=cls.code,
            name=cls.name,
            department=cls.department,
            semester=cls.semester,
        )
        for cls in student.classes
    ]


# GET /student/courses/{class_id}

@router.get("/courses/{class_id}", response_model=CourseDetailOut)
async def get_course_detail(
    class_id: int,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a single course with its materials and assignments.
    Verifies the student is actually enrolled before returning data -
    a student cannot fetch another class's materials by guessing an ID.
    """
    result = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == profile.id)
        .options(selectinload(StudentProfile.classes))
    )
    student = result.scalars().first()
    enrolled_ids = {cls.id for cls in student.classes}

    if class_id not in enrolled_ids:
        # 403 not 404: the class may exist but this student is not in it
        raise HTTPException(status_code=403, detail="Not enrolled in this class")

    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(
            selectinload(ClassGroup.materials),
            selectinload(ClassGroup.assignments),
        )
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    # Fetch this student's submissions for the assignments in this class,
    # keyed by assignment_id for O(1) lookup while building the response.
    assignment_ids = [a.id for a in cls.assignments]
    submissions_by_assignment: dict[int, Submission] = {}
    if assignment_ids:
        sub_result = await db.execute(
            select(Submission).where(
                Submission.student_id == profile.id,
                Submission.assignment_id.in_(assignment_ids),
            )
        )
        for sub in sub_result.scalars().all():
            submissions_by_assignment[sub.assignment_id] = sub

    def build_assignment(a: Assignment) -> AssignmentOut:
        sub = submissions_by_assignment.get(a.id)
        if sub is None:
            return AssignmentOut(
                id=a.id,
                title=a.title,
                description=a.description,
                due_date=a.due_date.isoformat(),
                submitted=False,
            )
        # Regenerate a fresh presigned view URL for the submission file
        file_url = get_file_url(sub.object_key) if sub.object_key else sub.file_url
        return AssignmentOut(
            id=a.id,
            title=a.title,
            description=a.description,
            due_date=a.due_date.isoformat(),
            submitted=True,
            submission_id=sub.id,
            submission_file_url=file_url,
            submitted_at=sub.submitted_at.isoformat() if sub.submitted_at else None,
            marks_awarded=sub.marks_awarded,
            feedback=sub.feedback,
        )

    return CourseDetailOut(
        id=cls.id,
        code=cls.code,
        name=cls.name,
        department=cls.department,
        semester=cls.semester,
        materials=[
            MaterialOut(
                id=m.id,
                title=m.title,
                # Regenerate presigned URL for S3 uploads (stored ones expire);
                # links (object_key is None) are served as-is.
                file_url=get_file_url(m.object_key) if m.object_key else m.file_url,
                source_type=getattr(m, "source_type", "upload"),
                uploaded_at=m.uploaded_at.isoformat() if m.uploaded_at else None,
            )
            for m in cls.materials
        ],
        assignments=[build_assignment(a) for a in cls.assignments],
    )


# GET /student/attendance?class_id=...


@router.get("/attendance", response_model=list[AttendanceOut])
async def get_attendance(
    class_id: int | None = None,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all attendance records for this student.
    Optionally filtered by class via class_id.
    """
    query = select(Attendance).where(Attendance.student_id == profile.id)

    if class_id is not None:
        query = query.where(Attendance.class_id == class_id)

    # Eager-load the class so we can return its name as `subject`
    query = query.options(selectinload(Attendance.class_group)).order_by(Attendance.date.desc())
    result = await db.execute(query)
    records = result.scalars().all()

    return [
        AttendanceOut(
            id=r.id,
            date=r.date.isoformat(),
            # `subject` is now derived from the linked class name, not a stored string
            subject=r.class_group.name if r.class_group else "Unknown",
            is_present=r.is_present,
        )
        for r in records
    ]



# GET /student/grades?semester=...

@router.get("/grades", response_model=list[GradeOut])
async def get_grades(
    semester: int | None = None,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all grades for this student, optionally filtered by semester.
    Percentage is computed server-side so the frontend never has to.
    """
    query = select(Grade).where(Grade.student_id == profile.id)

    if semester is not None:
        query = query.where(Grade.semester == semester)

    result = await db.execute(query)
    grades = result.scalars().all()

    return [
        GradeOut(
            id=g.id,
            subject=g.subject,
            marks_obtained=g.marks_obtained,
            total_marks=g.total_marks,
            semester=g.semester,
            percentage=round((g.marks_obtained / g.total_marks) * 100, 2),
        )
        for g in grades
    ]

# Assignment submission - S3 presigned upload flow (mirrors materials)

async def _verify_assignment_access(
    assignment_id: int, profile: StudentProfile, db: AsyncSession
) -> Assignment:
    """
    Confirms the assignment exists AND the student is enrolled in the class
    it belongs to. Prevents submitting to an assignment in a class you're
    not part of, even by guessing the ID.
    """
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check enrollment in the assignment's class
    result = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == profile.id)
        .options(selectinload(StudentProfile.classes))
    )
    student = result.scalars().first()
    enrolled_ids = {cls.id for cls in student.classes}
    if assignment.class_id not in enrolled_ids:
        raise HTTPException(status_code=403, detail="Not enrolled in this class")

    return assignment


@router.post(
    "/assignments/{assignment_id}/submit/presign",
    response_model=SubmissionPresignResponse,
)
async def presign_submission(
    assignment_id: int,
    payload: SubmissionPresignRequest,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 1 of 2. Returns a presigned S3 PUT URL for the submission file.
    The browser uploads directly to S3 - file bytes never touch this server.
    """
    await _verify_assignment_access(assignment_id, profile, db)

    try:
        presigned_url, object_key = generate_presigned_upload_url(
            folder=f"submissions/{assignment_id}/{profile.enrollment_no}",
            filename=payload.filename,
            content_type=payload.content_type,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return SubmissionPresignResponse(presigned_url=presigned_url, object_key=object_key)


@router.post("/assignments/{assignment_id}/submit/confirm", status_code=201)
async def confirm_submission(
    assignment_id: int,
    payload: ConfirmSubmissionRequest,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Step 2 of 2. Called after the browser has PUT the file to S3.

    If the student already submitted this assignment, the old submission
    is updated (and the old S3 file deleted) - re-submission overwrites,
    it does not create a duplicate. Marks and feedback are reset since
    the file changed and needs re-grading.
    """
    await _verify_assignment_access(assignment_id, profile, db)

    try:
        view_url = get_file_url(payload.object_key)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Check for an existing submission (re-submission case)
    result = await db.execute(
        select(Submission).where(
            Submission.assignment_id == assignment_id,
            Submission.student_id == profile.id,
        )
    )
    existing = result.scalars().first()

    if existing:
        # Delete the old S3 file before overwriting the reference
        if existing.object_key and existing.object_key != payload.object_key:
            delete_file(existing.object_key)
        existing.file_url = view_url
        existing.object_key = payload.object_key
        existing.submitted_at = datetime.now(timezone.utc)
        # Reset grading - the submission changed, so prior marks are stale
        existing.marks_awarded = None
        existing.feedback = None
        await db.commit()
        return {"message": "Submission updated", "id": existing.id}

    submission = Submission(
        file_url=view_url,
        object_key=payload.object_key,
        assignment_id=assignment_id,
        student_id=profile.id,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    await db.commit()
    return {"message": "Submission received", "id": submission.id}


# GET /student/results - exam results across all enrolled classes


@router.get("/results", response_model=list[StudentExamResult])
async def get_exam_results(
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Every exam in the student's enrolled classes, with their mark, class
    average, and 1-based rank. Rank uses standard competition ranking
    (ties share a rank). Ungraded exams are still returned (marks None).
    """
    stu_result = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == profile.id)
        .options(selectinload(StudentProfile.classes))
    )
    student = stu_result.scalars().first()
    class_ids = [c.id for c in student.classes]
    class_lookup = {c.id: c for c in student.classes}

    if not class_ids:
        return []

    exam_result = await db.execute(
        select(Exam)
        .where(Exam.class_id.in_(class_ids))
        .options(selectinload(Exam.results))
        .order_by(Exam.exam_date.desc())
    )
    exams = exam_result.scalars().all()

    output: list[StudentExamResult] = []
    for exam in exams:
        cls = class_lookup.get(exam.class_id)
        all_marks = [r.marks_obtained for r in exam.results]
        my_result = next((r for r in exam.results if r.student_id == profile.id), None)

        class_average = round(sum(all_marks) / len(all_marks), 2) if all_marks else None

        rank = None
        if my_result is not None and all_marks:
            # Standard competition ranking: 1 + number strictly above
            higher = sum(1 for m in all_marks if m > my_result.marks_obtained)
            rank = higher + 1

        pct = (
            round(my_result.marks_obtained / exam.max_marks * 100, 2)
            if my_result is not None and exam.max_marks
            else None
        )

        output.append(StudentExamResult(
            exam_id=exam.id,
            title=exam.title,
            exam_type=exam.exam_type,
            exam_date=exam.exam_date.isoformat(),
            class_code=cls.code if cls else "",
            class_name=cls.name if cls else "",
            max_marks=exam.max_marks,
            marks_obtained=my_result.marks_obtained if my_result else None,
            percentage=pct,
            remarks=my_result.remarks if my_result else None,
            class_average=class_average,
            rank=rank,
            total_ranked=len(all_marks) if my_result else None,
        ))

    return output

# GET /student/attendance/summary

ATTENDANCE_THRESHOLD = 75.0


def _attendance_status_and_message(present: int, total: int) -> tuple[str, str]:
    """
    Returns (status, plain-English message) for a subject's attendance.

    The math the student actually cares about:
      - Below 75%: how many consecutive classes must they attend to recover?
      - At/above 75%: how many can they miss and still stay above?
    """
    if total == 0:
        return "safe", "No classes held yet."

    pct = present / total * 100

    if pct >= ATTENDANCE_THRESHOLD:
        # How many future classes can be missed while staying >= 75%?
        # Solve: present / (total + miss) >= 0.75  ->  miss <= present/0.75 - total
        can_miss = int(present / (ATTENDANCE_THRESHOLD / 100) - total)
        can_miss = max(0, can_miss)
        if pct >= 85:
            return "safe", f"Safe - you can miss {can_miss} more class{'es' if can_miss != 1 else ''}."
        # 75-85% is technically safe but thin
        return "warning", f"Just above the line - you can miss only {can_miss} more class{'es' if can_miss != 1 else ''}."
    else:
        # How many consecutive classes must be attended to reach 75%?
        # (present + attend) / (total + attend) >= 0.75
        need = (ATTENDANCE_THRESHOLD / 100 * total - present) / (1 - ATTENDANCE_THRESHOLD / 100)
        need = max(1, int(need) + (1 if need != int(need) else 0))  # ceil, min 1
        return "critical", f"At risk - attend the next {need} class{'es' if need != 1 else ''} to reach 75%."


@router.get("/attendance/summary", response_model=AttendanceOverallSummary)
async def attendance_summary(
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Per-subject attendance percentage plus overall, each with a color status
    (safe/warning/critical) and a plain-English message. All the logic lives
    here so the frontend just renders numbers and colors.
    """
    stu_result = await db.execute(
        select(StudentProfile)
        .where(StudentProfile.id == profile.id)
        .options(selectinload(StudentProfile.classes))
    )
    student = stu_result.scalars().first()

    att_result = await db.execute(
        select(Attendance)
        .where(Attendance.student_id == profile.id)
        .options(selectinload(Attendance.class_group))
    )
    records = att_result.scalars().all()

    by_class: dict[int, list] = {}
    for r in records:
        by_class.setdefault(r.class_id, []).append(r)

    subjects: list[AttendanceSubjectSummary] = []
    grand_present = 0
    grand_total = 0

    for cls in sorted(student.classes, key=lambda c: c.code):
        rows = by_class.get(cls.id, [])
        total = len(rows)
        present = sum(1 for r in rows if r.is_present)
        pct = round(present / total * 100, 1) if total else 0.0
        status, message = _attendance_status_and_message(present, total)

        subjects.append(AttendanceSubjectSummary(
            class_id=cls.id,
            class_code=cls.code,
            class_name=cls.name,
            total_sessions=total,
            present=present,
            absent=total - present,
            percentage=pct,
            status=status,
            message=message,
        ))
        grand_present += present
        grand_total += total

    overall_pct = round(grand_present / grand_total * 100, 1) if grand_total else 0.0
    overall_status = (
        "safe" if overall_pct >= 85
        else "warning" if overall_pct >= ATTENDANCE_THRESHOLD
        else "critical" if grand_total else "safe"
    )

    return AttendanceOverallSummary(
        overall_percentage=overall_pct,
        total_sessions=grand_total,
        total_present=grand_present,
        status=overall_status,
        subjects=subjects,
    )