import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useOrgSubscription } from "@/hooks/useSubscription";
import { paths } from "@/app/routes/paths";

interface Props {
  children: ReactNode;
}

const Spinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="border-4 border-blue-500/30 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
  </div>
);

/**
 * Wraps protected /admin routes for organisation users.
 * Redirects to /organisation/subscription if subscription is not active.
 */
const OrganisationSubscriptionGuard: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "organisation") return <>{children}</>;
  return <RequireActiveSubscription>{children}</RequireActiveSubscription>;
};

/**
 * Wraps the /organisation/subscription page.
 * Redirects already-subscribed orgs away to the dashboard.
 */
export const OrganisationSubscriptionPageGuard: React.FC<Props> = ({
  children,
}) => {
  const { user } = useAuth();
  if (user?.role !== "organisation") return <>{children}</>;
  return <RedirectIfSubscribed>{children}</RedirectIfSubscribed>;
};

// ── internals ──────────────────────────────────────────────────────────────

const RequireActiveSubscription: React.FC<Props> = ({ children }) => {
  const { data, isLoading } = useOrgSubscription();

  if (isLoading) return <Spinner />;

  const isActive = isActiveStatus(data?.status);
  if (!isActive) {
    return <Navigate to={paths.organisationSubscriptionRequired} replace />;
  }
  return <>{children}</>;
};

const RedirectIfSubscribed: React.FC<Props> = ({ children }) => {
  const { data, isLoading } = useOrgSubscription();

  if (isLoading) return <Spinner />;

  const isActive = isActiveStatus(data?.status);
  if (isActive) {
    return <Navigate to={paths.adminDashboard} replace />;
  }
  return <>{children}</>;
};

function isActiveStatus(status?: string) {
  return ["active", "trialing"].includes((status ?? "").toLowerCase());
}

export default OrganisationSubscriptionGuard;
