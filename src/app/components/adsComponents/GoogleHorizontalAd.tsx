'use client';

import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleHorizontalAd() {
  return (
    <BaseGoogleAd
      containerClassName="ad-container"
      slot={ADSENSE_CONFIG.SLOTS.HORIZONTAL}
      adFormat="horizontal"
      reserveHeight={90}
      maxWidth={728}
    />
  );
}
