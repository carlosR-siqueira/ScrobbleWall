'use client';

import React from 'react';
import styles from './page.module.css';
import GoogleHorizontalAd from '../components/adsComponents/GoogleHorizontalAd';

const Sobre = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sobre o ScrobbleWall</h1>

      <p className={styles.paragraph}>
        O <span className={styles.mark}>ScrobbleWall</span> é um projeto criado para transformar seus dados musicais do Last.fm em arte visual.
        A ideia é simples: você fornece seu nome de usuário do Last.fm, e o site gera uma colagem com os álbuns mais
        reproduzidos no período escolhido.
      </p>

      <p className={styles.paragraph}>
        Com uma interface simples e personalizável, é possível criar facilmente uma imagem com os álbuns que marcaram
        sua semana, mês ou até mesmo toda sua jornada musical. Você pode incluir informações como o nome do álbum e
        artista, ajustar o tamanho da grade e fazer o download da imagem gerada com alta qualidade.
      </p>

      <p className={styles.paragraph}>
        Tudo é feito diretamente no navegador, sem necessidade de login ou coleta de dados sensíveis.
      </p>

      <GoogleHorizontalAd />

      <h2 className={styles.subtitle}>Por que criei este site?</h2>

      <p className={styles.paragraph}>
        Sou <strong>Carlos Siqueira</strong>, desenvolvedor front-end com paixão por música, arte e dados. Sempre achei
        fascinante como nossa trilha sonora pessoal pode contar histórias. O ScrobbleWall nasceu como uma forma de dar
        vida visual a esses dados e compartilhar nossa identidade musical com o mundo.
      </p>

      <p className={styles.paragraph}>
        Se você gostou do projeto, considere apoiar com um café ou compartilhá-lo com amigos!
      </p>

      <p className={styles.paragraph}>
        Obrigado por visitar o site. 🎵✨
      </p>

      <GoogleHorizontalAd />
    </div>
  );
};

export default Sobre;
