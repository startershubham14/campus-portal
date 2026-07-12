// Auth

export type Role = "admin" | "faculty" | "student";

export interface LoginResponse {
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

// Admin

export interface Stats {
  total_students: number;
  total_faculty: number;
  total_admins: number;
  active_users: number;
  inactive_users: number;
}

export interface UserProfile {
  full_name: string;
  enrollment_no?: string;  // students
  employee_id?: string;    // faculty
  department: string;
  current_semester?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  profile: UserProfile | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: Role;
  full_name: string;
  enrollment_no?: string;
  employee_id?: string;
}

export interface ClassOut {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: number;
  student_count: number;
  faculty_count: number;
}

export interface PersonInClass {
  user_id: string;
  full_name: string;
  enrollment_no?: string;
  employee_id?: string;
  department: string;
  current_semester?: number;
}

export interface ClassDetail extends ClassOut {
  faculty: PersonInClass[];
  students: PersonInClass[];
}

export interface CreateClassPayload {
  code: string;
  name: string;
  department: string;
  semester: number;
}

// Toggle-active returns the new state
export interface ToggleActiveResponse {
  is_active: boolean;
}