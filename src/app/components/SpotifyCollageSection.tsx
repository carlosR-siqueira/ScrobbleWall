import React from 'react';
import styles from '../page.module.css';

interface SpotifyCollageSectionProps {
  type: 'artist' | 'track';
  setType: React.Dispatch<React.SetStateAction<'artist' | 'track'>>;
  fetchTop: () => void;
  loading: boolean;
  error: string;
}

const SpotifyCollageSection: React.FC<SpotifyCollageSectionProps> = ({
  type,
  setType,
  fetchTop,
  loading,
  error,
}) => {
  return (
    <div className={styles.generateFormContainer}>
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
          <h4>Tipo de colagem:</h4>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className={type === 'artist' ? styles.buttonActive : styles.button}
              onClick={() => setType('artist')}
              disabled={loading}
            >
              Top 10 Artistas
            </button>
            <button
              className={type === 'track' ? styles.buttonActive : styles.button}
              onClick={() => setType('track')}
              disabled={loading}
            >
              Top 10 Músicas
            </button>
          </div>
        </div>

        <button
          onClick={fetchTop}
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