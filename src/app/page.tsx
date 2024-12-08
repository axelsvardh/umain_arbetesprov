import React, { Suspense } from 'react';
import Overview from './Components/';
import styles from "./page.module.css";

function Page() {
  return (
    <main className={styles.mainContainer}>
        <Overview />
    </main>
  );
}

export default Page;

