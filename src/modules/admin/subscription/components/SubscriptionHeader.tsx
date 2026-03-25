interface SubscriptionHeaderProps {
  currentStatus?: string | null;
}

export function SubscriptionHeader({ currentStatus }: SubscriptionHeaderProps) {
  const statusBadge =
    currentStatus === "active" ? (
      <span className="inline-flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full text-green-700 text-sm">
        <span className="bg-green-500 rounded-full w-1.5 h-1.5" />
        Active
      </span>
    ) : currentStatus ? (
      <span className="inline-flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full text-amber-700 text-sm capitalize">
        <span className="bg-amber-500 rounded-full w-1.5 h-1.5" />
        {currentStatus.replace("_", " ")}
      </span>
    ) : null;

  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-3">
      <div>
        <h1 className="font-medium text-secondary text-sm">Subscription Plans</h1>
        <p className="mt-1 text-accent text-sm">
          Choose the plan that fits your organisation.
        </p>
      </div>
      {statusBadge && (
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm">Status:</span>
          {statusBadge}
        </div>
      )}
    </div>
  );
}
