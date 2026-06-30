from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database.connection import get_db
from app.database.models import User, StudentProfile, FacultyProfile
from app.auth.schemas import UserLogin, UserRegister, TokenResponse, UserMeResponse
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Depends() this is fastapi function which call another function(callback)
#diffrence is fastapi calls it for you. for eg. below ir calls the function get_db
#it is a method to get seperate session for database for each user session when required

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
    await db.flush()

    # 3. Create Role-Specific Profile
    if user_data.role == "student":
        profile = StudentProfile(
            user_id=new_user.id,
            enrollment_no=user_data.enrollment_no ,
            full_name=user_data.full_name,
            department="General"
        )
        db.add(profile)
    elif user_data.role == "faculty":
        profile = FacultyProfile(
            user_id=new_user.id,
            employee_id=user_data.employee_id ,
            full_name=user_data.full_name,
            department="General"
        )
        db.add(profile)

    await db.commit()
    return {"message": f"Successfully created {user_data.role} account!"}

@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login_user(
    request: Request,          # <-- Add this
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    # 1. Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()

    # 2. Verify existence and password
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Generate JWT
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    # 4. Set the token as an httpOnly cookie.
    #    httponly=True means JavaScript (and therefore XSS) cannot read it.
    #    secure=True should be True in production (HTTPS only).
    #    samesite="lax" protects against CSRF on cross-site navigations.
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,         # ← Change to True when deployed over HTTPS
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # in seconds
    )

    # 5. Return only the role — the token itself never touches the frontend
    return {"role": user.role}


@router.post("/logout")
async def logout(response: Response):
    """Clears the auth cookie. The token is invalidated from the browser side."""
    response.delete_cookie(key="access_token", samesite="lax")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserMeResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    The frontend calls this on every dashboard mount to verify auth server-side.
    Returns the real user data from the DB based on the cookie's JWT.
    If the cookie is missing, expired, or tampered, returns 401 automatically.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }