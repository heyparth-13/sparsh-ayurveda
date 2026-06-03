"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About Us", path: "/about" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoLeaf}>🌿</span>
          <span className={styles.logoText}>Sparsh Veda</span>
        </Link>
        <nav className={styles.navLinks}>
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`${styles.navLink} ${
                pathname === link.path ? styles.active : ""
              }`}
            >
              {pathname === link.path && (
                <motion.div
                  layoutId="active-pill"
                  className={styles.activePill}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={styles.navLinkText}>{link.name}</span>
            </Link>
          ))}
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
