import axiosInstance from "./axiosInstance";
import type { LoginResponse, AuthUser } from "./types";

/**
 * Authentication calls. The JWT lives in an httpOnly cookie set by the
 * server, so none of these ever touch a token directly.
 */
export const authService = {
  /** Log in. On success the server sets the auth cookie; we get the role back. */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await axiosInstance.post<LoginResponse>("/auth/login", { email, password });
    return res.data;
  },

  /** Verify the current session and return the logged-in user (or throws 401). */
  async getMe(): Promise<AuthUser> {
    const res = await axiosInstance.get<AuthUser>("/auth/me");
    return res.data;
  },

  /** Clear the auth cookie server-side. Never throws - logout should always proceed. */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Ignore - we redirect regardless of whether the call succeeded.
    }
  },
};