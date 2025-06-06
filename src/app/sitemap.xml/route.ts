// src/app/sitemap.xml/route.ts
import { type NextRequest } from 'next/server';

export const dynamic = 'force-static';

export function GET(req: NextRequest) {
  const baseUrl = 'https://www.scrobblewall.art';

  const pages = [
    '',        // Home
    '/conectar',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map(
        (page) => `
      <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`
      )
      .join('')}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
