import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white shadow-sm p-8 sm:p-10 border border-gray-100 rounded-2xl w-full max-w-md text-center space-y-4">
          <img
            src="/images/auth/logo.svg"
            alt="Logo"
            width={140}
            height={40}
            className="mx-auto mb-4"
          />
          <div className="flex justify-center items-center bg-red-100 mx-auto rounded-full w-16 h-16">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-semibold text-secondary text-xl">
            Something went wrong
          </h1>
          <p className="text-accent text-sm">
            No payment session found. Please try again.
          </p>
          <Button
            onClick={() => navigate("/admin/subscription")}
            className="bg-primary hover:bg-primary/80 rounded-full w-full text-white"
          >
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-sm p-8 sm:p-10 border border-gray-100 rounded-2xl w-full max-w-md text-center space-y-6">
        <img
          src="/images/auth/logo.svg"
          alt="Logo"
          width={140}
          height={40}
          className="mx-auto"
        />

        <div className="flex justify-center items-center bg-green-100 mx-auto rounded-full w-20 h-20">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="font-semibold text-secondary text-2xl">
            Payment Successful!
          </h1>
          <p className="text-accent text-sm">
            Your subscription is now active. Welcome aboard!
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-primary hover:bg-primary/80 rounded-full w-full text-white"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Link
            to="/admin/subscription"
            className="text-primary text-sm hover:underline"
          >
            View subscription details
          </Link>
        </div>
      </div>
    </div>
  );
}
