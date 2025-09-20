// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { getSubTotal, getTotalAmount, deliveryFee } from "@/lib/cart";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-08-27.basil",
// });

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { cart, formData } = body;

//     interface CartItem {
//       name: string;
//       image: string;
//       basePrice: number;
//       quantity: number;
//     }

//     // const totalPrice = getTotalAmount(cart); // Removed unused variable

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: (cart as CartItem[]).map((item: CartItem) => ({
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: item.name,
//             images: [item.image],
//           },
//           unit_amount: Math.round(item.basePrice * 100),
//         },
//         quantity: item.quantity,
//       })),
//       shipping_options: [
//         {
//           shipping_rate_data: {
//             type: "fixed_amount",
//             fixed_amount: { amount: deliveryFee * 100, currency: "usd" },
//             display_name: "Delivery fee",
//           },
//         },
//       ],
//       success_url: `${process.env.NEXTAUTH_URL}/ordersuccess`,
//       cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
//       metadata: {
//         phone: formData.phone,
//         address: formData.address,
//         city: formData.city,
//         country: formData.country,
//         postalCode: formData.postalCode,
//         cart: JSON.stringify(cart), // useful in webhook
//       },
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (err: unknown) {
//     console.error("Stripe error:", err);
//     const errorMessage =
//       err instanceof Error ? err.message : "An unexpected error occurred";
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { deliveryFee, getSubTotal } from "@/lib/cart";
import { db } from "@/lib/prisma";
import type { CartItem } from "@/redux/features/cart/cartSlice";
import Stripe from "stripe";

// Initialize Stripe safely
let stripe: Stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15", // ✅ use latest stable version
  });
} catch (error) {
  console.error("Stripe initialization failed:", error);
  throw new Error("Stripe configuration error");
}

export async function POST(req: Request) {
  try {
    const { cart, formData } = await req.json();

    if (!cart || !Array.isArray(cart) || !formData) {
      return new Response(
        JSON.stringify({ error: "Invalid cart or form data" }),
        { status: 400 }
      );
    }

    const requiredFields = ["userEmail", "phone", "streetAddress", "city", "country"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(", ")}` }),
        { status: 400 }
      );
    }

    const subTotal = getSubTotal(cart);
    const totalPrice = subTotal + deliveryFee;

    const order = await db.order.create({
      data: {
        status: "pending",
        paid: false,
        subTotal,
        deliveryFee,
        totalPrice,
        userEmail: formData.userEmail,
        phone: formData.phone,
        streetAddress: formData.streetAddress,
        postalCode: formData.postalCode || "",
        city: formData.city,
        country: formData.country,
        products: {
          create: cart.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map((item: CartItem) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              size: item.size ? JSON.stringify(item.size) : "",
              extras: item.extras ? JSON.stringify(item.extras) : "",
            },
          },
          unit_amount: Math.round(item.basePrice * 100),
        },
        quantity: item.quantity ?? 1,
      })),
      success_url: `${process.env.NEXTAUTH_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        orderId: order.id,
        userEmail: formData.userEmail,
        cartItems: JSON.stringify(cart.length),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout session error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
