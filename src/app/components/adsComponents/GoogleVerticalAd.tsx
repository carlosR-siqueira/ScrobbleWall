'use client';

import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleVerticalAd() {
  return (
    <BaseGoogleAd
      containerClassName="ad-container-vertical"
      slot={ADSENSE_CONFIG.SLOTS.VERTICAL}
      adFormat="vertical"
      fullWidthResponsive={false}
      reserveHeight={600}
      maxWidth={300}
      fixedHeight={600}
    />
  );
}
