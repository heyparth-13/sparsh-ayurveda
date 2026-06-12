import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ==========================================
// FUTURE RAZORPAY INTEGRATION CREDENTIALS:
// Simply add these variables to your .env.local file:
// RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
// No other code changes are needed!
// ==========================================
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const isConfigured = !!(keyId && keySecret);

let razorpay: Razorpay | null = null;
if (isConfigured) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: NextRequest) {
  let amount = 0;
  try {
    const body = await req.json();
    amount = body.amount;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    if (!isConfigured) {
      // Demo fallback order creation
      console.log("Razorpay credentials not found in env. Running in DEMO mode.");
      return NextResponse.json({
        id: `order_demo_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_demo_${Date.now()}`,
        status: "created",
        isDemo: true,
        key: "rzp_test_demo_mode",
      }, { status: 200 });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay!.orders.create(options);
    return NextResponse.json({
      ...order,
      isDemo: false,
      key: keyId,
    }, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // Return a mock order if Razorpay fails
    return NextResponse.json({
      id: `order_demo_${Date.now()}`,
      amount: Math.round((amount || 100) * 100),
      currency: "INR",
      receipt: `receipt_demo_${Date.now()}`,
      status: "created",
      isDemo: true,
      key: "rzp_test_failed_fallback"
    }, { status: 200 });
  }
}

