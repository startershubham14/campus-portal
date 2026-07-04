import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export function useAuthGuard(requiredRole: string) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          // "include" sends the httpOnly cookie automatically
          credentials: "include",
        });

        if (!res.ok) {
          // 401: not logged in, or token expired
          navigate("/login");
          return;
        }

        const data: AuthUser = await res.json();

        if (data.role !== requiredRole) {
          // Logged in but wrong role — kick back to login
          navigate("/login");
          return;
        }

        setUser(data);
      } catch {
        // Network error — can't verify, safest to redirect
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate, requiredRole]);//depended states

  return { user, loading };
}

/**
 * Calls /auth/logout which clears the httpOnly cookie on the server,
 * then navigates to login.
 */
export async function logout(navigate: (path: string) => void) {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    // Always redirect even if the network call fails
    navigate("/login");
  }
}