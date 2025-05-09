'use client'
// components/Header.tsx
import React from 'react';
import Image from 'next/image'
import styles from '../page.module.css';
import Link from 'next/link';


const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContentContainer}>
      
        <Image
            src="/logo-color.png"
            alt="Logo"
            width={250}
            height={50}
            style={{ padding: '1px', cursor: 'pointer' }}
            onClick={() => window.location.href = '/'} // recarrega a página ao redirecionar
          />
  
      
       
      </div>
    </header>
  );
};

export default Header;
