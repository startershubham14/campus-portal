"""
Pydantic schemas for the exams feature — shared by faculty and student routers.
"""
import uuid
from typing import Optional, Literal
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Requests (faculty)
# ---------------------------------------------------------------------------

class CreateExamRequest(BaseModel):
    title: str
    exam_type: Literal["quiz", "midterm", "final", "assignment"]
    max_marks: float
    exam_date: str   # ISO "YYYY-MM-DD"


class ResultEntry(BaseModel):
    student_id: uuid.UUID
    marks_obtained: float
    remarks: Optional[str] = None


class SaveResultsRequest(BaseModel):
    results: list[ResultEntry]


# ---------------------------------------------------------------------------
# Responses (faculty)
# ---------------------------------------------------------------------------

class ExamListItem(BaseModel):
    id: int
    title: str
    exam_type: str
    max_marks: float
    exam_date: str
    results_entered: int      # how many students have a result so far
    total_students: int       # enrolled count


class ResultRosterItem(BaseModel):
    student_id: uuid.UUID
    full_name: str
    enrollment_no: str
    marks_obtained: Optional[float] = None   # None = not entered yet
    remarks: Optional[str] = None


class ExamAnalytics(BaseModel):
    exam_id: int
    title: str
    max_marks: float
    total_students: int
    results_entered: int
    average: Optional[float] = None
    highest: Optional[float] = None
    lowest: Optional[float] = None
    pass_count: int = 0        # >= 40% of max
    fail_count: int = 0
    # Distribution buckets for a histogram: labels like "0-20%", "20-40%"...
    distribution: list[dict] = []   # [{"bucket": "80-100%", "count": 5}, ...]


class ExamRosterResponse(BaseModel):
    exam_id: int
    title: str
    max_marks: float
    roster: list[ResultRosterItem]


# ---------------------------------------------------------------------------
# Responses (student)
# ---------------------------------------------------------------------------

class StudentExamResult(BaseModel):
    exam_id: int
    title: str
    exam_type: str
    exam_date: str
    class_code: str
    class_name: str
    max_marks: float
    marks_obtained: Optional[float] = None   # None if not graded yet
    percentage: Optional[float] = None
    remarks: Optional[str] = None
    # Class comparison
    class_average: Optional[float] = None     # average marks (not %)
    rank: Optional[int] = None                # 1-based rank in class for this exam
    total_ranked: Optional[int] = None        # how many students have results