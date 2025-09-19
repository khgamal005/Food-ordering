import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import Stripe from "stripe";

// Define CartItem type
type CartItem = {
  id: string;
  quantity?: number;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature")!;
    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // ✅ Recover metadata
      const cart: CartItem[] = JSON.parse(session.metadata?.cart || "[]");
      const formData = JSON.parse(session.metadata?.formData || "{}");

      // ✅ Create order in Prisma
      await db.order.create({
        data: {
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          postalCode: formData.postalCode,
          city: formData.city,
          country: formData.country,
          userEmail: formData.userEmail,
          paid: true,
          subTotal: Number(session.amount_subtotal) / 100,
          deliveryFee: 30, // or dynamic
          totalPrice: Number(session.amount_total) / 100,
          products: {
            create: cart.map((item) => ({
              quantity: item.quantity ?? 1,
              productId: item.id,
            })),
          },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
