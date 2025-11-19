import { NextResponse } from 'next/server';

export async function GET() {
  const urls = [
    '',
    'facebook',
    'youtube',
    'tiktok',
  ];

  const baseUrl = 'https://fty-downloader-pro.netlify.app';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (path) => `
      <url>
        <loc>${baseUrl}/${path}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
        <priority>${path === '' ? '1.0' : '0.8'}</priority>
      </url>`
      )
      .join('')}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}