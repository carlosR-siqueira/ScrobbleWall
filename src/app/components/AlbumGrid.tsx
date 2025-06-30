// components/AlbumGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';

interface Album {
  image: string;
  name: string;
  artist: string;
  playcount: number;
}

interface AlbumGridProps {
  albums: Album[];
  gridSize: number;
  collageRef: React.RefObject<HTMLDivElement | null>;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, gridSize, collageRef }) => {
  return (
    <div
      ref={collageRef}
      className={styles.collageContainer}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {albums.map((album, idx) => (
        <div key={idx} className={styles.collageItem}>
          <motion.img
            src={album.image || '/fallback1.png'} 
            alt={album.name || 'Album sem nome'}
            className={styles.collageImage}
            width={100}
            height={100}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
          />
          <div className={styles.albumInfo} >
            <strong className={styles.albumDescription}>{album.name}</strong> <br />
            <span className={styles.albumDescription}>{album.artist}</span> <br />
            <span className={styles.albumDescription} style={{ fontSize: '0.8em', opacity: 0.8 }}>
              {album.playcount} plays
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumGrid;
