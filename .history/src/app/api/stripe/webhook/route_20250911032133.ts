// Increased tolerance for timestamp verification (10 minutes)
const WEBHOOK_TOLERANCE = 600; // 10 minutes in seconds

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
    // Verify webhook signature with increased tolerance
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
      WEBHOOK_TOLERANCE // Add tolerance parameter
    );
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    
    // Check if it's a timestamp error specifically
    if (err.message.includes("timestamp")) {
      console.error("⚠️ Timestamp issue detected - check server time synchronization");
      
      // Try again with maximum tolerance
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!,
          900 // 15 minutes maximum tolerance
        );
        console.log(`✅ Webhook verified with max tolerance: ${event.type}`);
      } catch (retryErr: any) {
        return NextResponse.json(
          { error: `Webhook verification failed even with extended tolerance: ${retryErr.message}` }, 
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` }, 
        { status: 400 }
      );
    }
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
            status: "processing",
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
                </div>
                
                <div class="info-box">
                    <p><strong>Key changes:</strong></p>
                    <ul>
                        <li>Added tolerance parameter to <code>constructEvent()</code> call</li>
                        <li>Implemented retry logic with extended tolerance for timestamp errors</li>
                        <li>Added specific error handling for timestamp issues</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>Additional Fixes</h2>
                
                <h3>1. Synchronize Your Server Time</h3>
                <p>Ensure your server's clock is synchronized with NTP (Network Time Protocol):</p>
                
                <div class="code-block">
# For Ubuntu/Debian systems
sudo apt update
sudo apt install ntpdate
sudo ntpdate pool.ntp.org

# For CentOS/RHEL systems
sudo yum install ntp
sudo systemctl start ntpd
sudo systemctl enable ntpd

# Check current time
date
                </div>
                
                <h3>2. Check Stripe CLI Time Synchronization</h3>
                <p>Ensure your local machine running Stripe CLI is also time-synchronized:</p>
                
                <div class="code-block">
# On macOS
sudo sntp -sS time.apple.com

# On Windows
w32tm /resync

# On Linux
sudo timedatectl set-ntp true
                </div>
                
                <h3>3. Environment-Specific Webhook Handling</h3>
                <p>Consider different handling for development vs production:</p>
                
                <div class="code-block">
// Skip signature verification in development if needed
if (process.env.NODE_ENV === "development") {
  try {
    // First try with proper verification
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    // If it fails, try to parse without verification (for testing only!)
    console.warn("⚠️ Development mode: Skipping signature verification");
    event = JSON.parse(body);
  }
} else {
  // Production - always verify with tolerance
  event = stripe.webhooks.constructEvent(
    body, 
    sig, 
    process.env.STRIPE_WEBHOOK_SECRET!,
    WEBHOOK_TOLERANCE
  );
}