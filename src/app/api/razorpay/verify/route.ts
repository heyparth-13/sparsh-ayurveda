import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { saveOrder, Order, getProductById, updateProduct } from "@/lib/db";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      items,
      totalAmount,
      paymentMethod,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      isDemoMode,
    } = body;

    // Basic validation
    if (!customer || !items || !totalAmount || !paymentMethod || items.length === 0) {
      return NextResponse.json({ error: "Invalid order or customer details" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Signature Verification
    if (keySecret && !isDemoMode && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      // Real signature verification
      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("Razorpay signature verification failed!");
        return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
      }
    } else {
      // Demo / simulated mode bypasses key secret HMAC checks
      console.log("Processing order verification in DEMO mode.");
    }

    // 2. Generate Unique Order ID & tracking info
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingNumber = `SPARK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      items,
      totalAmount,
      paymentMethod,
      status: "Confirmed", // Paid orders are immediately "Confirmed"
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      trackingNumber,
      paymentId: razorpay_payment_id || `pay_demo_${Math.random().toString(36).substring(2, 11)}`,
      razorpayOrderId: razorpay_order_id || `order_demo_${Math.random().toString(36).substring(2, 11)}`,
      razorpaySignature: razorpay_signature || "demo_signature_ok",
    };

    // 3. Save order to database
    await saveOrder(newOrder);

    // 4. Update product inventory (decrement stock)
    for (const item of newOrder.items) {
      try {
        const product = await getProductById(item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateProduct(item.id, { stock: newStock });
        }
      } catch (err) {
        console.error(`Stock update failed for product ${item.id}:`, err);
      }
    }

    // 5. Send multi-channel notifications
    let emailPreviewUrl = null;
    try {
      emailPreviewUrl = await sendOrderConfirmationEmail(newOrder);
    } catch (err) {
      console.error("Email notification to customer failed:", err);
    }

    try {
      await sendAdminNotificationEmail(newOrder);
    } catch (err) {
      console.error("Email notification to admin failed:", err);
    }

    try {
      await sendOrderConfirmationWhatsApp(newOrder);
    } catch (err) {
      console.error("WhatsApp confirmation failed:", err);
    }

    try {
      await sendOrderConfirmationSMS(newOrder);
    } catch (err) {
      console.error("SMS confirmation failed:", err);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      paymentId: newOrder.paymentId,
      emailPreviewUrl,
    }, { status: 201 });

  } catch (error) {
    console.error("Error verifying payment and creating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
