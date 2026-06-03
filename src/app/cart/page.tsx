"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Dynamic Shipping logic (Free shipping above ₹500, else ₹50)
  const shippingThreshold = 500;
  const shippingFee = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal + shippingFee;

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className="container section-padding">
          <h1 className={styles.pageTitle}>Your Self-Care Basket</h1>
          <div className={styles.divider} />

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>🛒</div>
              <h2>Your basket is empty</h2>
              <p>Looks like you haven&apos;t added any Ayurvedic products yet.</p>
              <Link href="/shop" className={styles.shopBtn}>
                Explore Our Products 🌿
              </Link>
            </div>
          ) : (
            <div className={styles.cartLayout}>
              {/* Left Column: Items List */}
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    {/* Image */}
                    <div className={styles.itemImgWrapper}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className={styles.itemImg}
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.itemInfo}>
                      <Link href={`/shop/${item.id}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      <span className={styles.itemPrice}>₹{item.price} each</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className={styles.qtyControls}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={styles.qtyBtn}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className={styles.itemSubtotal}>
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className={styles.removeBtn}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className={styles.cartActions}>
                  <Link href="/shop" className={styles.continueLink}>
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className={styles.summaryCol}>
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryTitle}>Basket Summary</h3>

                  <div className={styles.summaryRow}>
                    <span>Items Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Shipping Charges</span>
                    <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                  </div>

                  {shippingFee > 0 && (
                    <p className={styles.shippingNotice}>
                      💡 Add <strong>₹{shippingThreshold - cartTotal}</strong> more to qualify for <strong>FREE Shipping</strong>!
                    </p>
                  )}

                  <div className={styles.totalDivider} />

                  <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>

                  <Link href="/checkout" className={styles.checkoutBtn}>
                    Proceed to Checkout ➔
                  </Link>

                  <div className={styles.trustBadges}>
                    <span>🔒 Secured Checkout</span>
                    <span>🌿 Authentic Ayurveda</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
