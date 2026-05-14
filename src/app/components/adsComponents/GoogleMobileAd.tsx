'use client';

import { useEffect, useState } from 'react';
import BaseGoogleAd from './BaseGoogleAd';
import GoogleMultiplexAd from './GoogleMultiplexAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleMobileAd() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= ADSENSE_CONFIG.BREAKPOINTS.MOBILE);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return <GoogleMultiplexAd />;
  }

  return (
    <BaseGoogleAd
      containerClassName="ad-container-mobile"
      slot={ADSENSE_CONFIG.SLOTS.MOBILE}
      adFormat="auto"
      reserveHeight={100}
      maxWidth={320}
    />
  );
}
