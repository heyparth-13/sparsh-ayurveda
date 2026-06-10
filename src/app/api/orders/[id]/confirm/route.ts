import { NextRequest, NextResponse } from "next/server";
import { getOrders, updateOrderStatus, saveOrder, getProductById, updateProduct, Order } from "@/lib/db";
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

    // Try to read body (client sends the full order object for Vercel compatibility)
    let clientOrder: Order | null = null;
    try {
      const body = await req.json();
      if (body && body.id) {
        clientOrder = body as Order;
      }
    } catch {
      // No body or invalid JSON — that's fine, we'll try the DB
    }

    // 1. Try to find the order in the database/memory store
    const orders = await getOrders();
    let order = orders.find((o) => o.id === id);

    // 2. If not found in store (common on Vercel cold starts), use the client-provided order
    if (!order && clientOrder) {
      // Re-hydrate: save it into the in-memory store so updateOrderStatus can find it
      await saveOrder(clientOrder);
      order = clientOrder;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "Confirmed") {
      return NextResponse.json({ error: "Order is already confirmed" }, { status: 400 });
    }

    // 3. Change status to Confirmed and save confirmation timestamp
    const now = new Date().toISOString();
    const updatedOrder = await updateOrderStatus(id, "Confirmed", now);

    // Build a response order (use updatedOrder if available, otherwise manually construct)
    const confirmedOrder: Order = updatedOrder || { ...order, status: "Confirmed", confirmedAt: now };

    // 4. Auto-update stock levels (Inventory Management)
    for (const item of order.items) {
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

    // 5. Send notifications (Email, WhatsApp, SMS)
    let emailPreviewUrl = null;
    try {
      emailPreviewUrl = await sendOrderConfirmationEmail(confirmedOrder);
    } catch (err) {
      console.error("Email send failed:", err);
    }

    try {
      await sendOrderConfirmationWhatsApp(confirmedOrder);
    } catch (err) {
      console.error("WhatsApp send failed:", err);
    }

    let smsResult = null;
    try {
      smsResult = await sendOrderConfirmationSMS(confirmedOrder);
    } catch (err) {
      console.error("SMS send failed:", err);
    }

    return NextResponse.json({
      success: true,
      order: confirmedOrder,
      emailPreviewUrl,
      smsContent: smsResult?.content || "",
      message: "Order confirmed, stock updated, and notifications sent."
    });
  } catch (error) {
    console.error("Confirm order API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
