// components/Header.tsx
import React from 'react';
import Image from 'next/image'
import styles from '../page.module.css';


const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContentContainer}>
        <Image src={'/scrobblewalllogo.png'} alt={'Logo'} width={'250'} height={'50'} style={{padding: '1px'}}/>
      
       
      </div>
    </header>
  );
};

export default Header;
