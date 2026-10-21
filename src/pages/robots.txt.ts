import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';

const ALLOWED_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
  'Amazonbot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
];

const body = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /data/',
  '',
  ...ALLOWED_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
  `Sitemap: ${SITE.url}/sitemap-index.xml`,
].join('\n');

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
