"use client"
import React from 'react';
import SpotifyTopTrackDay from '../../components/SpotifyTopTrackDay';
import styles from '../spotify.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';
import globalStyles from '../../page.module.css';

export default function TopTrackDayPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/spotify');
  };

  const downloadImage = async () => {
    try {
      const response = await fetch('/api/spotify/topday');
      if (!response.ok) {
        throw new Error('Erro ao baixar imagem');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      link.download = `Top-Track-Day-${formattedDate}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  return (
    <main className={styles.container} style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: '20px',
    }}>
      {/* Container de ações com botões de voltar e download */}
      <div className={globalStyles.resultActions}>
        <div className={globalStyles.VoltarButton}>
          <IconButton
            onClick={handleBack}
            aria-label="Voltar"
            sx={{ color: '#ff9f00', fontSize: '1.2m' }}
          >
            <ArrowBackIcon />
            <span className={globalStyles.voltar}>Voltar</span>
          </IconButton>
        </div>

        <div className={globalStyles.downloadBtnContainer}>
          <button onClick={downloadImage} className={globalStyles.button}>
            Baixar Top Track Day
          </button>
        </div>
      </div>
      
      {/* Componente SpotifyTopTrackDay */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <SpotifyTopTrackDay />
      </div>
    </main>
  );
} 