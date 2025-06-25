'use client';

import React from 'react';
import GoogleResponsiveAd from './GoogleResponsiveAd';

interface AdWrapperProps {
  topMargin?: number;
  bottomMargin?: number;
  className?: string;
}

export default function AdWrapper({ 
  topMargin = 20, 
  bottomMargin = 20, 
  className = '' 
}: AdWrapperProps) {
  return (
    <div 
      className={`ad-wrapper ${className}`}
      style={{ 
        marginTop: `${topMargin}px`, 
        marginBottom: `${bottomMargin}px`,
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <GoogleResponsiveAd />
    </div>
  );
} 