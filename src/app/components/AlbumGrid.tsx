// components/AlbumGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../page.module.css';

interface Album {
  image: string;
  name: string;
  artist: string;
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
            src={album.image}
            alt={album.name}
            className={styles.collageImage}
            width={100}
            height={100}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
          />
          <div className={styles.albumInfo}>
            <strong>{album.name}</strong> <br />
            <span>{album.artist}</span>
          </div>
        </div>
      ))}
    </div>
  );
};



export default AlbumGrid;
