"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./AddToCartSection.module.css";
import { toast } from "sonner";

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    toast.success(`${quantity} ${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectorRow}>
        <div className={styles.quantityLabel}>Quantity:</div>
        <div className={styles.quantitySelector}>
          <button onClick={handleDecrement} className={styles.qtyBtn} aria-label="Decrease quantity">
            −
          </button>
          <span className={styles.qtyVal}>{quantity}</span>
          <button onClick={handleIncrement} className={styles.qtyBtn} aria-label="Increase quantity">
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`${styles.addBtn} ${added ? styles.added : ""}`}
      >
        {added ? "✓ Added to Cart" : `Add to Cart • ₹${product.price * quantity}`}
      </button>
    </div>
  );
}
