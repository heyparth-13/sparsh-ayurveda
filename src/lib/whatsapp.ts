import { Order } from "./db";

// To use this, you need to set up a WhatsApp Business account and Meta developer app
// Add these to your .env file:
// WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
// WHATSAPP_ACCESS_TOKEN=your_permanent_access_token

export async function sendOrderConfirmationWhatsApp(order: Order) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // If no credentials, just log it out and skip
  if (!phoneNumberId || !accessToken) {
    console.log("WhatsApp integration is not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.");
    console.log(`Would have sent WhatsApp message to: ${order.customer.phone}`);
    return;
  }

  // Format the customer's phone number
  // Meta Cloud API requires country code without '+'. Assuming India (91) if 10 digits.
  let formattedPhone = order.customer.phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  const itemsList = order.items.map(item => `${item.name} (x${item.quantity}) - ₹${item.price}`).join("\\n");
  
  // Note: For WhatsApp Business API, you typically have to use pre-approved templates
  // for the first message (like order confirmations).
  // Below is an example payload using a text message (which only works if the customer initiated the chat within 24h).
  // In production, change the "type" to "template" and provide your approved template details.

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "text",
    text: {
      preview_url: false,
      body: `Hi ${order.customer.name},\n\nThank you for your order! 🎉\n\nYour order ID is ${order.id}.\n\nItems:\n${itemsList}\n\nTotal Bill: ₹${order.totalAmount}\n\nWe will notify you once it's shipped.\n\nThanks,\nSparsh Ayurveda`
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send WhatsApp message:", errorData);
    } else {
      console.log("WhatsApp message sent successfully!");
    }
  } catch (error) {
    console.error("Error connecting to WhatsApp API:", error);
  }
}
