"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.aboutPage}>
        <section className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Our Story
            </motion.h1>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Rooted in tradition, crafted with purity, and driven by a passion for holistic wellness.
            </motion.p>
          </div>
        </section>

        <section className={styles.storySection}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p className={styles.storyText}>
              Sparksweda began with a simple belief: that nature holds the cure to our modern ailments. In a world crowded with synthetic chemicals and artificial fragrances, we wanted to return to the ancient wisdom of Ayurveda.
            </p>
            <p className={styles.storyText}>
              Every formulation at Sparsh Veda is carefully crafted by hand. We source organic, wild-crafted herbs and pure cold-pressed oils from local Indian farmers, ensuring that every drop retains its natural potency. We are proudly 100% cruelty-free, vegan, and transparent about our ingredients.
            </p>
          </motion.div>

          <div className={styles.valuesGrid}>
            <motion.div
              className={styles.valueCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className={styles.valueIcon}>🌱</div>
              <h3 className={styles.valueTitle}>Pure & Organic</h3>
              <p className={styles.valueDesc}>We use only the finest natural ingredients without any harsh chemicals or parabens.</p>
            </motion.div>

            <motion.div
              className={styles.valueCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.valueIcon}>🤲</div>
              <h3 className={styles.valueTitle}>Handcrafted</h3>
              <p className={styles.valueDesc}>Each product is made in small batches to preserve freshness, quality, and medicinal value.</p>
            </motion.div>

            <motion.div
              className={styles.valueCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={styles.valueIcon}>🌍</div>
              <h3 className={styles.valueTitle}>Sustainable</h3>
              <p className={styles.valueDesc}>Our packaging is eco-friendly and we prioritize minimal environmental impact.</p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
