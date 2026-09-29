import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { load } from 'cheerio';

for (const name of ['hero', 'texture', 'services']) {
  for (const width of [640, 1200, 1920]) {
    await sharp(`public/assets/${name}-original.png`).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`public/assets/${name}-${width}.webp`);
  }
}
await sharp('public/assets/owners.jpg').resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 85 }).toFile('public/assets/owners.webp');
const $ = load(await readFile('docs/source-site.html', 'utf8'));
const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const articles = [];
const routeMap = { home: '/', about: '/about', services: '/services', careers: '/careers', blog: '/resources', contact: '/contact', faq: '/faq', privacy: '/privacy', terms: '/terms' };
$('[id^="pg-article-"]').each((_, element) => {
  const page = $(element);
  const title = page.find('h2').first().text().trim();
  const slug = slugify(title);
  routeMap[element.attribs.id.replace('pg-', '')] = `/resources/${slug}`;
  articles.push({ id: element.attribs.id, title, slug, category: page.find('.blog-cat').first().text().trim() || 'NDIS insights', sourceDate: page.find('.blog-meta').first().text().replace(/\s+/g, ' ').trim(), excerpt: page.find('.article-body p').first().text().trim() });
});
function clean(fragment) {
  const $fragment = load(fragment, null, false);
  $fragment('script, style, svg, img, iframe, form, .article-cta, .article-back, .back-link').remove();
  $fragment('span[data-cfemail]').each((_, el) => {
    const encoded = $fragment(el).attr('data-cfemail');
    const key = parseInt(encoded.slice(0, 2), 16);
    $fragment(el).replaceWith(Array.from({ length: (encoded.length - 2) / 2 }, (_, index) => String.fromCharCode(parseInt(encoded.slice(2 + index * 2, 4 + index * 2), 16) ^ key)).join(''));
  });
  $fragment('*').each((_, element) => {
    for (const attribute of Object.keys(element.attribs)) {
      if (!['href'].includes(attribute)) $fragment(element).removeAttr(attribute);
    }
    if (element.name === 'a') {
      const href = $fragment(element).attr('href') || '';
      if (href.startsWith('#pg-')) $fragment(element).attr('href', routeMap[href.slice(4)] || '/resources');
      else if (href.includes('email-protection')) $fragment(element).attr('href', `mailto:${$fragment(element).text()}`);
      else if (!/^(https?:|mailto:|tel:|\/)/.test(href)) $fragment(element).replaceWith($fragment(element).text());
    }
  });
  return $fragment.html();
}
for (const article of articles) {
  const page = $(`#${article.id} .article-body`).clone();
  article.html = clean(page.html()).replaceAll('<h3>', '<h2>').replaceAll('</h3>', '</h2>').replaceAll('<h4>', '<h3>').replaceAll('</h4>', '</h3>');
  article.readingMinutes = Math.max(1, Math.ceil(page.text().split(/\s+/).length / 220));
}
const legal = {};
for (const name of ['privacy', 'terms']) legal[name] = clean($(`#pg-${name} section`).last().html());
await writeFile('src/source-content.json', JSON.stringify({ articles, legal, legacyRoutes: routeMap }, null, 2));
console.log(`Prepared responsive assets and ${articles.length} archived articles.`);
