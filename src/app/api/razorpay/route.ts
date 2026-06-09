import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Use test keys as fallbacks if environment variables are not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // Since we are likely using a placeholder in local, let's mock it if it fails so the frontend can still proceed
    if (process.env.RAZORPAY_KEY_ID === undefined) {
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round((await req.json()).amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        status: "created"
      }, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
