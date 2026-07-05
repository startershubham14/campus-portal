from fastapi import APIRouter, Depends, HTTPException , Query
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Literal
from app.database.connection import get_db
from app.database.models import User, StudentProfile, FacultyProfile, ClassGroup
from app.auth.schemas import UserRegister
from app.auth.security import get_password_hash
from app.auth.dependencies import require_admin
from app.routers.admin_schemas import ( UserListItem, StatsResponse, UpdateUser,
 ClassOut, ClassDetailOut, CreateClassRequest, FacultyInClass, StudentInClass,)
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import selectinload
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])

# Helpers to auto-generate readable IDs 

async def _generate_enrollment_no(db: AsyncSession) -> str:
    """
    Sequential, human-readable student ID: STU00001, STU00002, ...
    Based on current row count + 1. Not strictly gap-free if a student
    is later deleted, but that's fine for an enrollment number — it
    only needs to be unique, not perfectly contiguous.
    """
    result = await db.execute(select(func.count()).select_from(StudentProfile))
    count = result.scalar() or 0
    return f"STU{count + 1:05d}"


async def _generate_employee_id(db: AsyncSession) -> str:
    """Sequential faculty ID: FAC00001, FAC00002, ..."""
    result = await db.execute(select(func.count()).select_from(FacultyProfile))
    count = result.scalar() or 0
    return f"FAC{count + 1:05d}"

#function to compress  ( role specific profile -> dict ) for response
def build_profile_dict( user : User) -> dict | None:
    if "student" == user.role and user.student_profile:
        p=user.student_profile
        return {
            "full_name": p.full_name,
            "enrollment_no": p.enrollment_no,
            "department": p.department,
            "current_semester": p.current_semester,
        }
    if  "faculty" == user.role and user.faculty_profile:
        p=user.faculty_profile
        return {
            "full_name": p.full_name,
            "employee_id": p.employee_id,
            "department": p.department,
        }
    return None #admin have no profile


# POST /admin/users — manual user creation (admins only)

@router.post("/users",status_code=201)
async def create_user(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
    # This is the actual access control: require_admin decodes the
    # httpOnly cookie, verifies the JWT, and checks current_user.role
    # == "admin" server-side. There is no client-supplied "role" check
    # anywhere here — an unauthenticated or non-admin request never
    # reaches the body of this function at all.
    _admin: User = Depends(require_admin),
):
    """
      The only way to create accounts. No public self-registration exists.
    enrollment_no / employee_id are auto-generated.
    """
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
    )
    db.add(new_user)
    await db.flush()  
    # flush is super important here to get the new user's ID before inserting the profile

    if  "student" == user_data.role:
        enrollment_no = user_data.enrollment_no or await _generate_enrollment_no(db)
        db.add(StudentProfile(
            user_id=new_user.id,
            enrollment_no=enrollment_no,
            full_name=user_data.full_name,
            department="General",
        ))
    elif  "faculty"== user_data.role:
        employee_id = user_data.employee_id or await _generate_employee_id(db)
        db.add(FacultyProfile(
            user_id=new_user.id,
            employee_id=employee_id,
            full_name=user_data.full_name,
            department="General",
        ))
    # role == "admin" needs no profile row — admins aren't students or faculty

    try:
        await db.commit()
    except IntegrityError:
        # Extremely unlikely race: two requests generated the same
        # DB rollback if something clashes, 
        # usually happens if two people click save at the exact same time
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="ID collision — please retry",
        )

    return {"message": f"Successfully created {user_data.role} account: {user_data.email}"}

# GET /admin/users — the big list endpoint
# this get endpoint helps query the user of single role 

