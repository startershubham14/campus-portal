from datetime import datetime, timedelta, timezone
import bcrypt
# 1. Changed import from 'jose' to 'jwt'
import jwt
from app.config import settings
from fastapi import HTTPException, status

# password hashing


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt requires bytes, so encode the strings to utf-8 before checking
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    # Generate a secure salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)

    # Decode back to a regular string so it can be stored safely in PostgreSQL
    return hashed_bytes.decode("utf-8")


# JWT token generation


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    # Set expiration time for the token
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    # Generate the JWT using secret key and algorithm from .env
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


# JWT token verification


def verify_access_token(token: str) -> dict:
    """Decodes and validates a JWT.

    Raises 401 if the token is missing, expired, or tampered with. Returns the
    raw payload dict.
    """
    try:
        # PyJWT strictly requires algorithms as an iterable (list/set)
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        # Ensure the token actually contains a subject (user id)
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload is missing subject",
            )
        return payload
    # 2. Replaced JWTError with jwt.InvalidTokenError
    except jwt.InvalidTokenError:
        # Covers expired tokens, invalid signature, malformed tokens
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )