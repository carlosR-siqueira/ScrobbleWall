'use client';
import React from 'react';
import styles from './donate.module.css';

export default function DonatePage() {
  const pixKey = '21976178836';
  const name = 'Nome: Carlos Roberto Santos Siqueira Filho'
  const banco = 'Banco: Inter'

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Apoie com um Pix</h1>
      <p>Escaneie o QR Code abaixo para doar:</p>
      <img
        src="/pix-qrcode.png"
        alt="QR Code Pix"
        className={styles.qrImage}
      />
      <p className={styles.pixKey}>Chave Pix: {pixKey} <br />{name} <br />{banco}</p>
    </div>
  );
}