@router.get("/users", response_model=list[UserListItem])
async def list_users(
    # role is REQUIRED — the request must have one type to avoid
    # returning thousands of mixed rows and slow joins
    role: Literal["student", "faculty", "admin"] = Query(
        ...,
        description="Filter by role. Required — pick one of: student, faculty, admin."
    ),
    # optional: narrow further by active status
    active: bool | None = Query(
        default=None,
        description="true = active only, false = inactive only, omit = both"
    ),
    # optional: search by name or ID
    search: str | None = Query(
        default=None,
        description="Search by email, name, enrollment_no, or employee_id"
    ),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """
    List users of a specific role.

    Examples:
      GET /admin/users?role=student
      GET /admin/users?role=faculty&active=true
      GET /admin/users?role=student&search=john
      GET /admin/users?role=student&active=false&search=STU001
    """
    # Base query to filter by role 
    #query hits role column first
    query = select(User).where(User.role == role)

    # to load the multiple profiles in the same query to avoid N+1 queries for each user .
    # Without this SQLAlchemy would fire a separate SELECT for each user's
    # profile when we access user.student_profile / user.faculty_profile.
    
    if  "student" == role:
        query = query.options(selectinload(User.student_profile))
    elif "faculty" == role:
        query = query.options(selectinload(User.faculty_profile))

    # Optional active filter
    if active is not None:
        query = query.where(User.is_active == active)

    # Search stuff. Using ilike 
    # so it doesn't care if they type uppercase or lowercase its gonna be lowercase for query.
    if search:
        term = f"%{search.lower()}%"
        if  "student" == role :
            query = query.join(User.student_profile).where(
                User.email.ilike(term)
                | StudentProfile.full_name.ilike(term)
                | StudentProfile.enrollment_no.ilike(term)
                | StudentProfile.department.ilike(term)
            )
        elif  "faculty" == role :
            query = query.join(User.faculty_profile).where(
                User.email.ilike(term)
                | FacultyProfile.full_name.ilike(term)
                | FacultyProfile.employee_id.ilike(term)
                | FacultyProfile.department.ilike(term)
            )
        else:
            # admins don't have profiles so we just check their email
            query = query.where(User.email.ilike(term))

    result = await db.execute(query)
    users = result.scalars().all()

    return [
        UserListItem(
            id=u.id,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            profile=build_profile_dict(u),
        )
        for u in users
    ]

# GET /admin/users/{user_id} — single user detail

@router.get("/users/{user_id}", response_model=UserListItem)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
   

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    result = await db.execute(
        select(User)
        .where(User.id == uid)
        .options(
            selectinload(User.student_profile),
            selectinload(User.faculty_profile),
        )
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserListItem(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        profile=build_profile_dict(user),
    )

# PATCH /admin/users/{user_id} — update profile fields

@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    payload: UpdateUser,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """
    Update name, department, or (for students) current_semester.
    Email and role are intentionally not patchable here.
    Only the fields included in the request body are updated.
    """
    

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    result = await db.execute(
        select(User)
        .where(User.id == uid)
        .options(
            selectinload(User.student_profile),
            selectinload(User.faculty_profile),
        )
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only update the fields the actually sent
    # (exclude_unset=True means fields not in the JSON body are skipped)
    updates = payload.model_dump(exclude_unset=True)

    if "student" == user.role  and user.student_profile:
        profile = user.student_profile
        if "full_name" in updates:
            profile.full_name = updates["full_name"]
        if "department" in updates:
            profile.department = updates["department"]
        if "current_semester" in updates:
            profile.current_semester = updates["current_semester"]

    elif "faculty" == user.role  and user.faculty_profile:
        profile = user.faculty_profile
        if "full_name" in updates:
            profile.full_name = updates["full_name"]
        if "department" in updates:
            profile.department = updates["department"]

    await db.commit()
    return {"message": "User updated successfully"}

# PATCH /admin/users/{user_id}/toggle-active — soft delete / reactivate
@router.patch("/users/{user_id}/toggle-active")
async def toggle_active(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """
    Deactivates an active user, or reactivates an inactive one.
    A deactivated user's cookie is still technically valid until it
    expires, but get_current_user checks is_active on every request
    and returns 401 — so the effect is immediate.
    """
    import uuid

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent an admin from deactivating their own account —
    # they'd be locked out immediately with no way back in
    if str(user.id) == str(_admin.id):
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account"
        )

    user.is_active = not user.is_active
    await db.commit()

    status = "activated" if user.is_active else "deactivated"
    return {"message": f"User {status} successfully", "is_active": user.is_active}

# GET /admin/stats — dashboard overview counts


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """
    Aggregate counts for the admin dashboard overview cards.
    All in a single round-trip using subqueries.
    """
    # Count per role using conditional aggregation — one query, one round-trip
    result = await db.execute(
        select(
            func.count().filter(User.role == "student").label("total_students"),
            func.count().filter(User.role == "faculty").label("total_faculty"),
            func.count().filter(User.role == "admin").label("total_admins"),
            func.count().filter(User.is_active == True).label("active_users"),
            func.count().filter(User.is_active == False).label("inactive_users"),
        ).select_from(User)
    )
    row = result.first()

    return StatsResponse(
        total_students=row.total_students,
        total_faculty=row.total_faculty,
        total_admins=row.total_admins,
        active_users=row.active_users,
        inactive_users=row.inactive_users,
    )

# Class management endpoints
@router.get("/classes", response_model=list[ClassOut])
async def list_classes(
    department: str | None = None,
    semester: int | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all classes with student and faculty counts."""
    from sqlalchemy.orm import selectinload
    query = select(ClassGroup).options(
        selectinload(ClassGroup.students),
        selectinload(ClassGroup.faculty),
    )
    if department:
        query = query.where(ClassGroup.department.ilike(f"%{department}%"))
    if semester:
        query = query.where(ClassGroup.semester == semester)

    result = await db.execute(query)
    classes = result.scalars().all()

    return [
        ClassOut(
            id=cls.id,
            code=cls.code,
            name=cls.name,
            department=cls.department,
            semester=cls.semester,
            student_count=len(cls.students),
            faculty_count=len(cls.faculty),
        )
        for cls in classes
    ]


@router.post("/classes", status_code=201)
async def create_class(
    payload: CreateClassRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    # Check code uniqueness
    result = await db.execute(
        select(ClassGroup).where(ClassGroup.code == payload.code)
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="A class with this code already exists")

    cls = ClassGroup(
        code=payload.code,
        name=payload.name,
        department=payload.department,
        semester=payload.semester,
    )
    db.add(cls)
    await db.commit()
    return {"message": "Class created", "id": cls.id}


@router.delete("/classes/{class_id}", status_code=200)
async def delete_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(ClassGroup).where(ClassGroup.id == class_id))
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    await db.delete(cls)
    await db.commit()
    return {"message": "Class deleted"}


@router.get("/classes/{class_id}", response_model=ClassDetailOut)
async def get_class_detail(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Return a class with its full faculty and student lists."""
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(
            selectinload(ClassGroup.faculty),
            selectinload(ClassGroup.students),
        )
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    return ClassDetailOut(
        id=cls.id,
        code=cls.code,
        name=cls.name,
        department=cls.department,
        semester=cls.semester,
        faculty=[
            FacultyInClass(
                user_id=f.user_id,
                full_name=f.full_name,
                employee_id=f.employee_id,
                department=f.department,
            )
            for f in cls.faculty
        ],
        students=[
            StudentInClass(
                user_id=s.user_id,
                full_name=s.full_name,
                enrollment_no=s.enrollment_no,
                department=s.department,
                current_semester=s.current_semester,
            )
            for s in cls.students
        ],
    )


@router.post("/classes/{class_id}/faculty/{user_id}", status_code=200)
async def assign_faculty(
    class_id: int,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Assign a faculty member to a class. Takes the faculty's user UUID."""
    import uuid as _uuid
    from sqlalchemy.orm import selectinload

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Resolve to FacultyProfile
    result = await db.execute(
        select(FacultyProfile).where(FacultyProfile.user_id == uid)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    # Load class with existing faculty
    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.faculty))
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if profile in cls.faculty:
        raise HTTPException(status_code=400, detail="Faculty already assigned to this class")

    cls.faculty.append(profile)
    await db.commit()
    return {"message": "Faculty assigned"}


@router.delete("/classes/{class_id}/faculty/{user_id}", status_code=200)
async def remove_faculty(
    class_id: int,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Remove a faculty member from a class."""
    import uuid as _uuid
    from sqlalchemy.orm import selectinload

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(
        select(FacultyProfile).where(FacultyProfile.user_id == uid)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.faculty))
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if profile not in cls.faculty:
        raise HTTPException(status_code=400, detail="Faculty not assigned to this class")

    cls.faculty.remove(profile)
    await db.commit()
    return {"message": "Faculty removed"}


@router.post("/classes/{class_id}/students/{user_id}", status_code=200)
async def enroll_student(
    class_id: int,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Enroll a student in a class. Takes the student's user UUID."""
    import uuid as _uuid
    from sqlalchemy.orm import selectinload

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == uid)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if profile in cls.students:
        raise HTTPException(status_code=400, detail="Student already enrolled in this class")

    cls.students.append(profile)
    await db.commit()
    return {"message": "Student enrolled"}


@router.delete("/classes/{class_id}/students/{user_id}", status_code=200)
async def unenroll_student(
    class_id: int,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Remove a student from a class."""
    import uuid as _uuid
    from sqlalchemy.orm import selectinload

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == uid)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    result = await db.execute(
        select(ClassGroup)
        .where(ClassGroup.id == class_id)
        .options(selectinload(ClassGroup.students))
    )
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if profile not in cls.students:
        raise HTTPException(status_code=400, detail="Student not enrolled in this class")

    cls.students.remove(profile)
    await db.commit()
    return {"message": "Student unenrolled"}