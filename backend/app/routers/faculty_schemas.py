#Pydantic schemas for the faculty API.

import uuid
from typing import Optional, Literal
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
    source_type: str = "upload"   # "upload" or "link"
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
    # S3 object key from the presign step. The confirm endpoint turns this
    # into a presigned GET URL stored as file_url.
    object_key: str


class LinkMaterialRequest(BaseModel):
    title: str
    # External URL (Google Drive, YouTube, etc). Stored as-is -
    # no S3, no presigned URL regeneration.
    url: str


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

#schemas for attendence
class AttendanceRosterItem(BaseModel):
    student_id: uuid.UUID       # StudentProfile.id
    full_name: str
    enrollment_no: str
    # is_present: Present status for the queried date. None = not yet marked that day.
    is_present: Optional[bool] = None


class AttendanceRosterResponse(BaseModel):
    class_id: int
    date: str               
    roster: list[AttendanceRosterItem]


class AttendanceMark(BaseModel):
    student_id: uuid.UUID
    is_present: bool


class SaveAttendanceRequest(BaseModel):
    date: str               
    marks: list[AttendanceMark]

class StudentAttendanceStat(BaseModel):
    student_id: uuid.UUID
    full_name: str
    enrollment_no: str
    present: int
    total: int
    percentage: float
    status: Literal["safe" , "warning" , "critical"]


class ClassAttendanceSummary(BaseModel):
    class_id: int
    total_sessions: int       
    class_average: float    
    at_risk_count: int         
    students: list[StudentAttendanceStat]  