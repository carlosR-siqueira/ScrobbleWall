'use client';

import { useEffect, useMemo, useState } from 'react';
import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

interface GoogleResponsiveAdProps {
  position?: 'top' | 'bottom';
  forceHorizontal?: boolean;
}

export default function GoogleResponsiveAd({
  position = 'top',
  forceHorizontal = true,
}: GoogleResponsiveAdProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= ADSENSE_CONFIG.BREAKPOINTS.MOBILE);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const adConfig = useMemo(() => {
    if (isMobile) {
      return {
        slot: ADSENSE_CONFIG.SLOTS.MOBILE,
        adFormat: 'auto',
        reserveHeight: 100,
        maxWidth: 320,
      };
    }

    if (position === 'bottom') {
      return {
        slot: ADSENSE_CONFIG.SLOTS.MULTIPLEX,
        adFormat: 'autorelaxed',
        reserveHeight: 180,
        maxWidth: 728,
      };
    }

    return {
      slot: ADSENSE_CONFIG.SLOTS.RESPONSIVE,
      adFormat: forceHorizontal ? 'horizontal' : 'auto',
      reserveHeight: 90,
      maxWidth: 728,
    };
  }, [forceHorizontal, isMobile, position]);

  return (
    <BaseGoogleAd
      containerClassName="ad-container-responsive"
      slot={adConfig.slot}
      adFormat={adConfig.adFormat}
      reserveHeight={adConfig.reserveHeight}
      maxWidth={adConfig.maxWidth}
    />
  );
}
