"""
One-time script to create the very first admin account.

Why this exists: once registration is admin-only, there's a 
 you need an admin to create an admin. This script
breaks that cycle by writing directly to the database, bypassing the
API and its auth checks entirely. It should never be exposed as an
HTTP endpoint.

Usage (run from the backend/ directory, with your venv active):
    python -m app.scripts.create_first_admin
"""
import asyncio
import getpass

from sqlalchemy.future import select

from app.database.connection import AsyncSessionLocal
from app.database.models import User
from app.auth.security import get_password_hash


async def main():
    email = input("Admin email: ").strip()
    if not email:
        print("Email cannot be empty.")
        return

    password = getpass.getpass("Admin password: ")
    if len(password) < 8:
        print("Password should be at least 8 characters.")
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        if result.scalars().first():
            print(f"A user with email '{email}' already exists.")
            return

        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            role="admin",
        )
        db.add(admin)
        await db.commit()
        print(f"Admin account created successfully: {email}")
        print("You can now log in and use POST /admin/users to create more accounts.")


if __name__ == "__main__":
    asyncio.run(main())