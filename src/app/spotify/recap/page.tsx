"use client"
import React from 'react';
import styles from '../spotify.module.css';
import SpotifyRecapImage from '../../components/SpotifyRecapImage';

export default function SpotifyRecapPage() {
  return (
    <main className={styles.container}>
      <div className={styles.generateFormContainer}>
        <section className={styles.inputContainer}>
          <div className={styles.spotifyAuthSection}>
            <h3>Spotify Recap</h3>
            <p>Gere uma imagem visual com seus artistas e músicas mais ouvidos</p>
          </div>
        </section>
      </div>
      <SpotifyRecapImage />
    </main>
  );
} 