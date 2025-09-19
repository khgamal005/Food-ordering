import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
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
      interface CartItem {
        id: string;
        quantity: number;
      }
      const cart: CartItem[] = JSON.parse(session.metadata?.cart || "[]");

      await db.order.create({
        data: {
          phone: session.metadata?.phone ?? "",
          streetAddress: session.metadata?.address ?? "",
          postalCode: session.metadata?.postalCode ?? "",
          city: session.metadata?.city ?? "",
          country: session.metadata?.country ?? "",
          userEmail: session.customer_email || undefined,
          paid: true,
            create: cart.map((item: CartItem) => ({
              quantity: item.quantity,
              product: { connect: { id: item.id } },
            })),
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
