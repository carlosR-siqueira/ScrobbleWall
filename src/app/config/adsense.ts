// Configurações centralizadas do Google AdSense
export const ADSENSE_CONFIG = {
  // ID do cliente AdSense
  CLIENT_ID: 'ca-pub-8940704424317590',
  
  // Slots de propaganda
  SLOTS: {
    HORIZONTAL: '3404072661',
    VERTICAL: '3404072661', // Usando o mesmo slot por enquanto
    RESPONSIVE: '3404072661'
  },
  
  // Configurações de carregamento
  LOADING_DELAY: 1000, // 1 segundo
  
  // Configurações responsivas
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },
  
  // Tamanhos de propaganda
  SIZES: {
    MOBILE: {
      width: 320,
      height: 250
    },
    DESKTOP: {
      width: 728,
      height: 90
    }
  }
};

// Função para verificar se o AdSense está disponível
export const isAdSenseAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.adsbygoogle);
};

// Função para carregar propaganda
export const loadAd = (): void => {
  if (typeof window !== 'undefined' && window.adsbygoogle) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
}; 