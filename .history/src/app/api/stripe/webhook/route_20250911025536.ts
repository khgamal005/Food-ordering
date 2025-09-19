import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // ✅ Stripe requires raw bytes, not parsed JSON
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: { paid: true }, // you already have `paid`
          });
          console.log(`✅ Order ${orderId} marked as paid`);
        } else {
          console.warn("⚠️ No orderId in session metadata");
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (dbErr) {
    console.error("❌ Failed to update order in DB:", dbErr);
  }

  return NextResponse.json({ received: true });
}
