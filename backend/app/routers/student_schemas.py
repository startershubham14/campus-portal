"""
Pydantic schemas for the student API.
"""
import uuid
from typing import Optional
from pydantic import BaseModel


class StudentProfileOut(BaseModel):
    id: uuid.UUID
    full_name: str
    enrollment_no: str
    department: str
    current_semester: int


class CourseOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int


class MaterialOut(BaseModel):
    id: int
    title: str
    file_url: str
    uploaded_at: Optional[str] = None   # ISO string, None if not set


class AssignmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: str                        # ISO string


class CourseDetailOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    materials: list[MaterialOut]
    assignments: list[AssignmentOut]


class AttendanceOut(BaseModel):
    id: int
    date: str           # ISO date string
    subject: str
    is_present: bool


class GradeOut(BaseModel):
    id: int
    subject: str
    marks_obtained: float
    total_marks: float
    semester: int
    percentage: float   # computed by the API, not stored