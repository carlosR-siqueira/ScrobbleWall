'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import styles from './page.module.css';
import GoogleResponsiveAd from '../components/adsComponents/GoogleResponsiveAd';
import PageWithSidebarAds from '../components/adsComponents/PageWithSidebarAds';
import { useLanguage } from '../contexts/LanguageContext';

const Contato = () => {
  const [state, handleSubmit] = useForm('xnndbljn');
  const { t } = useLanguage();

  if (state.succeeded) {
    return <div className={styles.successMessageContainer}>
        <p
          className={styles.successMessage}>{t('contact.successMessage')}
        </p>
      </div> 
  }

  return (
    <PageWithSidebarAds>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('contact.title')}</h1>
        <p className={styles.paragraph}>
          {t('contact.description')}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            {t('contact.emailLabel')}
          </label>
          <input id="email" type="email" name="email" className={styles.input} required />
          <ValidationError prefix="Email" field="email" errors={state.errors} />

          <label htmlFor="message" className={styles.label}>
            {t('contact.messageLabel')}
          </label>
          <textarea id="message" name="message" className={styles.textarea} rows={5} required />
          <ValidationError prefix="Message" field="message" errors={state.errors} />

          <button type="submit" disabled={state.submitting} className={styles.button}>
            {state.submitting ? t('contact.sendingButton') : t('contact.sendButton')}
          </button>
        </form>

        <p className={styles.paragraph}>
          {t('contact.orSendTo')} <a href="mailto:bekguittar@gmail.com" className={styles.link}>bekguittar@gmail.com</a>
        </p>

        {/* Propaganda no final da página */}
        <GoogleResponsiveAd position="bottom" forceHorizontal={true} />
      </div>
    </PageWithSidebarAds>
  );
};

export default Contato;
