"use client"
import React from 'react';
import styles from './spotify.module.css';
import SpotifyRecapImage from '../components/SpotifyRecapImage';

export default function SpotifyPage() {
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
      <SpotifyRecapImage />
    </main>
  );
} 