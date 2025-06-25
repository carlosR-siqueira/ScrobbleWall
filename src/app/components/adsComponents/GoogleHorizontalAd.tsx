'use client';

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleHorizontalAdProps {
  slot?: string;
  className?: string;
  id?: string;
  delay?: number;
}

export default function GoogleHorizontalAd({ 
  slot = "3404072661", 
  className = "",
  id,
  delay = 0
}: GoogleHorizontalAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adId = useRef(id || `ad-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        // Adiciona delay extra para evitar conflitos entre múltiplas propagandas
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            console.log(`✅ Horizontal ad loaded successfully (ID: ${adId.current})`);
          } else {
            console.warn('⚠️ AdSense script not available');
          }
        }, 1000 + delay); // Delay base + delay específico

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("❌ Horizontal AdSense error:", e);
    }
  }, [adId.current, delay]);

  return (
    <div className={`ad-container-horizontal ${className}`} style={{ 
      textAlign: 'center', 
      margin: '20px 0',
      minHeight: '90px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10px'
    }}>
      <ins
        id={adId.current}
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '90px',
          width: '100%',
          maxWidth: '728px'
        }}
        data-ad-client="ca-pub-8940704424317590"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      {!adLoaded && (
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Carregando propaganda... (ID: {adId.current})
        </div>
      )}
    </div>
  );
}
