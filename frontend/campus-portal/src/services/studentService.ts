import axios from "axios";
import axiosInstance from "./axiosInstance";
import type {
  StudentProfile,
  StudentCourse,
  StudentCourseDetail,
  StudentGrade,
  AttendanceOverallSummary,
  StudentExamResult,
} from "./types";

/**
 * file.type is unreliable; S3 requires the PUT Content-Type to match what the
 * presigned URL was signed with, so we derive it from the extension.
 */
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

export const studentService = {
  // --- Profile & courses ---------------------------------------------------
  async getProfile(): Promise<StudentProfile> {
    const res = await axiosInstance.get<StudentProfile>("/student/profile");
    return res.data;
  },

  async listCourses(): Promise<StudentCourse[]> {
    const res = await axiosInstance.get<StudentCourse[]>("/student/courses");
    return res.data;
  },

  async getCourseDetail(courseId: number): Promise<StudentCourseDetail> {
    const res = await axiosInstance.get<StudentCourseDetail>(`/student/courses/${courseId}`);
    return res.data;
  },

  // --- Assignment submission (S3) ------------------------------------------

  /**
   * Full submission flow in one call:
   *   1. presign  → get an S3 PUT URL from our backend
   *   2. PUT      → upload bytes directly to S3 (bare axios, no auth cookie)
   *   3. confirm  → tell our backend so it records/updates the submission
   */
  async submitAssignment(
    assignmentId: number,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const contentType = getMimeType(file.name);

    // Step 1: presign
    const presignRes = await axiosInstance.post<{ presigned_url: string; object_key: string }>(
      `/student/assignments/${assignmentId}/submit/presign`,
      { filename: file.name, content_type: contentType }
    );
    const { presigned_url, object_key } = presignRes.data;

    // Step 2: raw PUT to S3 — bare axios, NOT the `api` instance
    await axios.put(presigned_url, file, {
      headers: { "Content-Type": contentType },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });

    // Step 3: confirm
    await axiosInstance.post(`/student/assignments/${assignmentId}/submit/confirm`, { object_key });
  },

  // --- Grades, attendance, results -----------------------------------------
  async listGrades(): Promise<StudentGrade[]> {
    const res = await axiosInstance.get<StudentGrade[]>("/student/grades");
    return res.data;
  },

  async getAttendanceSummary(): Promise<AttendanceOverallSummary> {
    const res = await axiosInstance.get<AttendanceOverallSummary>("/student/attendance/summary");
    return res.data;
  },

  async getResults(): Promise<StudentExamResult[]> {
    const res = await axiosInstance.get<StudentExamResult[]>("/student/results");
    return res.data;
  },
};