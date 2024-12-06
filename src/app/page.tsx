import React, { Suspense } from 'react';
// import Image from "next/image";
// import Link from "next/link";
// import MatchStatsPopup from '../Overview/Matches_stats_popup';
// import FocusArea from './focus_areas/page';
// import Champions from './champions/page';
import Overview from './Components/';
import styles from "./page.module.css";
// import Filters from './Components/filter';

function Page() {
  return (
    <main className={styles.mainContainer}>
      <Suspense fallback={<div>Loading...</div>}>
        <Overview />
        {/* <Filters /> */}
      </Suspense>
    </main>
  );
}

export default Page;

