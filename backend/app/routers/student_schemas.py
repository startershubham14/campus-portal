"""
Pydantic schemas for the student API.
"""
import uuid
from typing import Optional, Literal
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
    source_type: str = "upload"          # "upload" or "link"
    uploaded_at: Optional[str] = None   # ISO string, None if not set


class AssignmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: str                    
    submitted: bool = False
    submission_id: Optional[int] = None
    submission_file_url: Optional[str] = None
    submitted_at: Optional[str] = None
    marks_awarded: Optional[float] = None
    feedback: Optional[str] = None


class SubmissionPresignRequest(BaseModel):
    filename: str        # e.g. "assignment3.pdf"
    content_type: str    # e.g. "application/pdf"


class SubmissionPresignResponse(BaseModel):
    presigned_url: str
    object_key: str


class ConfirmSubmissionRequest(BaseModel):
    object_key: str    


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
    date: str           
    subject: str
    is_present: bool
class AttendanceSubjectSummary(BaseModel):
    class_id: int
    class_code: str
    class_name: str
    total_sessions: int       
    present: int
    absent: int
    percentage: float           
    status: Literal["safe" , "warning" , "critical"]             
    message: str


class AttendanceOverallSummary(BaseModel):
    overall_percentage: float
    total_sessions: int
    total_present: int
    status: Literal["safe", "warning", "critical"]
    subjects: list[AttendanceSubjectSummary]

class GradeOut(BaseModel):
    id: int
    subject: str
    marks_obtained: float
    total_marks: float
    semester: int
    percentage: float   