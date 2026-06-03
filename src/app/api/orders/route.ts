import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrder, Order } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

    const saved = await saveOrder(newOrder);
    
    // Send confirmation email
    const emailPreviewUrl = await sendOrderConfirmationEmail(newOrder);
    
    return NextResponse.json({ ...saved, emailPreviewUrl }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
