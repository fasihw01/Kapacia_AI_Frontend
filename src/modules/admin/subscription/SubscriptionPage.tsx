import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import {
  useSubscriptionPlans,
  useCreateCheckout,
  useOrgSubscription,
  usePaymentHistory,
} from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/services/subscriptionService";
import { PlanCard } from "./components/PlanCard";
import { PlanCardSkeleton } from "./components/PlanCardSkeleton";
import { BillingIntervalToggle } from "./components/BillingIntervalToggle";
import { CheckoutErrorAlert } from "./components/CheckoutErrorAlert";
import { getPriceForInterval } from "./components/subscriptionHelpers";
import { ActiveSubscriptionCard } from "./components/ActiveSubscriptionCard";
import { SubscribedOrgsTab } from "./components/SubscribedOrgsTab";
// ── Organisation view ──────────────────────────────────────────────────────

function OrgSubscriptionPage() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data: sub, isLoading: subLoading } = useOrgSubscription();
  const { data: payments } = usePaymentHistory();
  const { data: plans, isLoading: plansLoading, isError, refetch } = useSubscriptionPlans();
  const checkoutMutation = useCreateCheckout();

  const isActive = ["active", "trialing"].includes(
    (sub?.status ?? "").toLowerCase(),
  );

  const handleSubscribe = async (priceId: string) => {
    setCheckoutError(null);
    setCheckoutLoadingId(priceId);
    try {
      const result = await checkoutMutation.mutateAsync(priceId);
      if (result.checkout?.url) {
        window.location.href = result.checkout.url;
      } else {
        setCheckoutError("Checkout failed. Please try again.");
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Checkout failed. Please try again.",
      );
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-medium text-secondary text-sm">Subscription</h1>
        <p className="mt-1 text-accent text-sm">
          Manage your organisation's subscription.
        </p>
      </div>

      {/* Active subscription details */}
      {subLoading ? (
        <div className="bg-gray-100 rounded-xl w-full h-32 animate-pulse" />
      ) : sub ? (
        <ActiveSubscriptionCard subscription={sub} payments={payments} />
      ) : null}

      {/* Plans — show upgrade options if active, or all plans if not */}
      {!subLoading && (
        <div className="space-y-4">
          <div>
            <p className="font-medium text-secondary text-sm">
              {isActive ? "Change Plan" : "Choose a Plan"}
            </p>
            <p className="text-accent text-xs mt-0.5">
              {isActive
                ? "Upgrade or switch your current plan."
                : "Select a plan to get started."}
            </p>
          </div>

          <BillingIntervalToggle interval={interval} onChange={setInterval} />

          {checkoutError && (
            <CheckoutErrorAlert
              message={checkoutError}
              onDismiss={() => setCheckoutError(null)}
            />
          )}

          {plansLoading ? (
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <PlanCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto mb-3 w-8 h-8 text-red-400" />
              <p className="mb-4 text-accent text-sm">Failed to load plans.</p>
              <Button
                onClick={() => refetch()}
                className="bg-primary hover:bg-primary/80 rounded-full text-white"
              >
                Try Again
              </Button>
            </Card>
          ) : (
            <div
              className={`grid gap-6 ${
                (plans?.length ?? 0) <= 1
                  ? "grid-cols-1 max-w-sm mx-auto"
                  : (plans?.length ?? 0) === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {(plans ?? []).map((plan: SubscriptionPlan) => {
                const price = getPriceForInterval(plan.prices, interval);
                const isCurrentPlan = isActive && price?.id === sub?.priceId;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    interval={interval}
                    isCurrentPlan={!!isCurrentPlan}
                    isLoading={checkoutLoadingId === price?.id}
                    onSubscribe={handleSubscribe}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-center text-accent text-xs">
        Payments are processed securely via Stripe. You can cancel anytime.
      </p>
    </div>
  );
}

// ── Admin / Moderator view ─────────────────────────────────────────────────

function AdminSubscriptionPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-medium text-secondary text-sm">Subscribed Organisations</h1>
        <p className="mt-1 text-accent text-sm">
          Organisations with an active subscription.
        </p>
      </div>
      <SubscribedOrgsTab />
    </div>
  );
}

// ── Entry point ────────────────────────────────────────────────────────────

export function SubscriptionPage() {
  const { user } = useAuth();
  const isOrg = user?.role === "organisation";
  return isOrg ? <OrgSubscriptionPage /> : <AdminSubscriptionPage />;
}
