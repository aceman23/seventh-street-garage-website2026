export interface Faq { q: string; a: string } // `a` may contain simple inline HTML links
export interface Fact { label: string; value: string }
export interface ServiceSection { heading: string; html: string }
export type ServiceGroup = 'Towing' | 'Roadside' | 'Hauling' | 'Property' | 'Agency' | 'Storage';
export interface Service {
  slug: string; group: ServiceGroup; name: string;
  card: string;      // one-line blurb for cards / mega menu
  title: string;     // <title> (brand suffix added by Seo component when it fits in ~66 chars)
  desc: string;      // meta description (<=160 chars)
  eyebrow: string; h1: string;
  img: string;       // basename in /public/images (no extension)
  img_alt: string;
  intro: string;     // answer-first paragraph, inline HTML allowed
  facts: Fact[]; sections: ServiceSection[]; includes: string[]; faqs: Faq[];
  related: string[]; children: string[]; wide: boolean; hasForm: boolean;
}
export interface Yard { name: string; addr: string; city: string; zip: string; lat: number; lng: number; label: string }
export interface CityInput {
  name: string; slug: string; county: 'Los Angeles' | 'Orange' | 'San Bernardino' | string;
  region: string; lat: number; lng: number;
  freeways: string[]; landmarks: string[]; note: string;
}
export interface City extends CityInput { yard: 'wilmington' | 'bell-gardens'; yardMiles: number; nearby: string[] }
export interface Video { title: string; desc: string; poster: string; youtube?: string; mp4?: string }
