'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';

interface BaseGoogleAdProps {
  containerClassName: string;
  adClassName?: string;
  slot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  adLayout?: string;
  reserveHeight?: number;
  maxWidth?: number;
  fixedWidth?: number;
  fixedHeight?: number;
  loadingText?: string;
  errorTextPrefix?: string;
  onStatusChange?: (status: 'loaded' | 'failed') => void;
}

export default function BaseGoogleAd({
  containerClassName,
  adClassName = '',
  slot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  adLayout,
  reserveHeight = 90,
  maxWidth,
  fixedWidth,
  fixedHeight,
  loadingText = 'Carregando propaganda...',
  errorTextPrefix = 'Erro ao carregar propaganda',
  onStatusChange,
}: BaseGoogleAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) return;

    const timer = window.setTimeout(() => {
      try {
        const loaded = loadAd();
        if (!loaded) {
          throw new Error('AdSense script not available');
        }
        didLoadRef.current = true;
        setAdLoaded(true);
        onStatusChange?.('loaded');
        console.info(`[ads] loaded slot=${slot}`);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        onStatusChange?.('failed');
        console.warn(`[ads] failed slot=${slot} reason=${message}`);
      }
    }, ADSENSE_CONFIG.LOADING_DELAY);

    return () => window.clearTimeout(timer);
  }, [onStatusChange, slot]);

  const inlineStyle: CSSProperties = {};

  if (maxWidth) inlineStyle.maxWidth = `${maxWidth}px`;
  if (fixedWidth) inlineStyle.width = `${fixedWidth}px`;
  if (fixedHeight) inlineStyle.height = `${fixedHeight}px`;
  if (!fixedHeight && reserveHeight) inlineStyle.minHeight = `${reserveHeight}px`;

  return (
    <div className={containerClassName} style={reserveHeight ? { minHeight: `${reserveHeight}px` } : undefined}>
      {error ? (
        <div className="ad-error">
          {errorTextPrefix}: {error}
        </div>
      ) : (
        <>
          <ins
            className={`adsbygoogle ${adClassName}`.trim()}
            style={inlineStyle}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format={adFormat}
            data-ad-layout={adLayout}
            data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
          />
          {!adLoaded && <div className="ad-loading">{loadingText}</div>}
        </>
      )}
    </div>
  );
}
