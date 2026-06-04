"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Order, Product } from "@/lib/db";
import styles from "./page.module.css";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [products, setProducts] = useState<Product[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected order for detail modal viewer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Authenticate Admin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "7259") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid passcode. Hint: Use '7259'");
    }
  };

  // Fetch orders from API
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }
    fetchOrders();
    fetchProducts();
  }, [isAuthenticated]);

  const handleProductUpdate = async (id: string, name: string, price: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        alert("Product updated successfully");
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      alert("Error updating product");
    }
  };

  // Update Status handler
  const handleStatusChange = async (orderId: string, newStatus: "Pending" | "Shipped" | "Delivered") => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updatedOrder.status } : o))
        );
        // Update selected order details if open
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: updatedOrder.status } : null));
        }
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating order status");
    }
  };

  // Calculations for Analytics Cards
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(0) : "0";

  // Filtering Logic
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = statusFilter === "All" || order.status === statusFilter;
    const normQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      normQuery === "" ||
      order.id.toLowerCase().includes(normQuery) ||
      order.customer.name.toLowerCase().includes(normQuery) ||
      order.customer.email.toLowerCase().includes(normQuery) ||
      order.customer.phone.includes(normQuery) ||
      order.customer.city.toLowerCase().includes(normQuery) ||
      order.customer.zipCode.includes(normQuery);

    return matchesFilter && matchesSearch;
  });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container section-padding">
            <div className={styles.loginCard}>
              <h2 className={styles.loginTitle}>🌿 Sparsh Veda Admin Access</h2>
              <p className={styles.loginSubtitle}>Please enter your administration passcode to proceed to orders and sales analytics.</p>
              <form onSubmit={handleLogin} className={styles.loginForm}>
                {authError && <div className={styles.authError}>{authError}</div>}
                <div className={styles.formGroup}>
                  <label htmlFor="passcode-input" className={styles.label}>Passcode PIN</label>
                  <input
                    id="passcode-input"
                    type="password"
                    required
                    placeholder="Enter passcode (hint: 7259)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className={styles.loginBtn}>
                  Authorize Admin Panel 🔓
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className="container section-padding">
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.title}>Admin Command Dashboard</h1>
              <p className={styles.subtitle}>Track incoming orders, customer details, and sales growth.</p>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>
              Lock Panel 🔒
            </button>
          </div>

          {/* Analytics Overview Cards */}
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsLabel}>Total Revenue</span>
              <span className={styles.analyticsVal}>₹{totalSales}</span>
              <span className={styles.analyticsSub}>All completed checkouts</span>
            </div>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsLabel}>Orders Received</span>
              <span className={styles.analyticsVal}>{totalOrders}</span>
              <span className={styles.analyticsSub}>Volume of unique orders</span>
            </div>
            <div className={styles.analyticsCard}>
              <span className={styles.analyticsLabel}>Avg Order Size</span>
              <span className={styles.analyticsVal}>₹{avgOrderValue}</span>
              <span className={styles.analyticsSub}>Revenue per transaction</span>
            </div>
          </div>

          {/* Core Orders Table Section */}
          <div className={styles.tableCard}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
              <button 
                onClick={() => setActiveTab("orders")} 
                style={{ background: activeTab === "orders" ? "var(--primary-color)" : "transparent", color: activeTab === "orders" ? "white" : "var(--text-color)", border: "1px solid var(--primary-color)", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab("products")} 
                style={{ background: activeTab === "products" ? "var(--primary-color)" : "transparent", color: activeTab === "products" ? "white" : "var(--text-color)", border: "1px solid var(--primary-color)", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
              >
                Products List
              </button>
            </div>

            {activeTab === "orders" ? (
              <>
                <h3 className={styles.tableTitle}>Order Book</h3>

                {/* Filter and Search Row */}
                <div className={styles.controlsRow}>
                  <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search order ID, customer name, city, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <div className={styles.filterTabs}>
                    {["All", "Pending", "Shipped", "Delivered"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`${styles.filterBtn} ${
                          statusFilter === status ? styles.activeFilter : ""
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading / Data Table */}
                {isLoading ? (
                  <p className={styles.loadingText}>Loading order database...</p>
                ) : filteredOrders.length === 0 ? (
                  <div className={styles.emptyTable}>
                    <h3>No Orders Found</h3>
                    <p>No orders matched your active search or filter selection.</p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Customer Details</th>
                          <th>Total Amt</th>
                          <th>Payment</th>
                          <th>Shipment Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className={styles.tableRow}>
                            <td className={styles.orderId}>{order.id.slice(0, 14)}...</td>
                            <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                            <td>
                              <div className={styles.custName}>{order.customer.name}</div>
                              <div className={styles.custContact}>
                                {order.customer.city} | {order.customer.phone}
                              </div>
                            </td>
                            <td className={styles.amountCell}>₹{order.totalAmount}</td>
                            <td className={styles.payCell}>
                              {order.paymentMethod === "cod" ? "COD" : "Online"}
                            </td>
                            <td>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.id,
                                    e.target.value as "Pending" | "Shipped" | "Delivered"
                                  )
                                }
                                className={`${styles.statusSelect} ${
                                  order.status === "Pending"
                                    ? styles.statusPending
                                    : order.status === "Shipped"
                                    ? styles.statusShipped
                                    : styles.statusDelivered
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className={styles.viewBtn}
                              >
                                Invoice 🧾
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className={styles.tableTitle}>Product Management</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Price (₹)</th>
                        <th>Category</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className={styles.tableRow}>
                          <td>{product.id.substring(0, 8)}</td>
                          <td>
                            <input 
                              type="text" 
                              defaultValue={product.name} 
                              id={`name-${product.id}`}
                              style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              defaultValue={product.price} 
                              id={`price-${product.id}`}
                              style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px", width: "80px" }}
                            />
                          </td>
                          <td>{product.category}</td>
                          <td>
                            <button
                              onClick={() => {
                                const newName = (document.getElementById(`name-${product.id}`) as HTMLInputElement).value;
                                const newPrice = parseFloat((document.getElementById(`price-${product.id}`) as HTMLInputElement).value);
                                handleProductUpdate(product.id, newName, newPrice);
                              }}
                              style={{ background: "var(--primary-dark)", color: "white", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Order Invoice Summary</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className={styles.closeBtn}
                aria-label="Close invoice details"
              >
                ✕
              </button>
            </div>

            <div id="printable-receipt" className={styles.modalBody}>
              <div className={styles.receiptTitleRow}>
                <h2>🌿 Sparsh Veda Invoice</h2>
                <span>Status: <strong>{selectedOrder.status}</strong></span>
              </div>
              <p className={styles.receiptTagline}>Sparsh Veda Care - &quot;Nurtured by Nature&quot;</p>
              <div className={styles.receiptDivider} />

              <div className={styles.receiptGrid}>
                <div>
                  <h4>Delivery Address</h4>
                  <p><strong>{selectedOrder.customer.name}</strong></p>
                  <p>{selectedOrder.customer.address}</p>
                  <p>{selectedOrder.customer.city} - {selectedOrder.customer.zipCode}</p>
                  <p>Phone: {selectedOrder.customer.phone}</p>
                  <p>Email: {selectedOrder.customer.email}</p>
                </div>
                <div className={styles.textRight}>
                  <h4>Receipt Details</h4>
                  <p>Order ID: {selectedOrder.id}</p>
                  <p>Date: {formatDate(selectedOrder.createdAt)}</p>
                  <p>Tracking: {selectedOrder.trackingNumber}</p>
                  <p>Method: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                </div>
              </div>

              <div className={styles.receiptDivider} />

              <div className={styles.invoiceTable}>
                <div className={`${styles.invoiceRow} ${styles.tableHeader}`}>
                  <span>Item Name</span>
                  <span className={styles.textCenter}>Qty</span>
                  <span className={styles.textRight}>Price</span>
                  <span className={styles.textRight}>Total</span>
                </div>

                {selectedOrder.items.map((item) => (
                  <div key={item.id} className={styles.invoiceRow}>
                    <span>{item.name}</span>
                    <span className={styles.textCenter}>x{item.quantity}</span>
                    <span className={styles.textRight}>₹{item.price}</span>
                    <span className={styles.textRight}>₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <div className={styles.receiptDivider} style={{ margin: "12px 0" }} />

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span className={styles.textRight}>₹{selectedOrder.totalAmount >= 550 ? selectedOrder.totalAmount : selectedOrder.totalAmount - 50}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping Fee</span>
                  <span className={styles.textRight}>{selectedOrder.totalAmount >= 500 ? "FREE" : "₹50"}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.receiptGrand}`}>
                  <span>Grand Total Paid</span>
                  <span className={styles.textRight}>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => window.print()}
                className={styles.printBtn}
              >
                Print Invoice 🖨
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className={styles.dismissBtn}
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
