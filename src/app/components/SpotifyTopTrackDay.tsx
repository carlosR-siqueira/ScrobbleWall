import React, { useState } from 'react';
import styles from '../page.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MAX_WIDTH = 700;

const SpotifyTopTrackDay: React.FC = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    window.history.back();
  };

  const handleGenerate = async () => {
    setLoading(true);
    setImgUrl(null);
    setError(null);
    try {
      const url = `/api/spotify/topday`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }
      const blob = await res.blob();
      setImgUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar imagem Top Track Day!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Barra preta translúcida com título e botão de voltar */}
      
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: 24,
            top: 24,
            background: 'none',
            border: 'none',
            color: '#1DB954',
            fontWeight: 700,
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
          aria-label="Voltar"
        >
          <ArrowBackIcon style={{ fontSize: 32 }} />
        </button>
       
      
      {/* Antes de gerar: bloco preto centralizado com descrição e botão */}
      {!imgUrl && (
        <div
          style={{
            margin: '0 auto',
            marginTop: 32,
            background: 'rgba(0, 0, 0, 0.97)',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0004',
            textAlign: 'center',
            maxWidth: 500,
            width: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2
          style={{
            color: '#37b954',
            fontSize: 32,
            fontWeight: 900,
            margin: "0 0 20px 0",
            width: '100%',
            letterSpacing: 1,
            fontFamily: 'inherit',
            textAlign: 'center',
          }}
        >
          Top Track Day
        </h2>
          <p
            style={{
              color: '#B2B2B2',
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 32,
              fontFamily: 'inherit',
              textShadow: '0 2px 8px #000a',
            }}
          >
            Gere uma imagem pronta para stories com suas 5 músicas mais reproduzidas recentemente no Spotify.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={styles.button}
            style={{
              width: '100%',
              fontSize: 26,
              padding: '18px 0',
              borderRadius: 12,
              fontWeight: 900,
              background: loading ? '#666' : '#1DB954',
              color: '#fff',
              marginBottom: 0,
              boxShadow: '0 2px 12px #0004',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Gerando imagem...' : 'Gerar Top Track Day'}
          </button>
          {error && (
            <div
              style={{
                background: '#ff4444',
                color: '#fff',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              ❌ {error}
            </div>
          )}
        </div>
      )}
      {/* Depois de gerar: imagem centralizada, preenchendo o body abaixo da barra do topo */}
      {imgUrl && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1, marginTop: 32 }}>
          <img
            src={imgUrl}
            alt="Top Track Day"
            style={{ width: '100%', maxWidth: 500, borderRadius: '0 0 16px 16px', boxShadow: '0 4px 24px #0004', border: '2px solid #1DB954', margin: 0, display: 'block', marginTop: 0 }}
          />
        </div>
      )}
    </>
  );
};

export default SpotifyTopTrackDay; 