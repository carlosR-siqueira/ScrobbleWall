"use client"
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import CollageSection from '../components/CollageSection';
import AlbumGrid from '../components/AlbumGrid';
import AdWrapper from '../components/adsComponents/AdWrapper';
import { useLanguage } from '../contexts/LanguageContext';

import Switch from '@mui/material/Switch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import styles from '../page.module.css';
import { styled } from '@mui/material/styles';
import type { Album } from '../../lib/covers/metadata';
import { useCovers } from '../../lib/covers/useCovers';
import { renderCollage } from '../../lib/covers/export';

const CustomSwitch = styled(Switch)({
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
});

export default function GeneratePage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [period, setPeriod] = useState('7day');
  const [gridSize, setGridSize] = useState(3);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [includeInfo, setIncludeInfo] = useState(false);
  const [includePlayCount, setIncludePlayCount] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'resultado'>('formulario');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [confirmFallback, setConfirmFallback] = useState(false);
  const { session, states: covers } = useCovers(albums);
  const pendingCovers = covers.filter(cover => ['loading', 'retrying'].includes(cover.status)).length;
  const unavailableCovers = covers.filter(cover => ['fallback', 'failed'].includes(cover.status)).length;
  const fetchController = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const downloadGuard = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; fetchController.current?.abort(); };
  }, []);

  const retryCover = (index: number) => {
    if (downloading) return;
    setConfirmFallback(false);
    setError('');
    session?.retry(index);
  };

  const collageRef = useRef<HTMLDivElement>(null);
  const allowNavigationRef = useRef(false);

  const openSupportModal = (nextUrl?: string) => {
    if (isSupportModalOpen) return;
    setPendingNavigation(nextUrl ?? null);
    setIsSupportModalOpen(true);
  };

  const fetchAlbums = async () => {
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;
    setLoading(true);
    setError('');
    setConfirmFallback(false);
    try {
      const params = new URLSearchParams({ username, period, limit: String(gridSize * gridSize) });
      const res = await fetch(`/api/collage?${params}`, { signal: controller.signal });
      const data = await res.json();
      if (!mounted.current || controller.signal.aborted) return;
      if (!res.ok || !Array.isArray(data.albums)) {
        setError(t('generate.errorData'));
      } else if (!data.albums.length) {
        setAlbums([]);
        setError(t('generate.noAlbums'));
      } else {
        setAlbums(data.albums);
        setEtapa('resultado');
      }
    } catch {
      if (mounted.current && !controller.signal.aborted) setError(t('generate.errorNetwork'));
    } finally {
      if (mounted.current && !controller.signal.aborted) setLoading(false);
    }
  };

  const downloadImage = async (allowFallback = false) => {
    if (downloadGuard.current || !session || !albums.length) return;
    downloadGuard.current = true;
    setDownloading(true);
    setError('');
    try {
      // Wait for this same session: export never loads a second set of images.
      const assets = await session.wait();
      if (!mounted.current) return;
      if (session.states.some(cover => cover.status === 'fallback') && !allowFallback) {
        setConfirmFallback(true);
        return;
      }
      const data = renderCollage(albums, assets, gridSize, includeInfo, includePlayCount);
      const mapping: Record<string, string> = {
        '7day': t('generate.period7day'), '1month': t('generate.period1month'),
        '3month': t('generate.period3month'), '12month': t('generate.period12month'),
        'overall': t('generate.periodOverall'),
      };
      const formattedDate = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.download = `ScrobbleWall - ${mapping[period] || period} - ${formattedDate}.png`;
      link.href = data;
      link.click();
      setConfirmFallback(false);
      openSupportModal();
    } catch (error) {
      if (mounted.current) {
        setError(t('generate.errorExport'));
        console.warn('[export]', error instanceof Error && error.name === 'SecurityError' ? 'canvas_cors' : 'export_failed');
      }
    } finally {
      downloadGuard.current = false;
      if (mounted.current) setDownloading(false);
    }
  };

  const continueNavigation = () => {
    if (!pendingNavigation) {
      setIsSupportModalOpen(false);
      return;
    }

    allowNavigationRef.current = true;
    setIsSupportModalOpen(false);

    if (pendingNavigation === '__back__') {
      window.history.back();
      return;
    }

    window.location.href = pendingNavigation;
  };

  useEffect(() => {
    if (etapa !== 'resultado') return;

    const onDocumentClick = (event: MouseEvent) => {
      if (allowNavigationRef.current || isSupportModalOpen) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank') return;
      if (anchor.href.startsWith('mailto:') || anchor.href.startsWith('tel:')) return;

      const targetUrl = new URL(anchor.href, window.location.origin);
      const currentUrl = new URL(window.location.href);
      if (targetUrl.href === currentUrl.href) return;

      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      openSupportModal(targetUrl.href);
    };

    const onPopState = () => {
      if (allowNavigationRef.current || isSupportModalOpen) return;
      history.pushState({ supportModalGuard: true }, '', window.location.href);
      openSupportModal('__back__');
    };

    history.pushState({ supportModalGuard: true }, '', window.location.href);
    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, [etapa, isSupportModalOpen]);

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
            downloadImage={() => { void downloadImage(); }}
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
                onClick={() => { setEtapa('formulario'); setAlbums([]); setError(''); setConfirmFallback(false); }}
                disabled={downloading}
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
                  disabled={downloading}
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
                  disabled={downloading}
                  onChange={(e) => setIncludeInfo(e.target.checked)}
                  inputProps={{ 'aria-label': t('generate.includeInfo') }}
                />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('generate.includeInfo')}</span>
              </div>


              <button onClick={() => { void downloadImage(); }} disabled={downloading || !session} className={styles.button}>
                {downloading ? t('generate.waitingCovers') : t('generate.downloadButton')}
              </button>
            </div>
          </div>
          
          <div className={styles.coverStatus} role="status" aria-live="polite">
            {pendingCovers > 0 && <p>{t('generate.pendingCovers').replace('{count}', String(pendingCovers))}</p>}
            {unavailableCovers > 0 && pendingCovers === 0 && <p>{t('generate.unavailableCovers').replace('{count}', String(unavailableCovers))}</p>}
            {confirmFallback && <button type="button" className={styles.button} disabled={downloading}
              onClick={() => { void downloadImage(true); }}>{t('generate.downloadFallback')}</button>}
            {error && <p role="alert">{error}</p>}
          </div>
          <AlbumGrid
            albums={albums}
            gridSize={gridSize}
            collageRef={collageRef}
            covers={covers}
            retry={retryCover}
            onImageError={(index) => session?.previewFailed(index)}
          />
          
          <AdWrapper topMargin={20} bottomMargin={20} />
        </>
      )}

      {isSupportModalOpen && (
        <div className={styles.supportModalOverlay}>
          <div className={styles.supportModalCard}>
            <h3>Gostou do ScrobbleWall?</h3>
            <p>
              Se o site te ajudou a criar sua colagem, considere apoiar o projeto com um café.
            </p>
            <div className={styles.supportModalActions}>
              <a
                href="https://www.buymeacoffee.com/scrobblewall"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportPrimaryAction}
              >
                Apoiar no Buy Me a Coffee
              </a>
              <button
                type="button"
                className={styles.supportSecondaryAction}
                onClick={continueNavigation}
              >
                {pendingNavigation ? 'Ir para outra página' : 'Agora não'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
