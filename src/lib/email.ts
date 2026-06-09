import nodemailer from "nodemailer";
import { Order } from "./db";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Use real SMTP if configured (e.g., Gmail App Passwords, SendGrid, etc.)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail", // default to gmail
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }
  
  // Generate test SMTP service account from ethereal.email if no real config exists
  let testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
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
      from: process.env.SMTP_USER ? `"Sparsh Ayurveda" <${process.env.SMTP_USER}>` : '"Sparsh Ayurveda" <no-reply@sparksayurveda.com>',
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
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <h3>Itemized Bill:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; text-align: left;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px;">Qty</th>
                <th style="padding: 8px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="padding: 8px;">${item.quantity}</td>
                  <td style="padding: 8px;">₹${item.price * item.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <h3 style="color: #1b4332; text-align: right;">Total Paid/Due: ₹${order.totalAmount}</h3>
          
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
