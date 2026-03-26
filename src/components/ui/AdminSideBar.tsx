import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: string;
  lucideIcon?: LucideIcon;
  show: boolean;
}

const PractitionerSideBar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "moderator";
  const isOrganisation = user?.role === "organisation";

  const items: NavItem[] = [
    { key: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: "dash", show: true },
    { key: "my-classes", label: "All Cases", to: "/admin/cases", icon: "class", show: isOrganisation },
    { key: "user-management", label: "User Management", to: "/admin/user-management", icon: "user", show: isAdmin },
    { key: "practitioners", label: "Practitioners", to: "/admin/practitioners", icon: "user", show: isOrganisation },
    { key: "organisation-management", label: "Organisations", to: "/admin/organisation-management", icon: "user", show: isAdmin },
    { key: "audit-logs", label: "Audit Logs", to: "/admin/audit-logs", icon: "audit", show: true },
    { key: "subscription", label: "Subscription", to: "/admin/subscription", icon: "", lucideIcon: CreditCard, show: isOrganisation },
    { key: "subscription-admin", label: "Subscription", to: "/admin/subscription", icon: "", lucideIcon: CreditCard, show: isAdmin },
    { key: "settings", label: "Settings", to: "/admin/settings", icon: "setting", show: true },
  ].filter((item) => item.show);
  return (
    <aside className="flex flex-col justify-between bg-white border-border/60 border-r w-64 h-full">
      <div>
        <div className="flex items-center gap-3 px-6 py-3 border-border/60 border-b">
          <Link to="/admin/dashboard" className="flex items-center">
            <img
              src="/images/practitioner/dashboardlogo.svg"
              alt="Kapacia AI"
              className="rounded-md w-full h-12"
            />
            {/* <div>
              <h1 className="font-bold text-[#03045E] text-2xl">Kapacia AI</h1>
              <p className="text-[#67B5F9] text-[12px]">
             Documentation
              </p>
            </div> */}
          </Link>
        </div>

        <nav className="space-y-1 px-2 py-4">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mx-2 hover:bg-gray-100 ${
                  isActive ? "bg-blue-50  text-primary" : "text-gray-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {it.lucideIcon ? (
                    <it.lucideIcon
                      className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-500"}`}
                    />
                  ) : (
                    <img
                      src={
                        isActive
                          ? `/images/admin/active/${it.icon}.svg`
                          : `/images/admin/${it.icon}.svg`
                      }
                      alt={it.label}
                      className="w-5 h-5"
                    />
                  )}
                  <span className="font-medium">{it.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-6 py-8">
        <div className="pt-6 border-t">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
};

export default PractitionerSideBar;
