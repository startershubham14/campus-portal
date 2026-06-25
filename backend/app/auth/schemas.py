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

# for returning jwt token on successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str