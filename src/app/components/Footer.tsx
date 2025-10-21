import Link from 'next/link';
import React from 'react';
import styles from '../page.module.css';
import Divider, { dividerClasses } from '@mui/material/Divider';
import { Box } from '@mui/material';
import BuyMeACoffeeButton from './BuyMeACoffee';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerStyle}>
      <div className={styles.donateButtonContainer} >
        {/* <a href="https://buymeacoffee.com/scrobblewall" rel="noopener noreferrer" target='blank' className={styles.donateButtonStyle}>
          ☕ Buy me a coffee
        </a> */}
        <BuyMeACoffeeButton />

        <div className={styles.politicasFooterContainer}>
          
          <Link href="/termos-de-uso">{t('footer.termsOfUse')}</Link>
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
          <Link href="/politica-de-privacidade">{t('footer.privacyPolicy')}</Link>
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
        © {currentYear} ScrobbleWall. {t('footer.rightsReserved')} | {t('footer.developedBy')}{" "}
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
