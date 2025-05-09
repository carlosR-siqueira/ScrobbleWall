"use client"
import { useState, useRef } from 'react';
import CollageSection from './components/CollageSection';
import AlbumGrid from './components/AlbumGrid';
import ErrorMessage from './components/ErrorMessage';
import styles from './page.module.css';


export default function Home() {
  const [username, setUsername] = useState('');
  const [period, setPeriod] = useState('7day');
  const [gridSize, setGridSize] = useState(3);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [includeInfo, setIncludeInfo] = useState(false);
  const [etapa, setEtapa] = useState<'inicio' | 'formulario' | 'resultado'>('inicio');

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
        setError('Erro ao buscar dados. Verifique o nome de usuário ou tente novamente mais tarde.');
      }
    } catch (err) {
      setAlbums([]);
      setError('Erro de rede. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

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

        if (includeInfo) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(x, y + imageSize - 50, imageSize, 50);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(album.name, x + 5, y + imageSize - 30);
          ctx.font = '12px Arial';
          ctx.fillText(album.artist, x + 5, y + imageSize - 15);
        }
      }

      const formatPeriodName = (period: string): string => {
        const mapping: Record<string, string> = {
          '7day': '7 Dias',
          '1month': '1 Mês',
          '3month': '3 Meses',
          '12month': '12 Meses',
          'overall': 'Todos os Tempos'
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
      {etapa === 'inicio' && (
        <div className={styles.welcome}>
          <div className={styles.titleWelcome}>
            <h1 className={styles.title}>Bem Vindo ao </h1>
            <img src="/logo-color.png" alt="Logo" className={styles.logo} />
          </div>
          <div className={styles.descriptionContainer}>
            <p className={styles.description}>Seu top de álbuns, agora em forma de arte! Crie uma colagem com os mais ouvidos do seu perfil no Last.fm.</p>
            <button onClick={() => setEtapa('formulario')} className={styles.button}>
              Começar
            </button>
          </div>
        </div>
      )}

      {etapa === 'formulario' && (
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
        />
      )}

        {etapa === 'resultado' && (
          <>
            <div className={styles.resultActions}>
                <button onClick={() => setEtapa('formulario')} className={styles.button}>
                  Voltar
                </button>
                <div className={styles.downloadBtnContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={includeInfo}
                      onChange={(e) => setIncludeInfo(e.target.checked)}
                      />
                    Incluir nome do álbum e artista
                  </label>
                  <button onClick={downloadImage} className={styles.button}>
                    Baixar Collage
                  </button>
                </div>
            </div>
           <AlbumGrid
              albums={albums}
              gridSize={gridSize}
              collageRef={collageRef}
            />
          </>
        )}


      {error && <ErrorMessage error={error} />}
    </main>
  );
}
