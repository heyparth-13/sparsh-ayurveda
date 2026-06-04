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
  status: "Pending" | "Shipped" | "Delivered";
  createdAt: string;
  trackingNumber: string;
}

// Custom simple review interface
export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const getFilePath = (fileName: string) => {
  return path.join(process.cwd(), "src", "data", fileName);
};

// Check if file exists, if not write empty array
const ensureFileExists = (filePath: string, initialContent = "[]") => {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, initialContent, "utf-8");
  }
};

// Order Database Operations
export async function getOrders(): Promise<Order[]> {
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
  const filePath = getFilePath("orders.json");
  ensureFileExists(filePath);
  const orders = await getOrders();
  orders.push(order);
  await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), "utf-8");
  return order;
}

export async function updateOrderStatus(orderId: string, status: "Pending" | "Shipped" | "Delivered"): Promise<Order | null> {
  const filePath = getFilePath("orders.json");
  ensureFileExists(filePath);
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].status = status;
  await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

// Product Database Operations
export async function getProducts(): Promise<Product[]> {
  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as Product[];
  } catch (error) {
    console.error("Error reading products:", error);
    // Fallback to static data if file doesn't exist or is empty/corrupt
    return productsData as Product[];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const filePath = getFilePath("products.json");
  ensureFileExists(filePath);
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  await fs.promises.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
  return products[index];
}

// Reviews Database Operations
export async function getReviews(): Promise<Review[]> {
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
  const filePath = getFilePath("reviews.json");
  ensureFileExists(filePath);
  const reviews = await getReviews();
  reviews.push(review);
  await fs.promises.writeFile(filePath, JSON.stringify(reviews, null, 2), "utf-8");
  return review;
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.productId === productId);
}
