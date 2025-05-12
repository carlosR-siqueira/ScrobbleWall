'use client';

import React from 'react';
import styles from './page.module.css';

const TermosDeUso = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Termos de Uso</h1>
      <p className={styles.paragraph}>Atualizado em {currentYear}</p>

      <h2 className={styles.subtitle}>1. Aceitação dos Termos</h2>
      <p className={styles.paragraph}>
        Ao acessar e utilizar este site, você concorda com os termos e condições aqui descritos. Caso não concorde,
        por favor, não utilize o serviço.
      </p>

      <h2 className={styles.subtitle}>2. Descrição do Serviço</h2>
      <p className={styles.paragraph}>
        Este site permite a geração de colagens personalizadas com base nas informações públicas de usuários do
        <strong> Last.fm</strong>. Os dados são obtidos exclusivamente por meio da API oficial do Last.fm.
      </p>

      <h2 className={styles.subtitle}>3. Uso Pessoal</h2>
      <p className={styles.paragraph}>
        O conteúdo gerado por este site é para uso pessoal e não comercial. A reprodução, modificação ou distribuição
        sem autorização prévia é proibida.
      </p>

      <h2 className={styles.subtitle}>4. Conteúdo de Terceiros</h2>
      <p className={styles.paragraph}>
        As imagens e informações dos álbuns exibidos são fornecidas por serviços externos como o Last.fm. Não nos
        responsabilizamos por eventuais imprecisões ou conteúdos exibidos.
      </p>

      <h2 className={styles.subtitle}>5. Limitação de Responsabilidade</h2>
      <p className={styles.paragraph}>
        Este site é fornecido “no estado em que se encontra”, sem garantias de qualquer tipo. Não nos responsabilizamos
        por perdas, danos ou prejuízos decorrentes do uso do site.
      </p>

      <h2 className={styles.subtitle}>6. Modificações</h2>
      <p className={styles.paragraph}>
        Reservamo-nos o direito de modificar ou descontinuar o site (ou parte dele) a qualquer momento, com ou sem
        aviso prévio.
      </p>

      <h2 className={styles.subtitle}>7. Anúncios</h2>
      <p className={styles.paragraph}>
        Podemos exibir anúncios no site por meio do Google AdSense ou plataformas similares. Os anúncios são de
        responsabilidade de seus respectivos anunciantes.
      </p>

      <h2 className={styles.subtitle}>8. Contato</h2>
      <p className={styles.paragraph}>
        Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail:{' '}
        <a className={styles.link} href="mailto:bekguittar@gmail.com">bekguittar@gmail.com</a>
      </p>

      <p className={styles.paragraph}>
        © {currentYear}{' '}
        <a
          href="https://github.com/carlosR-siqueira"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Carlos Siqueira
        </a>. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default TermosDeUso;
