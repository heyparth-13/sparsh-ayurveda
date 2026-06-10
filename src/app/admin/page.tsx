"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Order, Product } from "@/lib/db";
import styles from "./page.module.css";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "inventory" | "customers">("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & Filter
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Modals & Popups
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Notification Feedbacks
  const [notificationToast, setNotificationToast] = useState<{
    message: string;
    emailPreviewUrl?: string | null;
    smsContent?: string;
  } | null>(null);

  // Add Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    category: "oils",
    description: "",
    ingredients: "",
    benefits: "",
    image: "",
    stock: "20",
    enabled: true
  });

  // Check login cookie on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/orders"); // If this is fine, we fetch orders
        if (res.ok) {
          // If we can fetch without error, check cookie or client state
          // Simple auth gate: we'll check localStorage for session flag
          const localAuth = localStorage.getItem("sportsveda_admin_auth") === "true";
          if (localAuth) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("sportsveda_admin_auth", "true");
        setAuthError("");
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication API");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("sportsveda_admin_auth");
  };

  // Fetch orders and products
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products")
      ]);
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData);
      }
      if (productsRes.ok) {
        const pData = await productsRes.json();
        setProducts(pData);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Update Status handler
  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updatedOrder.status } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: updatedOrder.status } : null));
        }
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error changing status");
    }
  };

  // Confirm Order system
  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local status and stock levels
        await loadData();
        setNotificationToast({
          message: `Order ${orderId} confirmed successfully!`,
          emailPreviewUrl: data.emailPreviewUrl,
          smsContent: data.smsContent
        });
      } else {
        alert(data.error || "Failed to confirm order");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming order");
    }
  };

  // Add Product handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...newProductForm,
        price: parseFloat(newProductForm.price),
        stock: parseInt(newProductForm.stock),
        ingredients: newProductForm.ingredients.split(",").map(i => i.trim()).filter(Boolean),
        benefits: newProductForm.benefits.split(",").map(b => b.trim()).filter(Boolean),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert("Product added successfully!");
        setIsAddProductOpen(false);
        setNewProductForm({
          name: "",
          price: "",
          category: "oils",
          description: "",
          ingredients: "",
          benefits: "",
          image: "",
          stock: "20",
          enabled: true
        });
        loadData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add product");
      }
    } catch (err) {
      alert("Error adding product");
    }
  };

  // Update Product handler
  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        alert("Product updated successfully!");
        setEditingProduct(null);
        loadData();
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      alert("Error updating product");
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Product deleted successfully");
        loadData();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  // Send Invoice manually via Email
  const handleSendEmailInvoice = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.emailPreviewUrl) {
        alert(`Invoice Email sent! Preview URL: ${data.emailPreviewUrl}`);
      } else {
        alert("Invoice Email dispatched successfully.");
      }
    } catch (err) {
      alert("Failed to send invoice email.");
    }
  };

  // Formatting date helper
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculations for analytics
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;

  // Aggregate unique customers
  const customersMap: { [email: string]: { name: string; phone: string; email: string; totalSpent: number; ordersCount: number; ordersList: Order[] } } = {};
  orders.forEach(order => {
    const emailKey = order.customer.email.toLowerCase().trim();
    if (!customersMap[emailKey]) {
      customersMap[emailKey] = {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        totalSpent: 0,
        ordersCount: 0,
        ordersList: []
      };
    }
    customersMap[emailKey].ordersCount += 1;
    customersMap[emailKey].ordersList.push(order);
    if (order.status !== "Cancelled") {
      customersMap[emailKey].totalSpent += order.totalAmount;
    }
  });

  const uniqueCustomersList = Object.values(customersMap);
  const totalCustomersCount = uniqueCustomersList.length;

  // Best selling products calculation
  const productSalesMap: { [id: string]: { name: string; category: string; quantity: number } } = {};
  orders.filter(o => o.status !== "Cancelled").forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.id]) {
        productSalesMap[item.id] = {
          name: item.name,
          category: "",
          quantity: 0
        };
      }
      productSalesMap[item.id].quantity += item.quantity;
    });
  });
  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Daily Sales Calculation (last 7 days)
  const getLast7DaysSales = () => {
    const sales: { dateStr: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const keyDate = d.toDateString();

      const totalForDay = orders
        .filter(o => o.status !== "Cancelled" && new Date(o.createdAt).toDateString() === keyDate)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      sales.push({ dateStr: dateString, amount: totalForDay });
    }
    return sales;
  };
  const dailySalesData = getLast7DaysSales();
  const maxDayAmount = Math.max(...dailySalesData.map(d => d.amount), 1000);

  // Monthly Sales Report
  const getMonthlySalesReport = () => {
    const monthlyMap: { [monthStr: string]: { label: string; orders: number; amount: number } } = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { label: monthLabel, orders: 0, amount: 0 };
      }
      monthlyMap[monthKey].orders += 1;
      if (order.status !== "Cancelled") {
        monthlyMap[monthKey].amount += order.totalAmount;
      }
    });
    return Object.values(monthlyMap);
  };
  const monthlySalesData = getMonthlySalesReport();

  // Filters for orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderStatusFilter === "All" || order.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      order.id.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      order.customer.phone.includes(q) ||
      order.customer.city?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  // Filters for products
  const filteredProducts = products.filter((product) => {
    const q = productSearchQuery.toLowerCase().trim();
    return q === "" || product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q);
  });

  // Filters for customers
  const filteredCustomers = uniqueCustomersList.filter((cust) => {
    const q = customerSearchQuery.toLowerCase().trim();
    return q === "" || cust.name.toLowerCase().includes(q) || cust.email.toLowerCase().includes(q) || cust.phone.includes(q);
  });

  // Login Gate
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container section-padding">
            <div className={styles.loginCard}>
              <h2 className={styles.loginTitle}>🌿 Sportsveda Admin Portal</h2>
              <p className={styles.loginSubtitle}>Provide administrator username and security passcode to authenticate.</p>
              <form onSubmit={handleLogin} className={styles.loginForm}>
                {authError && <div className={styles.authError}>{authError}</div>}
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Passcode PIN</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className={styles.loginBtn}>
                  Authorize Secure Session 🔓
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

      <main className={`${styles.main} ${isDarkMode ? styles.darkMode : ""}`}>
        <div className={styles.dashboardWrapper}>
          
          {/* Sidebar Navigation */}
          <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
              <span style={{ fontSize: "24px" }}>🌿</span>
              <span className={styles.logoText}>Sportsveda Admin</span>
            </div>
            
            <nav className={styles.navMenu}>
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`${styles.navItem} ${activeTab === "dashboard" ? styles.activeNavItem : ""}`}
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("orders")} 
                className={`${styles.navItem} ${activeTab === "orders" ? styles.activeNavItem : ""}`}
              >
                🛍 Orders Book
              </button>
              <button 
                onClick={() => setActiveTab("products")} 
                className={`${styles.navItem} ${activeTab === "products" ? styles.activeNavItem : ""}`}
              >
                📦 Products
              </button>
              <button 
                onClick={() => setActiveTab("inventory")} 
                className={`${styles.navItem} ${activeTab === "inventory" ? styles.activeNavItem : ""}`}
              >
                📉 Inventory
              </button>
              <button 
                onClick={() => setActiveTab("customers")} 
                className={`${styles.navItem} ${activeTab === "customers" ? styles.activeNavItem : ""}`}
              >
                👥 Customers
              </button>
            </nav>

            <div className={styles.sidebarFooter}>
              <button 
                onClick={() => setIsDarkMode(prev => !prev)} 
                className={styles.themeToggleBtn}
              >
                {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Lock Panel 🔒
              </button>
            </div>
          </aside>

          {/* Core Content Area */}
          <section className={styles.contentArea}>
            
            {/* Header Area */}
            <div className={styles.adminHeader}>
              <div>
                <h1 className={styles.title}>
                  {activeTab === "dashboard" && "Analytics Command Centre"}
                  {activeTab === "orders" && "Customer Orders Ledger"}
                  {activeTab === "products" && "Product Catalog Manager"}
                  {activeTab === "inventory" && "Stock & Inventory Control"}
                  {activeTab === "customers" && "Customer Relationships"}
                </h1>
                <p className={styles.subtitle}>Welcome back, administrator. Manage and optimize Sportsveda operations.</p>
              </div>
            </div>

            {/* Notification Toast Alert */}
            {notificationToast && (
              <div style={{ backgroundColor: "var(--primary-soft)", border: "1px solid var(--primary-light)", padding: "16px", borderRadius: "8px", marginBottom: "20px", position: "relative" }}>
                <h4 style={{ color: "var(--primary-dark)", display: "flex", justifyContent: "space-between" }}>
                  <span>📢 Multi-channel Confirmation Dispatched</span>
                  <button onClick={() => setNotificationToast(null)} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }}>✕</button>
                </h4>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>{notificationToast.message}</p>
                {notificationToast.emailPreviewUrl && (
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>
                    📧 <strong>Email Test Preview:</strong> <a href={notificationToast.emailPreviewUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary-dark)", textDecoration: "underline" }}>Click to view nodemailer test inbox</a>
                  </p>
                )}
                {notificationToast.smsContent && (
                  <div style={{ marginTop: "8px", backgroundColor: "rgba(255,255,255,0.7)", padding: "10px", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    💬 <strong>Simulated SMS & WhatsApp text:</strong><br/>
                    {notificationToast.smsContent}
                  </div>
                )}
              </div>
            )}

            {/* loading state */}
            {isLoading ? (
              <p className={styles.loadingText}>Fetching database contents...</p>
            ) : (
              <>
                {/* 1. DASHBOARD / ANALYTICS TAB */}
                {activeTab === "dashboard" && (
                  <div>
                    {/* Cards */}
                    <div className={styles.analyticsGrid}>
                      <div className={styles.analyticsCard}>
                        <span className={styles.analyticsLabel}>Total Revenue</span>
                        <span className={styles.analyticsVal}>₹{totalRevenue.toLocaleString("en-IN")}</span>
                        <span className={styles.analyticsSub}>Excludes cancelled orders</span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <span className={styles.analyticsLabel}>Orders Volume</span>
                        <span className={styles.analyticsVal}>{totalOrdersCount}</span>
                        <span className={styles.analyticsSub}>All incoming checkout logs</span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <span className={styles.analyticsLabel}>Customers</span>
                        <span className={styles.analyticsVal}>{totalCustomersCount}</span>
                        <span className={styles.analyticsSub}>Unique buying profiles</span>
                      </div>
                      <div className={styles.analyticsCard}>
                        <span className={styles.analyticsLabel}>Average Order Size</span>
                        <span className={styles.analyticsVal}>₹{totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0}</span>
                        <span className={styles.analyticsSub}>Revenue per cart checkout</span>
                      </div>
                    </div>

                    {/* Chart and Best Sellers Row */}
                    <div className={styles.analyticsDetailsRow}>
                      <div className={styles.graphCard}>
                        <h3 className={styles.tableTitle}>Daily Sales Trend (Last 7 Days)</h3>
                        <div className={styles.graphContainer}>
                          {dailySalesData.map((day, idx) => {
                            const barHeight = `${Math.min(100, (day.amount / maxDayAmount) * 100)}%`;
                            return (
                              <div key={idx} className={styles.graphBarContainer}>
                                <div className={styles.graphBar} style={{ height: barHeight }}>
                                  <div className={styles.graphTooltip}>₹{day.amount}</div>
                                </div>
                                <span className={styles.graphLabel}>{day.dateStr}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className={styles.graphCard}>
                        <h3 className={styles.tableTitle}>Top Selling Products</h3>
                        <div className={styles.bestSellersList}>
                          {bestSellers.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No purchase records yet.</p>
                          ) : (
                            bestSellers.map((item, idx) => (
                              <div key={idx} className={styles.bestSellerItem}>
                                <span style={{ fontWeight: "bold", color: "var(--primary-dark)" }}>#{idx + 1}</span>
                                <div className={styles.bestSellerDetails}>
                                  <div className={styles.bestSellerName}>{item.name}</div>
                                  <div className={styles.bestSellerSales}>{item.quantity} units sold</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Monthly sales report */}
                    <div className={styles.tableCard}>
                      <h3 className={styles.tableTitle}>Monthly Performance Ledger</h3>
                      <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Billing Period</th>
                              <th>Orders Placed</th>
                              <th>Gross Revenue (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlySalesData.map((month, idx) => (
                              <tr key={idx} className={styles.tableRow}>
                                <td style={{ fontWeight: "600" }}>{month.label}</td>
                                <td>{month.orders}</td>
                                <td style={{ fontWeight: "700", color: "var(--primary-dark)" }}>₹{month.amount.toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ORDER MANAGEMENT TAB */}
                {activeTab === "orders" && (
                  <div className={styles.tableCard}>
                    <div className={styles.tableTitleRow}>
                      <h3 className={styles.tableTitle}>Customer Order Book</h3>
                    </div>

                    <div className={styles.controlsRow}>
                      <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                          type="text"
                          placeholder="Search customer, email, order ID, phone..."
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                      <div className={styles.filterTabs}>
                        {["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((status) => (
                          <button
                            key={status}
                            onClick={() => setOrderStatusFilter(status)}
                            className={`${styles.filterBtn} ${orderStatusFilter === status ? styles.activeFilter : ""}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer info</th>
                            <th>Price</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>No orders found matching search criteria.</td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => (
                              <tr key={order.id} className={styles.tableRow}>
                                <td className={styles.orderId}>{order.id.slice(0, 14)}...</td>
                                <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                                <td>
                                  <div className={styles.custName}>{order.customer.name}</div>
                                  <div className={styles.custContact}>{order.customer.email} | {order.customer.phone}</div>
                                </td>
                                <td className={styles.amountCell}>₹{order.totalAmount}</td>
                                <td className={styles.payCell}>{order.paymentMethod}</td>
                                <td>
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                                    className={`${styles.statusSelect} ${
                                      order.status === "Pending" ? styles.statusPending :
                                      order.status === "Confirmed" ? styles.statusConfirmed :
                                      order.status === "Shipped" ? styles.statusShipped :
                                      order.status === "Delivered" ? styles.statusDelivered :
                                      styles.statusCancelled
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td>
                                  <div className={styles.actionBtnGroup}>
                                    <button 
                                      onClick={() => setSelectedOrder(order)} 
                                      className={styles.actionBtn}
                                      title="Generate Invoice Receipt"
                                    >
                                      🧾 Invoice
                                    </button>
                                    {order.status === "Pending" && (
                                      <button 
                                        onClick={() => handleConfirmOrder(order.id)} 
                                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                      >
                                        ✔️ Confirm
                                      </button>
                                    )}
                                    {order.status === "Confirmed" && (
                                      <button 
                                        onClick={() => handleStatusChange(order.id, "Shipped")} 
                                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                      >
                                        🚚 Ship
                                      </button>
                                    )}
                                    {order.status === "Shipped" && (
                                      <button 
                                        onClick={() => handleStatusChange(order.id, "Delivered")} 
                                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                      >
                                        🎁 Deliver
                                      </button>
                                    )}
                                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                                      <button 
                                        onClick={() => handleStatusChange(order.id, "Cancelled")} 
                                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                      >
                                        ❌ Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. PRODUCT CATALOG MANAGEMENT */}
                {activeTab === "products" && (
                  <div className={styles.tableCard}>
                    <div className={styles.tableTitleRow}>
                      <h3 className={styles.tableTitle}>Product Catalogue</h3>
                      <button onClick={() => setIsAddProductOpen(true)} className="btn-primary" style={{ padding: "8px 20px", fontSize: "12px" }}>
                        ➕ Add Product
                      </button>
                    </div>

                    <div className={styles.controlsRow}>
                      <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                          type="text"
                          placeholder="Search product catalog..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                    </div>

                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Thumbnail</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Unit Price</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>No products in stock.</td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id} className={styles.tableRow} style={{ opacity: product.enabled ? 1 : 0.6 }}>
                                <td>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "4px" }} 
                                    onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=100&auto=format&fit=crop"; }}
                                  />
                                </td>
                                <td>
                                  <div style={{ fontWeight: "600" }}>{product.name}</div>
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                    {product.description}
                                  </div>
                                </td>
                                <td><span className="badge badge-primary">{product.category}</span></td>
                                <td style={{ fontWeight: "700" }}>₹{product.price}</td>
                                <td>
                                  <span>{product.stock} units</span>
                                  {product.stock < 5 && <span className={styles.stockAlert}>⚠️ Low Stock</span>}
                                </td>
                                <td>
                                  <label className={styles.productToggle}>
                                    <input 
                                      type="checkbox" 
                                      checked={product.enabled} 
                                      onChange={() => handleUpdateProductSubmit({
                                        preventDefault: () => {},
                                      } as any).then(() => {
                                        // Simple quick enable/disable toggle logic
                                        fetch(`/api/products/${product.id}`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ enabled: !product.enabled })
                                        }).then(() => loadData());
                                      })}
                                      style={{ marginRight: "6px" }}
                                    />
                                    {product.enabled ? "Active" : "Disabled"}
                                  </label>
                                </td>
                                <td>
                                  <div className={styles.actionBtnGroup}>
                                    <button onClick={() => setEditingProduct(product)} className={styles.actionBtn}>✏️ Edit</button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className={`${styles.actionBtn} ${styles.cancelBtn}`}>🗑️ Del</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. INVENTORY TAB */}
                {activeTab === "inventory" && (
                  <div className={styles.tableCard}>
                    <h3 className={styles.tableTitle}>Stock Replenishment & Threshold Track</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Keep track of stock volumes. Alert flags are enabled for products dropping below 5 units.</p>

                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Current Inventory</th>
                            <th>Replenish Quick Update</th>
                            <th>Status Badge</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className={styles.tableRow}>
                              <td style={{ fontWeight: "600" }}>{product.name}</td>
                              <td style={{ fontSize: "14px", fontWeight: "bold" }}>
                                {product.stock} units
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <input 
                                    type="number" 
                                    defaultValue={product.stock} 
                                    id={`stock-input-${product.id}`}
                                    style={{ width: "70px", padding: "4px 8px", border: "1px solid var(--border-light)", borderRadius: "4px" }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const inputVal = (document.getElementById(`stock-input-${product.id}`) as HTMLInputElement).value;
                                      fetch(`/api/products/${product.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ stock: parseInt(inputVal) || 0 })
                                      }).then(() => {
                                        alert("Stock level updated successfully");
                                        loadData();
                                      });
                                    }}
                                    className={styles.actionBtn}
                                    style={{ backgroundColor: "var(--primary-dark)", color: "white" }}
                                  >
                                    Save
                                  </button>
                                </div>
                              </td>
                              <td>
                                {product.stock === 0 ? (
                                  <span className={styles.stockAlert} style={{ padding: "4px 10px", fontSize: "11px" }}>🔴 Out of Stock</span>
                                ) : product.stock < 5 ? (
                                  <span className={styles.stockAlert} style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "#fef3c7", color: "#d97706" }}>🟡 Low Stock warning</span>
                                ) : (
                                  <span className="badge badge-primary" style={{ padding: "4px 10px", fontSize: "11px" }}>🟢 Normal Stock</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. CUSTOMER RELATIONSHIPS */}
                {activeTab === "customers" && (
                  <div className={styles.tableCard}>
                    <h3 className={styles.tableTitle}>Customer Index Directory</h3>
                    <div className={styles.controlsRow} style={{ marginBottom: "20px" }}>
                      <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                          type="text"
                          placeholder="Search by customer name, email, phone..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                    </div>

                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Full Name</th>
                            <th>Contact Details</th>
                            <th>Total Sales Generated</th>
                            <th>Orders Placed</th>
                            <th>Interaction Ledger</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>No customer records captured.</td>
                            </tr>
                          ) : (
                            filteredCustomers.map((cust, idx) => (
                              <tr key={idx} className={styles.tableRow}>
                                <td style={{ fontWeight: "600" }}>{cust.name}</td>
                                <td>
                                  <div>📧 {cust.email}</div>
                                  <div>📞 {cust.phone}</div>
                                </td>
                                <td style={{ fontWeight: "700", color: "var(--primary-dark)" }}>₹{cust.totalSpent}</td>
                                <td>{cust.ordersCount} checkouts</td>
                                <td>
                                  <button 
                                    onClick={() => setSelectedCustomerEmail(cust.email)} 
                                    className={styles.actionBtn}
                                  >
                                    🔍 View Purchase History
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* MODAL 1: Invoice Receipt summary */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>🧾 Professional Invoice Receipt</h3>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>✕</button>
            </div>
            
            <div id="printable-receipt" className={styles.modalBody}>
              <div className={styles.receiptTitleRow}>
                <h2>🌿 SPORTSVEDA INVOICE</h2>
                <span className={`${styles.badge} ${
                  selectedOrder.status === "Pending" ? styles.statusPending :
                  selectedOrder.status === "Confirmed" ? styles.statusConfirmed :
                  selectedOrder.status === "Shipped" ? styles.statusShipped :
                  selectedOrder.status === "Delivered" ? styles.statusDelivered :
                  styles.statusCancelled
                }`} style={{ fontSize: "11px" }}>
                  {selectedOrder.status}
                </span>
              </div>
              <p className={styles.receiptTagline}>Sportsveda E-commerce Care — &quot;Nurtured by Nature&quot;</p>
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
                <div style={{ textAlign: "right" }}>
                  <h4>Order Summary</h4>
                  <p>Invoice ID: #{selectedOrder.id}</p>
                  <p>Date: {formatDate(selectedOrder.createdAt)}</p>
                  {selectedOrder.confirmedAt && <p>Confirmed: {formatDate(selectedOrder.confirmedAt)}</p>}
                  <p>Tracking Ref: {selectedOrder.trackingNumber}</p>
                  <p>Payment: {selectedOrder.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <div className={styles.receiptDivider} />

              <div className={styles.invoiceTable}>
                <div className={`${styles.invoiceRow} ${styles.tableHeader}`}>
                  <span>Product Item</span>
                  <span className={styles.textCenter}>Qty</span>
                  <span className={styles.textRight}>Price</span>
                  <span className={styles.textRight}>Total</span>
                </div>
                
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className={styles.invoiceRow} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span>{item.name}</span>
                    <span className={styles.textCenter}>{item.quantity}</span>
                    <span className={styles.textRight}>₹{item.price}</span>
                    <span className={styles.textRight}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className={styles.receiptDivider} />

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className={styles.textRight}>₹{selectedOrder.totalAmount >= 550 ? selectedOrder.totalAmount : selectedOrder.totalAmount - 50}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery & Handling</span>
                <span className={styles.textRight}>{selectedOrder.totalAmount >= 500 ? "FREE" : "₹50"}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.receiptGrand}`}>
                <span>Total Amount Paid/Due</span>
                <span className={styles.textRight}>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => window.print()} className={styles.printBtn}>
                🖨 Print / Save PDF
              </button>
              <button onClick={() => handleSendEmailInvoice(selectedOrder)} className={styles.dismissBtn} style={{ backgroundColor: "var(--primary-soft)" }}>
                📧 Email Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className={styles.dismissBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Product Modal */}
      {isAddProductOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>➕ Add New Product to Catalogue</h3>
              <button onClick={() => setIsAddProductOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            
            <form onSubmit={handleAddProductSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Amla Hair Cleanser" 
                    value={newProductForm.name} 
                    onChange={e => setNewProductForm({...newProductForm, name: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={newProductForm.price} 
                      onChange={e => setNewProductForm({...newProductForm, price: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select 
                      value={newProductForm.category} 
                      onChange={e => setNewProductForm({...newProductForm, category: e.target.value})}
                      className={styles.formSelect}
                    >
                      <option value="oils">oils</option>
                      <option value="cleansers">cleansers</option>
                      <option value="face-wash">face wash</option>
                      <option value="soaps">soaps</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      required 
                      value={newProductForm.stock} 
                      onChange={e => setNewProductForm({...newProductForm, stock: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image URL Path</label>
                    <input 
                      type="text" 
                      placeholder="/images/products/example.jpg" 
                      value={newProductForm.image} 
                      onChange={e => setNewProductForm({...newProductForm, image: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea 
                    rows={3} 
                    value={newProductForm.description} 
                    onChange={e => setNewProductForm({...newProductForm, description: e.target.value})}
                    className={styles.formTextarea} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ingredients (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="Aloe Vera, Shikakai, Neem" 
                    value={newProductForm.ingredients} 
                    onChange={e => setNewProductForm({...newProductForm, ingredients: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Benefits (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="Promotes growth, Nourishes scalp" 
                    value={newProductForm.benefits} 
                    onChange={e => setNewProductForm({...newProductForm, benefits: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
                  Save Product
                </button>
                <button type="button" onClick={() => setIsAddProductOpen(false)} className={styles.dismissBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Product Modal */}
      {editingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>✏️ Edit Product Details</h3>
              <button onClick={() => setEditingProduct(null)} className={styles.closeBtn}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateProductSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editingProduct.name} 
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={editingProduct.price} 
                      onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <input 
                      type="text" 
                      required 
                      value={editingProduct.category} 
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Stock Volume</label>
                    <input 
                      type="number" 
                      required 
                      value={editingProduct.stock} 
                      onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image URL Path</label>
                    <input 
                      type="text" 
                      value={editingProduct.image} 
                      onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea 
                    rows={3} 
                    value={editingProduct.description} 
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    className={styles.formTextarea} 
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className={styles.dismissBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Customer Order History Details */}
      {selectedCustomerEmail && customersMap[selectedCustomerEmail] && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>👤 Customer History: {customersMap[selectedCustomerEmail].name}</h3>
              <button onClick={() => setSelectedCustomerEmail(null)} className={styles.closeBtn}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div style={{ marginBottom: "16px", fontSize: "13px" }}>
                <p><strong>Email Address:</strong> {customersMap[selectedCustomerEmail].email}</p>
                <p><strong>Phone Number:</strong> {customersMap[selectedCustomerEmail].phone}</p>
                <p><strong>Total Gross Purchases:</strong> ₹{customersMap[selectedCustomerEmail].totalSpent}</p>
              </div>

              <h4 style={{ fontSize: "14px", margin: "14px 0 8px 0", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>Purchase Transactions</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {customersMap[selectedCustomerEmail].ordersList.map((order, idx) => (
                  <div key={idx} style={{ padding: "10px", backgroundColor: "var(--bg-cream)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold" }}>
                      <span>Order Ref: {order.id.slice(0, 15)}...</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Date: {formatDate(order.createdAt)} | Status: <strong>{order.status}</strong>
                    </div>
                    <div style={{ fontSize: "11px", marginTop: "4px" }}>
                      Items: {order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setSelectedCustomerEmail(null)} className={styles.dismissBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
