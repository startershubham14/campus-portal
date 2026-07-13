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

// Faculty

export interface FacultyProfile {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
}

export interface FacultyCourse {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: number;
  student_count: number;
}

export interface FacultyMaterial {
  id: number;
  title: string;
  file_url: string;
  source_type: "upload" | "link";
  uploaded_at: string | null;
}

export interface FacultyAssignment {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  submission_count: number;
}

export interface FacultyCourseDetail extends FacultyCourse {
  materials: FacultyMaterial[];
  assignments: FacultyAssignment[];
}

export interface FacultySubmission {
  id: number;
  student_name: string;
  enrollment_no: string;
  file_url: string;
  submitted_at: string | null;
  marks_awarded: number | null;
  feedback: string | null;
}

export interface AttendanceRosterItem {
  student_id: string;
  full_name: string;
  enrollment_no: string;
  is_present: boolean | null;
}

export interface StudentAttendanceStat {
  student_id: string;
  full_name: string;
  enrollment_no: string;
  present: number;
  total: number;
  percentage: number;
  status: "safe" | "warning" | "critical";
}

export interface ClassAttendanceSummary {
  class_id: number;
  total_sessions: number;
  class_average: number;
  at_risk_count: number;
  students: StudentAttendanceStat[];
}

export interface ExamListItem {
  id: number;
  title: string;
  exam_type: string;
  max_marks: number;
  exam_date: string;
  results_entered: number;
  total_students: number;
}

export interface ExamResultRosterItem {
  student_id: string;
  full_name: string;
  enrollment_no: string;
  marks_obtained: number | null;
  remarks: string | null;
}

export interface ExamAnalyticsData {
  exam_id: number;
  title: string;
  max_marks: number;
  total_students: number;
  results_entered: number;
  average: number | null;
  highest: number | null;
  lowest: number | null;
  pass_count: number;
  fail_count: number;
  distribution: { bucket: string; count: number }[];
}

// Request payloads
export interface CreateAssignmentPayload {
  title: string;
  description: string | null;
  due_date: string;
}

export interface CreateExamPayload {
  title: string;
  exam_type: string;
  max_marks: number;
  exam_date: string;
}

export interface AttendanceMark {
  student_id: string;
  is_present: boolean;
}

export interface ExamResultEntry {
  student_id: string;
  marks_obtained: number;
}