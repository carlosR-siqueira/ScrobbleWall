// components/BuyMeACoffeeButton.tsx
'use client';
import React from 'react';
import styles from '../page.module.css';

const BuyMeACoffeeButton = () => {
  return (
    <a
      className={styles.bmcButton}
      href="https://www.buymeacoffee.com/scrobblewall"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.emoji}>☕</span>
      <span className={styles.text}>Buy me a coffee</span>
    </a>
  );
};

export default BuyMeACoffeeButton;
