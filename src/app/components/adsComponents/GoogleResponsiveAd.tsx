'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG, loadAd } from '../../config/adsense';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleResponsiveAdProps {
  position?: 'top' | 'bottom';
  forceHorizontal?: boolean;
}

export default function GoogleResponsiveAd({ 
  position = 'top', 
  forceHorizontal = true 
}: GoogleResponsiveAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar slot diferente baseado na posição para evitar conflitos
  const getAdSlot = () => {
    if (position === 'bottom') {
      return ADSENSE_CONFIG.SLOTS.MULTIPLEX; // Usar slot multiplex para o segundo anúncio
    }
    return ADSENSE_CONFIG.SLOTS.RESPONSIVE; // Usar slot responsivo para o primeiro anúncio
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            loadAd();
            setAdLoaded(true);
            console.log(`✅ ${position} Ad loaded successfully with slot ${getAdSlot()}`);
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
  }, [position]);

  return (
    <div className="ad-container-responsive" style={{ 
      textAlign: 'center', 
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10px',
      minHeight: forceHorizontal ? '90px' : 'auto'
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
              width: '100%',
              maxWidth: '728px',
              minHeight: forceHorizontal ? '90px' : 'auto'
            }}
            data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
            data-ad-slot={getAdSlot()}
            data-ad-format={forceHorizontal ? 'horizontal' : 'auto'}
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