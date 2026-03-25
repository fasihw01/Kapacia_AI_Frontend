import { Link } from "react-router-dom";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function OrganisationSubscribeNavBar() {
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

        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

