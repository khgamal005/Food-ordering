import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getSubTotal, deliveryFee, getTotalAmount } from "@/lib/cart";
import type { CartItem } from "@/redux/features/cart/cartSlice";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      phone,
      streetAddress,
      postalCode,
      city,
      country,
      userEmail = "",
      cart,
      paymentMethod,
    }: {
      phone: string;
      streetAddress: string;
      postalCode: string;
      city: string;
      country: string;
      userEmail?: string;
      cart: CartItem[];
      paymentMethod: "cod" | "stripe";
    } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ✅ use lib/cart helpers
    const subTotal = getSubTotal(cart);
    const totalPrice = getTotalAmount(cart);

    // ✅ create order
    const order = await db.order.create({
      data: {
        phone,
        streetAddress,
        postalCode,
        city,
        country,
        userEmail,
        paid: paymentMethod === "stripe",
        subTotal,
        deliveryFee,
        totalPrice,
        products: {
          create: cart.map((item) => ({
            quantity: item.quantity || 1,
            productId: item.id, // references Product
          })),
        },
      },
      include: {
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
