"use client"
import * as React from 'react';
import { useState, useRef } from 'react';
import SpotifyCollageSection from '../components/SpotifyCollageSection';
import AlbumGrid from '../components/AlbumGrid';
import AdWrapper from '../components/adsComponents/AdWrapper';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import styles from '../page.module.css';

export default function SpotifyPage() {
  const [type, setType] = useState<'artist' | 'track'>('artist');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [etapa, setEtapa] = useState<'formulario' | 'resultado'>('formulario');

  const collageRef = useRef<HTMLDivElement>(null);

  const fetchTop = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/spotify/top?type=${type}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setEtapa('resultado');
      } else if (data.error === 'not_authenticated') {
        setError('Você precisa fazer login com o Spotify primeiro.');
      } else {
        setItems([]);
        setError('Erro ao buscar dados. Tente novamente mais tarde.');
      }
    } catch (err) {
      setItems([]);
      setError('Erro de rede. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {etapa === 'formulario' && (
        <>
          <SpotifyCollageSection
            type={type}
            setType={setType}
            fetchTop={fetchTop}
            loading={loading}
            error={error}
          />
          <AdWrapper topMargin={40} bottomMargin={20} />
        </>
      )}

      {etapa === 'resultado' && (
        <>
          <div className={styles.resultActions}>
            <div className={styles.VoltarButton}>
              <IconButton
                onClick={() => setEtapa('formulario')}
                aria-label="Voltar"
                sx={{ color: '#1DB954', fontSize: '1.2rem' }}
              >
                <ArrowBackIcon />
                <span className={styles.voltar}>Voltar</span>
              </IconButton>
            </div>
          </div>
          <AlbumGrid
            albums={items}
            gridSize={5}
            collageRef={collageRef}
          />
          <AdWrapper topMargin={20} bottomMargin={20} />
        </>
      )}
    </main>
  );
} 