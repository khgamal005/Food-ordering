import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSubTotal, getTotalAmount, deliveryFee } from "@/lib/cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, formData } = body;

    interface CartItem {
      name: string;
      image: string;
      basePrice: number;
      quantity: number;
    }

    // const totalPrice = getTotalAmount(cart); // Removed unused variable

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: (cart as CartItem[]).map((item: CartItem) => ({
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
      success_url: `${process.env.NEXTAUTH_URL}/ordersuccess`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
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
  } catch (err: unknown) {
    console.error("Stripe error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import type { CartItem } from "@/redux/features/cart/cartSlice";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const { cart, formData } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: cart.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image], // ✅ Stripe shows product image
          metadata: {
            size: item.size ?? "",
            extras: item.extras?.map((e) => `${e.name}:${e.price}`).join(",") ?? "",
          },
        },
        unit_amount: item.basePrice * 100, // cents
      },
      quantity: item.quantity ?? 1,
    })),
      success_url: `${process.env.NEXTAUTH_URL}/ordersuccess`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    // ✅ Save full cart + form data to metadata for later webhook use
    metadata: {
      cart: JSON.stringify(cart),
      formData: JSON.stringify(formData),
    },
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
}
