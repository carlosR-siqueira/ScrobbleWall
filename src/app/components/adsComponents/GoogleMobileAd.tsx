'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';
import GoogleMultiplexAd from './GoogleMultiplexAd';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleMobileAd() {
  const [isMobile, setIsMobile] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Verificar no carregamento inicial
    checkMobile();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      try {
        if (typeof window !== 'undefined') {
          // Aguarda um pouco para garantir que o script do AdSense foi carregado
          const timer = setTimeout(() => {
            if (window.adsbygoogle) {
              loadAd();
              setAdLoaded(true);
              console.log('✅ Mobile Ad loaded successfully');
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
        console.error("❌ Mobile AdSense error:", e);
      }
    }
  }, [isMobile]);

  // Em mobile, renderizar o anúncio mobile específico
  if (isMobile) {
    return (
      <div className="ad-container-mobile" style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '320px',
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
                width: '100%',
                overflow: 'visible'
              }}
              data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
              data-ad-slot={ADSENSE_CONFIG.SLOTS.MOBILE}
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

  // Em desktop, renderizar GoogleMultiplexAd
  return <GoogleMultiplexAd />;
} 