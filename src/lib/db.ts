import fs from "fs";
import path from "path";
import productsData from "../data/products.json";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;         // New field (default: 20)
  enabled: boolean;      // New field (default: true)
}

export interface OrderItem {
  id: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  confirmedAt?: string;  // New field
  trackingNumber: string;
  paymentId?: string;       // Razorpay payment ID (or demo payment ID)
  razorpayOrderId?: string; // Razorpay order ID (or demo order ID)
  razorpaySignature?: string; // Razorpay payment signature
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ---------- Storage Strategy ----------
const isVercel = !!process.env.VERCEL;

const memoryStore: {
  orders: Order[];
  products: Product[];
  reviews: Review[];
  initialized: boolean;
} = {
  orders: [],
  products: [],
  reviews: [],
  initialized: false,
};

function initMemoryStore() {
  if (!memoryStore.initialized) {
    memoryStore.products = (productsData as any[]).map(p => ({
      ...p,
      stock: typeof p.stock === "number" ? p.stock : 20,
      enabled: typeof p.enabled === "boolean" ? p.enabled : true,
    }));
    memoryStore.initialized = true;
  }
}

// ---------- File helpers (local dev only) ----------
const getFilePath = (fileName: string) => {
  return path.join(process.cwd(), "src", "data", fileName);
};

const ensureFileExists = (filePath: string, initialContent = "[]") => {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, initialContent, "utf-8");
    }
  } catch (err) {
    console.error("ensureFileExists failed:", err);
  }
};

// ---------- Order Database Operations ----------
export async function getOrders(): Promise<Order[]> {
  if (isVercel) {
    initMemoryStore();
    return [...memoryStore.orders];
  }

  const filePath = getFilePath("orders.json");
  ensureFileExists(filePath);
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as Order[];
  } catch (error) {
    console.error("Error reading orders:", error);
    return [];
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  if (isVercel) {
    initMemoryStore();
    memoryStore.orders.push(order);
    return order;
  }

  const filePath = getFilePath("orders.json");
  ensureFileExists(filePath);
  try {
    const orders = await getOrders();
    orders.push(order);
    await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("saveOrder file write failed, order still valid:", err);
  }
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled",
  confirmedAt?: string
): Promise<Order | null> {
  if (isVercel) {
    initMemoryStore();
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    if (confirmedAt) {
      order.confirmedAt = confirmedAt;
    }
    return order;
  }

  const filePath = getFilePath("orders.json");
  ensureFileExists(filePath);
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  
  orders[index].status = status;
  if (confirmedAt) {
    orders[index].confirmedAt = confirmedAt;
  }
  await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

// ---------- Product Database Operations ----------
export async function getProducts(): Promise<Product[]> {
  if (isVercel) {
    initMemoryStore();
    return [...memoryStore.products];
  }

  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as any[];
    return parsed.map(p => ({
      ...p,
      stock: typeof p.stock === "number" ? p.stock : 20,
      enabled: typeof p.enabled === "boolean" ? p.enabled : true,
    }));
  } catch (error) {
    console.error("Error reading products:", error);
    return (productsData as any[]).map(p => ({
      ...p,
      stock: typeof p.stock === "number" ? p.stock : 20,
      enabled: typeof p.enabled === "boolean" ? p.enabled : true,
    }));
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProduct(product: Product): Promise<Product> {
  if (isVercel) {
    initMemoryStore();
    memoryStore.products.push(product);
    return product;
  }

  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  const products = await getProducts();
  products.push(product);
  await fs.promises.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (isVercel) {
    initMemoryStore();
    const index = memoryStore.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    memoryStore.products[index] = { ...memoryStore.products[index], ...updates };
    return memoryStore.products[index];
  }

  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  await fs.promises.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isVercel) {
    initMemoryStore();
    const index = memoryStore.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    memoryStore.products.splice(index, 1);
    return true;
  }

  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  await fs.promises.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
  return true;
}

// ---------- Reviews Database Operations ----------
export async function getReviews(): Promise<Review[]> {
  if (isVercel) {
    initMemoryStore();
    return [...memoryStore.reviews];
  }

  const filePath = getFilePath("reviews.json");
  ensureFileExists(filePath);
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as Review[];
  } catch (error) {
    console.error("Error reading reviews:", error);
    return [];
  }
}

export async function saveReview(review: Review): Promise<Review> {
  if (isVercel) {
    initMemoryStore();
    memoryStore.reviews.push(review);
    return review;
  }

  const filePath = getFilePath("reviews.json");
  ensureFileExists(filePath);
  try {
    const reviews = await getReviews();
    reviews.push(review);
    await fs.promises.writeFile(filePath, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.error("saveReview file write failed:", err);
  }
  return review;
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.productId === productId);
}
