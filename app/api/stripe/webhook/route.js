import { getStripe } from "../../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured");
  return createClient(url, key);
}

export async function POST(req) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, companyId, type } = session.metadata || {};

    if (type === "annual_subscription" && companyId) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      try {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from("companies")
          .update({
            subscription_status: "active",
            subscription_paid_at: new Date().toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
            stripe_customer_id: session.customer,
            stripe_payment_intent: session.payment_intent,
          })
          .eq("id", companyId);

        await supabaseAdmin
          .from("profiles")
          .update({ plan: "enterprise_annual" })
          .eq("id", userId);
      } catch (err) {
        console.error("Supabase update error:", err);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
