from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.connection import get_db
from app.database.models import (
    User, FacultyProfile, StudentProfile, ClassGroup,
    CourseMaterial, Assignment, Submission,
)
from app.auth.dependencies import require_faculty 
from app.s3 import generate_presigned_upload_url, get_file_url, delete_file
from app.routers.faculty_schemas import (
    FacultyProfileOut, CourseOut, CourseDetailOut,
    MaterialOut, AssignmentOut, SubmissionOut,
    UploadMaterialRequest, CreateAssignmentRequest, GradeSubmissionRequest,
      PresignRequest, PresignResponse,
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
                file_url=m.file_url,
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

# POST /faculty/courses/{class_id}/materials/presign  — Step 1: get upload URL

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
    the file directly to S3 — the file bytes never pass through this server.

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


# POST /faculty/courses/{class_id}/materials/confirm  — Step 2: save to DB

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
        object_key=payload.object_key,
        class_id=class_id,
        faculty_id=profile.id,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(material)
    await db.commit()
    return {"message": "Material saved", "id": material.id}

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
    # delete_file() is non-fatal — if S3 delete fails, the DB record
    # is still removed (orphaned S3 objects are preferable to stuck DB records).
    if material.object_key:
        delete_file(material.object_key)

    await db.delete(material)
    await db.commit()
    return {"message": "Material deleted"}


# POST /faculty/courses/{class_id}/assignments  — create assignment

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