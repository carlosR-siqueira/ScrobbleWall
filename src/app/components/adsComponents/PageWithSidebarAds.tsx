'use client';

import { useEffect, useState } from 'react';
import GoogleSidebarAd from './GoogleSidebarAd';

interface PageWithSidebarAdsProps {
  children: React.ReactNode;
}

export default function PageWithSidebarAds({ children }: PageWithSidebarAdsProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    // Verificar no carregamento inicial
    checkDesktop();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop) {
    // Em mobile, renderizar apenas o conteúdo sem anúncios laterais
    return <>{children}</>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      gap: '15px',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px',
      minHeight: '100vh'
    }}>
      {/* Anúncio lateral esquerdo */}
      <div style={{ 
        position: 'sticky',
        top: '100px',
        width: '120px',
        flexShrink: 0,
        height: 'fit-content'
      }}>
        <GoogleSidebarAd />
      </div>

      {/* Conteúdo principal */}
      <div style={{ 
        flex: '1',
        minWidth: '0', // Permite que o conteúdo seja espremido se necessário
        maxWidth: '900px',
        width: '100%'
      }}>
        {children}
      </div>

      {/* Anúncio lateral direito */}
      <div style={{ 
        position: 'sticky',
        top: '100px',
        width: '120px',
        flexShrink: 0,
        height: 'fit-content'
      }}>
        <GoogleSidebarAd />
      </div>
    </div>
  );
} 