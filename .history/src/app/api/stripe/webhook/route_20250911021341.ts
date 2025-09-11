import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma"; // adjust to your prisma client path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil", // use your Stripe version
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text(); // Stripe requires raw text
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Handle events
  switch (event.type) {
    case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
      try {
        // Read metadata
          if (orderId) {
    await db.order.update({
      where: { id: orderId },
      data: { status: "paid", paid: true },
    });
  }
  break;
}


      } catch (dbErr) {
        console.error("❌ Failed to save order in DB:", dbErr);
      }

      break;
    }

    case "payment_intent.succeeded": {
      console.log("💰 PaymentIntent succeeded");
      break;
    }

    default: {
      console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
  }

  return NextResponse.json({ received: true });
}

