import { getStripe, ANNUAL_PRICE_CENTS } from "../../../../lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, companyId, email } = await req.json();

    if (!userId || !companyId) {
      return NextResponse.json({ error: "Missing userId or companyId" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Abonnement Annuel Handball Connect Entreprise",
              description: "Accès illimité à la plateforme de recrutement de handballeurs pros pendant 1 an.",
            },
            unit_amount: ANNUAL_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        companyId,
        type: "annual_subscription",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/cancel`,
      customer_email: email || undefined,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
