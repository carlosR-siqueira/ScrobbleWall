import React, { useState } from 'react';

const SpotifyRecapImage: React.FC = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setImgUrl(null);
    try {
      const res = await fetch('/api/spotify/recap-image');
      if (!res.ok) throw new Error('Erro ao gerar imagem');
      const blob = await res.blob();
      setImgUrl(URL.createObjectURL(blob));
    } catch (e) {
      alert('Erro ao gerar imagem recap!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: 32 }}>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: '12px 32px', fontSize: 18, borderRadius: 8, background: '#1DB954', color: '#fff', border: 'none', cursor: 'pointer' }}>
        {loading ? 'Gerando imagem...' : 'Gerar Recap Visual'}
      </button>
      {imgUrl && (
        <div style={{ marginTop: 24 }}>
          <img
            src={imgUrl}
            alt="Spotify Recap"
            style={{ maxWidth: '100%', borderRadius: 16, boxShadow: '0 4px 24px #0004' }}
          />
          <a href={imgUrl} download="spotify-recap.png" style={{ display: 'block', marginTop: 12, color: '#1DB954', fontWeight: 'bold' }}>
            Baixar imagem
          </a>
        </div>
      )}
    </div>
  );
};

export default SpotifyRecapImage; 