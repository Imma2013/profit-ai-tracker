import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function hasPaidAccess(uid: string, email?: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY || !uid || !email) return false;

  try {
    const customers = await stripe.customers.list({ email, limit: 10 });

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 100,
      });

      const entitled = subscriptions.data.some((subscription) => {
        const statusAllowed = subscription.status === "active" || subscription.status === "trialing";
        return statusAllowed && subscription.metadata?.firebaseUid === uid;
      });

      if (entitled) return true;
    }

    return false;
  } catch (error) {
    console.error("Stripe entitlement check failed", error);
    return false;
  }
}
