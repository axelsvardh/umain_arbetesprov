"use client";

import { useRouter } from "next/navigation"; // Ensure correct import for Next.js 13+
import styles from "../page.module.css";

export default function FrontPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className={styles.frontpageContainer}>
      <img src="/images/logo-white.png" alt="Munchies Logo" className={styles.frontpageLogo} />
      <div className={styles.textWrapper}>
        <h1 className={styles.frontpageHeading}>Treat yourself.</h1>
        <p>Find the best restaurants in your city and get it delivered to your place!</p>
      </div>
      <button
        onClick={() => router.push('/')}
        className={styles.continueButton}
      >
        Continue
      </button>
    </div>
  );
}
