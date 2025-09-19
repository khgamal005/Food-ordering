import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma"; // adjust to your prisma client path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-28.acacia", // use your Stripe version
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
      console.log("✅ Payment success:", session.id);

      try {
        // Read metadata
        const userEmail = session.metadata?.userEmail || "";
        const cart = session.metadata?.cart
          ? JSON.parse(session.metadata.cart)
          : [];

        // Save order
        await db.order.create({
          data: {
            userEmail,
            paid: true,
            totalPrice: session.amount_total
              ? session.amount_total / 100
              : 0,
            subTotal: session.metadata?.subTotal
              ? Number(session.metadata.subTotal)
              : 0,
            deliveryFee: session.metadata?.deliveryFee
              ? Number(session.metadata.deliveryFee)
              : 0,
            phone: session.metadata?.phone || "",
            streetAddress: session.metadata?.streetAddress || "",
            city: session.metadata?.city || "",
            postalCode: session.metadata?.postalCode || "",
            products: {
              create: cart.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity || 1,
              })),
            },
          },
        });

        console.log("✅ Order saved in DB:", session.id);
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

