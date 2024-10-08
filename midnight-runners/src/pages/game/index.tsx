import Head from "next/head";
import React from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import styles from "../../styles/GamePage.module.css"; // Adjust the path as needed

export default function Album() {
  return (
    <>
      <Head>
        <title>Game</title>
        <meta name="description" content="Album page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Game Page</h1>
          {/* Content for the Album page */}
        </main>
      </div>
      <Footer />
    </>
  );
}
