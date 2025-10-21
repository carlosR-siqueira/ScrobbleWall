'use client';

import React from 'react';
import styles from './page.module.css';
import GoogleResponsiveAd from '../components/adsComponents/GoogleResponsiveAd';
import GoogleMobileAd from '../components/adsComponents/GoogleMobileAd';
import PageWithSidebarAds from '../components/adsComponents/PageWithSidebarAds';
import { useLanguage } from '../contexts/LanguageContext';

const Sobre = () => {
  const { t } = useLanguage();
  
  return (
    <PageWithSidebarAds>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('about.title')}</h1>

        <p className={styles.paragraph}>
          {t('about.paragraph1')}
        </p>

        <p className={styles.paragraph}>
          {t('about.paragraph2')}
        </p>

        <p className={styles.paragraph}>
          {t('about.paragraph3')}
        </p>

        <GoogleResponsiveAd position="top" forceHorizontal={true} />

        <h2 className={styles.subtitle}>{t('about.whyCreatedTitle')}</h2>

        <p className={styles.paragraph}>
          {t('about.whyCreatedText1')}
        </p>

        <p className={styles.paragraph}>
          {t('about.whyCreatedText2')}
        </p>

        <p className={styles.paragraph}>
          {t('about.thanks')}
        </p>

        <GoogleMobileAd />
      </div>
    </PageWithSidebarAds>
  );
};

export default Sobre;
