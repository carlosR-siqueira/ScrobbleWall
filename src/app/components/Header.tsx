'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css';
import Close from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Divider from '@mui/material/Divider';
import { Card } from '@mui/material';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContentContainer}>
        <Image
          src="/logo-color.png"
          alt="Logo"
          width={250}
          height={50}
          style={{ padding: '1px', cursor: 'pointer' }}
          onClick={() => (window.location.href = '/')}
        />

        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <MenuOpenIcon 
            sx={{fontSize: 40}}
          />
        </button>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink} onClick={() => (window.location.href = '/')}>Início</Link>
          <Link href="/sobre" className={styles.navLink}>Sobre</Link>
          <Link href="/contato" className={styles.navLink}>Contato</Link>
          <Link href="/donate" className={styles.navLink}>Nos Apoie</Link>
        </nav>
      </div>

      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}

      <nav className={`${styles.navMobile} ${isMenuOpen ? styles.navMobileOpen : ''}`}>
        <div className={styles.mobileHeader}>
          <Image
            src="/logo-color.png"
            alt="Logo"
            width={180}
            height={40}
            className={styles.mobileLogo}
            onClick={() => {
              window.location.href = '/';
              setIsMenuOpen(false);
            }}
            style={{ cursor: 'pointer' }}
          />
          <button className={styles.closeButton} onClick={() => setIsMenuOpen(false)}><Close /></button>
        </div>
        <div className={styles.linksContainer} >
          <div className={styles.mobileLinks}>
            <Card variant="elevation" className={styles.dividerContainer}>
              <Divider />
            </Card>
            <div onClick={() => { window.location.href = '/'; setIsMenuOpen(false); }} className={styles.navLink}>Início</div>
            <Link href="/sobre" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Sobre</Link>
            <Link href="/contato" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contato</Link>
            <Link href="/donate" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Nos Apoie</Link>
          </div>
          
          <div className={styles.politicasLinkContainer}>
            <Card variant="elevation" className={styles.dividerContainer}>
              <Divider />
            </Card>
            <Link href="/politica-de-privacidade" onClick={() => setIsMenuOpen(false)}>Política de Privacidade</Link>
            <Link href="/termos-de-uso" onClick={() => setIsMenuOpen(false)}>Termos de uso</Link>

          </div>
        </div>  
      </nav>
    </header>
  );
};

export default Header;
