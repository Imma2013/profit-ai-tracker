import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { priceId, planType, userId, userEmail } = await req.json();

    if (!userId || userId === "anonymous" || !userEmail) {
      return NextResponse.json({ error: "You must be signed in before checkout" }, { status: 401 });
    }

    const isYearly = planType === "yearly";

    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: isYearly ? "Profit AI Pro (Yearly - 3 Day Free Trial)" : "Profit AI Pro (Monthly)",
              description: isYearly
                ? "Full access to AI Trading Chart Analysis ($29.99/yr after 3-day free trial)"
                : "Full access to AI Trading Chart Analysis ($9.99/month)",
            },
            unit_amount: isYearly ? 2999 : 999,
            recurring: {
              interval: isYearly ? ("year" as const) : ("month" as const),
            },
          },
          quantity: 1,
        };

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: { firebaseUid: userId },
      ...(isYearly ? { trial_period_days: 3 } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      line_items: [lineItem],
      subscription_data: subscriptionData,
      metadata: { firebaseUid: userId },
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
