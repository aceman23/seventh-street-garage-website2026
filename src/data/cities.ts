import type { Yard, CityInput } from './types';

export const YARDS: Record<'wilmington' | 'bell-gardens', Yard> = {
 "wilmington": {
  "name": "Wilmington",
  "addr": "1615 E Mauretania St",
  "city": "Wilmington",
  "zip": "90744",
  "lat": 33.779,
  "lng": -118.2445,
  "label": "Wilmington HQ & impound yard"
 },
 "bell-gardens": {
  "name": "Bell Gardens",
  "addr": "7535 Scout Ave",
  "city": "Bell Gardens",
  "zip": "90201",
  "lat": 33.966,
  "lng": -118.1545,
  "label": "Bell Gardens yard"
 }
};

export const REGIONS = ["Harbor Area", "South Bay", "Westside", "South LA", "Long Beach area", "Gateway Cities", "San Gabriel Valley", "North Orange County", "Central Orange County", "Inland Empire"] as const;

export const CITIES: CityInput[] = [
 {
  "name": "Wilmington",
  "slug": "wilmington",
  "county": "Los Angeles",
  "region": "Harbor Area",
  "lat": 33.78,
  "lng": -118.262,
  "freeways": [
   "I-110 Harbor Fwy",
   "SR-1 Pacific Coast Hwy",
   "SR-103 Terminal Island Fwy",
   "I-710 (nearby)"
  ],
  "landmarks": [
   "the Port of Los Angeles",
   "Banning Park",
   "Wilmington Waterfront Park"
  ],
  "note": "Our headquarters, impound yard and public auction are all in Wilmington, so local calls are dispatched from right here in the neighborhood."
 },
 {
  "name": "San Pedro",
  "slug": "san-pedro",
  "county": "Los Angeles",
  "region": "Harbor Area",
  "lat": 33.7361,
  "lng": -118.2922,
  "freeways": [
   "I-110 Harbor Fwy",
   "SR-47 Vincent Thomas Bridge",
   "Gaffey St"
  ],
  "landmarks": [
   "Cabrillo Beach",
   "Point Fermin Lighthouse",
   "the West Harbor waterfront"
  ],
  "note": "San Pedro is part of the LAPD Harbor Area, which our Official Police Garage serves, and port truck traffic on Harbor Blvd and the Vincent Thomas Bridge is a daily part of our work."
 },
 {
  "name": "Harbor City",
  "slug": "harbor-city",
  "county": "Los Angeles",
  "region": "Harbor Area",
  "lat": 33.79,
  "lng": -118.298,
  "freeways": [
   "I-110 Harbor Fwy",
   "SR-1 Pacific Coast Hwy",
   "I-405 (nearby)"
  ],
  "landmarks": [
   "Ken Malloy Harbor Regional Park",
   "Kaiser Permanente South Bay Medical Center"
  ],
  "note": "Harbor City sits between our Wilmington yard and the South Bay, along the busy PCH and Normandie Ave commuter routes."
 },
 {
  "name": "Carson",
  "slug": "carson",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8317,
  "lng": -118.2817,
  "freeways": [
   "I-405 San Diego Fwy",
   "I-110 Harbor Fwy",
   "SR-91 Artesia Fwy",
   "I-710 (nearby)"
  ],
  "landmarks": [
   "Dignity Health Sports Park",
   "Cal State Dominguez Hills",
   "SouthBay Pavilion"
  ],
  "note": "Carson's refineries, distribution centers and truck routes keep our heavy-duty wreckers busy, and stadium event days bring extra traffic to the 405 and 110."
 },
 {
  "name": "Long Beach",
  "slug": "long-beach",
  "county": "Los Angeles",
  "region": "Long Beach area",
  "lat": 33.7701,
  "lng": -118.1937,
  "freeways": [
   "I-710 Long Beach Fwy",
   "I-405 San Diego Fwy",
   "I-605 San Gabriel River Fwy",
   "SR-1 Pacific Coast Hwy"
  ],
  "landmarks": [
   "the Port of Long Beach",
   "Long Beach Airport (LGB)",
   "Belmont Shore",
   "the Queen Mary"
  ],
  "note": "We cover all of Long Beach, from Downtown and Belmont Shore to Bixby Knolls and North Long Beach, plus the port terminals and the 710 truck corridor."
 },
 {
  "name": "Signal Hill",
  "slug": "signal-hill",
  "county": "Los Angeles",
  "region": "Long Beach area",
  "lat": 33.8044,
  "lng": -118.1678,
  "freeways": [
   "I-405 San Diego Fwy",
   "SR-1 Pacific Coast Hwy"
  ],
  "landmarks": [
   "Hilltop Park",
   "the Signal Hill auto dealerships"
  ],
  "note": "Signal Hill's steep residential streets are a common place for no-starts and parking-brake failures, where a flatbed is the safer choice."
 },
 {
  "name": "Lakewood",
  "slug": "lakewood",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.8536,
  "lng": -118.134,
  "freeways": [
   "I-605 San Gabriel River Fwy",
   "SR-91 Artesia Fwy",
   "I-405 (nearby)"
  ],
  "landmarks": [
   "Lakewood Center",
   "Mayfair Park"
  ],
  "note": "Lakewood is between our two yards, so trucks can come from Wilmington or Bell Gardens depending on where they are."
 },
 {
  "name": "Compton",
  "slug": "compton",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.8958,
  "lng": -118.2201,
  "freeways": [
   "SR-91 Artesia Fwy",
   "I-710 Long Beach Fwy",
   "I-105 Century Fwy"
  ],
  "landmarks": [
   "Compton/Woodley Airport",
   "Gateway Towne Center"
  ],
  "note": "Compton sits on the Alameda Corridor rail and truck route between the ports and downtown, so we see a lot of commercial truck calls here."
 },
 {
  "name": "Gardena",
  "slug": "gardena",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8884,
  "lng": -118.309,
  "freeways": [
   "I-110 Harbor Fwy",
   "SR-91 Artesia Fwy",
   "I-405 San Diego Fwy"
  ],
  "landmarks": [
   "the Gardena Valley Japanese Cultural Institute",
   "Rowley Park"
  ],
  "note": "Gardena is surrounded by the 110, the 91 and the 405, three freeways where breakdowns and fender-benders are daily events."
 },
 {
  "name": "Torrance",
  "slug": "torrance",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8358,
  "lng": -118.3406,
  "freeways": [
   "I-405 San Diego Fwy",
   "I-110 Harbor Fwy",
   "SR-1 Pacific Coast Hwy",
   "SR-107 Hawthorne Blvd"
  ],
  "landmarks": [
   "Del Amo Fashion Center",
   "Zamperini Field (Torrance Municipal Airport)",
   "Torrance Beach"
  ],
  "note": "Torrance is home to large corporate campuses and industrial parks, and we handle everything from commuter breakdowns to fleet vans."
 },
 {
  "name": "Redondo Beach",
  "slug": "redondo-beach",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8492,
  "lng": -118.3884,
  "freeways": [
   "SR-1 Pacific Coast Hwy",
   "I-405 (nearby)"
  ],
  "landmarks": [
   "the Redondo Beach Pier",
   "King Harbor",
   "Riviera Village"
  ],
  "note": "Beach-area parking structures and tight lots in Redondo often call for a wheel-lift truck or dollies to reach a vehicle."
 },
 {
  "name": "Hermosa Beach",
  "slug": "hermosa-beach",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8622,
  "lng": -118.3995,
  "freeways": [
   "SR-1 Pacific Coast Hwy",
   "Aviation Blvd"
  ],
  "landmarks": [
   "the Hermosa Beach Pier",
   "Pier Plaza"
  ],
  "note": "Hermosa's narrow walk streets and busy weekend parking make careful, low-clearance towing important."
 },
 {
  "name": "Manhattan Beach",
  "slug": "manhattan-beach",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8847,
  "lng": -118.4109,
  "freeways": [
   "SR-1 Sepulveda Blvd",
   "I-405 San Diego Fwy",
   "Rosecrans Ave"
  ],
  "landmarks": [
   "the Manhattan Beach Pier",
   "Manhattan Village"
  ],
  "note": "Many vehicles in Manhattan Beach are AWD, EVs or high-value cars that should only ride on a flatbed."
 },
 {
  "name": "El Segundo",
  "slug": "el-segundo",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.9192,
  "lng": -118.4165,
  "freeways": [
   "I-105 Century Fwy",
   "I-405 San Diego Fwy",
   "SR-1 Sepulveda Blvd"
  ],
  "landmarks": [
   "LAX (next door)",
   "Los Angeles Air Force Base",
   "the El Segundo refinery"
  ],
  "note": "El Segundo's aerospace campuses, refinery traffic and the approach roads to LAX mean steady demand for both light and heavy towing."
 },
 {
  "name": "Hawthorne",
  "slug": "hawthorne",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.9164,
  "lng": -118.3526,
  "freeways": [
   "I-105 Century Fwy",
   "I-405 San Diego Fwy",
   "SR-107 Hawthorne Blvd"
  ],
  "landmarks": [
   "Hawthorne Municipal Airport",
   "the SpaceX headquarters campus"
  ],
  "note": "Hawthorne sits right at the 105/405 interchange, one of the busiest junctions in the South Bay."
 },
 {
  "name": "Lawndale",
  "slug": "lawndale",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.8872,
  "lng": -118.3526,
  "freeways": [
   "I-405 San Diego Fwy",
   "SR-107 Hawthorne Blvd"
  ],
  "landmarks": [
   "the Hawthorne Blvd corridor",
   "Alondra Park (nearby)"
  ],
  "note": "Lawndale's stretch of the 405 and Hawthorne Blvd sees frequent breakdowns during rush hour."
 },
 {
  "name": "Inglewood",
  "slug": "inglewood",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.9617,
  "lng": -118.3531,
  "freeways": [
   "I-405 San Diego Fwy",
   "I-105 Century Fwy"
  ],
  "landmarks": [
   "SoFi Stadium",
   "the Kia Forum",
   "Intuit Dome"
  ],
  "note": "Stadium and arena event days in Inglewood bring heavy traffic and parking enforcement towing to the area."
 },
 {
  "name": "Palos Verdes Peninsula",
  "slug": "palos-verdes",
  "county": "Los Angeles",
  "region": "South Bay",
  "lat": 33.775,
  "lng": -118.385,
  "freeways": [
   "Palos Verdes Dr",
   "SR-107 Hawthorne Blvd",
   "Western Ave"
  ],
  "landmarks": [
   "Point Vicente Lighthouse",
   "Malaga Cove",
   "Terranea"
  ],
  "note": "Steep, winding roads across Palos Verdes Estates, Rancho Palos Verdes and Rolling Hills Estates often call for flatbeds and careful winch-outs."
 },
 {
  "name": "Marina del Rey",
  "slug": "marina-del-rey",
  "county": "Los Angeles",
  "region": "Westside",
  "lat": 33.9803,
  "lng": -118.4517,
  "freeways": [
   "SR-90 Marina Fwy",
   "SR-1 Lincoln Blvd",
   "I-405 (nearby)"
  ],
  "landmarks": [
   "the Marina del Rey harbor",
   "Fisherman's Village"
  ],
  "note": "Low-clearance residential parking garages in Marina del Rey often need wheel-lift trucks or dollies."
 },
 {
  "name": "South Los Angeles",
  "slug": "south-los-angeles",
  "county": "Los Angeles",
  "region": "South LA",
  "lat": 33.9897,
  "lng": -118.2915,
  "freeways": [
   "I-110 Harbor Fwy",
   "I-105 Century Fwy",
   "I-10 (north edge)"
  ],
  "landmarks": [
   "Exposition Park",
   "USC",
   "the Crenshaw corridor"
  ],
  "note": "Seventh Street Garage is the LAPD Official Police Garage for the South LA / Harbor area, and we serve drivers and businesses across South LA."
 },
 {
  "name": "Huntington Park",
  "slug": "huntington-park",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9817,
  "lng": -118.2251,
  "freeways": [
   "I-710 (nearby)",
   "Pacific Blvd",
   "Florence Ave"
  ],
  "landmarks": [
   "the Pacific Blvd shopping district",
   "Salt Lake Park"
  ],
  "note": "Huntington Park is a short run from our Bell Gardens yard along Florence Ave."
 },
 {
  "name": "South Gate",
  "slug": "south-gate",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9547,
  "lng": -118.212,
  "freeways": [
   "I-710 Long Beach Fwy",
   "I-105 Century Fwy"
  ],
  "landmarks": [
   "South Gate Park",
   "the Los Angeles River"
  ],
  "note": "South Gate sits at the 710/105 junction, right next to our Bell Gardens yard."
 },
 {
  "name": "Lynwood",
  "slug": "lynwood",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9303,
  "lng": -118.2115,
  "freeways": [
   "I-105 Century Fwy",
   "I-710 Long Beach Fwy",
   "Long Beach Blvd"
  ],
  "landmarks": [
   "St. Francis Medical Center",
   "Plaza Mexico"
  ],
  "note": "Lynwood is bordered by two major freeways, and the 105/710 interchange is a frequent spot for heavy-truck calls."
 },
 {
  "name": "Commerce",
  "slug": "commerce",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 34.0006,
  "lng": -118.1598,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "I-710 Long Beach Fwy"
  ],
  "landmarks": [
   "Citadel Outlets",
   "the Commerce rail yards"
  ],
  "note": "Commerce's rail yards, warehouses and freight traffic make it one of our most common heavy-duty service areas from Bell Gardens."
 },
 {
  "name": "Bell Gardens",
  "slug": "bell-gardens",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9653,
  "lng": -118.1514,
  "freeways": [
   "I-710 Long Beach Fwy",
   "I-5 Santa Ana Fwy",
   "Florence Ave"
  ],
  "landmarks": [
   "The Bicycle Hotel & Casino",
   "John Anson Ford Park"
  ],
  "note": "Our second yard is at 7535 Scout Ave in Bell Gardens, so local calls are dispatched from inside the city."
 },
 {
  "name": "Downey",
  "slug": "downey",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9401,
  "lng": -118.1332,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "I-605 San Gabriel River Fwy",
   "I-105 Century Fwy"
  ],
  "landmarks": [
   "the Columbia Memorial Space Center",
   "Stonewood Center"
  ],
  "note": "Downey borders Bell Gardens, and our yard there sits a few minutes from the I-5 and I-105."
 },
 {
  "name": "Bellflower",
  "slug": "bellflower",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.8817,
  "lng": -118.117,
  "freeways": [
   "I-105 Century Fwy",
   "SR-91 Artesia Fwy",
   "I-605 (nearby)"
  ],
  "landmarks": [
   "downtown Bellflower on Bellflower Blvd"
  ],
  "note": "Bellflower sits between the 105 and the 91 and is covered from our Bell Gardens yard."
 },
 {
  "name": "Paramount",
  "slug": "paramount",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.8895,
  "lng": -118.1598,
  "freeways": [
   "I-105 Century Fwy",
   "SR-91 Artesia Fwy",
   "I-710 (nearby)"
  ],
  "landmarks": [
   "the Paramount Swap Meet",
   "Paramount Park"
  ],
  "note": "Paramount's industrial corridors and nearby 710 freight traffic generate both light and heavy towing calls."
 },
 {
  "name": "Norwalk",
  "slug": "norwalk",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9022,
  "lng": -118.0817,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "I-105 Century Fwy",
   "I-605 San Gabriel River Fwy"
  ],
  "landmarks": [
   "Norwalk Town Square",
   "the Norwalk/Santa Fe Springs Metrolink station"
  ],
  "note": "Norwalk is where the 5, the 105 and the 605 meet, a junction we cover from Bell Gardens."
 },
 {
  "name": "Santa Fe Springs",
  "slug": "santa-fe-springs",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9472,
  "lng": -118.0853,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "I-605 San Gabriel River Fwy",
   "Telegraph Rd"
  ],
  "landmarks": [
   "Heritage Park",
   "the Santa Fe Springs industrial district"
  ],
  "note": "Santa Fe Springs is a warehouse and distribution hub, so forklift, equipment and box truck moves are common here."
 },
 {
  "name": "Whittier",
  "slug": "whittier",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9792,
  "lng": -118.0328,
  "freeways": [
   "I-605 San Gabriel River Fwy",
   "SR-72 Whittier Blvd",
   "I-5 (nearby)"
  ],
  "landmarks": [
   "Uptown Whittier",
   "Whittier College",
   "Whittier Narrows"
  ],
  "note": "Whittier's hillside neighborhoods and Whittier Blvd commercial strip are covered from our Bell Gardens yard."
 },
 {
  "name": "La Mirada",
  "slug": "la-mirada",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.9172,
  "lng": -118.012,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "Imperial Hwy"
  ],
  "landmarks": [
   "Biola University",
   "the La Mirada Theatre"
  ],
  "note": "La Mirada's stretch of the I-5 near the Orange County line is a frequent spot for freeway calls."
 },
 {
  "name": "Cerritos",
  "slug": "cerritos",
  "county": "Los Angeles",
  "region": "Gateway Cities",
  "lat": 33.8583,
  "lng": -118.0648,
  "freeways": [
   "SR-91 Artesia Fwy",
   "I-605 San Gabriel River Fwy"
  ],
  "landmarks": [
   "the Cerritos Auto Square",
   "Los Cerritos Center",
   "the Cerritos Center for the Performing Arts"
  ],
  "note": "Cerritos Auto Square dealerships and the 91/605 interchange make dealer transfers and freeway tows common here."
 },
 {
  "name": "Hacienda Heights",
  "slug": "hacienda-heights",
  "county": "Los Angeles",
  "region": "San Gabriel Valley",
  "lat": 33.9931,
  "lng": -117.9687,
  "freeways": [
   "SR-60 Pomona Fwy",
   "I-605 (nearby)"
  ],
  "landmarks": [
   "Hsi Lai Temple",
   "the Puente Hills"
  ],
  "note": "Hacienda Heights sits along the 60, one of the region's busiest truck routes."
 },
 {
  "name": "Rowland Heights",
  "slug": "rowland-heights",
  "county": "Los Angeles",
  "region": "San Gabriel Valley",
  "lat": 33.9761,
  "lng": -117.9053,
  "freeways": [
   "SR-60 Pomona Fwy",
   "SR-57 Orange Fwy"
  ],
  "landmarks": [
   "Schabarum Regional Park",
   "the Colima Rd shopping corridor"
  ],
  "note": "Rowland Heights is near the 57/60 interchange, where freight and commuter traffic merge."
 },
 {
  "name": "Diamond Bar",
  "slug": "diamond-bar",
  "county": "Los Angeles",
  "region": "San Gabriel Valley",
  "lat": 34.0286,
  "lng": -117.8103,
  "freeways": [
   "SR-57 Orange Fwy",
   "SR-60 Pomona Fwy"
  ],
  "landmarks": [
   "the 57/60 confluence",
   "the Diamond Bar Center"
  ],
  "note": "Diamond Bar's 57/60 confluence carries some of the heaviest truck traffic in the region, where heavy-duty towing is often needed."
 },
 {
  "name": "La Habra",
  "slug": "la-habra",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.9319,
  "lng": -117.9461,
  "freeways": [
   "SR-39 Beach Blvd",
   "SR-90 Imperial Hwy",
   "Harbor Blvd"
  ],
  "landmarks": [
   "La Habra Marketplace",
   "the Children's Museum at La Habra"
  ],
  "note": "La Habra sits on the LA/Orange County line along Beach Blvd and Imperial Hwy."
 },
 {
  "name": "Buena Park",
  "slug": "buena-park",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.8675,
  "lng": -117.9981,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "SR-91 Artesia Fwy",
   "SR-39 Beach Blvd"
  ],
  "landmarks": [
   "Knott's Berry Farm",
   "Buena Park Downtown"
  ],
  "note": "Buena Park's attractions and the I-5/SR-91 corridor bring constant visitor and commuter traffic."
 },
 {
  "name": "Fullerton",
  "slug": "fullerton",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.8704,
  "lng": -117.9242,
  "freeways": [
   "SR-57 Orange Fwy",
   "SR-91 Riverside Fwy",
   "I-5 (nearby)"
  ],
  "landmarks": [
   "Cal State Fullerton",
   "Fullerton Municipal Airport",
   "the Fullerton Transportation Center"
  ],
  "note": "Fullerton's university traffic and the 57/91 interchange are where many of our north OC calls come from."
 },
 {
  "name": "Anaheim",
  "slug": "anaheim",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.8366,
  "lng": -117.9143,
  "freeways": [
   "I-5 Santa Ana Fwy",
   "SR-57 Orange Fwy",
   "SR-91 Riverside Fwy"
  ],
  "landmarks": [
   "the Disneyland Resort",
   "Angel Stadium",
   "Honda Center"
  ],
  "note": "Anaheim's resort district, stadiums and three major freeways keep visitors and locals on the road around the clock."
 },
 {
  "name": "Yorba Linda",
  "slug": "yorba-linda",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.8886,
  "lng": -117.8131,
  "freeways": [
   "SR-91 Riverside Fwy",
   "SR-90 Imperial Hwy"
  ],
  "landmarks": [
   "the Richard Nixon Presidential Library"
  ],
  "note": "Yorba Linda is the eastern edge of our service area along the 91 corridor."
 },
 {
  "name": "Cypress",
  "slug": "cypress",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.817,
  "lng": -118.0373,
  "freeways": [
   "I-605 San Gabriel River Fwy",
   "SR-91 (nearby)",
   "Katella Ave"
  ],
  "landmarks": [
   "Los Alamitos Race Course",
   "Cypress College"
  ],
  "note": "Cypress borders Los Angeles County along the 605 and is covered from both of our yards."
 },
 {
  "name": "Los Alamitos & Rossmoor",
  "slug": "los-alamitos",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.803,
  "lng": -118.072,
  "freeways": [
   "I-605 San Gabriel River Fwy",
   "I-405 San Diego Fwy"
  ],
  "landmarks": [
   "Joint Forces Training Base Los Alamitos",
   "Rossmoor Village"
  ],
  "note": "Los Alamitos and Rossmoor sit at the 405/605 interchange, just across the county line from Long Beach."
 },
 {
  "name": "Seal Beach",
  "slug": "seal-beach",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.7414,
  "lng": -118.1048,
  "freeways": [
   "I-405 San Diego Fwy",
   "SR-1 Pacific Coast Hwy",
   "SR-22 (nearby)"
  ],
  "landmarks": [
   "the Seal Beach Pier",
   "Main Street",
   "Naval Weapons Station Seal Beach"
  ],
  "note": "Seal Beach is just over the San Gabriel River from Long Beach on PCH."
 },
 {
  "name": "Stanton",
  "slug": "stanton",
  "county": "Orange",
  "region": "North Orange County",
  "lat": 33.8025,
  "lng": -117.9931,
  "freeways": [
   "SR-22 Garden Grove Fwy",
   "SR-39 Beach Blvd",
   "Katella Ave"
  ],
  "landmarks": [
   "the Beach Blvd and Katella Ave corridors"
  ],
  "note": "Stanton's Beach Blvd commercial corridor is a steady source of breakdown and parking calls."
 },
 {
  "name": "Garden Grove",
  "slug": "garden-grove",
  "county": "Orange",
  "region": "Central Orange County",
  "lat": 33.7743,
  "lng": -117.938,
  "freeways": [
   "SR-22 Garden Grove Fwy",
   "I-5 (nearby)",
   "I-405 (nearby)"
  ],
  "landmarks": [
   "Christ Cathedral",
   "Historic Main Street"
  ],
  "note": "Garden Grove sits along the 22, a key east-west route across central Orange County."
 },
 {
  "name": "Westminster & Midway City",
  "slug": "westminster",
  "county": "Orange",
  "region": "Central Orange County",
  "lat": 33.7592,
  "lng": -118.0067,
  "freeways": [
   "I-405 San Diego Fwy",
   "SR-22 Garden Grove Fwy",
   "SR-39 Beach Blvd"
  ],
  "landmarks": [
   "Little Saigon",
   "Westminster Mall"
  ],
  "note": "Westminster and Midway City sit where the 405 and 22 split, a busy junction we cover regularly."
 },
 {
  "name": "Huntington Beach",
  "slug": "huntington-beach",
  "county": "Orange",
  "region": "Central Orange County",
  "lat": 33.6603,
  "lng": -117.9992,
  "freeways": [
   "I-405 San Diego Fwy",
   "SR-1 Pacific Coast Hwy",
   "SR-39 Beach Blvd"
  ],
  "landmarks": [
   "the Huntington Beach Pier",
   "Bolsa Chica Ecological Reserve"
  ],
  "note": "Huntington Beach's PCH and Beach Blvd traffic, beach lots and summer crowds make for a busy towing season."
 },
 {
  "name": "Fountain Valley",
  "slug": "fountain-valley",
  "county": "Orange",
  "region": "Central Orange County",
  "lat": 33.7092,
  "lng": -117.9536,
  "freeways": [
   "I-405 San Diego Fwy",
   "Brookhurst St"
  ],
  "landmarks": [
   "Mile Square Regional Park"
  ],
  "note": "Fountain Valley's stretch of the 405 is one of the most congested parts of the freeway in Orange County."
 },
 {
  "name": "Chino Hills",
  "slug": "chino-hills",
  "county": "San Bernardino",
  "region": "Inland Empire",
  "lat": 33.9898,
  "lng": -117.7326,
  "freeways": [
   "SR-71 Chino Valley Fwy",
   "SR-142 Carbon Canyon Rd",
   "SR-60 (nearby)"
  ],
  "landmarks": [
   "Chino Hills State Park",
   "The Shoppes at Chino Hills"
  ],
  "note": "Chino Hills is the far northeast corner of our coverage, reached via the 60 and the 57/71."
 }
];
