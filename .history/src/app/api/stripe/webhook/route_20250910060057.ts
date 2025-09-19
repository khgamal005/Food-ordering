import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma"; // adjust to your prisma client path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil", // use your real Stripe API version
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text(); // must use text()
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
      console.log("✅ Payment success:", session.id);

      try {
        // Get metadata from checkout session
        const userEmail = session.metadata?.userEmail || "";
        const cart = session.metadata?.cart
          ? JSON.parse(session.metadata.cart)
          : [];

        // Save order in DB
        await db.order.create({
          data: {
            userEmail,
            paid: true,
            totalPrice: session.amount_total
              ? session.amount_total / 100
              : 0,
            products: {
              create: cart.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity || 1,
              })),
            },
          },
        });

        console.log("✅ Order saved for session:", session.id);
      } catch (dbErr) {
        console.error("❌ Failed to save order in DB:", dbErr);
      }

      break;
    }

    case "payment_intent.succeeded": {
      console.log("💰 PaymentIntent succeeded");
      break;
    }

    default:
