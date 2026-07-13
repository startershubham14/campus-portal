import axios from "axios";
import axiosInstance from "./axiosInstance";
import type {
  FacultyProfile,
  FacultyCourse,
  FacultyCourseDetail,
  FacultySubmission,
  AttendanceRosterItem,
  ClassAttendanceSummary,
  ExamListItem,
  ExamResultRosterItem,
  ExamAnalyticsData,
  CreateAssignmentPayload,
  CreateExamPayload,
  AttendanceMark,
  ExamResultEntry,
} from "./types";

/**
 * file.type is unreliable across browsers/OS, and S3 requires the PUT
 * Content-Type to match exactly what the presigned URL was signed with.
 * Deriving it from the extension keeps both sides identical.
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

export const facultyService = {
  // --- Profile & courses ---------------------------------------------------
  async getProfile(): Promise<FacultyProfile> {
    const res = await axiosInstance.get<FacultyProfile>("/faculty/profile");
    return res.data;
  },

  async listCourses(): Promise<FacultyCourse[]> {
    const res = await axiosInstance.get<FacultyCourse[]>("/faculty/courses");
    return res.data;
  },

  async getCourseDetail(courseId: number): Promise<FacultyCourseDetail> {
    const res = await axiosInstance.get<FacultyCourseDetail>(`/faculty/courses/${courseId}`);
    return res.data;
  },

  // --- Materials -----------------------------------------------------------

  /**
   * Full S3 upload flow in one call:
   *   1. ask our backend for a presigned PUT URL
   *   2. upload the file bytes directly to S3 (bypasses our auth instance —
   *      S3 rejects requests that carry the auth cookie or JSON content-type)
   *   3. tell our backend the upload succeeded so it saves the record
   * onProgress (0-100) is optional, driven by the S3 upload step.
   */
  async uploadMaterial(
    courseId: number,
    courseCode: string,
    title: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const contentType = getMimeType(file.name);

    // Step 1: presign
    const presignRes = await axiosInstance.post<{ presigned_url: string; object_key: string }>(
      `/faculty/courses/${courseId}/materials/presign`,
      { filename: file.name, content_type: contentType, class_code: courseCode }
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
    await axiosInstance.post(`/faculty/courses/${courseId}/materials/confirm`, { title, object_key });
  },

  async addLinkMaterial(courseId: number, title: string, url: string): Promise<void> {
    await axiosInstance.post(`/faculty/courses/${courseId}/materials/link`, { title, url });
  },

  async deleteMaterial(materialId: number): Promise<void> {
    await axiosInstance.delete(`/faculty/materials/${materialId}`);
  },

  // --- Assignments & submissions -------------------------------------------
  async createAssignment(courseId: number, payload: CreateAssignmentPayload): Promise<void> {
    await axiosInstance.post(`/faculty/courses/${courseId}/assignments`, payload);
  },

  async listSubmissions(assignmentId: number): Promise<FacultySubmission[]> {
    const res = await axiosInstance.get<FacultySubmission[]>(
      `/faculty/assignments/${assignmentId}/submissions`
    );
    return res.data;
  },

  async gradeSubmission(
    submissionId: number,
    marks_awarded: number,
    feedback: string | null
  ): Promise<void> {
    await axiosInstance.patch(`/faculty/submissions/${submissionId}/grade`, {
      marks_awarded,
      feedback,
    });
  },

  // --- Attendance ----------------------------------------------------------
  async getAttendanceRoster(
    courseId: number,
    date: string
  ): Promise<{ roster: AttendanceRosterItem[] }> {
    const res = await axiosInstance.get<{ roster: AttendanceRosterItem[] }>(
      `/faculty/courses/${courseId}/attendance`,
      { params: { date } }
    );
    return res.data;
  },

  async saveAttendance(
    courseId: number,
    date: string,
    marks: AttendanceMark[]
  ): Promise<void> {
    await axiosInstance.post(`/faculty/courses/${courseId}/attendance`, { date, marks });
  },

  async getAttendanceSummary(courseId: number): Promise<ClassAttendanceSummary> {
    const res = await axiosInstance.get<ClassAttendanceSummary>(
      `/faculty/courses/${courseId}/attendance/summary`
    );
    return res.data;
  },

  // --- Exams ---------------------------------------------------------------
  async listExams(courseId: number): Promise<ExamListItem[]> {
    const res = await axiosInstance.get<ExamListItem[]>(`/faculty/courses/${courseId}/exams`);
    return res.data;
  },

  async createExam(courseId: number, payload: CreateExamPayload): Promise<void> {
    await axiosInstance.post(`/faculty/courses/${courseId}/exams`, payload);
  },

  async deleteExam(examId: number): Promise<void> {
    await axiosInstance.delete(`/faculty/exams/${examId}`);
  },

  async getExamRoster(examId: number): Promise<{ roster: ExamResultRosterItem[] }> {
    const res = await axiosInstance.get<{ roster: ExamResultRosterItem[] }>(
      `/faculty/exams/${examId}/roster`
    );
    return res.data;
  },

  async saveExamResults(examId: number, results: ExamResultEntry[]): Promise<void> {
    await axiosInstance.post(`/faculty/exams/${examId}/results`, { results });
  },

  async getExamAnalytics(examId: number): Promise<ExamAnalyticsData> {
    const res = await axiosInstance.get<ExamAnalyticsData>(`/faculty/exams/${examId}/analytics`);
    return res.data;
  },
};