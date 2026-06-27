from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Boolean, Text, Table, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base
student_class_association = Table(
    "student_classes",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("class_id", Integer, ForeignKey("class_groups.id", ondelete="CASCADE"), primary_key=True)
)

faculty_class_association = Table(
    "faculty_classes",
    Base.metadata,
    Column("faculty_id", Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("class_id", Integer, ForeignKey("class_groups.id", ondelete="CASCADE"), primary_key=True)
)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum("admin", "faculty", "student", name="user_role"),nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships map the User to their specific profile
    student_profile = relationship("StudentProfile", uselist=False, back_populates="user")
    faculty_profile = relationship("FacultyProfile", uselist=False, back_populates="user")

# user profiles 
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    enrollment_no = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    current_semester = Column(Integer, default=1)

    user = relationship("User", back_populates="student_profile")
    attendance = relationship("Attendance", back_populates="student")
    grades = relationship("Grade", back_populates="student")
    classes = relationship("ClassGroup", secondary=student_class_association, back_populates="students")
    submissions = relationship("Submission", back_populates="student")

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    employee_id = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)

    user = relationship("User", back_populates="faculty_profile")
    classes = relationship("ClassGroup", secondary=faculty_class_association, back_populates="faculty")
    materials = relationship("CourseMaterial", back_populates="faculty")
    assignments = relationship("Assignment", back_populates="faculty")

#  dashboard metrics 
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    subject = Column(String, nullable=False)
    is_present = Column(Boolean, nullable=False)

    student = relationship("StudentProfile", back_populates="attendance")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"))
    subject = Column(String, nullable=False)
    marks_obtained = Column(Float, nullable=False)
    total_marks = Column(Float, default=100.0)
    semester = Column(Integer, nullable=False)

    student = relationship("StudentProfile", back_populates="grades")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    target_audience = Column(String, default="all") # 'all', 'student', 'faculty'
    created_at = Column(Date, nullable=False)

class ClassGroup(Base):
    __tablename__ = "class_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)

    students = relationship("StudentProfile", secondary=student_class_association, back_populates="classes")
    faculty = relationship("FacultyProfile", secondary=faculty_class_association, back_populates="classes")
    materials = relationship("CourseMaterial", back_populates="class_group")
    assignments = relationship("Assignment", back_populates="class_group")

class CourseMaterial(Base):
    __tablename__ = "course_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc)
)
    class_id = Column(Integer, ForeignKey("class_groups.id", ondelete="CASCADE"))
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="SET NULL"))

    class_group = relationship("ClassGroup", back_populates="materials")
    faculty = relationship("FacultyProfile", back_populates="materials")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    class_id = Column(Integer, ForeignKey("class_groups.id", ondelete="CASCADE"))
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="SET NULL"))

    class_group = relationship("ClassGroup", back_populates="assignments")
    faculty = relationship("FacultyProfile", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    file_url = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    marks_awarded = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"))
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"))

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("StudentProfile", back_populates="submissions")