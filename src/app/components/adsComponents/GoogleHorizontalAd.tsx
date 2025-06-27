'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleHorizontalAd() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            loadAd();
            setAdLoaded(true);
            console.log('✅ Horizontal Ad loaded successfully');
          } else {
            setError('AdSense script not available');
            console.warn('⚠️ AdSense script not available');
          }
        }, ADSENSE_CONFIG.LOADING_DELAY);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(errorMessage);
      console.error("❌ Horizontal AdSense error:", e);
    }
  }, []);

  return (
    <div className="ad-container" style={{ 
      textAlign: 'center', 
      margin: '20px 0',
      minHeight: '90px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: '728px',
      overflow: 'visible'
    }}>
      {error ? (
        <div style={{ 
          color: '#ff6b6b', 
          fontSize: '14px',
          fontStyle: 'italic',
          padding: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          backgroundColor: '#fff5f5',
          width: '100%'
        }}>
          Erro ao carregar propaganda: {error}
        </div>
      ) : (
        <>
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minHeight: '90px',
              width: '100%',
              maxWidth: '728px',
              overflow: 'visible'
            }}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            data-ad-slot={ADSENSE_CONFIG.SLOTS.HORIZONTAL}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          ></ins>
          {!adLoaded && (
            <div style={{ 
              color: '#666', 
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              Carregando propaganda...
            </div>
          )}
        </>
      )}
    </div>
  );
}
