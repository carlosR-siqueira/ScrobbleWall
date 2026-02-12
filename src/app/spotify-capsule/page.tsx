'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Bungee, Manrope } from 'next/font/google';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './page.module.css';

const titleFont = Bungee({
  weight: '400',
  subsets: ['latin'],
});

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
});

type TopEntry = {
  rank: number;
  name: string;
  artist?: string;
  plays?: number;
  artistImage?: string;
};

type SpotifySummary = {
  profileName: string | null;
  timeRange: string;
  tracks: TopEntry[];
  minutesSource: string;
  generatedAt: string;
};

const localeMap: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

export default function SpotifyCapsulePage() {
  const { language, t } = useLanguage();
  const [data, setData] = useState<SpotifySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  const nowFormatted = useMemo(() => {
    return new Date().toLocaleDateString(localeMap[language] || 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [language]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/spotify/summary', { cache: 'no-store' });

      if (response.status === 401) {
        setData(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(t('spotifyCapsule.errorLoad'));
        setLoading(false);
        return;
      }

      const summary = (await response.json()) as SpotifySummary;
      setData(summary);
    } catch {
      setError(t('spotifyCapsule.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectStatus = params.get('connected');
    const authError = params.get('error');

    if (connectStatus === '1') {
      fetchSummary();
    }

    if (authError) {
      setError(t('spotifyCapsule.errorAuth'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const connectSpotify = () => {
    window.location.href = '/api/spotify/login';
  };

  const disconnectSpotify = async () => {
    await fetch('/api/spotify/logout', { method: 'POST' });
    setData(null);
  };

  const downloadArtwork = async () => {
    if (!artRef.current) return;
    try {
      setDownloading(true);
      const targetWidth = 1080;
      const scale = targetWidth / artRef.current.offsetWidth;
      const canvas = await html2canvas(artRef.current, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `scrobblewall-top10-dia-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className={`${styles.container} ${bodyFont.className}`}>
      <section className={styles.panel}>
        <div className={styles.controls}>
          {!data && (
            <button onClick={connectSpotify} className={styles.button}>
              {t('spotifyCapsule.connect')}
            </button>
          )}
          {data && (
            <>
              <button onClick={downloadArtwork} className={styles.button} disabled={downloading}>
                {downloading ? t('spotifyCapsule.downloading') : t('spotifyCapsule.downloadArt')}
              </button>
              <button
                onClick={disconnectSpotify}
                className={`${styles.button} ${styles.dangerButton}`}
              >
                {t('spotifyCapsule.disconnect')}
              </button>
            </>
          )}
        </div>

        {loading && <p className={styles.status}>{t('spotifyCapsule.loading')}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !data && !error && (
          <p className={styles.status}>{t('spotifyCapsule.notConnected')}</p>
        )}

        {!loading && data && (
          <div className={styles.stage}>
            <div className={styles.artwork} ref={artRef}>
              <div className={styles.topBar} />
              <div className={styles.brandTop}>
                <img src="/logo-color.png" alt="ScrobbleWall" className={styles.brandLogo} />
              </div>
              <div className={styles.titleRow}>
                <h1 className={`${styles.title} ${titleFont.className}`}>Daily Topify</h1>
                <p className={styles.date}>{nowFormatted}</p>
              </div>
              <p className={styles.subtitle}>
                {data?.profileName
                  ? `${t('spotifyCapsule.forUser')} ${data.profileName}`
                  : t('spotifyCapsule.subtitle')}
              </p>

              <h2 className={styles.cardTitle}>{t('spotifyCapsule.topTracks')}</h2>
              <ul className={styles.list}>
                {data.tracks.map((track) => (
                  <li key={track.rank} className={styles.listItem}>
                    <span className={styles.rank}>{track.rank}</span>
                    <img
                      src={track.artistImage || '/fallback1.png'}
                      alt={track.artist || track.name}
                      className={styles.artistImage}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <span className={styles.trackMeta}>
                      <span className={styles.trackName}>{track.name}</span>
                      <span className={styles.trackArtist}>{track.artist || '-'}</span>
                    </span>
                    <span className={styles.playBadge}>
                      {track.plays} {t('spotifyCapsule.plays')}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        )}
      </section>
    </main>
  );
}
