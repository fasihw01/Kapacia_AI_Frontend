import type { StripePrice } from "@/services/subscriptionService";

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function getPriceForInterval(
  prices: StripePrice[],
  interval: "month" | "year",
): StripePrice | undefined {
  return prices.find((price) => price.interval === interval);
}
