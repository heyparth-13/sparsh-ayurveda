# 🌿 Sparsh Veda Care

Welcome to the **Sparsh Veda Care** platform! This is a modern, full-stack e-commerce web application designed for an Ayurvedic products store. It provides a seamless shopping experience for customers and a secure management dashboard for store administrators.

## 🚀 How It Works (Features)

1. **Product Browsing & Cart**: Users can browse Ayurvedic products, read detailed descriptions, and add them to their shopping cart.
2. **User Authentication**: A custom, secure sign-up and login system allows users to create individual accounts with different email IDs and securely hashed passwords.
3. **Secure Checkout**:
   - Multiple payment gateways including **Credit/Debit Cards** and **UPI** seamlessly integrated via **Razorpay**.
   - **Cash on Delivery (COD)** option, enforcing a customized ₹30 surcharge.
4. **Automated Emails**: The system automatically dispatches an itemized, HTML-styled email bill and receipt to the customer upon successful order placement.
5. **Admin Command Dashboard**: 
   - A hidden gateway located in the site footer grants access to the admin panel.
   - Protected by a secure passcode (`7259`).
   - Admins can manage product listings (edit names, update prices) in real-time, view order books, track revenue, and update shipment statuses dynamically.

## 🛠️ How It's Made (Tech Stack)

This platform leverages modern web technologies for a premium feel and scalability:
- **Frontend**: Built with **Next.js 16 (App Router)** and **React 19**, styled utilizing custom CSS modules and beautifully animated using **Framer Motion**. 
- **Backend APIs**: Employs Next.js Serverless Route Handlers for robust API endpoints (`/api/auth`, `/api/orders`, `/api/products`, `/api/razorpay`).
- **Database**: A lightweight filesystem-based JSON architecture (`products.json`, `orders.json`, and `users.json`) allowing for rapid data operations.
- **Authentication**: Custom JWT and cookie session management leveraging Node.js native `crypto` (`scryptSync`) module for secure password hashing and verification.
- **Payment Processing**: Connected to the **Razorpay Node SDK** to handle checkout sessions, handle UPI, and calculate cart totals.

## 💻 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation

1. Navigate to the project directory:
   ```bash
   cd sparsh
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the website.

Enjoy exploring Sparsh Veda Care! 🌿
