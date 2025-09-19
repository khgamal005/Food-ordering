import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// 👇 Required: tell Next.js to not parse the body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // ✅ Get raw body
    const body = await req.text();

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      try {
        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: { status: "paid", paid: true },
          });
          console.log(`✅ Order ${orderId} marked as paid`);
        } else {
          console.warn("⚠️ No orderId in session metadata");
        }
      } catch (dbErr) {
        console.error("❌ Failed to update order in DB:", dbErr);
      }
      break;
    }

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
