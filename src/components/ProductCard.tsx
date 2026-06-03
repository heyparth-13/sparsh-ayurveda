"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";
import React, { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop click from bubbling and triggering parent Link
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Convert category ID to readable text
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "oils":
        return "Hair Oil";
      case "cleansers":
        return "Hair Cleanser";
      case "face-wash":
        return "Face Wash";
      case "soaps":
        return "Ayurvedic Soap";
      default:
        return cat;
    }
  };

  return (
    <div className={`${styles.card} hover-lift`}>
      <Link href={`/shop/${product.id}`} className={styles.linkContainer}>
        {/* Product Image Wrapper */}
        <div className={styles.imageWrapper}>
          <span className={styles.categoryBadge}>{getCategoryLabel(product.category)}</span>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
            priority={product.id === "keshamrit-hair-oil"}
          />
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>

          {/* Rating */}
          <div className={styles.ratingRow}>
            <span className={styles.stars}>{"★".repeat(Math.round(product.rating))}</span>
            <span className={styles.ratingVal}>{product.rating}</span>
            <span className={styles.reviews}>({product.reviewsCount} reviews)</span>
          </div>

          <p className={styles.description}>{product.description.slice(0, 75)}...</p>

          <div className={styles.footerRow}>
            <span className={styles.price}>₹{product.price}</span>
            <button
              onClick={handleAddToCart}
              className={`${styles.addBtn} ${added ? styles.added : ""}`}
              aria-label="Add to cart"
            >
              {added ? "✓ Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
