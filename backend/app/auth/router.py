from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database.connection import get_db
from app.database.models import User
from app.auth.schemas import UserLogin, TokenResponse, UserMeResponse
from app.auth.security import verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

# NOTE: There is no public POST /auth/register endpoint.
# Account creation (student, faculty, AND admin) only happens through
# POST /admin/users, which requires an authenticated admin (see
# app/routers/admin.py). The very first admin is created via the
# one-time bootstrap script: app/scripts/create_first_admin.py

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
        secure=settings.IS_PRODUCTION,         # ← Change to True when deployed over HTTPS
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # in seconds
    )

    # 5. Return only the role - the token itself never touches the frontend
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