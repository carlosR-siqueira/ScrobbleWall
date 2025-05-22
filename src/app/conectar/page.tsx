'use client';

import React from 'react';
import styles from './page.module.css';

const ConectarSpotify = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Como conectar o Spotify ao Last.fm</h1>

      <p className={styles.paragraph}>
        O Last.fm é uma plataforma que permite integrar serviços de streaming, como o Spotify, para registrar automaticamente as músicas que você ouve. Esse processo é conhecido como "scrobbling" e ajuda a catalogar seus hábitos musicais.
      </p>

      <p className={styles.paragraph}>
      Funciona como uma comunidade virtual focada em interesses musicais. Você pode trocar informações e indicações com fãs da sua banda preferida, por exemplo, e ver sua compatibilidade musical com outros usuários.
      </p>

      <h2 className={styles.subtitle}>Passo a passo para conectar</h2>

      <ol className={styles.paragraph}>
        <li>
          Acesse o site do <a href="https://www.last.fm/" target="_blank" rel="noopener noreferrer">Last.fm</a> e faça login na sua conta (ou crie uma nova).
          <div className={styles.imgContainer}>
            <img src="/public/lastFm.png" alt="last.fm" />
          </div>
        </li>
        <li>
          No rodapé da página, dentro de <strong>“Help”</strong> selecione <a href='https://www.last.fm/about/trackmymusic' target="_blank" rel="noopener noreferrer">Track My Music</a>, ou acesse diretamente a página de <a href="https://www.last.fm/settings/applications" target="_blank" rel="noopener noreferrer">aplicativos conectados</a>. Você também pode clicar em <a href='https://www.last.fm/about/trackmymusic' target="_blank" rel="noopener noreferrer">Download Scrobbler</a> dentro de <strong>"Goodies"</strong>
          <div className={styles.imgContainer}>
            <img src="/public/lastFm-footer.png" alt="last.fm footer" />
          </div>
        </li>
        <li>
          Clique em <strong>“Spotify”</strong>, em seguida clique em <strong>“Connect”</strong>.
          <div className={styles.imgContainer}>
            <img src="/public/spotify.png" alt="spotify" />
          </div>
        </li>
        <li>
          Uma janela pop-up do Spotify será aberta solicitando permissão para integrar as plataformas. Clique em <strong>“Aceitar”</strong>.
        </li>
        <li>
          Após a confirmação, suas músicas tocadas no Spotify começarão a ser registradas automaticamente no seu perfil do Last.fm.
          <div className={styles.imgContainer}>
            <img src="/public/spotify-connect.png" alt="spotify-connect" />
          </div>
        </li>

      </ol>

      <h2 className={styles.subtitle}>O que acontece depois?</h2>

      <p className={styles.paragraph}>
        Com o scrobbling ativo, todas as faixas reproduzidas no Spotify serão registradas no seu perfil do Last.fm, independentemente do dispositivo utilizado (celular, tablet ou computador). Você poderá visualizar estatísticas detalhadas sobre suas músicas, álbuns e artistas mais ouvidos, além de descobrir sua compatibilidade musical com outros usuários.
      </p>

      <h2 className={styles.subtitle}>Como remover a conexão?</h2>

      <p className={styles.paragraph}>
        Caso deseje desconectar o Spotify do Last.fm, acesse a página de <a href="https://www.spotify.com/account/apps/" target="_blank" rel="noopener noreferrer">aplicativos conectados do Spotify</a>, localize o Last.fm e clique em <strong>“Remover Acesso”</strong>.
      </p>

      <p className={styles.paragraph}>
        Pronto! Agora você já sabe como integrar o Spotify ao Last.fm e aproveitar ao máximo os recursos do ScrobbleWall.
      </p>
    </div>
  );
};

export default ConectarSpotify;
