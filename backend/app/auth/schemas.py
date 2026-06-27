from pydantic import BaseModel, EmailStr
from typing import Optional

# What is expected from the frontend when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# registering a test user
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # "admin", "faculty", or "student"
    full_name: str
    
    # Optional fields depending on the role
    enrollment_no: Optional[str] = None
    employee_id: Optional[str] = None

# The token is no longer returned in the body — it's set as an httpOnly cookie.
# We only return the role so the frontend knows where to redirect.
class TokenResponse(BaseModel):
    role: str

class UserMeResponse(BaseModel):
    id: int
    email: str
    role: str