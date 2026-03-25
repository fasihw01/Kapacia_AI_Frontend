import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/admin/dashboard`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="bg-primary disabled:opacity-50 px-4 py-3 rounded-lg w-full font-semibold text-white hover:scale-[1.02] disabled:transform-none transition-all duration-200 disabled:cursor-not-allowed transform"
      >
        {isSubmitting ? (
          <div className="flex justify-center items-center">
            <div className="mr-2 border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin" />
            Processing...
          </div>
        ) : (
          "Confirm Payment"
        )}
      </button>
    </form>
  );
}

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const secret = sessionStorage.getItem("stripe_client_secret");
    if (!secret) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    setClientSecret(secret);
    sessionStorage.removeItem("stripe_client_secret");
  }, [navigate]);

  if (!clientSecret) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-2xl w-full max-w-md">
        <div className="mb-6 text-center">
          <img
            src="/images/auth/logo.svg"
            alt="Logo"
            width={140}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="font-semibold text-gray-900 text-xl">
            Complete Your Subscription
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Enter your payment details to activate your organisation account.
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
