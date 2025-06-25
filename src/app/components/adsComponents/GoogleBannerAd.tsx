'use client';

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleBannerAdProps {
  slot?: string;
  className?: string;
  id?: string;
  delay?: number;
}

export default function GoogleBannerAd({ 
  slot = "3404072661", 
  className = "",
  id,
  delay = 0
}: GoogleBannerAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adId = useRef(id || `banner-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Aguarda um pouco para garantir que o script do AdSense foi carregado
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            console.log(`✅ Banner ad loaded successfully (ID: ${adId.current})`);
          } else {
            console.warn('⚠️ AdSense script not available');
          }
        }, 1000 + delay);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("❌ Banner AdSense error:", e);
    }
  }, [adId.current, delay]);

  return (
    <div className={`ad-container-banner ${className}`}>
      <ins
        id={adId.current}
        className="adsbygoogle"
        data-ad-client="ca-pub-8940704424317590"
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      ></ins>
      {!adLoaded && (
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '728px',
          height: '90px',
          backgroundColor: '#f0f0f0',
          border: '1px dashed #ccc'
        }}>
          Banner Horizontal 728x90 - Carregando... (ID: {adId.current})
        </div>
      )}
    </div>
  );
} 