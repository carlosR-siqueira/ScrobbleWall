import React, { useState, useRef } from 'react';
import styles from '../page.module.css';
import { useLanguage } from '../contexts/LanguageContext';

interface CollageSectionProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  period: string;
  setPeriod: React.Dispatch<React.SetStateAction<string>>;
  gridSize: number;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
  fetchAlbums: () => void;
  loading: boolean;
  error: string;
  downloadImage: (includeInfo: boolean) => void;
  albums: any[];
  includeInfo: boolean;
  setIncludeInfo: React.Dispatch<React.SetStateAction<boolean>>;
  isGeneratePage?: boolean;
}

const CollageSection: React.FC<CollageSectionProps> = ({
  username,
  setUsername,
  period,
  setPeriod,
  gridSize,
  setGridSize,
  fetchAlbums,
  loading,
  error,
  downloadImage,
  albums,
  includeInfo,
  setIncludeInfo,
  isGeneratePage = false,
}) => {
  const { t } = useLanguage();
  const collageRef = useRef<HTMLDivElement | null>(null);
  
  const containerClass = isGeneratePage ? styles.generateFormContainer : styles.formContainer;

  return (
    <div ref={collageRef} className={containerClass}>
      <section className={styles.inputContainer}>
        <input
          type="text"
          placeholder={t('generate.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.inputField}
        />

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={styles.selectField}
        >
          <option value="7day">{t('generate.period7day')}</option>
          <option value="1month">{t('generate.period1month')}</option>
          <option value="3month">{t('generate.period3month')}</option>
          <option value="12month">{t('generate.period12month')}</option>
          <option value="overall">{t('generate.periodOverall')}</option>
        </select>

        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className={styles.selectField}
        >
          <option value={3}>3x3</option>
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
        </select>

        <button
          onClick={fetchAlbums}
          disabled={loading}
          className={styles.button}
        >
          {loading ? t('generate.loading') : t('generate.generateButton')}
        </button>

        {error && (
          <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default CollageSection;
