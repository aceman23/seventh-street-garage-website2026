import type { Video } from './types';

export const SITE = {
  url: 'https://www.seventhstreetgarage.com', // TODO confirm production domain
  name: 'Seventh Street Garage',
  legalName: 'Seventh Street Garage, Inc.',
  phone: '(310) 856-1980',
  tel: '+13108561980',
  founded: '1978', // TODO confirm: main site says 1978, OPG page says 1953
  instagram: 'https://www.instagram.com/7thstreetgarageinc/',
  facebook: '', // TODO paste exact Facebook page URL (hide icon while empty)
  gmaps: 'https://www.google.com/maps/search/?api=1&query=Seventh+Street+Garage+1615+E+Mauretania+St+Wilmington+CA+90744',
  hours: { dispatch: '24 hours a day, 7 days a week, 365 days a year', office: '8am–5pm' },
  auction: {
    address: '701 Sanford Ave', city: 'Wilmington', zip: '90744',
    schedule: 'Every other Monday', registration: '8:30am', bidding: '10:00am', payment: 'Cash only',
  },
  opgUnit: 'LAPD Official Police Garage, Unit 5 (South LA / Harbor area)',
  agencies: [
    'California Highway Patrol (Rotation Tow Program)',
    'Los Angeles Police Department, Harbor Area Division',
    'Port of Los Angeles Police',
    "Los Angeles County Sheriff's Department",
    'Housing Authority of the City of Los Angeles',
    'LADOT (City of Los Angeles Department of Transportation)',
  ],
  storageCapacity: 'about 160 vehicles',
  formEndpoint: '', // e.g. Formspree URL; empty = form tells visitor to call
} as const;

// Fill youtube IDs or mp4 paths when client delivers videos. Empty = "Video coming soon".
export const VIDEOS: Video[] = [
  { title: 'Inside our Wilmington yard', desc: 'A walk through our gated impound and storage facility.', poster: 'wilmington-hq-crop' },
  { title: 'Heavy-duty recovery', desc: 'How our heavy wreckers handle semis and buses.', poster: 'heavy-wrecker-square' },
  { title: 'Claiming your vehicle', desc: 'What to bring and what to expect at the release window.', poster: 'impound-gate' },
];

export const HERO_SLIDES = [
  { img: 'night-tow-truck', alt: 'Seventh Street Garage tow truck with amber light bar at night', kicker: '24/7/365 dispatch', title: 'Out at 2am? So are we.', href: '/services/towing/' },
  { img: 'police-suv-flatbed', alt: 'LAPD police SUV loaded on a Seventh Street Garage flatbed', kicker: 'LAPD OPG Unit 5 · CHP Rotation', title: 'Trusted by public safety agencies', href: '/services/police-impound-towing/' },
  { img: 'heavy-wrecker-square', alt: 'Seventh Street Garage heavy-duty wrecker in Bell Gardens', kicker: 'Heavy duty', title: 'Semis, buses and port rigs', href: '/services/heavy-duty-towing/' },
  { img: 'jump-start', alt: 'Operator jump-starting a car battery', kicker: 'Roadside assistance', title: 'Jump starts, lockouts and flats', href: '/services/roadside-assistance/' },
  { img: 'wilmington-hq-crop', alt: 'Seventh Street Garage headquarters in Wilmington', kicker: 'Secure storage', title: 'About 160 gated, monitored spaces', href: '/services/vehicle-storage/' },
];
