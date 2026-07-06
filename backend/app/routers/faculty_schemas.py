#Pydantic schemas for the faculty API.

import uuid
from typing import Optional
from pydantic import BaseModel


class FacultyProfileOut(BaseModel):
    id: uuid.UUID
    full_name: str
    employee_id: str
    department: str


class CourseOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    student_count: int


class MaterialOut(BaseModel):
    id: int
    title: str
    file_url: str
    uploaded_at: Optional[str] = None


class AssignmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: str 
    submission_count: int   # how many students have submitted


class SubmissionOut(BaseModel):
    id: int
    student_name: str
    enrollment_no: str
    file_url: str
    submitted_at: Optional[str] = None
    marks_awarded: Optional[float] = None
    feedback: Optional[str] = None


class CourseDetailOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    semester: int
    student_count: int
    materials: list[MaterialOut]
    assignments: list[AssignmentOut]



class UploadMaterialRequest(BaseModel):
    title: str
    # Accepts a URL for now. When S3 is added, the frontend uploads the file
    # directly to S3 and sends the resulting URL here — this field stays the same.
    object_key: str


class CreateAssignmentRequest(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: str   


class GradeSubmissionRequest(BaseModel):
    marks_awarded: float
    feedback: Optional[str] = None


class PresignRequest(BaseModel):
    filename: str        # e.g. "week1-notes.pdf"
    content_type: str    # e.g. "application/pdf"
    class_code: str      # used as the S3 folder prefix e.g. "csc801"

class PresignResponse(BaseModel):
    presigned_url: str   # browser PUTs file here directly
    object_key: str      # store this; pass back in the confirm call
