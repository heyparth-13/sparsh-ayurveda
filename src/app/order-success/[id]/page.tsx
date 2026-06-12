import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrders } from "@/lib/db";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    notFound();
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstimatedDeliveryDate = (isoString: string) => {
    const date = new Date(isoString);
    date.setDate(date.getDate() + 5); // 5 days delivery
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className="container section-padding">
          <div className={styles.successWrapper}>
            {/* Header Success Check */}
            <div className={styles.successHeader}>
              <div className={styles.checkIcon}>✓</div>
              <h1 className={styles.title}>Order Placed Successfully!</h1>
              <p className={styles.subtitle}>
                Thank you for your order, <strong>{order.customer.name}</strong>. Your self-care remedies are being prepared in a fresh batch by our Ayurvedic team.
              </p>
            </div>

            {/* Tracking Timeline */}
            <div className={styles.timelineCard}>
              <h3 className={styles.cardTitle}>📦 Shipment Tracking</h3>
              <div className={styles.trackingNumber}>
                Tracking Number: <strong>{order.trackingNumber}</strong>
              </div>
              <div className={styles.timeline}>
                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.stepMarker}>✓</div>
                  <div className={styles.stepContent}>
                    <h4>Order Confirmed</h4>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className={`${styles.timelineStep} ${styles.active}`}>
                  <div className={styles.stepMarker}>🧪</div>
                  <div className={styles.stepContent}>
                    <h4>Batch Formulation</h4>
                    <p>Our artisans are blending herbs in Gandhinagar, Gujarat</p>
                  </div>
                </div>

                <div className={styles.timelineStep}>
                  <div className={styles.stepMarker}>🚚</div>
                  <div className={styles.stepContent}>
                    <h4>Package Dispatched</h4>
                    <p>Upcoming</p>
                  </div>
                </div>

                <div className={styles.timelineStep}>
                  <div className={styles.stepMarker}>🏡</div>
                  <div className={styles.stepContent}>
                    <h4>Delivered</h4>
                    <p>Estimated by: <strong>{getEstimatedDeliveryDate(order.createdAt)}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Grid: Order Info & Receipt */}
            <div className={styles.grid}>
              {/* Receipt Summary */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>🧾 Invoice details</h3>
                <div className={styles.orderMetadata}>
                  <div>Order ID: <strong>{order.id}</strong></div>
                  <div>Payment Method: <strong>{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}</strong></div>
                  {order.paymentId && (
                    <div>Payment ID: <strong>{order.paymentId}</strong></div>
                  )}
                  {order.razorpayOrderId && (
                    <div>Gateway Ref: <strong>{order.razorpayOrderId}</strong></div>
                  )}
                  <div>Status: <span className={styles.statusBadge}>{order.status}</span></div>
                </div>

                <div className={styles.invoiceTable}>
                  <div className={`${styles.invoiceRow} ${styles.tableHeader}`}>
                    <span>Product</span>
                    <span className={styles.textCenter}>Qty</span>
                    <span className={styles.textRight}>Subtotal</span>
                  </div>

                  {order.items.map((item) => (
                    <div key={item.id} className={styles.invoiceRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.textCenter}>x{item.quantity}</span>
                      <span className={styles.textRight}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}

                  <div className={styles.tableDivider} />

                  <div className={styles.invoiceRow}>
                    <span>Items Subtotal</span>
                    <span className={styles.textRight}>₹{order.totalAmount >= 550 ? order.totalAmount : order.totalAmount - 50}</span>
                  </div>

                  <div className={styles.invoiceRow}>
                    <span>Shipping Charges</span>
                    <span className={styles.textRight}>{order.totalAmount >= 500 ? "FREE" : "₹50"}</span>
                  </div>

                  <div className={styles.tableDivider} style={{ borderStyle: "double" }} />

                  <div className={`${styles.invoiceRow} ${styles.tableTotal}`}>
                    <span>Grand Total Paid</span>
                    <span className={styles.textRight}>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>📍 Shipping Details</h3>
                <div className={styles.shippingDetails}>
                  <p><strong>Name:</strong> {order.customer.name}</p>
                  <p><strong>Email:</strong> {order.customer.email}</p>
                  <p><strong>Phone:</strong> {order.customer.phone}</p>
                  <p className={styles.addressLine}>
                    <strong>Address:</strong><br />
                    {order.customer.address},<br />
                    {order.customer.city} - {order.customer.zipCode},<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className={styles.actions}>
              <Link href="/shop" className={styles.shopBtn}>
                Continue Shopping 🌿
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
