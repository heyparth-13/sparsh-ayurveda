import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, saveOrder, getOrders, Order } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await req.json();
    const { status, order: clientOrder } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Try to update directly
    let updated = await updateOrderStatus(id, status);

    // If not found (Vercel cold start), re-hydrate from client-provided order data
    if (!updated && clientOrder) {
      await saveOrder(clientOrder as Order);
      updated = await updateOrderStatus(id, status);
    }

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
