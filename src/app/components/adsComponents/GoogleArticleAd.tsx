'use client';

import BaseGoogleAd from './BaseGoogleAd';
import { ADSENSE_CONFIG } from '../../config/adsense';

export default function GoogleArticleAd() {
  return (
    <BaseGoogleAd
      containerClassName="ad-container-article"
      slot={ADSENSE_CONFIG.SLOTS.ARTICLE}
      adFormat="fluid"
      adLayout="in-article"
      reserveHeight={180}
      maxWidth={728}
    />
  );
}
