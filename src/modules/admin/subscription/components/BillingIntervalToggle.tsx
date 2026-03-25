interface BillingIntervalToggleProps {
  interval: "month" | "year";
  onChange: (interval: "month" | "year") => void;
}

export function BillingIntervalToggle({
  interval,
  onChange,
}: BillingIntervalToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-primary/5 p-1 rounded-full">
        <button
          onClick={() => onChange("month")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interval === "month"
              ? "bg-white text-primary shadow-sm"
              : "text-accent hover:text-secondary"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange("year")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interval === "year"
              ? "bg-white text-primary shadow-sm"
              : "text-accent hover:text-secondary"
          }`}
        >
          Yearly
          <span className="ml-1.5 bg-green-100 px-1.5 py-0.5 rounded-full text-green-700 text-xs">
            Save
          </span>
        </button>
      </div>
    </div>
  );
}
