'use client';

import React from 'react';
import styles from './page.module.css';
import GoogleResponsiveAd from '../components/adsComponents/GoogleResponsiveAd';

const PoliticaDePrivacidade = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Política de Privacidade</h1>
      <p className={styles.paragraph}>Atualizado em {currentYear}</p>

      <h2 className={styles.subtitle}>1. Informações Coletadas</h2>
      <p className={styles.paragraph}>
        Este site coleta apenas as informações necessárias para funcionamento da aplicação, como nome de usuário do
        Last.fm fornecido voluntariamente pelo usuário para geração de colagens personalizadas.
      </p>

      <h2 className={styles.subtitle}>2. Uso de Cookies</h2>
      <p className={styles.paragraph}>
        Podemos utilizar cookies e tecnologias semelhantes para melhorar a experiência do usuário, como lembrar suas
        preferências ou medir o desempenho do site.
      </p>

      <GoogleResponsiveAd position="top" forceHorizontal={true} />

      <h2 className={styles.subtitle}>3. Serviços de Terceiros</h2>
      <p className={styles.paragraph}>
        Utilizamos a API pública do <strong>Last.fm</strong> para recuperar informações musicais. Também podemos usar o
        serviço <strong>Google AdSense</strong> para exibir anúncios. Esses serviços podem coletar dados conforme suas
        próprias políticas de privacidade.
      </p>

      <h2 className={styles.subtitle}>4. Compartilhamento de Dados</h2>
      <p className={styles.paragraph}>
        Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário para os serviços citados acima.
      </p>

      <h2 className={styles.subtitle}>5. Segurança</h2>
      <p className={styles.paragraph}>
        Nos esforçamos para proteger suas informações, mas lembre-se de que nenhuma transmissão pela internet é 100%
        segura.
      </p>

      <h2 className={styles.subtitle}>6. Seus Direitos</h2>
      <p className={styles.paragraph}>
        Você tem o direito de solicitar a exclusão de seus dados ou de saber quais informações estão sendo coletadas. Para isso, entre em contato por e-mail.
      </p>

      <h2 className={styles.subtitle}>7. Alterações nesta Política</h2>
      <p className={styles.paragraph}>
        Podemos atualizar esta política periodicamente. Recomendamos que você a revise ocasionalmente para estar
        ciente de quaisquer alterações.
      </p>

      <h2 className={styles.subtitle}>8. Contato</h2>
      <p className={styles.paragraph}>
        Em caso de dúvidas ou solicitações, entre em contato pelo e-mail:{' '}
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

      <GoogleResponsiveAd position="bottom" forceHorizontal={true} />
    </div>
  );
};

export default PoliticaDePrivacidade;
