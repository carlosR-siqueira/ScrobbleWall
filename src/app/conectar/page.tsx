'use client';

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import GoogleResponsiveAd from '../components/adsComponents/GoogleResponsiveAd';
import GoogleMobileAd from '../components/adsComponents/GoogleMobileAd';
import PageWithSidebarAds from '../components/adsComponents/PageWithSidebarAds';
import { useLanguage } from '../contexts/LanguageContext';

const ConectarSpotify = () => {
  const { t } = useLanguage();
  
  return (
    <PageWithSidebarAds>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('connect.title')}</h1>

        <p className={styles.paragraph}>
          {t('connect.intro1')}
        </p>

        <p className={styles.paragraph}>
          {t('connect.intro2')}
        </p>

        {/* Propaganda após a introdução */}
        <GoogleMobileAd />

        <h2 className={styles.subtitle}>{t('connect.stepsTitle')}</h2>

        <ol className={styles.paragraph}>
          <li>
            {t('connect.step1')}
            <div className={styles.imgContainer}>
              <Image src="/lastFm.PNG" alt="last.fm" width={800} height={600} />
            </div>
          </li>
          <li>
            {t('connect.step2')}
            <div className={styles.imgContainer}>
              <Image src="/lastFm-Footer.PNG" alt="last.fm footer" width={500} height={300} />
            </div>
          </li>
          <li>
            {t('connect.step3')}
            <div className={styles.imgContainer}>
              <Image src="/spotify.PNG" alt="spotify" width={400} height={200} />
            </div>
          </li>
          <li>
            {t('connect.step4')}
          </li>
          <li>
            {t('connect.step5')}
            <div className={styles.imgContainer}>
              <Image src="/spotify-connect.PNG" alt="spotify-connect" width={600} height={400} />
            </div>
          </li>
        </ol>

        <h2 className={styles.subtitle}>{t('connect.afterTitle')}</h2>

        <p className={styles.paragraph}>
          {t('connect.afterText')}
        </p>

        <h2 className={styles.subtitle}>{t('connect.removeTitle')}</h2>

        <p className={styles.paragraph}>
          {t('connect.removeText')}
        </p>

        <p className={styles.paragraph}>
          {t('connect.conclusion')}
        </p>

        {/* Propaganda no final da página */}
        <GoogleMobileAd />
      </div>
    </PageWithSidebarAds>
  );
};

export default ConectarSpotify;
