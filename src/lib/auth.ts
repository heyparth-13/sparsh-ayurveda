import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_123";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const isVercel = !!process.env.VERCEL;

// In-memory user store for Vercel
const memoryUsers: User[] = [];

const getUsersFilePath = () => {
  return path.join(process.cwd(), "src", "data", "users.json");
};

const ensureUsersFileExists = () => {
  try {
    const filePath = getUsersFilePath();
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
  } catch (err) {
    console.error("ensureUsersFileExists failed:", err);
  }
};

export async function getUsers(): Promise<User[]> {
  if (isVercel) {
    return [...memoryUsers];
  }

  const filePath = getUsersFilePath();
  ensureUsersFileExists();
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function saveUser(user: User): Promise<User> {
  if (isVercel) {
    memoryUsers.push(user);
    return user;
  }

  const filePath = getUsersFilePath();
  ensureUsersFileExists();
  try {
    const users = await getUsers();
    users.push(user);
    await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("saveUser file write failed:", err);
  }
  return user;
}

// Security utils
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return key === derivedKey;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
