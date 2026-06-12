"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error") || "The payment transaction was cancelled or declined by the bank.";

  return (
    <div className={styles.failedWrapper}>
      <div className={styles.iconWrapper}>✕</div>
      <h1 className={styles.title}>Payment Failed</h1>
      <p className={styles.description}>
        We couldn't process your payment transaction. Don't worry, your cart items are still saved, and no funds were deducted.
      </p>

      <div className={styles.errorBox}>
        <strong>Error Reason:</strong><br />
        {errorMessage}
      </div>

      <div className={styles.actions}>
        <Link href="/checkout" className={styles.retryBtn}>
          🔄 Try Payment Again
        </Link>
        <Link href="/" className={styles.homeBtn}>
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container section-padding">
          <Suspense fallback={<div className={styles.failedWrapper}>Loading...</div>}>
            <PaymentFailedContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
