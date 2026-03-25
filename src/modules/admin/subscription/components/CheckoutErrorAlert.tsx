import { AlertCircle } from "lucide-react";

interface CheckoutErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function CheckoutErrorAlert({
  message,
  onDismiss,
}: CheckoutErrorAlertProps) {
  return (
    <div className="flex items-center gap-3 bg-red-50 px-4 py-3 border border-red-200 rounded-lg">
      <AlertCircle className="shrink-0 w-4 h-4 text-red-600" />
      <p className="flex-1 text-red-700 text-sm">{message}</p>
      <button onClick={onDismiss} className="text-red-500 hover:text-red-700 text-xs">
        Dismiss
      </button>
    </div>
  );
}
