import { SITE } from '@/data/site';
import { YARDS } from '@/data/cities';
import { SERVICES } from '@/data/services';
import { getCities } from '@/lib/geo';
import type { Faq, Service } from '@/data/types';

export const ORG_ID = `${SITE.url}/#organization`;
export const WEB_ID = `${SITE.url}/#website`;
export const locationId = (key: string): string => `${SITE.url}/#location-${key}`;

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export type Node = Record<string, unknown>;
type YardKey = keyof typeof YARDS;

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function baseGraph(): Node[] {
  const cities = getCities();
  const sameAs: string[] = ([SITE.instagram, SITE.facebook] as string[]).filter(
    (v) => v.length > 0,
  );

  const org: Node = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/images/seventh-street-garage-logo.png`,
    telephone: SITE.tel,
    foundingDate: SITE.founded,
    sameAs,
    description: `${SITE.name} is a 24/7 towing, roadside assistance, recovery, impound and secure vehicle storage company, and the ${SITE.opgUnit}.`,
    knowsAbout: SERVICES.map((s) => s.name),
    memberOf: {
      '@type': 'Organization',
      name: 'California Highway Patrol Rotation Tow Program',
    },
    location: (Object.keys(YARDS) as YardKey[]).map((k) => ({
      '@type': 'Place',
      '@id': locationId(k),
    })),
  };

  const web: Node = {
    '@type': 'WebSite',
    '@id': WEB_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': ORG_ID },
  };

  const yards = (Object.keys(YARDS) as YardKey[]).map((k): Node => {
    const y = YARDS[k];
    const served = cities
      .filter((c) => c.yard === k)
      .map((c) => ({ '@type': 'City', name: `${c.name}, CA` }));
    return {
      '@type': 'AutomotiveBusiness',
      '@id': locationId(k),
      additionalType: 'http://www.productontology.org/id/Tow_truck',
      name: `Seventh Street Garage — ${y.label}`,
      parentOrganization: { '@id': ORG_ID },
      telephone: SITE.tel,
      image: `${SITE.url}/images/og-seventh-street-garage.jpg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: y.addr,
        addressLocality: y.city,
        addressRegion: 'CA',
        postalCode: y.zip,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: y.lat,
        longitude: y.lng,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: DAYS,
          opens: '00:00',
          closes: '23:59',
        },
      ],
      areaServed: served,
      hasMap: SITE.gmaps,
      priceRange: 'Call for quote',
    };
  });

  return [org, web, ...yards];
}

export function breadcrumbList(
  items: { name: string; path: string }[],
): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

export function webPage(
  path: string,
  name: string,
  description: string,
  crumbs: { name: string; path: string }[],
  type = 'WebPage',
): Node {
  return {
    '@type': type,
    '@id': `${SITE.url}${path}`,
    url: `${SITE.url}${path}`,
    name,
    description,
    isPartOf: { '@id': WEB_ID },
    publisher: { '@id': ORG_ID },
    breadcrumb: breadcrumbList(crumbs),
    dateModified: BUILD_DATE,
  };
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

export function faqPage(faqs: Faq[], url: string): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE.url}${url}`,
    url: `${SITE.url}${url}`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(f.a),
      },
    })),
  };
}

export function service(s: Service): Node {
  const url = `${SITE.url}/services/${s.slug}/`;
  const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: s.name,
    serviceType: s.group,
    description: stripTags(s.intro),
    url,
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Los Angeles County, CA' },
      { '@type': 'AdministrativeArea', name: 'Orange County, CA' },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      serviceLocation: { '@id': locationId('wilmington') },
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: SITE.tel,
        contactType: 'dispatch',
        hoursAvailable: 'Mo-Su 00:00-23:59',
      },
    },
    image: `${SITE.url}/images/${s.img}.webp`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      itemListElement: s.includes.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item,
        },
      })),
    },
  };
}

export function howTo(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): Node {
  return {
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((st, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: st.name,
      text: st.text,
    })),
  };
}

export function videoObject(opts: {
  name: string;
  description: string;
  thumbnailUrl: string;
  embedUrl?: string;
  contentUrl?: string;
}): Node {
  const node: Node = {
    '@type': 'VideoObject',
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    // TODO: add uploadDate when the video publish date is known
  };
  if (opts.embedUrl) node.embedUrl = opts.embedUrl;
  if (opts.contentUrl) node.contentUrl = opts.contentUrl;
  return node;
}
