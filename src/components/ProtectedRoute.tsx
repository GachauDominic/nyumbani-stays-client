import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === "hostAdmin" ? "/host" : "/rooms"} replace />;
  }

  return <>{children}</>;
}
