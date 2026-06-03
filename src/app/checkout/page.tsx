"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
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
  const [errorMsg, setErrorMsg] = useState("");

  // Prevent accessing checkout with an empty cart
  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) {
      router.push("/cart");
    }
  }, [cartItems, router, isSubmitting]);

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
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

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to place the order. Please try again.");
      }

      const placedOrder = await res.json();
      clearCart();
      router.push(`/order-success/${placedOrder.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to place order.");
      }
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Avoid render flashes
  }

  return (
    <>
      <Header />

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
                      <span>Simulate online payment securely.</span>
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
                  {isSubmitting ? "Placing Order..." : "Place Order 🔒"}
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
