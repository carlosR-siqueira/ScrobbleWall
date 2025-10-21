'use client';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './LanguageSwitcher.module.css';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';



const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: 'pt' | 'en' | 'es') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={styles.currentLanguage}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        {currentLanguage?.label}
        <ArrowDropDownOutlinedIcon  />
      </button>
      
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`${styles.languageOption} ${language === lang.code ? styles.active : ''}`}
                onClick={() => handleLanguageChange(lang.code as 'pt' | 'en' | 'es')}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
