import { CheckCircle, CreditCard, Calendar, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { OrgSubscription, PaymentHistoryItem } from "@/services/subscriptionService";

interface Props {
  subscription: OrgSubscription;
  payments?: PaymentHistoryItem[];
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-amber-100 text-amber-700",
  canceled: "bg-red-100 text-red-700",
};

export function ActiveSubscriptionCard({ subscription, payments }: Props) {
  const { status, planName, amount, currency, interval, cancelAtPeriodEnd, currentPeriodEnd } =
    subscription;

  const badgeClass =
    statusColors[status?.toLowerCase()] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-4">
      {/* Main details card */}
      <Card className="p-6 border border-border/60">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-primary/10 rounded-xl w-12 h-12 shrink-0">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-secondary text-base">
                {planName ?? "Subscription"}
              </p>
              <p className="text-accent text-sm capitalize">
                {interval ? `Billed ${interval}ly` : ""}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium capitalize ${badgeClass}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {status?.replace("_", " ")}
          </span>
        </div>

        <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 mt-6">
          {amount != null && currency && (
            <div>
              <p className="text-accent text-xs">Amount</p>
              <p className="font-semibold text-secondary text-sm">
                {formatCurrency(amount, currency)}
                <span className="font-normal text-accent text-xs">
                  /{interval === "month" ? "mo" : "yr"}
                </span>
              </p>
            </div>
          )}

          {currentPeriodEnd && (
            <div>
              <p className="text-accent text-xs">Renews On</p>
              <p className="font-semibold text-secondary text-sm flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          {cancelAtPeriodEnd && (
            <div>
              <p className="text-accent text-xs">Cancellation</p>
              <p className="font-semibold text-amber-600 text-sm flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                Cancels at period end
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment history */}
      {payments && payments.length > 0 && (
        <Card className="p-6 border border-border/60">
          <p className="mb-4 font-semibold text-secondary text-sm">
            Payment History
          </p>
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm"
              >
                <div>
                  <p className="text-secondary">{p.description ?? "Payment"}</p>
                  <p className="text-accent text-xs">{formatDate(p.created)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-secondary">
                    {formatCurrency(p.amount, p.currency)}
                  </p>
                  <span
                    className={`text-xs capitalize ${
                      p.status === "succeeded"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
