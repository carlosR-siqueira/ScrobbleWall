'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';
import { useLanguage } from './contexts/LanguageContext';
import GoogleResponsiveAd from './components/adsComponents/GoogleResponsiveAd';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const openModal = (src: string) => {
    setModalImage(src);
    setModalOpen(true);
    
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage('');
  };

  return (
    <main className={styles.container}>
      {/* Seção de boas-vindas */}
      <div className={styles.welcome}>
        <div className={styles.titleWelcome}>
          <h1 className={styles.title}>{t('home.welcomeTitle')}</h1>
          <img src="/logo-color.png" alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            {t('home.description')}
          </p>
          <button onClick={() => router.push('/generate')} className={styles.button}>
            {t('home.startButton')}
          </button>
        </div>
      </div>

      {/* Propaganda responsiva após a seção de boas-vindas */}
      <GoogleResponsiveAd position="top" forceHorizontal={true} />

      {/* Seção de instruções para conectar Spotify ao Last.fm */}
      <section className={styles.integrationSection}>
        <h2 className={styles.integrationTitle}>{t('home.integrationTitle')}</h2>
        <p className={styles.integrationDescription}>
          {t('home.integrationDescription')}
        </p>
        <button
          className={styles.integrationButton}
          onClick={() => router.push('/conectar')}
        >
          {t('home.integrationButton')}
        </button>
      </section>

      {/* Seção de exemplos de colagens */}
      <section className={styles.examplesSection}>
        <h2 className={styles.examplesTitle}>{t('home.examplesTitle')}</h2>

        <div className={styles.exampleItem}>
          <img
            src="/exemplo-3x3.png"
            alt="Colagem 3x3"
            className={styles.exampleImage}
            onClick={() => openModal('/exemplo-3x3.png')}
          />
          <div className={styles.exampleText}>
            <h3>{t('home.collage3x3Title')}</h3>
            <p>{t('home.collage3x3Description')}</p>
          </div>
        </div>

        <div className={styles.exampleItem}>
          <div className={styles.exampleText}>
            <h3>{t('home.collage4x4Title')}</h3>
            <p>{t('home.collage4x4Description')}</p>
          </div>
          <img
            src="/exemplo-4x4.png"
            alt="Colagem 4x4"
            className={styles.exampleImage}
            onClick={() => openModal('/exemplo-4x4.png')}
          />
        </div>

        <div className={styles.exampleItem}>
          <img
            src="/exemplo-5x5.png"
            alt="Colagem 5x5"
            className={styles.exampleImage}
            onClick={() => openModal('/exemplo-5x5.png')}
          />
          <div className={styles.exampleText}>
            <h3>{t('home.collage5x5Title')}</h3>
            <p>{t('home.collage5x5Description')}</p>
          </div>
        </div>
      </section>

      {/* Segunda propaganda responsiva no final da página */}
      <GoogleResponsiveAd position="bottom" forceHorizontal={true} />

      {/* Modal de visualização da imagem */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Imagem ampliada" className={styles.modalImage} />
            <button
              className={`${styles.closeButton} ${modalOpen ? styles.active : ''}`}
              onClick={closeModal}
            >
              X
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
