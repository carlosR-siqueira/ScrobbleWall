'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleVerticalAd() {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="ad-container-vertical" style={{ 
      textAlign: 'center', 
      margin: '20px 0',
      minHeight: '600px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '600px',
          width: '100%',
          maxWidth: '300px'
        }}
        data-ad-client="ca-pub-8940704424317590"
        data-ad-slot="3404072661"
        data-ad-format="vertical"
        data-full-width-responsive="false"
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
    </div>
  );
} 