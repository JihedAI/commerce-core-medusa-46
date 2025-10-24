const fs = require('fs');
const path = require('path');

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://api.amine.agency';
const SITE_URL = 'https://lunette.amine.agency';

async function fetchAll(endpoint, key) {
  const limit = 100;
  let offset = 0;
  let results = [];
  while (true) {
    const url = `${MEDUSA_BACKEND_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=${limit}&offset=${offset}`;
    try {
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      const items = data[key] || data;
      if (!items || items.length === 0) break;
      results = results.concat(items);
      if (items.length < limit) break;
      offset += limit;
    } catch (err) {
      console.error('Failed to fetch', url, err);
      break;
    }
  }
  return results;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function generate() {
  console.log('Generating sitemap...');
  // Fetch products
  const products = await fetchAll('/store/products', 'products');
  // Fetch collections
  const collections = await fetchAll('/store/collections', 'collections');
  // Fetch categories (Medusa uses product-categories endpoint)
  const categories = await fetchAll('/store/product-categories', 'product_categories');

  const urls = new Set();

  // Static pages
  const staticPages = ['/', '/products', '/categories', '/collections', '/about', '/help'];
  staticPages.forEach(p => urls.add(JSON.stringify({ loc: `${SITE_URL}${p}`, lastmod: null, priority: '0.8' })));

  // Products
  products.forEach(p => {
    if (p.handle) {
      urls.add(JSON.stringify({ loc: `${SITE_URL}/products/${p.handle}`, lastmod: formatDate(p.updated_at) || formatDate(p.created_at), priority: '0.8' }));
    } else if (p.id) {
      urls.add(JSON.stringify({ loc: `${SITE_URL}/products/${p.id}`, lastmod: formatDate(p.updated_at) || formatDate(p.created_at), priority: '0.7' }));
    }
  });

  // Collections (use id route)
  collections.forEach(c => {
    if (c.id) {
      urls.add(JSON.stringify({ loc: `${SITE_URL}/collections/${c.id}`, lastmod: formatDate(c.updated_at) || formatDate(c.created_at), priority: '0.6' }));
    }
    if (c.handle) {
      // also add friendly path if used
      urls.add(JSON.stringify({ loc: `${SITE_URL}/collections/${c.handle}`, lastmod: formatDate(c.updated_at) || formatDate(c.created_at), priority: '0.6' }));
    }
  });

  // Categories (use handle)
  categories.forEach(cat => {
    if (cat.handle) {
      urls.add(JSON.stringify({ loc: `${SITE_URL}/categories/${cat.handle}`, lastmod: formatDate(cat.updated_at) || formatDate(cat.created_at), priority: '0.6' }));
    }
  });

  // Build XML
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const footer = `</urlset>`;

  const urlEntries = Array.from(urls).map(entry => {
    const item = typeof entry === 'string' ? JSON.parse(entry) : entry;
    return `  <url>\n    <loc>${item.loc}</loc>${item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : ''}\n    <priority>${item.priority || '0.5'}</priority>\n  </url>`;
  }).join('\n');

  const content = header + urlEntries + '\n' + footer;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  try {
    fs.writeFileSync(outPath, content, 'utf8');
    console.log('Wrote sitemap to', outPath);
  } catch (err) {
    console.error('Failed to write sitemap', err);
    process.exit(1);
  }
}

generate().catch(err => {
  console.error('Sitemap generation failed', err);
  process.exit(1);
});
