from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.connection import get_db
from app.database.models import User, StudentProfile, FacultyProfile
from app.auth.schemas import UserRegister
from app.auth.security import get_password_hash
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


async def _generate_enrollment_no(db: AsyncSession) -> str:
    """
    Sequential, human-readable student ID: STU00001, STU00002, ...
    Based on current row count + 1. Not strictly gap-free if a student
    is later deleted, but that's fine for an enrollment number — it
    only needs to be unique, not perfectly contiguous.
    """
    result = await db.execute(select(func.count()).select_from(StudentProfile))
    count = result.scalar() or 0
    return f"STU{count + 1:05d}"


async def _generate_employee_id(db: AsyncSession) -> str:
    """Sequential faculty ID: FAC00001, FAC00002, ..."""
    result = await db.execute(select(func.count()).select_from(FacultyProfile))
    count = result.scalar() or 0
    return f"FAC{count + 1:05d}"


@router.post("/users")
async def create_user(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
    # This is the actual access control: require_admin decodes the
    # httpOnly cookie, verifies the JWT, and checks current_user.role
    # == "admin" server-side. There is no client-supplied "role" check
    # anywhere here — an unauthenticated or non-admin request never
    # reaches the body of this function at all.
    _admin: User = Depends(require_admin),
):
    """
    The only way to create a user account — student, faculty, or admin.
    Only an authenticated admin can call this. There is no public
    self-registration route.
    """
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
    )
    db.add(new_user)
    await db.flush()  # assigns new_user.id without committing yet

    if user_data.role == "student":
        enrollment_no = user_data.enrollment_no or await _generate_enrollment_no(db)
        db.add(StudentProfile(
            user_id=new_user.id,
            enrollment_no=enrollment_no,
            full_name=user_data.full_name,
            department="General",
        ))
    elif user_data.role == "faculty":
        employee_id = user_data.employee_id or await _generate_employee_id(db)
        db.add(FacultyProfile(
            user_id=new_user.id,
            employee_id=employee_id,
            full_name=user_data.full_name,
            department="General",
        ))
    # role == "admin" needs no profile row — admins aren't students or faculty

    try:
        await db.commit()
    except IntegrityError:
        # Extremely unlikely race: two requests generated the same
        # sequential ID at the same moment. Roll back and let the
        # admin retry rather than silently corrupting state.
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A unique ID collision occurred — please retry the request",
        )

    return {"message": f"Successfully created {user_data.role} account: {user_data.email}"}
