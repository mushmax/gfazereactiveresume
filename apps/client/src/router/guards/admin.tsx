import { Navigate, Outlet } from "react-router";

import { useUser } from "@/client/services/user";

export const AdminGuard = () => {
  const { user, loading } = useUser();

  if (loading) return null;

  if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
    return <Outlet />;
  }

  return <Navigate replace to="/dashboard" />;
};
