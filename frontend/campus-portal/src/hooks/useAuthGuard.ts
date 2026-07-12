import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import type { AuthUser, Role } from "../services/types";

/**
 * Guards a page by verifying the session server-side via /auth/me.
 * Redirects to /login if not authenticated or the role doesn't match.
 */
export function useAuthGuard(requiredRole: Role) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await authService.getMe();
        if (data.role !== requiredRole) {
          // Logged in but wrong role — kick back to login
          navigate("/login");
          return;
        }
        setUser(data);
      } catch {
        // 401 or network error — can't verify, redirect
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate, requiredRole]);

  return { user, loading };
}

export async function logout(navigate: (path: string) => void) {
  await authService.logout();
  navigate("/login");
}