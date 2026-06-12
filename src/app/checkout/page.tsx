"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Card details simulation
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Demo Modal states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState<any>(null);
  const [demoOrderPayload, setDemoOrderPayload] = useState<any>(null);
  const [demoSelectedMethod, setDemoSelectedMethod] = useState("card");

  // Prevent accessing checkout with an empty cart
  useEffect(() => {
    if (cartItems.length === 0 && transactionStatus === "idle") {
      router.push("/cart");
    }
  }, [cartItems, router, transactionStatus]);

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 50;
  const codSurcharge = paymentMethod === "cod" ? 30 : 0;
  const grandTotal = cartTotal + shippingFee + codSurcharge;

  const placeOrder = async (orderPayload: any) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      let errorText = "Failed to place the order. Please try again.";
      try {
        const errData = await res.json();
        if (errData?.error) errorText = errData.error;
      } catch {
        // Response wasn't JSON
      }
      throw new Error(errorText);
    }

    // Safely parse response JSON
    let placedOrder: any = {};
    try {
      const text = await res.text();
      if (text) {
        placedOrder = JSON.parse(text);
      }
    } catch {
      // If response body is empty/invalid, still proceed with order
      console.warn("Could not parse order response, proceeding anyway");
    }

    setTransactionStatus("success");
    
    setTimeout(() => {
      clearCart();
      router.push(`/order-success/${placedOrder.id || ""}`);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const orderPayload = {
      customer: {
        name,
        email,
        phone,
        address,
        city,
        zipCode,
      },
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: grandTotal,
      paymentMethod,
    };

    if (paymentMethod === "card" || paymentMethod === "upi") {
      setTransactionStatus("processing");
      try {
        const rzpRes = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: grandTotal })
        });
        const orderData = await rzpRes.json();

        if (orderData.error) throw new Error(orderData.error);

        setTransactionStatus("idle");

        if (orderData.isDemo) {
          // Open simulated modal for demo
          setDemoOrderData(orderData);
          setDemoOrderPayload(orderPayload);
          setIsDemoModalOpen(true);
          setIsSubmitting(false);
        } else {
          // Open real Razorpay Checkout using keys returned from backend
          const options: any = {
            key: orderData.key, // REAL key ID from backend env variables
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Sparsh Veda",
            description: "Ayurvedic Products Checkout",
            order_id: orderData.id,
            handler: async function (response: any) {
              setTransactionStatus("processing");
              try {
                // Call verification API
                const verifyRes = await fetch("/api/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer: orderPayload.customer,
                    items: orderPayload.items,
                    totalAmount: orderPayload.totalAmount,
                    paymentMethod: orderPayload.paymentMethod,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    isDemoMode: false,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok && verifyData.success) {
                  setTransactionStatus("success");
                  setTimeout(() => {
                    clearCart();
                    router.push(`/order-success/${verifyData.orderId}?paymentId=${verifyData.paymentId}&amt=${orderPayload.totalAmount}`);
                  }, 1500);
                } else {
                  throw new Error(verifyData.error || "Verification failed");
                }
              } catch (err: any) {
                setErrorMsg(err.message);
                setTransactionStatus("idle");
              }
            },
            prefill: { name, email, contact: phone },
            theme: { color: "#2E4F39" }
          };

          const rzp1 = new (window as any).Razorpay(options);
          rzp1.on("payment.failed", function (response: any) {
            router.push(`/payment-failed?error=${encodeURIComponent(response.error.description || "Razorpay Payment Failed")}`);
          });
          rzp1.open();
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to connect to Razorpay.");
        setIsSubmitting(false);
        setTransactionStatus("idle");
      }
    } else {
      // Cash on Delivery
      setTransactionStatus("processing");
      try {
        await placeOrder(orderPayload);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to place order.");
        setIsSubmitting(false);
        setTransactionStatus("idle");
      }
    }
  };

  const handleDemoPaymentSuccess = async () => {
    setIsDemoModalOpen(false);
    setTransactionStatus("processing");
    try {
      const demoPaymentId = `pay_demo_${Math.random().toString(36).substring(2, 11)}`;
      const demoSignature = `sig_demo_${Math.random().toString(36).substring(2, 16)}`;

      const verifyRes = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: demoOrderPayload.customer,
          items: demoOrderPayload.items,
          totalAmount: demoOrderPayload.totalAmount,
          paymentMethod: demoOrderPayload.paymentMethod,
          razorpay_payment_id: demoPaymentId,
          razorpay_order_id: demoOrderData.id,
          razorpay_signature: demoSignature,
          isDemoMode: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setTransactionStatus("success");
        setTimeout(() => {
          clearCart();
          router.push(`/order-success/${verifyData.orderId}?paymentId=${verifyData.paymentId}&amt=${demoOrderPayload.totalAmount}`);
        }, 1500);
      } else {
        throw new Error(verifyData.error || "Simulated verification failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Demo payment simulation error.");
      setTransactionStatus("idle");
    }
  };

  const handleDemoPaymentFailure = () => {
    setIsDemoModalOpen(false);
    router.push("/payment-failed?error=Simulated+payment+failure+by+customer.");
  };

  if (cartItems.length === 0 && transactionStatus === "idle") {
    return null; // Avoid render flashes
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />

      {/* Simulated Razorpay Checkout Popup */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className={styles.demoOverlay}>
            <div className={styles.demoContainer}>
              <div className={styles.demoHeader}>
                <span className={styles.demoHeaderLogo}>💳</span>
                <h3 className={styles.demoHeaderTitle}>Razorpay Checkout</h3>
                <p className={styles.demoHeaderDesc}>Sparsh Veda • Test Mode</p>
                <div className={styles.demoHeaderAmount}>₹{grandTotal}</div>
                <button onClick={() => setIsDemoModalOpen(false)} className={styles.demoCloseBtn}>✕</button>
              </div>

              <div className={styles.demoBody}>
                <div className={styles.demoAlert}>
                  <strong>Testing Mode Active</strong><br />
                  No real funds will be processed. Select a payment simulation outcome below to continue testing.
                </div>

                <p className={styles.demoMethodTitle}>Test Payment Methods</p>
                <div className={styles.demoMethodList}>
                  <label className={styles.demoMethodItem}>
                    <input
                      type="radio"
                      name="demopay"
                      value="card"
                      checked={demoSelectedMethod === "card"}
                      onChange={() => setDemoSelectedMethod("card")}
                    />
                    <span>Credit / Debit Card (Simulated)</span>
                  </label>
                  <label className={styles.demoMethodItem}>
                    <input
                      type="radio"
                      name="demopay"
                      value="upi"
                      checked={demoSelectedMethod === "upi"}
                      onChange={() => setDemoSelectedMethod("upi")}
                    />
                    <span>UPI / QR Code (Simulated)</span>
                  </label>
                </div>

                <div className={styles.demoActions}>
                  <button onClick={handleDemoPaymentSuccess} className={styles.demoSuccessBtn}>
                    Simulate Success ✅
                  </button>
                  <button onClick={handleDemoPaymentFailure} className={styles.demoFailBtn}>
                    Simulate Failure ❌
                  </button>
                </div>
              </div>

              <div className={styles.demoFooter}>
                <span>🔒 Secure payments by Razorpay</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {transactionStatus !== "idle" && (
          <motion.div 
            className={styles.processingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.processingModal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              {transactionStatus === "processing" ? (
                <>
                  <div className={styles.spinner} />
                  <h2>Processing Payment...</h2>
                  <p>Please do not close this window while we securely establish connections.</p>
                </>
              ) : (
                <>
                  <motion.div 
                    className={styles.successCheck}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                  >
                    ✓
                  </motion.div>
                  <h2>Payment Accepted!</h2>
                  <p>Redirecting to your order confirmation...</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={styles.main}>
        <div className="container section-padding">
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          <div className={styles.divider} />

          {errorMsg && <div className={styles.errorAlert}>⚠ {errorMsg}</div>}

          <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
            {/* Left: Billing and Delivery Details */}
            <div className={styles.formCol}>
              {/* Shipping Address */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionHeader}>📍 Delivery Address</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name-input" className={styles.label}>Full Name</label>
                    <input
                      id="name-input"
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email-input" className={styles.label}>Email Address</label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone-input" className={styles.label}>Phone Number</label>
                    <input
                      id="phone-input"
                      type="tel"
                      required
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="address-input" className={styles.label}>Flat / House / Street Address</label>
                    <input
                      id="address-input"
                      type="text"
                      required
                      placeholder="Address detail"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city-input" className={styles.label}>Town / City</label>
                    <input
                      id="city-input"
                      type="text"
                      required
                      placeholder="City name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="zip-input" className={styles.label}>Pincode / Zip Code</label>
                    <input
                      id="zip-input"
                      type="text"
                      required
                      placeholder="6 digits"
                      pattern="[0-9]{5,6}"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionHeader}>💳 Payment Preference</h3>
                <div className={styles.paymentSelector}>
                  <label
                    className={`${styles.paymentOption} ${
                      paymentMethod === "cod" ? styles.selectedOption : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className={styles.radioInput}
                    />
                    <div className={styles.optionDetails}>
                      <strong>Cash on Delivery (COD)</strong>
                      <span>Pay in cash upon delivery at your doorstep.</span>
                    </div>
                  </label>

                  <label
                    className={`${styles.paymentOption} ${
                      paymentMethod === "card" ? styles.selectedOption : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className={styles.radioInput}
                    />
                    <div className={styles.optionDetails}>
                      <strong>Credit / Debit Card</strong>
                      <span>Pay securely using Razorpay.</span>
                    </div>
                  </label>

                  <label
                    className={`${styles.paymentOption} ${
                      paymentMethod === "upi" ? styles.selectedOption : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className={styles.radioInput}
                    />
                    <div className={styles.optionDetails}>
                      <strong>UPI (GPay, PhonePe, Paytm)</strong>
                      <span>Fast and secure UPI payments via Razorpay.</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className={`${styles.cardForm} animate-fade-in`}>
                    <div className={styles.formGroup}>
                      <label htmlFor="card-number" className={styles.label}>Card Number</label>
                      <input
                        id="card-number"
                        type="text"
                        required
                        placeholder="16-digit card number"
                        pattern="[0-9]{16}"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className={styles.cardRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-expiry" className={styles.label}>Expiry Date</label>
                        <input
                          id="card-expiry"
                          type="text"
                          required
                          placeholder="MM/YY"
                          pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="card-cvv" className={styles.label}>CVV</label>
                        <input
                          id="card-cvv"
                          type="password"
                          required
                          placeholder="3 digits"
                          pattern="[0-9]{3}"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Summary Column */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>

                {/* Items Mini List */}
                <div className={styles.itemsList}>
                  {cartItems.map((item) => (
                    <div key={item.id} className={styles.miniItem}>
                      <div className={styles.miniImgWrapper}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className={styles.miniImg}
                        />
                        <span className={styles.miniQty}>{item.quantity}</span>
                      </div>
                      <span className={styles.miniName}>{item.name}</span>
                      <span className={styles.miniSub}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping Charges</span>
                    <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className={styles.summaryRow}>
                      <span>COD Surcharge</span>
                      <span>₹{codSurcharge}</span>
                    </div>
                  )}
                  <div className={styles.totalDivider} />
                  <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                 <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.placeOrderBtn}
                >
                  {isSubmitting
                    ? (paymentMethod === "cod" ? "Placing Order..." : "Processing...")
                    : (paymentMethod === "cod" ? "Place Order 🔒" : "Pay Now 🔒")}
                </button>

                <p className={styles.safeNotice}>
                  🔒 Safe &amp; Secure checkout. By placing this order, you agree to our Terms and Ayurvedic Care Guidelines.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
