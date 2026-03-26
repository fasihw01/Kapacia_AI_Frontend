// src/components/auth/HomeRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { paths } from "@/app/routes/paths";

const HomeRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not logged in - redirect to login
      navigate(paths.login, { replace: true });
      return;
    }

    console.log("user in home redirect", user);
    // Logged in - redirect based on role
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "moderator":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "practitioner":
          navigate("/practitioner/dashboard", { replace: true });
          break;
        case "organisation": {
          const status = user.organisation?.subscriptionStatus;
          const isActive =
            typeof status === "string" &&
            ["active", "trialing"].includes(status.toLowerCase());
          if (isActive) {
            navigate(paths.adminDashboard, { replace: true });
          } else {
            navigate(paths.organisationSubscriptionRequired, { replace: true });
          }
          break;
        }
        default:
          navigate(paths.login, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Show loading spinner while checking
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-4 border-blue-500/30 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return null;
};

export default HomeRedirect;
