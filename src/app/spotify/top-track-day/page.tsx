"use client"
import React from 'react';
import SpotifyTopTrackDay from '../../components/SpotifyTopTrackDay';
import styles from '../spotify.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';

export default function TopTrackDayPage() {
  const router = useRouter();

  return (
    <main className={styles.container} style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
     
    }}>
      
        
        <SpotifyTopTrackDay />
    </main>
  );
} 