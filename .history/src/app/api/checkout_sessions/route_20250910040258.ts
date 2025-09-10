import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSubTotal, getTotalAmount, deliveryFee } from "@/lib/cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, formData } = body;

    const subTotal = getSubTotal(cart);
    const totalPrice = getTotalAmount(cart);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.basePrice * 100),
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: deliveryFee * 100, currency: "usd" },
            display_name: "Delivery fee",
          },
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL=http://localhost:3000
}/ordersuccess`,
      cancel_url: `${process.env.NEXTAUTH_URL=http://localhost:3000
}/cart`,
      metadata: {
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
        cart: JSON.stringify(cart), // useful in webhook
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
