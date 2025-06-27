'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleSidebarAd() {
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
            console.log('✅ Sidebar Ad loaded successfully');
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
      console.error("❌ Sidebar AdSense error:", e);
    }
  }, []);

  return (
    <div className="ad-container-sidebar" style={{ 
      textAlign: 'center', 
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '250px',
      height: '450px',
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
              display: 'inline-block',
              width: '250px',
              height: '450px',
              overflow: 'visible'
            }}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            data-ad-slot={ADSENSE_CONFIG.SLOTS.SIDEBAR}
          ></ins>
          {!adLoaded && (
            <div style={{ 
              color: '#666', 
              fontSize: '14px',
              fontStyle: 'italic',
              width: '100%'
            }}>
              Carregando propaganda...
            </div>
          )}
        </>
      )}
    </div>
  );
} 