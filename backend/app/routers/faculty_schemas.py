#Pydantic schemas for the faculty API.

import uuid
from typing import Optional, Literal
from pydantic import BaseModel, Field

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
    title: str = Field(min_length=1, max_length=200)
    object_key: str = Field(min_length=1, max_length=500)


class LinkMaterialRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)


class CreateAssignmentRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    due_date: str = Field(min_length=1, max_length=30)


class GradeSubmissionRequest(BaseModel):
    marks_awarded: float = Field(ge=0, le=1000)
    feedback: Optional[str] = Field(default=None, max_length=2000)


class PresignRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=100)
    class_code: str = Field(min_length=1, max_length=20)

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
    date: str = Field(min_length=1, max_length=30)
    marks: list[AttendanceMark] = Field(max_length=1000)


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