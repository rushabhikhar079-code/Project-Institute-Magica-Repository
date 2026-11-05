import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "./services/api";
import { useAppSelector } from "./redux/hooks";

type AccessLevel = "institute" | "branch";

interface ProtectedRouteProps {
  allowedLevel?: AccessLevel;
  allowedRoles?: number[];
}

const ProtectedRoute = ({
  allowedLevel,
  allowedRoles,
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const branchId = useAppSelector((state) => state.branch.branchId);
  const roleId = Number(localStorage.getItem("role"));

  const outletContext = useOutletContext();

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Never logged in
      if (!accessToken && !refreshToken) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        await api.get("/auth/CheckAuth", {
          params: {
            t: Date.now(),
          },
        });

        setAuthenticated(true);
      } catch (error: any) {
        setAuthenticated(false);

        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          toast.error("Your session has expired. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedLevel === "institute" && branchId !== 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedLevel === "branch" && branchId === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet context={outletContext} />;
};

export default ProtectedRoute;
