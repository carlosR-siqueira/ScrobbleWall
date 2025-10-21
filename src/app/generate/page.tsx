"use client"
import * as React from 'react';
import { useState, useRef } from 'react';
import CollageSection from '../components/CollageSection';
import AlbumGrid from '../components/AlbumGrid';
import AdWrapper from '../components/adsComponents/AdWrapper';
import { useLanguage } from '../contexts/LanguageContext';

import Switch from '@mui/material/Switch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import styles from '../page.module.css';
import { styled } from '@mui/material/styles';

export default function GeneratePage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [period, setPeriod] = useState('7day');
  const [gridSize, setGridSize] = useState(3);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [includeInfo, setIncludeInfo] = useState(false);
  const [includePlayCount, setIncludePlayCount] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'resultado'>('formulario');

  const collageRef = useRef<HTMLDivElement>(null);

  const fetchAlbums = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/collage?username=${username}&period=${period}&limit=${gridSize * gridSize}`);
      const data = await res.json();
      if (data.albums) {
        setAlbums(data.albums);
        setEtapa('resultado');
      } else {
        setAlbums([]);
        setError(t('generate.errorData'));
      }
    } catch (err) {
      setAlbums([]);
      setError(t('generate.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
      color: '#ccc',
      '&.Mui-checked': {
        color: '#D0021B',
      },
      '&.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#D0021B',
      },
    },
    '& .MuiSwitch-track': {
      backgroundColor: '#444',
    },
  }));

  const fallbackImage = '/fallback1.png';

  const downloadImage = async () => {
    const imageSize = 300;
    const canvasSize = gridSize * imageSize;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.src = fallbackImage;
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => resolve(fallbackImg);
        };
        img.src = src || fallbackImage;
      });

    try {
      for (let i = 0; i < albums.length; i++) {
        const album = albums[i];
        const img = await loadImage(album.image);
        const x = (i % gridSize) * imageSize;
        const y = Math.floor(i / gridSize) * imageSize;
        ctx.drawImage(img, x, y, imageSize, imageSize);

        if (includeInfo || includePlayCount) {
          let infoHeight = 0;
          let currentY = y + imageSize;
          
          if (includeInfo) {
            infoHeight += 50;
            currentY -= infoHeight;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(x, currentY, imageSize, infoHeight);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(album.name, x + 5, currentY + 20);
            ctx.font = '12px Arial';
            ctx.fillText(album.artist, x + 5, currentY + 35);
          }
          
          if (includePlayCount) {
            const playHeight = 30;
            currentY -= playHeight;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(x, currentY, imageSize, playHeight);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${album.playcount} plays`, x + 5, currentY + 20);
          }
        }
      }

      const formatPeriodName = (period: string): string => {
        const mapping: Record<string, string> = {
          '7day': t('generate.period7day'),
          '1month': t('generate.period1month'),
          '3month': t('generate.period3month'),
          '12month': t('generate.period12month'),
          'overall': t('generate.periodOverall')
        };
        return mapping[period] || period;
      };

      const formattedPeriod = formatPeriodName(period);
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      const link = document.createElement('a');
      link.download = `ScrobbleWall - ${formattedPeriod} - ${formattedDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  return (
    <main className={styles.container}>
      {etapa === 'formulario' && (
        <>
          <CollageSection
            username={username}
            setUsername={setUsername}
            period={period}
            setPeriod={setPeriod}
            gridSize={gridSize}
            setGridSize={setGridSize}
            fetchAlbums={fetchAlbums}
            loading={loading}
            error={error}
            downloadImage={downloadImage}
            albums={albums}
            includeInfo={includeInfo}
            setIncludeInfo={setIncludeInfo}
            isGeneratePage={true}
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
                aria-label={t('generate.backButton')}
                sx={{ color: '#ff9f00', fontSize: '1.2rem' }}
              >
                <ArrowBackIcon />
                <span className={styles.voltar}>{t('generate.backButton')}</span>
              </IconButton>
            </div>

            <div className={styles.downloadBtnContainer}>
              <div className={styles.switchContainer}>
                <CustomSwitch
                  checked={includePlayCount}
                  onChange={(e) => setIncludePlayCount(e.target.checked)}
                  inputProps={{ 'aria-label': t('generate.includePlayCount') }}
                />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                  {t('generate.includePlayCount')}
                </span>
              </div>
              <div className={styles.switchContainer}>
                <CustomSwitch
                  checked={includeInfo}
                  onChange={(e) => setIncludeInfo(e.target.checked)}
                  inputProps={{ 'aria-label': t('generate.includeInfo') }}
                />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('generate.includeInfo')}</span>
              </div>


              <button onClick={downloadImage} className={styles.button}>
                {t('generate.downloadButton')}
              </button>
            </div>
          </div>
          
          <AlbumGrid
            albums={albums}
            gridSize={gridSize}
            collageRef={collageRef}
          />
          
          <AdWrapper topMargin={20} bottomMargin={20} />
        </>
      )}
    </main>
  );
}
