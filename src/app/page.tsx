'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

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
          <h1 className={styles.title}>Bem-vindo ao</h1>
          <img src="/logo-color.png" alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            Seu top de álbuns, agora em forma de arte! Crie uma colagem com os mais ouvidos do seu perfil no Last.fm.
          </p>
          <button onClick={() => router.push('/generate')} className={styles.button}>
            Começar
          </button>
        </div>
      </div>

      {/* Seção de instruções para conectar Spotify ao Last.fm */}
      <section className={styles.integrationSection}>
        <h2 className={styles.integrationTitle}>Ainda não conectou seu Spotify ao Last.fm?</h2>
        <p className={styles.integrationDescription}>
          Para que suas músicas do Spotify sejam registradas e apareçam na colagem, é necessário conectar sua conta ao Last.fm.
        </p>
        <button
          className={styles.integrationButton}
          onClick={() => window.open('https://www.last.fm/settings/applications', '_blank')}
        >
          Aprender como conectar
        </button>
      </section>


      {/* Seção de exemplos de colagens */}
      <section className={styles.examplesSection}>
        <h2 className={styles.examplesTitle}>Exemplos de Colagens</h2>

        <div className={styles.exampleItem}>
          <img
            src="/exemplo-3x3.png"
            alt="Colagem 3x3"
            className={styles.exampleImage}
            onClick={() => openModal('/exemplo-3x3.png')}
          />
          <div className={styles.exampleText}>
            <h3>Colagem 3x3</h3>
            <p>Uma grade compacta com os 9 álbuns mais ouvidos. Ideal para destacar seus favoritos da semana.</p>
          </div>
        </div>

        <div className={styles.exampleItem}>
          <div className={styles.exampleText}>
            <h3>Colagem 4x4</h3>
            <p>Um equilíbrio entre variedade e tamanho. Perfeita para o seu top do mês.</p>
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
            <h3>Colagem 5x5</h3>
            <p>Para os ouvintes mais intensos! Mostre 25 álbuns em uma única imagem, ideal para todo o seu histórico.</p>
          </div>
        </div>
      </section>

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
