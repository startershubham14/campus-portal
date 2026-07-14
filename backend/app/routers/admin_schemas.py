import uuid
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field
# i added Out in naming to show these schemas are Response schemas i.e. what the API sends back
class StudentProfileOut(BaseModel):
  enrollment_no:str
  full_name:str
  department:str
  current_semester:int

class FacultyProfileOut(BaseModel):
  employee_id:str
  full_name:str
  department:str
"""
    One row in the GET /admin/users list.
    profile is typed as dict because it has different shapes per role
    (StudentProfileOut vs FacultyProfileOut vs None for admin).
    The actual fields are documented in the endpoint .
    """
class UserListItem(BaseModel):
  id:uuid.UUID
  email:str
  role:str
  is_active:bool
  profile:Optional[dict]=None
  # For students:  { enrollment_no, full_name, department, current_semester }
  # For faculty:   { employee_id, full_name, department }
  # For admins:    null like that

class StatsResponse(BaseModel):
  total_students:int
  total_faculty:int
  total_admins:int
  active_users:int
  inactive_users:int

# Request schemas - what the API receives on request like post.

class UpdateUser(BaseModel):
  full_name:Optional[str]=Field(default=None, max_length=100)
  department:Optional[str]=Field(default=None, max_length=100)
  current_semester: Optional[int] = None

# Class management schemas

class FacultyInClass(BaseModel):
    user_id: uuid.UUID
    full_name: str
    employee_id: str
    department: str

class StudentInClass(BaseModel):
    user_id: uuid.UUID
    full_name: str
    enrollment_no: str
    department: str
    current_semester: int

class ClassOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    student_count: int
    faculty_count: int

class ClassDetailOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    faculty: list[FacultyInClass]
    students: list[StudentInClass]

class CreateClassRequest(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=150)
    department: str = Field(min_length=1, max_length=100)
    semester: int = Field(ge=1, le=12)
