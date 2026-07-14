import axiosInstance from "./axiosInstance";
import type {
  Stats,
  AdminUser,
  CreateUserPayload,
  ClassOut,
  ClassDetail,
  CreateClassPayload,
  ToggleActiveResponse,
  Role,
} from "./types";

interface ListUsersFilters {
  role: Role;
  active?: boolean;
  search?: string;
}

/**
 * Admin operations: user management, class management, dashboard stats.
 * Every call here is gated server-side by the require_admin dependency.
 */
export const adminService = {
  // Stats
  async getStats(): Promise<Stats> {
    const res = await axiosInstance.get<Stats>("/admin/stats");
    return res.data;
  },

  // Users 
  async listUsers(filters: ListUsersFilters): Promise<AdminUser[]> {
    // axios serializes `params` into the query string and omits undefined keys
    const res = await axiosInstance.get<AdminUser[]>("/admin/users", {
      params: {
        role: filters.role,
        active: filters.active,
        search: filters.search || undefined,
      },
    });
    return res.data;
  },

  async createUser(payload: CreateUserPayload): Promise<void> {
    await axiosInstance.post("/admin/users", payload);
  },

  async toggleUserActive(userId: string): Promise<ToggleActiveResponse> {
    const res = await axiosInstance.patch<ToggleActiveResponse>(
      `/admin/users/${userId}/toggle-active`
    );
    return res.data;
  },

  //  Classes 
  async listClasses(): Promise<ClassOut[]> {
    const res = await axiosInstance.get<ClassOut[]>("/admin/classes");
    return res.data;
  },

  async getClass(classId: number): Promise<ClassDetail> {
    const res = await axiosInstance.get<ClassDetail>(`/admin/classes/${classId}`);
    return res.data;
  },

  async createClass(payload: CreateClassPayload): Promise<void> {
    await axiosInstance.post("/admin/classes", payload);
  },

  async deleteClass(classId: number): Promise<void> {
    await axiosInstance.delete(`/admin/classes/${classId}`);
  },

  // --- Class membership ----------------------------------------------------
  async assignFaculty(classId: number, userId: string): Promise<void> {
    await axiosInstance.post(`/admin/classes/${classId}/faculty/${userId}`);
  },

  async removeFaculty(classId: number, userId: string): Promise<void> {
    await axiosInstance.delete(`/admin/classes/${classId}/faculty/${userId}`);
  },

  async enrollStudent(classId: number, userId: string): Promise<void> {
    await axiosInstance.post(`/admin/classes/${classId}/students/${userId}`);
  },

  async unenrollStudent(classId: number, userId: string): Promise<void> {
    await axiosInstance.delete(`/admin/classes/${classId}/students/${userId}`);
  },
};