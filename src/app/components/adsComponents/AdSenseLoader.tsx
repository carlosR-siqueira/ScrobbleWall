'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSenseLoader() {
  useEffect(() => {
    // Verifica se o script do AdSense foi carregado
    const checkAdSenseLoaded = () => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        console.log('✅ AdSense script loaded successfully');
        return true;
      }
      return false;
    };

    // Tenta verificar imediatamente
    if (checkAdSenseLoaded()) {
      return;
    }

    // Se não estiver carregado, verifica periodicamente
    const interval = setInterval(() => {
      if (checkAdSenseLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    // Limpa o intervalo após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkAdSenseLoaded()) {
        console.warn('⚠️ AdSense script may not have loaded properly');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
} 