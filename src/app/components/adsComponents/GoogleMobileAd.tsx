'use client';

import { useEffect, useState } from 'react';
import GoogleHorizontalAd from './GoogleHorizontalAd';
import GoogleMultiplexAd from './GoogleMultiplexAd';

export default function GoogleMobileAd() {
  const [isMobile, setIsMobile] = useState(false);

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

  // Renderizar GoogleHorizontalAd no mobile, GoogleMultiplexAd no desktop
  return isMobile ? <GoogleHorizontalAd /> : <GoogleMultiplexAd />;
} 