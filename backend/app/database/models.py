from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

#  Authentication & core user 
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'admin', 'faculty', 'student'
    is_active = Column(Boolean, default=True)

    # Relationships map the User to their specific profile
    student_profile = relationship("StudentProfile", uselist=False, back_populates="user")
    faculty_profile = relationship("FacultyProfile", uselist=False, back_populates="user")

#  User profiles for student and faculties
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

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    employee_id = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)

    user = relationship("User", back_populates="faculty_profile")

#  Attendence dashboard metrics 
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