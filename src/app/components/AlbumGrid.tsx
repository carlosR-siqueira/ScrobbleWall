// components/AlbumGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';
import type { Album } from '../../lib/covers/metadata';
import type { CoverState } from '../../lib/covers/resolver';
import { useLanguage } from '../contexts/LanguageContext';

interface AlbumGridProps {
  albums: Album[];
  gridSize: number;
  collageRef: React.RefObject<HTMLDivElement | null>;
  covers: CoverState[];
  retry: (index: number) => void;
  onImageError: (index: number) => void;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, gridSize, collageRef, covers, retry, onImageError }) => {
  const { t } = useLanguage();
  return (
    <div
      ref={collageRef}
      className={styles.collageContainer}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {albums.map((album, idx) => (
        <div key={idx} className={styles.collageItem} aria-busy={['loading', 'retrying'].includes(covers[idx]?.status)}>
          {covers[idx]?.asset ? <motion.img key={covers[idx].asset.src}
            src={covers[idx].asset.src}
            alt={album.name || 'Album sem nome'}
            className={styles.collageImage}
            width={100}
            height={100}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            onError={(event) => {
              // A revoked or browser-evicted blob must never leave a broken icon.
              event.currentTarget.style.visibility = 'hidden';
              onImageError(idx);
            }}
          /> : <div className={styles.coverPlaceholder}>
            {covers[idx]?.status === 'failed' ? t('generate.coverUnavailable') : t('generate.loadingCovers')}
          </div>}
          {['fallback', 'failed'].includes(covers[idx]?.status) && (
            <button type="button" onClick={() => retry(idx)} className={styles.coverRetry}
              aria-label={`${t('generate.retryCover')}: ${album.name}`}>
              {t('generate.retryCover')}
            </button>
          )}
          <div className={styles.albumInfo} >
            <strong className={styles.albumDescription}>{album.name}</strong> <br />
            <span className={styles.albumDescription}>{album.artist}</span> <br />
            <span className={styles.albumDescription} style={{ fontSize: '0.8em', opacity: 0.8 }}>
              {album.playcount} plays
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumGrid;
