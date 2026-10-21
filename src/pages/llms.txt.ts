import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';
import { SERVICES } from '@/data/services';
import { getCities } from '@/lib/geo';

function build(): string {
  const lines: string[] = [];

  lines.push('# Seventh Street Garage');
  lines.push('');
  lines.push(
    `> Seventh Street Garage has provided 24/7 towing, roadside assistance, heavy-duty recovery, impound and secure vehicle storage in Southern California since 1978. We are the LAPD Official Police Garage, Unit 5, a CHP Rotation Tow participant, and dispatch is open 24 hours a day, 365 days a year at ${SITE.phone}.`,
  );
  lines.push('');

  lines.push('## Key facts');
  lines.push('');
  lines.push(`- Phone: ${SITE.phone} (${SITE.tel}) — dispatch 24/7/365`);
  lines.push(`- Wilmington HQ: ${'1615 E Mauretania St, Wilmington, CA 90744'}`);
  lines.push(`- Bell Gardens yard: ${'7535 Scout Ave, Bell Gardens, CA 90201'}`);
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

  lines.push('## Service areas');
  lines.push('');
  const cityLinks = getCities().map(
    (c) => `[${c.name}](${SITE.url}/service-areas/${c.slug}/)`,
  );
  lines.push(cityLinks.join(', '));
  lines.push('');

  return lines.join('\n');
}

export const GET: APIRoute = () =>
  new Response(build(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
