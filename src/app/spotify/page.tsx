"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './spotify.module.css';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ImageIcon from '@mui/icons-material/Image';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function SpotifyPage() {
  const router = useRouter();

  const handleRecapClick = () => {
    router.push('/spotify/recap');
  };

  const handleTopTrackDayClick = () => {
    router.push('/spotify/top-track-day');
  };

  return (
    <main className={styles.container}>
      <div className={styles.generateFormContainer}>
        <section className={styles.inputContainer}>
          <div className={styles.spotifyAuthSection}>
            <h3>Conecte sua conta do Spotify</h3>
            <p>Para gerar seu recap, você precisa autorizar o acesso aos seus dados do Spotify</p>
            <button 
              onClick={() => window.location.href = '/api/spotify/auth'}
              className={styles.spotifyAuthButton}
            >
              Conectar com Spotify
            </button>
          </div>
        </section>
      </div>

      <div className={styles.optionsContainer}>
        <h2 className={styles.optionsTitle}>Escolha o que você quer gerar:</h2>
        
        <div className={styles.optionsGrid}>
          <button 
            onClick={handleRecapClick}
            className={styles.optionCard}
          >
            <ImageIcon className={styles.optionIcon} />
            <div className={styles.optionInfo}>
              <h3>Spotify Recap</h3>
              <p>Gere uma imagem visual com seus artistas e músicas mais ouvidos</p>
            </div>
          </button>

          <button 
            onClick={handleTopTrackDayClick}
            className={styles.optionCard}
          >
            <TrendingUpIcon className={styles.optionIcon} />
            <div className={styles.optionInfo}>
              <h3>Top Track Day</h3>
              <p>Crie uma colagem com suas músicas mais ouvidas do dia</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
} 