'use client';
import { useEffect, useState } from 'react';
import type { Album } from './metadata';
import { CoverSession, type CoverState } from './resolver';

export function useCovers(albums: Album[]) {
  const [resource, setResource] = useState<{ albums: Album[]; session: CoverSession; states: CoverState[] }>();
  useEffect(() => {
    let mounted = true;
    const session = new CoverSession(albums, () => {
      if (mounted) setResource({ albums, session, states: [...session.states] });
    });
    setResource({ albums, session, states: [...session.states] });
    session.start();
    return () => { mounted = false; session.dispose(); };
  }, [albums]);
  return resource?.albums === albums ? resource : {
    session: undefined, states: albums.map((): CoverState => ({ status: 'loading' })),
  };
}
