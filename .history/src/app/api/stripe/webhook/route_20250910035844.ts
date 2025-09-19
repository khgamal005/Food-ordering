import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const cart = JSON.parse(session.metadata?.cart || "[]");

      await db.order.create({
        data: {
          phone: session.metadata?.phone,
          streetAddress: session.metadata?.address,
          postalCode: session.metadata?.postalCode,
          city: session.metadata?.city,
          country: session.metadata?.country,
          userEmail: session.customer_email || undefined,
          paid: true,
          subTotal: session.amount_subtotal! / 100,
          deliveryFee: (session.total_details?.amount_shipping || 0) / 100,
          totalPrice: session.amount_total! / 100,
          products: {
            create: cart.map((item: any) => ({
              quantity: item.quantity,
              product: { connect: { id: item.id } },
            })),
          },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
