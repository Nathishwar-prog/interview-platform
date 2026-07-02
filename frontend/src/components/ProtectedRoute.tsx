import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}
