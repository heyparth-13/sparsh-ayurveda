import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import DoshaQuiz from "@/components/DoshaQuiz";
import productsData from "@/data/products.json";
import { Product } from "@/lib/db";
import styles from "./page.module.css";

export default function Home() {
  // Take the first 3 products as featured bestsellers
  const featuredProducts = (productsData as Product[]).slice(0, 3);

  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <Image
              src="/images/hero_banner_ayurveda.png"
              alt="Ayurvedic Wellness Banner"
              fill
              priority
              className={styles.heroBgImage}
            />
            <div className={styles.heroOverlay} />
          </div>
          <div className={`${styles.heroContent} container`}>
            <span className={styles.heroBadge}>✨ Experience Handcrafted Wellness</span>
            <h1 className={styles.heroTitle}>
              Nurtured By Nature,<br />
              Inspired By Ayurveda
            </h1>
            <p className={styles.heroDesc}>
              Welcome to <strong>Sparsh Veda</strong>. We handcraft authentic Ayurvedic remedies, oils, and cleansers using pure botanicals, cold-pressed oils, and age-old traditional recipes. 100% Chemical-free care.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className="btn-primary">
                Explore Shop 🌿
              </Link>
              <a href="#quiz-section" className="btn-secondary">
                Find Your Dosha 🔍
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Badges / Why Sparsh Veda Care */}
        <section className={`${styles.whyChoose} container section-padding`}>
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Our Philosophy</span>
            <h2 className={styles.sectionTitle}>Why Choose Sparsh Veda Care?</h2>
            <div className={styles.divider} />
          </div>

          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🌿</div>
              <h3>100% Ayurvedic</h3>
              <p>Formulated using traditional Ayurvedic herbs and wild-crafted botanical extracts.</p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🤲</div>
              <h3>Handmade with Care</h3>
              <p>Small-batch production to retain potency, freshness, and quality of ingredients.</p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🧪</div>
              <h3>Chemical-Free</h3>
              <p>No parabens, SLS, silicones, synthetic colors, or artificial chemical fragrances.</p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🇮🇳</div>
              <h3>Made In India</h3>
              <p>Sourced ethically and manufactured locally, preserving our traditional heritage.</p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🐇</div>
              <h3>Cruelty Free</h3>
              <p>Strictly tested on humans only. Pure vegan formulations and sustainable packaging.</p>
            </div>
            <div className={styles.whyCard}>
              <div className={styles.whyIcon}>🌸</div>
              <h3>Nurtured By Nature</h3>
              <p>Every product is clean, gentle on the skin, and works in harmony with your body.</p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.categoriesSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.preTitle}>Browse Categories</span>
              <h2 className={styles.sectionTitle}>Curated Self-Care Rituals</h2>
              <div className={styles.divider} />
            </div>

            <div className={styles.categoryGrid}>
              <Link href="/shop?category=oils" className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src="/images/products/keshamrit-hair-oil.jpg" alt="Hair Oil" fill className={styles.catImg} />
                </div>
                <h3>Ayurvedic Hair Oils</h3>
              </Link>
              <Link href="/shop?category=cleansers" className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src="/images/products/keshpallav-hair-cleanser.jpg" alt="Hair Cleanser" fill className={styles.catImg} />
                </div>
                <h3>Nourishing Cleansers</h3>
              </Link>
              <Link href="/shop?category=face-wash" className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src="/images/products/ubtan-face-wash.jpg" alt="Face Wash" fill className={styles.catImg} />
                </div>
                <h3>Brightening Face Wash</h3>
              </Link>
              <Link href="/shop?category=soaps" className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src="/images/products/palash-soap.jpg" alt="Soap Bars" fill className={styles.catImg} />
                </div>
                <h3>Handcrafted Soaps</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="container section-padding">
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Bestselling Remedies</span>
            <h2 className={styles.sectionTitle}>Our Featured Formulations</h2>
            <div className={styles.divider} />
          </div>

          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className={styles.viewAllWrapper}>
            <Link href="/shop" className={styles.viewAllBtn}>
              View All Products ➔
            </Link>
          </div>
        </section>

        {/* Quiz Section */}
        <section id="quiz-section" className={`${styles.quizSection} section-padding`}>
          <div className="container">
            <DoshaQuiz />
          </div>
        </section>

        {/* Testimonials */}
        <section className={`${styles.testimonials} container section-padding`}>
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Our Reviews</span>
            <h2 className={styles.sectionTitle}>Loved by Conscious Souls</h2>
            <div className={styles.divider} />
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                &quot;The Keshamrit hair oil is a miracle. My hair fall reduced by 80% within three weeks. The scent of rosemary and bhringraj is so calming!&quot;
              </p>
              <h4 className={styles.testimonialAuthor}>Ananya Sharma</h4>
              <span className={styles.testimonialVerified}>✓ Verified Buyer</span>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                &quot;Ubtan Face Wash leaves my skin glowing and clean without any tightness. It feels like applying a homemade face mask every morning.&quot;
              </p>
              <h4 className={styles.testimonialAuthor}>Rohan Malhotra</h4>
              <span className={styles.testimonialVerified}>✓ Verified Buyer</span>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={styles.testimonialText}>
                &quot;Neem soap is perfect for oily and acne-prone skin. It cleared my facial bumps in a week. Hard to find chemical-free soaps like this.&quot;
              </p>
              <h4 className={styles.testimonialAuthor}>Priyanka Das</h4>
              <span className={styles.testimonialVerified}>✓ Verified Buyer</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
