// components/Footer.tsx
import React from 'react';
import styles from '../page.module.css';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerStyle}>
      <a href="/donate"  rel="noopener noreferrer" className={styles.donateButtonStyle}>
        ☕ Apoie com um café
      </a>
      <p>
        © {currentYear} ScrobbleWall. Todos os direitos reservados. | Desenvolvido por{" "}
        <a
          href="https://github.com/carlosR-siqueira"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff'}}
        >
          Carlos Siqueira
        </a>
      </p>
    </footer>
  );
};

export default Footer;