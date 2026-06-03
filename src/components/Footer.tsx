import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <span className={styles.logoLeaf}>🌿</span>
              <span className={styles.logoText}>Sparsh Veda</span>
            </div>
            <p className={styles.tagline}>
              &quot;Nurtured By Nature&quot;
            </p>
            <p className={styles.description}>
              Handcrafted Ayurvedic formulations made with pure organic botanicals. Designed to bring balance and natural wellness to your daily self-care rituals.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/" className={styles.link}>Home</Link>
              </li>
              <li>
                <Link href="/shop" className={styles.link}>Shop Products</Link>
              </li>
              <li>
                <Link href="/cart" className={styles.link}>Shopping Cart</Link>
              </li>
            </ul>
          </div>

          {/* Core Values */}
          <div className={styles.valuesCol}>
            <h3 className={styles.colTitle}>Our Promise</h3>
            <ul className={styles.valueList}>
              <li>🌿 100% Ayurvedic Ingredients</li>
              <li>🌿 Handmade With Care</li>
              <li>🌿 Chemical-Free Formulations</li>
              <li>🌿 Made in India with Pride</li>
              <li>🌿 Cruelty-Free &amp; Vegan</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className={styles.contactCol}>
            <h3 className={styles.colTitle}>Sparsh Veda Care</h3>
            <p className={styles.contactItem}>
              <strong>📍 Address:</strong> Ayurvedic Hermitage, Sector 12, Gandhinagar, Gujarat, India
            </p>
            <p className={styles.contactItem}>
              <strong>📧 Email:</strong> care@sparshvedacare.com
            </p>
            <p className={styles.contactItem}>
              <strong>📞 Support:</strong> +91 98765 43210
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Sparsh Veda (Sparsh Veda Care). All rights reserved.
          </p>
          <Link href="/admin" className={styles.adminSecretBtn} aria-label="Admin Access">
            &#128274;
          </Link>
        </div>
      </div>
    </footer>
  );
}
