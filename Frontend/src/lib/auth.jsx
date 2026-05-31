import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { userApi } from "../services/authService";

/**
 * Normalize the user payload returned by the backend so the frontend
 * can use camelCase consistently. Backend returns snake_case fields.
 */
export function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.full_name ?? u.fullName ?? "",
    phone: u.phone ?? "",
    role: u.role,
    status: u.status,
    isVerified: u.is_verified ?? u.isVerified ?? false,
    createdAt: u.created_at ?? u.createdAt,
    updatedAt: u.updated_at ?? u.updatedAt,
  };
}

export function ProtectedRoute({ children, roles }) {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { accessToken, user } = useAuthStore();
  if (accessToken && user) return <Navigate to="/" replace />;
  return children;
}

/**
 * Refresh the cached user profile from /users/me on app boot.
 * Keeps role / status fresh after admin actions.
 */
export function useSyncProfile() {
  const { accessToken, setUser } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    userApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(normalizeUser(u));
      })
      .catch(() => {
        // interceptor will handle 401 and clear auth
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);
}
