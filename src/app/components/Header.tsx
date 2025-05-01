// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-cyan-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎵 ScrobbleWall</h1>
       
      </div>
    </header>
  );
};

export default Header;
