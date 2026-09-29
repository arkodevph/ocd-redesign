import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render, routes, routeMeta, schemaFor } from '../.ssr/prerender.js';

const template = await readFile('dist/index.html', 'utf8');
const origin = process.env.PRESENTATION_ORIGIN || 'http://localhost:4173';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const route of routes) {
  const [title, description] = routeMeta[route];
  const head = `<title>${escape(title)} | OCD Brilliance</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${route}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}/assets/hero-1200.webp"><script type="application/ld+json" id="route-schema">${JSON.stringify(schemaFor(route)).replaceAll('<', '\\u003c')}</script>`;
  const html = template.replace('<!--app-html-->', render(route)).replace('<!--page-head-->', head);
  const directory = `dist${route === '/' ? '' : route}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  if (route === '/404') await writeFile('dist/404.html', html);
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(route => route !== '/404').map(route => `<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log(`Prerendered ${routes.length} presentation routes. Intentionally noindex.`);
