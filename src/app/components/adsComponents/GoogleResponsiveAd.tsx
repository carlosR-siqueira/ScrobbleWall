'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleResponsiveAd() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detecta se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < ADSENSE_CONFIG.BREAKPOINTS.MOBILE);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            loadAd();
            setAdLoaded(true);
            console.log('✅ Ad loaded successfully');
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
      console.error("❌ AdSense error:", e);
    }
  }, []);

  const adSize = isMobile ? ADSENSE_CONFIG.SIZES.MOBILE : ADSENSE_CONFIG.SIZES.DESKTOP;

  return (
    <div className="ad-container-responsive" style={{ 
      textAlign: 'center', 
      margin: '10px 0',
      minHeight: `${adSize.height}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10px'
    }}>
      {error ? (
        <div style={{ 
          color: '#ff6b6b', 
          fontSize: '14px',
          fontStyle: 'italic',
          padding: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          backgroundColor: '#fff5f5'
        }}>
          Erro ao carregar propaganda: {error}
        </div>
      ) : (
        <>
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minHeight: `${adSize.height}px`,
              width: '100%',
              maxWidth: `${adSize.width}px`
            }}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            data-ad-slot={ADSENSE_CONFIG.SLOTS.RESPONSIVE}
            data-ad-format="auto"
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