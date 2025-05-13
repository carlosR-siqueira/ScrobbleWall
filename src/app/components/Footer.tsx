import Link from 'next/link';
import React from 'react';
import styles from '../page.module.css';
import Divider, { dividerClasses } from '@mui/material/Divider';
import { Box } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerStyle}>
      <div className={styles.donateButtonContainer} >
        <a href="/donate" rel="noopener noreferrer" className={styles.donateButtonStyle}>
          ☕ Apoie com um café
        </a>
        

        <div className={styles.politicasFooterContainer}>
          
          <Link href="/termos-de-uso">Termos de uso</Link>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'white',
              opacity: "0.3",
              height: '17px', 
            }}
          >

            <Divider
              orientation="horizontal"
              flexItem
              sx={{
                width: '1%',
                bgcolor: '#fff',
                // height: '1px',
                margin: '10px 0',
                opacity: "0.1",
                
              }}
            />
          </Box>
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </div>  
      </div>

      {/* Divider visível */}
      <Divider
        sx={{
          width: '100%',
          bgcolor: '#fff',
          height: '1px',
          
          opacity: "0.1"
          
        }}
      />



      <p>
        © {currentYear} ScrobbleWall. Todos os direitos reservados. | Desenvolvido por{" "}
        <a
          href="https://github.com/carlosR-siqueira"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff' }}
        >
          Carlos Siqueira
        </a>
      </p>
    </footer>
  );
};

export default Footer;
