'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import styles from './page.module.css';
import GoogleResponsiveAd from '../components/adsComponents/GoogleResponsiveAd';
import PageWithSidebarAds from '../components/adsComponents/PageWithSidebarAds';

const Contato = () => {
  const [state, handleSubmit] = useForm('xnndbljn');

  if (state.succeeded) {
    return <div className={styles.successMessageContainer}>
        <p
          className={styles.successMessage}>Mensagem enviada com sucesso!
        </p>
      </div> 
  }

  return (
    <PageWithSidebarAds>
      <div className={styles.container}>
        <h1 className={styles.title}>Contato</h1>
        <p className={styles.paragraph}>
          Tem dúvidas, sugestões ou precisa de ajuda? Fique à vontade para nos enviar uma mensagem.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Endereço de e-mail
          </label>
          <input id="email" type="email" name="email" className={styles.input} required />
          <ValidationError prefix="Email" field="email" errors={state.errors} />

          <label htmlFor="message" className={styles.label}>
            Mensagem
          </label>
          <textarea id="message" name="message" className={styles.textarea} rows={5} required />
          <ValidationError prefix="Message" field="message" errors={state.errors} />

          <button type="submit" disabled={state.submitting} className={styles.button}>
            {state.submitting ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <p className={styles.paragraph}>
          Ou envie diretamente para: <a href="mailto:bekguittar@gmail.com" className={styles.link}>bekguittar@gmail.com</a>
        </p>

        {/* Propaganda no final da página */}
        <GoogleResponsiveAd position="bottom" forceHorizontal={true} />
      </div>
    </PageWithSidebarAds>
  );
};

export default Contato;
