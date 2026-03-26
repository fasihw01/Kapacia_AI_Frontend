import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/contexts/useAuth";

export default function OrganisationSubscribeNavBar() {
  const { user } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const displayRole =
    user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : "";

  return (
    <header className="bg-white border-border/60 border-b">
      <div className="flex justify-between items-center mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4 w-full">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/auth/logo.svg"
            alt="Kapacia AI"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Avatar circle */}
              <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10 font-semibold text-gray-600 text-lg shrink-0">
                {initial}
              </div>
              {/* Name + role */}
              <div className="leading-tight">
                <p className="font-semibold text-gray-900 text-sm">
                  {user.name}
                </p>
                <p className="text-blue-500 text-xs">{displayRole}</p>
              </div>
            </div>
          )}

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

