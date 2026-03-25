import OrganisationSubscribeNavBar from "@/components/ui/OrganisationSubscribeNavBar";
import { SubscriptionPage } from "./SubscriptionPage";

export default function OrganisationSubscriptionRequiredPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrganisationSubscribeNavBar />
      <main className="mx-auto px-3 sm:px-4 md:px-6 py-6 w-full max-w-6xl">
        <SubscriptionPage />
      </main>
    </div>
  );
}

