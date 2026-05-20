import Stripe from "stripe";

let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key, { apiVersion: "2025-04-30.basil" });
  }
  return _stripe;
}

export const ANNUAL_PRICE_CENTS = 9900; // 99€
export const RECRUITMENT_FEE_CENTS = 250000; // 2500€
