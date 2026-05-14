'use client';

import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleSidebarAd() {
  return (
    <BaseGoogleAd
      containerClassName="ad-container-sidebar"
      adClassName="ad-slot-sidebar"
      slot={ADSENSE_CONFIG.SLOTS.SIDEBAR}
      adFormat="auto"
      fullWidthResponsive={false}
      reserveHeight={500}
      fixedWidth={120}
      fixedHeight={500}
    />
  );
}
