import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export const ANNUAL_PRICE_CENTS = 9900; // 99€
export const RECRUITMENT_FEE_CENTS = 250000; // 2500€
