"use client"
import * as React from 'react';
import { useState, useRef } from 'react';
import SpotifyCollageSection from '../components/SpotifyCollageSection';
import AlbumGrid from '../components/AlbumGrid';
import SpotifyStoriesLayout from '../components/SpotifyStoriesLayout';
import AdWrapper from '../components/adsComponents/AdWrapper';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
// import styles from '../page.module.css';
import styles from './spotify.module.css';

export default function SpotifyPage() {
  const [type, setType] = useState<'artist' | 'track'>('artist');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [etapa, setEtapa] = useState<'formulario' | 'resultado'>('formulario');

  const collageRef = useRef<HTMLDivElement>(null);

  // Função para gerar imagem do Stories
  const generateStoriesImage = async (): Promise<HTMLCanvasElement | null> => {
    if (type !== 'artist' || items.length === 0) return null;

    const width = 1080;
    const height = 1920;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Fundo gradiente principal
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1DB954');
    gradient.addColorStop(0.5, '#191414');
    gradient.addColorStop(1, '#1DB954');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Adicionar elementos visuais de fundo
    ctx.fillStyle = 'rgba(29, 185, 84, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.8, 150, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.4, height * 0.4, 80, 0, Math.PI * 2);
    ctx.fill();

    // Linhas decorativas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.3);
    ctx.lineTo(width, height * 0.3);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width, height * 0.7);
    ctx.stroke();

    // Título branco
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    // Sombra do texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText('Top 10 Artistas', width / 2 + 2, 82);
    
    // Título principal branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Top 10 Artistas', width / 2, 80);
    
    // Subtítulo
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('do Mês - Spotify', width / 2, 120);

    // Configurações para cada artista
    const artistHeight = 160;
    const imageSize = 120;
    const startY = 160;
    const padding = 25;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.src = '/fallback1.png';
          fallbackImg.onload = () => resolve(fallbackImg);
        };
        img.src = src || '/fallback1.png';
      });

    try {
      for (let i = 0; i < Math.min(items.length, 10); i++) {
        const artist = items[i];
        const y = startY + (i * artistHeight);
        const isEven = i % 2 === 0;

        // Carregar imagem do artista
        const img = await loadImage(artist.image);
        
        // Posicionar imagem (alternando esquerda/direita)
        const imageX = isEven ? padding : width - padding - imageSize;
        const imageY = y + (artistHeight - imageSize) / 2;
        
        // Desenhar imagem com borda arredondada
        ctx.save();
        ctx.beginPath();
        const radius = 15;
        ctx.moveTo(imageX + radius, imageY);
        ctx.lineTo(imageX + imageSize - radius, imageY);
        ctx.quadraticCurveTo(imageX + imageSize, imageY, imageX + imageSize, imageY + radius);
        ctx.lineTo(imageX + imageSize, imageY + imageSize - radius);
        ctx.quadraticCurveTo(imageX + imageSize, imageY + imageSize, imageX + imageSize - radius, imageY + imageSize);
        ctx.lineTo(imageX + radius, imageY + imageSize);
        ctx.quadraticCurveTo(imageX, imageY + imageSize, imageX, imageY + imageSize - radius);
        ctx.lineTo(imageX, imageY + radius);
        ctx.quadraticCurveTo(imageX, imageY, imageX + radius, imageY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        ctx.restore();

        // Posicionar texto sempre colado à imagem
        let textX;
        if (isEven) {
          // Imagem à esquerda, texto à direita
          textX = imageX + imageSize + 20;
          ctx.textAlign = 'left';
        } else {
          // Imagem à direita, texto à esquerda
          textX = imageX - 20;
          ctx.textAlign = 'right';
        }

        // Número da posição e nome do artista
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`#${i + 1} ${artist.name}`, textX, y + 70);

        // Linha separadora (exceto para o último)
        if (i < Math.min(items.length, 10) - 1) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding, y + artistHeight);
          ctx.lineTo(width - padding, y + artistHeight);
          ctx.stroke();
        }
      }

      // Footer com texto "scrobblewall.art"
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      
      // Sombra do texto
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText('scrobblewall.art', width / 2 + 1, height - 39);
      
      // Gradiente para o texto
      const footerGradient = ctx.createLinearGradient(width / 2 - 80, 0, width / 2 + 80, 0);
      footerGradient.addColorStop(0, '#1DB954');
      footerGradient.addColorStop(0.5, '#FFFFFF');
      footerGradient.addColorStop(1, '#1DB954');
      ctx.fillStyle = footerGradient;
      ctx.fillText('scrobblewall.art', width / 2, height - 40);

      return canvas;
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return null;
    }
  };

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
            <div className={styles.VoltarButtonSpotify}>
              <IconButton
                onClick={() => setEtapa('formulario')}
                aria-label="Voltar"
                sx={{ color: '#1DB954', fontSize: '1.2rem' }}
              >
                <ArrowBackIcon />
                <span className={styles.voltar}>Voltar</span>
              </IconButton>
            </div>

            <div className={styles.downloadBtnContainer}>
              <div className={styles.shareSection}>
                <h3>Compartilhar</h3>
                <div className={styles.shareButtons}>
                  {type === 'artist' ? (
                    <>
                      <button 
                        onClick={() => {
                          const storiesLayout = document.querySelector('[data-stories-layout]');
                          if (storiesLayout) {
                            const downloadButton = storiesLayout.querySelector('button');
                            if (downloadButton) {
                              downloadButton.click();
                            }
                          }
                        }} 
                        className={styles.shareButton}
                        title="Baixar imagem"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={async () => {
                          // Gerar a imagem primeiro
                          const canvas = await generateStoriesImage();
                          if (canvas) {
                            // Tentar usar Web Share API primeiro
                            if (navigator.share) {
                              try {
                                canvas.toBlob(async (blob) => {
                                  if (blob) {
                                    const file = new File([blob], 'spotify-stories.png', { type: 'image/png' });
                                    await navigator.share({
                                      title: 'Meu Top 10 Artistas do Spotify',
                                      text: 'Confira meu Top 10 Artistas do Spotify! 🎵',
                                      files: [file]
                                    });
                                  }
                                });
                              } catch (error) {
                                // Fallback para Instagram
                                window.open('https://www.instagram.com/stories/', '_blank');
                              }
                            } else {
                              // Fallback para Instagram
                              window.open('https://www.instagram.com/stories/', '_blank');
                            }
                          }
                        }} 
                        className={styles.shareButton}
                        title="Compartilhar no Instagram"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={async () => {
                          // Gerar a imagem primeiro
                          const canvas = await generateStoriesImage();
                          if (canvas) {
                            // Tentar usar Web Share API primeiro
                            if (navigator.share) {
                              try {
                                canvas.toBlob(async (blob) => {
                                  if (blob) {
                                    const file = new File([blob], 'spotify-stories.png', { type: 'image/png' });
                                    await navigator.share({
                                      title: 'Meu Top 10 Artistas do Spotify',
                                      text: 'Confira meu Top 10 Artistas do Spotify! 🎵 https://scrobblewall.art',
                                      files: [file]
                                    });
                                  }
                                });
                              } catch (error) {
                                // Fallback para Twitter
                                const text = "Confira meu Top 10 Artistas do Spotify! 🎵";
                                const url = "https://scrobblewall.art";
                                const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                                window.open(shareUrl, '_blank');
                              }
                            } else {
                              // Fallback para Twitter
                              const text = "Confira meu Top 10 Artistas do Spotify! 🎵";
                              const url = "https://scrobblewall.art";
                              const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                              window.open(shareUrl, '_blank');
                            }
                          }
                        }} 
                        className={styles.shareButton}
                        title="Compartilhar no X"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          const downloadCollage = async () => {
                            const imageSize = 300;
                            const canvasSize = 5 * imageSize;
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
                                  fallbackImg.src = '/fallback1.png';
                                  fallbackImg.onload = () => resolve(fallbackImg);
                                };
                                img.src = src || '/fallback1.png';
                              });

                            try {
                              for (let i = 0; i < Math.min(items.length, 25); i++) {
                                const track = items[i];
                                const img = await loadImage(track.image);
                                const x = (i % 5) * imageSize;
                                const y = Math.floor(i / 5) * imageSize;
                                ctx.drawImage(img, x, y, imageSize, imageSize);
                              }

                              const today = new Date();
                              const formattedDate = today.toISOString().split('T')[0];
                              const link = document.createElement('a');
                              link.download = `Spotify-Top10-Tracks-${formattedDate}.png`;
                              link.href = canvas.toDataURL('image/png');
                              link.click();
                            } catch (error) {
                              console.error('Erro ao gerar imagem:', error);
                            }
                          };
                          downloadCollage();
                        }} 
                        className={styles.shareButton}
                        title="Baixar colagem"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={async () => {
                          // Gerar colagem de tracks
                          const downloadCollage = async () => {
                            const imageSize = 300;
                            const canvasSize = 5 * imageSize;
                            const canvas = document.createElement('canvas');
                            canvas.width = canvasSize;
                            canvas.height = canvasSize;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return null;

                            const loadImage = (src: string): Promise<HTMLImageElement> =>
                              new Promise((resolve) => {
                                const img = new Image();
                                img.crossOrigin = 'anonymous';
                                img.onload = () => resolve(img);
                                img.onerror = () => {
                                  const fallbackImg = new Image();
                                  fallbackImg.src = '/fallback1.png';
                                  fallbackImg.onload = () => resolve(fallbackImg);
                                };
                                img.src = src || '/fallback1.png';
                              });

                            try {
                              for (let i = 0; i < Math.min(items.length, 25); i++) {
                                const track = items[i];
                                const img = await loadImage(track.image);
                                const x = (i % 5) * imageSize;
                                const y = Math.floor(i / 5) * imageSize;
                                ctx.drawImage(img, x, y, imageSize, imageSize);
                              }
                              return canvas;
                            } catch (error) {
                              console.error('Erro ao gerar imagem:', error);
                              return null;
                            }
                          };

                          const canvas = await downloadCollage();
                          if (canvas) {
                            // Tentar usar Web Share API primeiro
                            if (navigator.share) {
                              try {
                                canvas.toBlob(async (blob) => {
                                  if (blob) {
                                    const file = new File([blob], 'spotify-tracks.png', { type: 'image/png' });
                                    await navigator.share({
                                      title: 'Meu Top 10 Tracks do Spotify',
                                      text: 'Confira meu Top 10 Tracks do Spotify! 🎵 https://scrobblewall.art',
                                      files: [file]
                                    });
                                  }
                                });
                              } catch (error) {
                                // Fallback para Twitter
                                const text = "Confira meu Top 10 Tracks do Spotify! 🎵";
                                const url = "https://scrobblewall.art";
                                const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                                window.open(shareUrl, '_blank');
                              }
                            } else {
                              // Fallback para Twitter
                              const text = "Confira meu Top 10 Tracks do Spotify! 🎵";
                              const url = "https://scrobblewall.art";
                              const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                              window.open(shareUrl, '_blank');
                            }
                          }
                        }} 
                        className={styles.shareButton}
                        title="Compartilhar no X"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {type === 'artist' ? (
            <div data-stories-layout>
              <SpotifyStoriesLayout artists={items} />
            </div>
          ) : (
            <AlbumGrid
              albums={items}
              gridSize={5}
              collageRef={collageRef}
            />
          )}
          <AdWrapper topMargin={20} bottomMargin={20} />
        </>
      )}
    </main>
  );
} 