import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartSection from "@/components/AddToCartSection";
import ReviewsSection from "@/components/ReviewsSection";
import { getProductById } from "@/lib/db";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

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
    <>
      <Header />

      <main className={styles.main}>
        <div className="container section-padding">
          {/* Back Navigation */}
          <Link href="/shop" className={styles.backLink}>
            ← Back to Shop
          </Link>

          {/* Product Showcase */}
          <div className={styles.showcaseGrid}>
            {/* Left: Image Panel */}
            <div className={styles.imageCol}>
              <span className={styles.categoryBadge}>{getCategoryLabel(product.category)}</span>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Right: Details Panel */}
            <div className={styles.detailsCol}>
              <h1 className={styles.name}>{product.name}</h1>

              {/* Rating */}
              <div className={styles.ratingRow}>
                <span className={styles.stars}>{"★".repeat(Math.round(product.rating))}</span>
                <span className={styles.ratingVal}>{product.rating}</span>
                <span className={styles.reviewsCount}>({product.reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.price}</span>
                <span className={styles.taxLabel}>inclusive of all taxes</span>
              </div>

              {/* Description */}
              <p className={styles.description}>{product.description}</p>

              {/* Add to Cart client controls */}
              <AddToCartSection
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                }}
              />

              {/* Benefits checklist */}
              <div className={styles.sectionGroup}>
                <h3 className={styles.sectionTitle}>Benefits</h3>
                <ul className={styles.benefitsList}>
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className={styles.benefitItem}>
                      <span className={styles.benefitIcon}>✔</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ingredients tag grid */}
              <div className={styles.sectionGroup}>
                <h3 className={styles.sectionTitle}>Ingredients</h3>
                <div className={styles.ingredientsGrid}>
                  {product.ingredients.map((ing, idx) => (
                    <span key={idx} className={styles.ingredientTag}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className={styles.spacer} />

          {/* Reviews Section */}
          <ReviewsSection productId={product.id} />
        </div>
      </main>

      <Footer />
    </>
  );
}
