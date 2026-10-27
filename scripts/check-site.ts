import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const SITE_URL = 'https://www.7thstreetgarage.com';

interface PageResult {
  file: string;
  url: string;
  title: string;
  h1Count: number;
  description: string;
  hasCanonical: boolean;
  jsonLdValid: boolean;
  jsonLdError?: string;
  brokenLinks: string[];
  brokenImgs: string[];
}

function listHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listHtmlFiles(full));
    } else if (entry === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractDescription(html: string): string {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? m[1] : '';
}

function extractH1Count(html: string): number {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

function hasCanonical(html: string): boolean {
  return /<link\s+rel="canonical"/i.test(html);
}

function parseJsonLd(html: string): { valid: boolean; error?: string } {
  const blocks = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const content = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    try {
      JSON.parse(content);
    } catch (e: unknown) {
      return { valid: false, error: e instanceof Error ? e.message : 'parse error' };
    }
  }
  return { valid: true };
}

function extractInternalLinks(html: string): string[] {
  const links: string[] = [];
  const re = /href="(\/[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    links.push(m[1]);
  }
  return [...new Set(links)];
}

function extractImgSrcs(html: string): string[] {
  const srcs: string[] = [];
  const re = /src="(\/[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    srcs.push(m[1]);
  }
  return [...new Set(srcs)];
}

function pathExistsInDist(href: string): boolean {
  // strip query/hash
  let clean = href.split('#')[0].split('?')[0];
  if (clean.endsWith('/')) clean = clean + 'index.html';
  else if (!clean.endsWith('.html')) {
    // could be /foo/ or /foo
    if (existsSync(join(DIST, clean, 'index.html'))) return true;
    if (existsSync(join(DIST, clean + '/index.html'))) return true;
    return existsSync(join(DIST, clean));
  }
  return existsSync(join(DIST, clean));
}

// Main
const files = listHtmlFiles(DIST);
const errors: string[] = [];
const warnings: string[] = [];
const titles = new Map<string, string[]>();

for (const file of files) {
  const html = readFileSync(file, 'utf-8');
  const rel = file.replace(DIST, '').replace(/index\.html$/, '');
  const url = rel === '' ? '/' : rel;

  const title = extractTitle(html);
  const desc = extractDescription(html);
  const h1c = extractH1Count(html);
  const canonical = hasCanonical(html);
  const jsonLd = parseJsonLd(html);

  // Title checks
  if (!title) {
    errors.push(`${url}: missing <title>`);
  } else {
    if (title.length > 70) {
      errors.push(`${url}: title over 70 chars (${title.length}): "${title}"`);
    }
    const existing = titles.get(title) || [];
    existing.push(url);
    titles.set(title, existing);
  }

  // Description checks
  if (!desc) {
    errors.push(`${url}: missing meta description`);
  } else if (desc.length > 160) {
    errors.push(`${url}: description over 160 chars (${desc.length})`);
  }

  // H1 check
  if (h1c !== 1) {
    errors.push(`${url}: expected exactly 1 <h1>, found ${h1c}`);
  }

  // Canonical
  if (!canonical) {
    errors.push(`${url}: missing canonical link`);
  }

  // JSON-LD
  if (!jsonLd.valid) {
    errors.push(`${url}: invalid JSON-LD: ${jsonLd.error}`);
  }

  // Broken internal links
  for (const link of extractInternalLinks(html)) {
    if (!pathExistsInDist(link)) {
      errors.push(`${url}: broken internal link: ${link}`);
    }
  }

  // Broken image srcs
  for (const src of extractImgSrcs(html)) {
    if (!pathExistsInDist(src)) {
      errors.push(`${url}: broken img src: ${src}`);
    }
  }

  // Check for AggregateRating / Review schema
  if (jsonLd.valid && /"AggregateRating"|"Review"/i.test(html)) {
    errors.push(`${url}: found AggregateRating or Review in JSON-LD (should not be present)`);
  }
}

// Duplicate titles
for (const [title, urls] of titles) {
  if (urls.length > 1) {
    errors.push(`Duplicate title "${title}" on: ${urls.join(', ')}`);
  }
}

// Check robots.txt and llms.txt exist
for (const f of ['robots.txt', 'llms.txt', 'llms-full.txt']) {
  if (!existsSync(join(DIST, f))) {
    errors.push(`Missing ${f} in dist/`);
  }
}

// Check sitemap excludes 404
const sitemapPath = join(DIST, 'sitemap-0.xml');
if (existsSync(sitemapPath)) {
  const sm = readFileSync(sitemapPath, 'utf-8');
  if (/404/.test(sm)) {
    errors.push('Sitemap contains 404 page (should be excluded)');
  }
} else {
  warnings.push('sitemap-0.xml not found in dist/');
}

console.log(`Checked ${files.length} HTML pages in dist/\n`);

if (warnings.length > 0) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
} else {
  console.log('All checks passed.');
  process.exit(0);
}
