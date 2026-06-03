import nodemailer from "nodemailer";
import { Order } from "./db";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;
  
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
  
  return transporter;
}

export async function sendOrderConfirmationEmail(order: Order) {
  try {
    const mailer = await getTransporter();
    
    const itemsList = order.items.map(item => 
      `<li>${item.quantity}x ${item.name} - ₹${item.price * item.quantity}</li>`
    ).join("");

    const mailOptions = {
      from: '"Sparsh Veda Care 🌿" <no-reply@sparksweda.com>',
      to: order.customer.email,
      subject: `Order Confirmation - ${order.id}`,
      text: `Hello ${order.customer.name}, your order ${order.id} has been received. Total: ₹${order.totalAmount}. Tracking: ${order.trackingNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1b4332;">Thank you for your order, ${order.customer.name}! 🌿</h2>
          <p>We are thrilled to let you know that your order has been received and is being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <h3>Order Details:</h3>
          <ul>
            ${itemsList}
          </ul>
          
          <h3 style="color: #1b4332;">Total: ₹${order.totalAmount}</h3>
          
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Best regards,<br/><strong>Sparsh Veda Care Team</strong></p>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}
