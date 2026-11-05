import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionExpiredHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [navigate]);

  return null;
};

export default SessionExpiredHandler;
