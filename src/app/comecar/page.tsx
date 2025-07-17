"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import spotifyStyles from '../spotify/spotify.module.css';

export default function ComecarPage() {
  const router = useRouter();

  const handleSpotifyClick = () => {
    router.push('/spotify');
  };

  const handleLastFmClick = () => {
    router.push('/generate');
  };

  return (
    <main className={styles.container}>
      <div className={spotifyStyles.blackContainer}>
        <div className={styles.serviceSelectorContainer}>
          <h1 className={styles.serviceSelectorTitle}>
            Escolha sua plataforma musical
          </h1>
          
          <div className={styles.serviceButtonsContainer}>
            <button 
              onClick={handleSpotifyClick}
              className={`${styles.serviceButton} ${styles.spotifyCard}`}
            >
              <PlayCircleIcon className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <h3>Spotify</h3>
                <p>Conecte sua conta do Spotify e crie colagens com seus álbuns mais ouvidos</p>
              </div>
            </button>

            <button 
              onClick={handleLastFmClick}
              className={`${styles.serviceButton} ${styles.lastfmCard}`}
            >
              <MusicNoteIcon className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <h3>Last.fm</h3>
                <p>Use seu perfil do Last.fm para gerar colagens personalizadas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 