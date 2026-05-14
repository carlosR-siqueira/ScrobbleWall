'use client';

import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleMultiplexAd() {
  return (
    <BaseGoogleAd
      containerClassName="ad-container-multiplex"
      slot={ADSENSE_CONFIG.SLOTS.MULTIPLEX}
      adFormat="autorelaxed"
      reserveHeight={180}
      maxWidth={728}
    />
  );
}
