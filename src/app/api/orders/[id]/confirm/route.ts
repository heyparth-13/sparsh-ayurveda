import { NextRequest, NextResponse } from "next/server";
import { getOrders, updateOrderStatus, getProductById, updateProduct } from "@/lib/db";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = await getOrders();
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "Confirmed") {
      return NextResponse.json({ error: "Order is already confirmed" }, { status: 400 });
    }

    // 1. Change status to Confirmed and save confirmation timestamp
    const now = new Date().toISOString();
    const updatedOrder = await updateOrderStatus(id, "Confirmed", now);

    if (!updatedOrder) {
      return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
    }

    // 2. Auto-update stock levels (Inventory Management)
    for (const item of order.items) {
      const product = await getProductById(item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await updateProduct(item.id, { stock: newStock });
      }
    }

    // 3. Send notifications (Email, WhatsApp, SMS)
    // Email (uses nodemailer or fallback Ethereal simulation)
    let emailPreviewUrl = null;
    try {
      emailPreviewUrl = await sendOrderConfirmationEmail(updatedOrder);
    } catch (err) {
      console.error("Email send failed:", err);
    }

    // WhatsApp simulation/real Meta API
    try {
      await sendOrderConfirmationWhatsApp(updatedOrder);
    } catch (err) {
      console.error("WhatsApp send failed:", err);
    }

    // SMS simulation
    let smsResult = null;
    try {
      smsResult = await sendOrderConfirmationSMS(updatedOrder);
    } catch (err) {
      console.error("SMS send failed:", err);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      emailPreviewUrl,
      smsContent: smsResult?.content || "",
      message: "Order confirmed, stock updated, and notifications sent."
    });
  } catch (error) {
    console.error("Confirm order API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
