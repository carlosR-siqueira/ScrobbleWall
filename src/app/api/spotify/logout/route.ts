import { NextResponse } from 'next/server';
import {
  SPOTIFY_ACCESS_TOKEN_COOKIE,
  SPOTIFY_EXPIRES_AT_COOKIE,
  SPOTIFY_REFRESH_TOKEN_COOKIE,
} from '@/lib/spotify';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SPOTIFY_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(SPOTIFY_REFRESH_TOKEN_COOKIE);
  response.cookies.delete(SPOTIFY_EXPIRES_AT_COOKIE);
  return response;
}

