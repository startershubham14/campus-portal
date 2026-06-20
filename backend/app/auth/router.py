from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.connection import get_db
from app.database.models import User, StudentProfile, FacultyProfile
from app.auth.schemas import UserLogin, UserRegister, TokenResponse
from app.auth.security import get_password_hash, verify_password, create_access_token
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register_user(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # 1. Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create Base User
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    await db.flush() # Flushes to get the new_user.id without committing yet

    # 3. Create Role-Specific Profile based on the role provided
    if user_data.role == "student":
        profile = StudentProfile(
            user_id=new_user.id,
            enrollment_no=user_data.enrollment_no or "TEMP-123",
            full_name=user_data.full_name,
            department="General"
        )
        db.add(profile)
    elif user_data.role == "faculty":
        profile = FacultyProfile(
            user_id=new_user.id,
            employee_id=user_data.employee_id or "EMP-123",
            full_name=user_data.full_name,
            department="General"
        )
        db.add(profile)
    
    await db.commit()
    return {"message": f"Successfully created {user_data.role} account!"}

@router.post("/login", response_model=TokenResponse)
async def login_user(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # 1. Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()

    # 2. Verify existence and password
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Generate JWT containing their ID and Role
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    # 4. Return token to the frontend (Vite)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }