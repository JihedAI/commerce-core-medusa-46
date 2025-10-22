import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MEDUSA_API_URL = 'https://api.amine.agency/store';
const PUBLISHABLE_KEY = 'pk_4b2ca5103e173cdd941ec632e69148a9057c7ac2a73a57f5e0d1fe3bea5f764d';
const SITE_URL = 'https://lunette.amine.agency';

async function fetchMedusaData(endpoint) {
  const response = await fetch(`${MEDUSA_API_URL}${endpoint}`, {
    headers: {
      'x-publishable-api-key': PUBLISHABLE_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.error(`Failed to fetch ${endpoint}:`, response.statusText);
    return null;
  }
  
  return response.json();
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  
  try {
    // Fetch all data
    const [productsData, collectionsData, categoriesData] = await Promise.all([
      fetchMedusaData('/products?limit=1000&fields=handle,updated_at'),
      fetchMedusaData('/collections?limit=100&fields=handle,updated_at'),
      fetchMedusaData('/product-categories?limit=100&fields=handle,updated_at')
    ]);

    const products = productsData?.products || [];
    const collections = collectionsData?.collections || [];
    const categories = categoriesData?.product_categories || [];

    console.log(`✅ Found ${products.length} products, ${collections.length} collections, ${categories.length} categories`);

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    sitemap += `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>\n`;

    // Static pages
    const staticPages = [
      { url: '/products', priority: '0.9' },
      { url: '/collections', priority: '0.8' },
      { url: '/categories', priority: '0.8' },
      { url: '/about', priority: '0.7' },
      { url: '/help', priority: '0.6' }
    ];

    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>\n`;
    });

    // Product pages
    products.forEach(product => {
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      sitemap += `  <url>
    <loc>${SITE_URL}/products/${product.handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
    });

    // Collection pages
    collections.forEach(collection => {
      const lastmod = collection.updated_at
        ? new Date(collection.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      sitemap += `  <url>
    <loc>${SITE_URL}/collections/${collection.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
    });

    // Category pages
    categories.forEach(category => {
      const lastmod = category.updated_at
        ? new Date(category.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      sitemap += `  <url>
    <loc>${SITE_URL}/categories/${category.handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
    });

    sitemap += '</urlset>';

    // Write to public folder
    const sitemapPath = join(__dirname, '..', 'public', 'sitemap.xml');
    writeFileSync(sitemapPath, sitemap, 'utf-8');

    console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${products.length + collections.length + categories.length + staticPages.length + 1}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
