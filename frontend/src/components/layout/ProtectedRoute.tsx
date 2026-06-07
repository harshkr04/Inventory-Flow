import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuthStore();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
