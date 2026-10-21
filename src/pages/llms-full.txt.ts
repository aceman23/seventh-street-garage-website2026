import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';
import { SERVICES } from '@/data/services';
import { getCities } from '@/lib/geo';
import { YARDS } from '@/data/cities';
import { HOME_FAQ, RELEASE_FAQ, AUCTION_FAQ } from '@/data/faqs';
import type { Faq } from '@/data/types';

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}

function faqSection(title: string, faqs: Faq[]): string {
  const lines: string[] = [];
  lines.push(`### ${title}`);
  lines.push('');
  for (const f of faqs) {
    lines.push(`**Q: ${f.q}**`);
    lines.push(`A: ${stripHtml(f.a)}`);
    lines.push('');
  }
  return lines.join('\n');
}

function build(): string {
  const lines: string[] = [];

  // --- llms.txt content ---
  lines.push('# Seventh Street Garage');
  lines.push('');
  lines.push(
    `> Seventh Street Garage has provided 24/7 towing, roadside assistance, heavy-duty recovery, impound and secure vehicle storage in Southern California since 1978. We are the LAPD Official Police Garage, Unit 5, a CHP Rotation Tow participant, and dispatch is open 24 hours a day, 365 days a year at ${SITE.phone}.`,
  );
  lines.push('');

  lines.push('## Key facts');
  lines.push('');
  lines.push(`- Phone: ${SITE.phone} (${SITE.tel}) — dispatch 24/7/365`);
  lines.push(`- Wilmington HQ: 1615 E Mauretania St, Wilmington, CA 90744`);
  lines.push(`- Bell Gardens yard: 7535 Scout Ave, Bell Gardens, CA 90201`);
  lines.push(
    `- Vehicle release: office open ${SITE.hours.office}; bring driver's license, proof of ownership (registration or title), and cash or card; registered owner only`,
  );
  lines.push(
    `- Public auction: ${SITE.auction.schedule} at ${SITE.auction.address}, ${SITE.auction.city}, CA ${SITE.auction.zip}; registration ${SITE.auction.registration}, bidding ${SITE.auction.bidding}; ${SITE.auction.payment}`,
  );
  lines.push(`- Agencies: ${SITE.agencies.join('; ')}`);
  lines.push(
    `- Storage: ${SITE.storageCapacity} with perimeter fencing, controlled-access gates, surveillance systems and LED security lighting`,
  );
  lines.push(
    `- Fleet and operator vetting: criminal background checks, drug testing, continuous training, regular truck and facility inspections`,
  );
  lines.push('');

  lines.push('## Services');
  lines.push('');
  for (const s of SERVICES) {
    lines.push(`- [${s.name}](${SITE.url}/services/${s.slug}/): ${s.card}`);
  }
  lines.push('');

  lines.push('## Key pages');
  lines.push('');
  lines.push(`- [Claim your towed vehicle](${SITE.url}/vehicle-release/)`);
  lines.push(`- [Public car auction](${SITE.url}/auction/)`);
  lines.push(`- [About us](${SITE.url}/about/)`);
  lines.push(`- [Contact](${SITE.url}/contact/)`);
  lines.push(`- [FAQ](${SITE.url}/faq/)`);
  lines.push(`- [llms-full.txt](${SITE.url}/llms-full.txt)`);
  lines.push('');

  const cityLinks = getCities().map(
    (c) => `[${c.name}](${SITE.url}/service-areas/${c.slug}/)`,
  );
  lines.push('## Service areas');
  lines.push('');
  lines.push(cityLinks.join(', '));
  lines.push('');

  // --- expanded service details ---
  lines.push('---');
  lines.push('');
  lines.push('# Service details');
  lines.push('');

  for (const s of SERVICES) {
    const url = `${SITE.url}/services/${s.slug}/`;
    lines.push(`## ${s.name}`);
    lines.push('');
    lines.push(`URL: ${url}`);
    lines.push('');
    lines.push(stripHtml(s.intro));
    lines.push('');

    if (s.facts.length > 0) {
      lines.push('**Facts:**');
      lines.push('');
      for (const f of s.facts) {
        lines.push(`- ${f.label}: ${f.value}`);
      }
      lines.push('');
    }

    for (const sec of s.sections) {
      lines.push(`### ${sec.heading}`);
      lines.push('');
      lines.push(stripHtml(sec.html));
      lines.push('');
    }

    if (s.includes.length > 0) {
      lines.push('**Includes:**');
      lines.push('');
      for (const inc of s.includes) {
        lines.push(`- ${inc}`);
      }
      lines.push('');
    }

    if (s.faqs.length > 0) {
      lines.push(faqSection(`${s.name} FAQ`, s.faqs));
    }
  }

  // --- city details ---
  lines.push('---');
  lines.push('');
  lines.push('# Service area details');
  lines.push('');

  const cities = getCities();
  for (const c of cities) {
    const y = YARDS[c.yard];
    const url = `${SITE.url}/service-areas/${c.slug}/`;
    const here = c.slug === 'wilmington' || c.slug === 'bell-gardens';
    const distTxt = here
      ? `Our ${y.name} yard is right here in ${c.name}.`
      : `About ${Math.round(c.yardMiles)} miles (straight line) from our ${y.name} yard at ${y.addr}.`;

    lines.push(`## ${c.name}`);
    lines.push('');
    lines.push(`County: ${c.county} County · Region: ${c.region}`);
    lines.push(`URL: ${url}`);
    lines.push(`Nearest yard: ${y.label} — ${distTxt}`);
    lines.push(
      `Routes: ${c.freeways.map((f) => f.replace(' (nearby)', '')).join(', ')}`,
    );
    lines.push(`Landmarks: ${c.landmarks.join(', ')}`);
    lines.push('');
    lines.push(c.note);
    lines.push('');
  }

  // --- general FAQs ---
  lines.push('---');
  lines.push('');
  lines.push('# Frequently asked questions');
  lines.push('');

  lines.push(faqSection('General', HOME_FAQ));
  lines.push(faqSection('Claiming your vehicle', RELEASE_FAQ));
  lines.push(faqSection('Public auction', AUCTION_FAQ));

  return lines.join('\n');
}

export const GET: APIRoute = () =>
  new Response(build(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
