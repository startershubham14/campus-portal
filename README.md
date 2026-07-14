---

## Live Demo

**[https://campus-portal-gilt.vercel.app](https://campus-portal-gilt.vercel.app)**

Sign in with either account below to explore the two main roles:

| Role        | Email                        | Password         |
|-------------|------------------------------|------------------|
| **Faculty** | `meena.joshi@college.edu.in` | `meena.joshi`    |
| **Student** | `omkar.jadhav02@example.com` | `omkar.jadhav02` |

> Shared demo accounts — data may be modified by other visitors. There is no public
> sign-up by design: all accounts are created by an admin.

**What to try:**
- **As faculty** — open a class to upload course material, create an assignment, mark attendance, or create an exam and enter marks (the Analytics tab then shows a score distribution).
- **As student** — check the **Attendance** tab (shows the 75% exam-eligibility rule with plain-English guidance) and the **Results** tab (class rank and your scores vs the class average).

### Deployment architecture

| Layer        | Hosted on                                                   |
|--------------|-------------------------------------------------------------|
| Frontend     | Vercel                                                      |
| Backend API  | AWS EC2 (nginx → gunicorn/uvicorn), HTTPS via Let's Encrypt |
| Database     | AWS RDS (PostgreSQL)                                        |
| File storage | AWS S3 (direct browser uploads via presigned URLs)          |

---
