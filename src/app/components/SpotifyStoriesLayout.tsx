import React, { useRef } from 'react';
// import styles from '../page.module.css';
import styles from '../spotify/spotify.module.css';

interface Artist {
  name: string;
  image: string;
  popularity: number;
  type: 'artist';
}

interface SpotifyStoriesLayoutProps {
  artists: Artist[];
}

const SpotifyStoriesLayout: React.FC<SpotifyStoriesLayoutProps> = ({ artists }) => {
  const storiesRef = useRef<HTMLDivElement>(null);

  const downloadStoriesImage = async () => {
    if (!storiesRef.current) return;

    // Configurações para Instagram Stories (9:16)
    const width = 1080;
    const height = 1920;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Fundo gradiente principal
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1DB954'); // Spotify green
    gradient.addColorStop(0.5, '#191414'); // Spotify black
    gradient.addColorStop(1, '#1DB954'); // Spotify green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Adicionar elementos visuais de fundo
    // Círculos decorativos
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
      for (let i = 0; i < Math.min(artists.length, 10); i++) {
        const artist = artists[i];
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
        // Usar path para criar borda arredondada (mais compatível)
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
        if (i < Math.min(artists.length, 10) - 1) {
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

      // Download da imagem
      const link = document.createElement('a');
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      link.download = `Spotify-Top10-Artistas-${formattedDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }
  };

  return (
    <div className={styles.storiesContainer}>
      <div ref={storiesRef} className={styles.storiesPreview}>
        <div className={styles.storiesTitle}>
          <h2>Top 10 Artistas</h2>
          <p>do Mês - Spotify</p>
        </div>
        
        <div className={styles.storiesArtists}>
          {artists.slice(0, 10).map((artist, index) => (
            <div 
              key={index} 
              className={`${styles.storiesArtist} ${index % 2 === 0 ? styles.artistLeft : styles.artistRight}`}
            >
              <div className={styles.artistImage}>
                <img src={artist.image || '/fallback1.png'} alt={artist.name} />
              </div>
              <div className={styles.artistInfo}>
                <h3>#{index + 1} {artist.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={downloadStoriesImage} className={styles.button} style={{ display: 'none' }}>
        Baixar para Instagram Stories
      </button>
    </div>
  );
};

export default SpotifyStoriesLayout; 