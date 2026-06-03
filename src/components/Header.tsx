"use client";

import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoLeaf}>🌿</span>
          <span className={styles.logoText}>Sparsh Veda</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/shop" className={styles.navLink}>
            Shop
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartBtn} aria-label="Shopping Cart">
            <span className={styles.cartIcon}>🛒</span>
            <CartCountBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}

// Client Component badge to read the cart state reactively
import { useCart } from "@/context/CartContext";

function CartCountBadge() {
  const { cartCount } = useCart();
  if (cartCount === 0) return null;
  return <span className={styles.cartCount}>{cartCount}</span>;
}
