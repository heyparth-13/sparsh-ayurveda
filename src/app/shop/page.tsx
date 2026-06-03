"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { Product } from "@/lib/db";
import styles from "./page.module.css";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");

  // Sync category if URL search param changes
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setSelectedCategory(cat);
  }, [searchParams]);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "oils", name: "Hair Oils" },
    { id: "cleansers", name: "Hair Cleansers" },
    { id: "face-wash", name: "Face Wash" },
    { id: "soaps", name: "Bathing Bars" },
  ];

  // Filtering Logic
  const filteredProducts = (productsData as Product[]).filter((product) => {
    // Category filter
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    // Search filter (searches title, description, ingredients, benefits)
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      normalizedQuery === "" ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.ingredients.some((ing) => ing.toLowerCase().includes(normalizedQuery)) ||
      product.benefits.some((ben) => ben.toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    }
    if (sortBy === "price-high") {
      return b.price - a.price;
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    // Default or "featured"
    return b.reviewsCount - a.reviewsCount;
  });

  return (
    <div className={styles.shopContainer}>
      {/* Banner */}
      <section className={styles.shopBanner}>
        <div className="container">
          <h1 className={styles.bannerTitle}>Ayurvedic Apothecary</h1>
          <p className={styles.bannerDesc}>
            100% natural, artisanal formulas crafted with care. Explore our collection of premium oils, cleansers, and handcrafted soap bars.
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="container section-padding">
        <div className={styles.controlsRow}>
          {/* Search Input */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, ingredient (e.g. rosemary, amla)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.clearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className={styles.sortWrapper}>
            <label htmlFor="sort" className={styles.sortLabel}>Sort By:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="featured">Bestsellers</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsWrapper}>
          <div className={styles.tabsList}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${styles.tabBtn} ${
                  selectedCategory === cat.id ? styles.activeTab : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <span className={styles.resultsCount}>
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className={styles.grid}>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🌿</div>
            <h3>No Products Found</h3>
            <p>We couldn&apos;t find any products matching your selection. Try clearing your filters or refining your search query.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className={styles.resetBtn}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--primary-dark)" }}>Loading Apothecary...</p>
        </div>
      }>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
