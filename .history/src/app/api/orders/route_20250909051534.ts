import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // <-- your prisma instance

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      phone,
      streetAddress,
      postalCode,
      city,
      country,
      userEmail,
      cart,
      paymentMethod,
    } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // calculate prices
    const subTotal = cart.reduce((sum: number, item: any) => {
      const extrasPrice = item.extras?.reduce(
        (extraSum: number, extra: any) => extraSum + extra.price,
        0
      ) || 0;
      return sum + (item.basePrice + extrasPrice) * (item.quantity || 1);
    }, 0);

    const deliveryFee = 30; // example flat delivery fee
    const totalPrice = subTotal + deliveryFee;

    // create order
    const order = await db.order.create({
      data: {
        phone,
        streetAddress,
        postalCode,
        city,
        country,
        userEmail,
        paid: paymentMethod === "stripe" ? true : false, // COD = unpaid
        subTotal,
        deliveryFee,
        totalPrice,
        products: {
          create: cart.map((item: any) => ({
            quantity: item.quantity || 1,
            product: { connect: { id: item.id } },
            user: userEmail ? { connect: { email: userEmail } } : undefined,
          })),
        },
      },
      include: {
        products: true,
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
