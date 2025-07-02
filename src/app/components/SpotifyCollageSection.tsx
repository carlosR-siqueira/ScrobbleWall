import React, { useState, useRef } from 'react';
import styles from '../page.module.css';

interface SpotifyCollageSectionProps {
  period: string;
  setPeriod: React.Dispatch<React.SetStateAction<string>>;
  gridSize: number;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
  fetchAlbums: () => void;
  loading: boolean;
  error: string;
  downloadImage: (includeInfo: boolean) => void;
  albums: any[];
  includeInfo: boolean;
  setIncludeInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

const SpotifyCollageSection: React.FC<SpotifyCollageSectionProps> = ({
  period,
  setPeriod,
  gridSize,
  setGridSize,
  fetchAlbums,
  loading,
  error,
  downloadImage,
  albums,
  includeInfo,
  setIncludeInfo,
}) => {
  const collageRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={collageRef} className={styles.generateFormContainer}>
      <section className={styles.inputContainer}>
        <div className={styles.spotifyAuthSection}>
          <h3>Conecte sua conta do Spotify</h3>
          <p>Para gerar sua colagem, você precisa autorizar o acesso aos seus dados do Spotify</p>
          <button 
            onClick={() => window.location.href = '/api/spotify/auth'}
            className={styles.spotifyAuthButton}
            disabled={loading}
          >
            {loading ? 'Conectando...' : 'Conectar com Spotify'}
          </button>
        </div>

        <div className={styles.periodSelection}>
          <h4>Período de análise:</h4>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.selectField}
          >
            <option value="short_term">4 Semanas</option>
            <option value="medium_term">6 Meses</option>
            <option value="long_term">Todos os tempos</option>
          </select>
        </div>

        <div className={styles.gridSelection}>
          <h4>Tamanho da colagem:</h4>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className={styles.selectField}
          >
            <option value={3}>3x3</option>
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
          </select>
        </div>

        <button
          onClick={fetchAlbums}
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Carregando...' : 'Gerar Colagem Spotify'}
        </button>

        {error && (
          <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default SpotifyCollageSection; 