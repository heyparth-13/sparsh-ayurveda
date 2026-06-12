import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrder, Order } from "@/lib/db";

// Force Node.js runtime (required for fs operations)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getOrders();
    // Sort orders by date descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalAmount, paymentMethod } = body;

    // Simple validation
    if (!customer || !items || !totalAmount || !paymentMethod || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingNumber = `SPARK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      items,
      totalAmount,
      paymentMethod,
      status: "Pending",
      createdAt: new Date().toISOString(),
      trackingNumber,
    };

    await saveOrder(newOrder);

    // Return a plain response object (not spread) to guarantee valid JSON
    const responseBody = {
      id: newOrder.id,
      status: newOrder.status,
      trackingNumber: newOrder.trackingNumber,
      totalAmount: newOrder.totalAmount,
      createdAt: newOrder.createdAt,
    };

    // Send WhatsApp in background
    try {
      const { sendOrderConfirmationWhatsApp } = await import("@/lib/whatsapp");
      sendOrderConfirmationWhatsApp(newOrder).catch(() => {});
    } catch {
      // WhatsApp module failed to load
    }

    const response = NextResponse.json(responseBody, { status: 201 });
    // Store order in cookie for Vercel stateless fallback
    response.cookies.set("lastOrder", encodeURIComponent(JSON.stringify(newOrder)), { maxAge: 300, path: '/' });
    
    return response;
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
