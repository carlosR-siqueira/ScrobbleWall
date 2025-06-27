'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleHorizontalAd() {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
          console.log('✅ Horizontal Ad loaded successfully');
        }, 1000);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("AdSense error:", e);
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
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '90px',
          width: '100%',
          maxWidth: '728px',
          overflow: 'visible'
        }}
        data-ad-client="ca-pub-8940704424317590"
        data-ad-slot="3404072661"
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
    </div>
  );
}
