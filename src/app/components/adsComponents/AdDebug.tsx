'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const logs: string[] = [];
    
    // Verifica se estamos no browser
    if (typeof window === 'undefined') {
      logs.push('❌ Não estamos no browser (SSR)');
      setDebugInfo(logs);
      return;
    }

    logs.push('✅ Estamos no browser');
    
    // Verifica se o script do AdSense está carregado
    if (window.adsbygoogle) {
      logs.push('✅ Script do AdSense está disponível');
      logs.push(`📊 Tipo: ${typeof window.adsbygoogle}`);
      logs.push(`📊 Array: ${Array.isArray(window.adsbygoogle)}`);
    } else {
      logs.push('❌ Script do AdSense NÃO está disponível');
    }

    // Verifica o tamanho da tela
    logs.push(`📱 Tamanho da tela: ${window.innerWidth}x${window.innerHeight}`);
    logs.push(`📱 É mobile: ${window.innerWidth < 768}`);

    // Verifica se há bloqueadores de propaganda
    const hasAdBlocker = !window.adsbygoogle;
    logs.push(`🚫 Possível bloqueador: ${hasAdBlocker}`);

    setDebugInfo(logs);

    // Log no console também
    console.log('🔍 Debug do AdSense:', logs);
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '10px', 
      margin: '10px 0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔍 Debug do AdSense:</h4>
      {debugInfo.map((log, index) => (
        <div key={index} style={{ margin: '2px 0' }}>{log}</div>
      ))}
    </div>
  );
} 