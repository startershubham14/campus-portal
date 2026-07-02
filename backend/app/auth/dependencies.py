import uuid
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.auth.security import verify_access_token
from app.database.connection import get_db
from app.database.models import User


async def get_current_user(
    access_token: str = Cookie(default=None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Reads the httpOnly cookie, validates the JWT, and returns the real
    User object from the database. Raises 401 if anything is wrong.

    This is the core auth dependency — inject it into any route that
    needs a logged-in user, e.g.:
        async def my_route(user: User = Depends(get_current_user)):
    """
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Decode and validate the JWT (raises 401 on failure)
    payload = verify_access_token(access_token)
    user_id_raw: str = payload.get("sub")

    # The "sub" claim is now a UUID string (e.g. from str(user.id)).
    # Parsing can fail if the token is malformed or from an old format —
    # treat that the same as an invalid token rather than crashing with 500.
    try:
        user_id = uuid.UUID(user_id_raw)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject"
        )

    # Fetch the real user from DB — don't trust the payload alone
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is disabled"
        )

    return user


def require_role(role: str):
    """
    Factory that returns a FastAPI dependency enforcing a specific role.
    The role is taken from the JWT on the server — the client has no say.

    Usage:
        async def admin_route(user: User = Depends(require_admin)):
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: requires '{role}' role"
            )
        return current_user
    return role_checker


# Ready-made guards for each role — import and use directly in routes
require_admin = require_role("admin")
require_student = require_role("student")
require_faculty = require_role("faculty")