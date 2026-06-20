from pydantic import BaseModel, EmailStr
from typing import Optional

# What we expect from the frontend when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we expect from the frontend when registering a test user
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # "admin", "faculty", or "student"
    full_name: str
    
    # Optional fields depending on the role
    enrollment_no: Optional[str] = None
    employee_id: Optional[str] = None

# What we send BACK to the frontend upon successful login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str