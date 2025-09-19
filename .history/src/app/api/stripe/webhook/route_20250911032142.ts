// Refactored webhook handler with better error handling and logging
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  
  if (!sig) {
    console.error("❌ Missing Stripe signature header");
    return NextResponse.json(
      { error: "Missing Stripe signature" }, 
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  const body = await req.text(); // Get raw body
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` }, 
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.warn("⚠️ No orderId found in session metadata");
          return NextResponse.json(
            { error: "No orderId in metadata" }, 
            { status: 400 }
          );
        }

        console.log(`🔄 Updating order status for order: ${orderId}`);
        
        // Update order status in database
        const updatedOrder = await db.order.update({
          where: { id: orderId },
          data: { 
            paid: true,
            status: "processing", // Consider adding a status field if you don't have one
            // You might want to store the Stripe payment intent ID for reference
            // stripePaymentId: session.payment_intent as string
          },
        });
        
        console.log(`✅ Order ${orderId} successfully marked as paid`);
        break;
      }
      
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        
        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: { 
              status: "payment_failed",
              // You might want to add a paymentFailedAt timestamp
            },
          });
          console.log(`❌ Order ${orderId} payment failed`);
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" }, 
      { status: 500 }
    );
  }
}