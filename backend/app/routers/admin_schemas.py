import uuid
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr

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

# Request schemas — what the API receives on request like post.

class UpdateUser(BaseModel):
  full_name:Optional[str]=None
  department:Optional[str]=None
  current_semester: Optional[int] = None


