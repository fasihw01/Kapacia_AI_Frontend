import { Check, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/services/subscriptionService";
import { formatPrice, getPriceForInterval } from "./subscriptionHelpers";

interface PlanCardProps {
  plan: SubscriptionPlan;
  interval: "month" | "year";
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSubscribe: (priceId: string) => void;
}

function getDefaultPlanFeatures(planName: string): string[] {
  const normalizedName = planName.toLowerCase();

  if (normalizedName.includes("basic")) {
    return ["Core case management", "Secure session notes", "Email support"];
  }

  if (
    normalizedName.includes("pro") ||
    normalizedName.includes("professional")
  ) {
    return [
      "Everything in Basic",
      "Advanced reporting and analytics",
      "Priority support",
    ];
  }

  return [
    "Secure platform access",
    "Case and session workflow tools",
    "Standard support",
  ];
}

export function PlanCard({
  plan,
  interval,
  isCurrentPlan,
  isLoading,
  onSubscribe,
}: PlanCardProps) {
  const price = getPriceForInterval(plan.prices, interval);
  const isPopular = plan.metadata?.popular === "true";
  const features =
    plan.features && plan.features.length > 0
      ? plan.features
      : getDefaultPlanFeatures(plan.name);

  return (
    <div className="relative flex flex-col">
      {isPopular && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-primary px-3 py-1 rounded-full font-medium text-white text-xs">
            <Zap className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <Card
        className={`flex flex-col h-full p-6 transition-all duration-200 ${
          isPopular
            ? "border-2 border-primary shadow-md shadow-primary/10"
            : "border border-border/60"
        } ${isCurrentPlan ? "bg-primary/5" : "bg-card"}`}
      >
        <div className="mb-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-secondary text-base">
              {plan.name}
            </h3>
            {isCurrentPlan && (
              <span className="bg-green-100 px-2 py-0.5 rounded-full font-medium text-green-700 text-xs">
                Current Plan
              </span>
            )}
          </div>

          {price ? (
            <div className="flex items-baseline gap-1 mt-3">
              <span className="font-bold text-secondary text-3xl">
                {formatPrice(price.amount, price.currency)}
              </span>
              <span className="text-accent text-sm">
                /{interval === "month" ? "mo" : "yr"}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-accent text-sm italic">
              No {interval}ly pricing
            </p>
          )}

          {interval === "year" && price && (
            <p className="mt-1 text-green-600 text-xs">
              Save{" "}
              {Math.round(
                100 -
                  (price.amount /
                    12 /
                    (getPriceForInterval(plan.prices, "month")?.amount ??
                      price.amount / 12)) *
                    100,
              )}
              % vs monthly
            </p>
          )}
        </div>

        {plan.description && (
          <p className="mb-4 text-accent text-sm leading-relaxed">
            {plan.description}
          </p>
        )}

        {features.length > 0 && (
          <ul className="flex-1 space-y-2 mb-6">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 w-4 h-4 text-primary shrink-0" />
                <span className="text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={() => price && onSubscribe(price.id)}
          disabled={isCurrentPlan || !price || isLoading}
          className={`w-full rounded-full mt-auto font-semibold transition-all duration-200 ${
            isCurrentPlan
              ? "bg-primary/10 text-primary cursor-default"
              : isPopular
                ? "bg-primary hover:bg-primary/80 text-white"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
          }`}
        >
          {isLoading ? (
            <span className="flex justify-center items-center gap-2">
              <span className="border-2 border-current/30 border-t-current rounded-full w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : !price ? (
            "Not Available"
          ) : (
            "Subscribe"
          )}
        </Button>
      </Card>
    </div>
  );
}
