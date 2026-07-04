from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.connection import get_db
from app.database.models import (
    User, StudentProfile, ClassGroup,
    Attendance, Grade, CourseMaterial, Assignment
)
from app.auth.dependencies import require_student
from app.routers.student_schemas import (
    StudentProfileOut, CourseOut, CourseDetailOut,
    MaterialOut, AssignmentOut, AttendanceOut, GradeOut,
)

router = APIRouter(prefix="/student", tags=["Student"])


# ---------------------------------------------------------------------------
# Dependency — resolve the logged-in user to their StudentProfile
# ---------------------------------------------------------------------------

async def get_student_profile(
    current_user: User = Depends(require_student),
    db: AsyncSession = Depends(get_db),
) -> StudentProfile:
    """
    Returns the StudentProfile for the authenticated student.
    Every student endpoint uses this so we never serve one student's
    data to another — the profile is always derived from the cookie,
    never from a URL parameter the client could tamper with.
    """
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return profile


# ---------------------------------------------------------------------------
# GET /student/profile
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# GET /student/courses
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# GET /student/courses/{class_id}
# ---------------------------------------------------------------------------

@router.get("/courses/{class_id}", response_model=CourseDetailOut)
async def get_course_detail(
    class_id: int,
    profile: StudentProfile = Depends(get_student_profile),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a single course with its materials and assignments.
    Verifies the student is actually enrolled before returning data —
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
            )
            for a in cls.assignments
        ],
    )


# ---------------------------------------------------------------------------
# GET /student/attendance?class_id=...
# ---------------------------------------------------------------------------

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
        result = await db.execute(
            select(ClassGroup.name).where(ClassGroup.id == class_id)
        )
        class_name = result.scalar()
        if class_name:
            query = query.where(Attendance.subject == class_name)

    query = query.order_by(Attendance.date.desc())
    result = await db.execute(query)
    records = result.scalars().all()

    return [
        AttendanceOut(
            id=r.id,
            date=r.date.isoformat(),
            subject=r.subject,
            is_present=r.is_present,
        )
        for r in records
    ]


# ---------------------------------------------------------------------------
# GET /student/grades?semester=...
# ---------------------------------------------------------------------------

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