import { Order } from "./db";

export async function sendOrderConfirmationSMS(order: Order) {
  // Simulate sending SMS
  const orderId = order.id;
  const productName = order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(", ");
  const total = order.totalAmount;
  const phone = order.customer.phone;

  const smsText = `Thank you for shopping with Sparsh Ayurveda!

Your order #${orderId} has been confirmed by our team.

Product: ${productName}
Amount: ₹${total}

We are preparing your order and will notify you when it is shipped.

Team Sparsh Ayurveda`;

  console.log("================ SIMULATED SMS SENT ==================");
  console.log(`To phone: ${phone}`);
  console.log(smsText);
  console.log("======================================================");
  return { success: true, message: "Simulated SMS sent successfully", content: smsText };
}
