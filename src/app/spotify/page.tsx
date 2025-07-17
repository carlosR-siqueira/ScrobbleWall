"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './spotify.module.css';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ImageIcon from '@mui/icons-material/Image';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SpotifyPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const response = await fetch('/api/spotify/topday');
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecapClick = () => {
    router.push('/spotify/recap');
  };

  const handleTopTrackDayClick = () => {
    router.push('/spotify/top-track-day');
  };

  const handleConnectSpotify = () => {
    window.location.href = '/api/spotify/auth';
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.blackContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Verificando conexão...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.blackContainer}>
        {!isConnected ? (
          // Se não está conectado, mostrar card de conexão
          <div className={styles.generateFormContainer}>
            <section className={styles.inputContainer}>
              <div className={styles.spotifyAuthSection}>
                <h3>Conecte sua conta do Spotify</h3>
                <p>Para gerar seu recap e top tracks, você precisa autorizar o acesso aos seus dados do Spotify</p>
                <button 
                  onClick={handleConnectSpotify}
                  className={styles.spotifyAuthButton}
                >
                  Conectar com Spotify
                </button>
              </div>
            </section>
          </div>
        ) : (
          // Se está conectado, mostrar cards das opções
          <div className={styles.optionsContainer}>
            <div className={styles.connectionStatus}>
              <CheckCircleIcon className={styles.connectionIcon} />
              <span>Spotify Conectado</span>
            </div>
            
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
        )}
      </div>
    </main>
  );
} 