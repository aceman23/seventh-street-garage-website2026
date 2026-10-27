# Seventh Street Garage — Bolt.new build prompts (Astro + TypeScript)

Build the full 73-page site in bolt.new as an **Astro 5 + TypeScript (strict)** static site. Astro is used because it ships zero-JS HTML by default, which is the best base for SEO and AI-search visibility, and Bolt supports it natively.

All the content (14 services, 50 cities, FAQs), the design system CSS and the images are already in this starter kit. Bolt's job is to build the components, pages and SEO wiring around that content, not to write copy.

---

## Before you start (5 minutes)

**Option A (recommended): open the kit from GitHub**
1. Create a new GitHub repo and push the contents of this kit folder (everything next to this file).
2. In your browser, open `https://bolt.new/~/github.com/<your-user>/<your-repo>`. Bolt imports the repo with the data, CSS and images already in place.
3. Paste the prompts below **one at a time, in order**. Wait for each to finish and the preview to load before sending the next.

**Option B: start from a blank Bolt project**
1. Start a new project in bolt.new and paste **Prompt 0**.
2. In Bolt's file tree, create each file from the kit and paste its contents: `src/data/types.ts`, `site.ts`, `services.ts`, `cities.ts`, `faqs.ts`, and `src/styles/global.css`.
3. Upload the images from `public/images/` (and `public/images/auction/`) into the same folders in Bolt.
4. Continue with Prompt 1.

**Tips**
- One prompt per message. If Bolt stops partway through, reply `continue from where you stopped; don't redo finished files`.
- If Bolt starts rewriting the data files or inventing content, reply: `Revert changes to src/data/*. Those files are the source of truth and must not be edited.`
- Use Bolt's **Discuss** mode to ask questions without spending build tokens.

---

## Prompt 0 — Only if you used Option B (blank project)

```text
Create an Astro 5 project with TypeScript in strict mode. Static output only (no SSR adapter). Install @astrojs/sitemap and @astrojs/check. Set the following in astro.config.mjs:
site: 'https://www.7thstreetgarage.com', trailingSlash: 'always', output: 'static', build.format: 'directory', and the sitemap integration filtered to exclude /404.
Add a tsconfig path alias "@/*" -> "src/*". Do not add Tailwind, React or any UI framework. Create an empty src/data folder and src/styles folder; I will paste data files and CSS next. Stop after scaffolding.
```

---

## Prompt 1 — Foundation: rules, layout, header, footer, SEO plumbing

```text
You are building the production website for Seventh Street Garage, a towing, roadside assistance, recovery, impound and secure vehicle storage company in Southern California (LAPD Official Police Garage Unit 5, CHP Rotation Tow Program participant). Stack: Astro 5, TypeScript strict, static output, plain CSS. No Tailwind, no React, no UI libraries.

GROUND RULES (apply to every prompt that follows):
1. src/data/*.ts is the single source of truth for all copy, facts, cities and FAQs. Never edit those files and never invent copy, prices, response times, ratings, reviews, testimonials, awards or statistics. If something is missing, leave a clearly marked TODO comment.
2. src/styles/global.css is the complete design system. Import it once in the base layout and use its existing class names (listed below). Add new CSS only in component <style> blocks or at the end of global.css, using the existing CSS variables (--ink, --navy, --amber, --concrete, --paper, --muted, --mist, --line, --display, --body, --mono, --step-*). Do not change existing tokens.
3. Exactly one <h1> per page. Semantic HTML (header, nav, main, section with aria-labelledby, article, aside, footer, address, details/summary for FAQ).
4. All internal links use trailing-slash URLs (/services/towing/). No client-side routing.
5. Images live in /public/images as .webp. Many have a smaller "-480" variant (police-suv-flatbed, jump-start, impound-gate, night-tow-truck, wilmington-hq-crop) or a "-960"/"-720"/"-800" variant (wilmington-hq-960, heavy-wrecker-bell-gardens-960, heavy-wrecker-crop-720, service-area-map-800). Build an <Img> component that outputs width/height attributes, srcset when a variant exists, loading="lazy" decoding="async" by default, and fetchpriority="high" loading="eager" when an `eager` prop is set. Intrinsic sizes: square photos 720x720; wilmington-hq 1920x720; heavy-wrecker-bell-gardens 1861x476; heavy-wrecker-crop 1429x476; heavy-wrecker-square 476x476; light-duty-tow-truck 312x160; service-area-map 1292x621; auction/* 480x480; opg-unit-5-badge 225x226.
6. Phone number everywhere comes from SITE.phone / SITE.tel. Every page has at least two tel: call-to-actions.

BUILD NOW:

A) src/lib/geo.ts
- haversineMiles(lat1, lng1, lat2, lng2): number
- getCities(): City[], which enriches each CITIES entry with: yard (the nearest key of YARDS), yardMiles (straight-line distance to that yard), and nearby (slugs of the 5 closest other cities). Memoize it.
- getCity(slug) and citiesByRegion() (ordered by REGIONS).

B) src/lib/schema.ts (typed JSON-LD builders; return plain objects)
- ORG_ID = `${SITE.url}/#organization`, WEB_ID = `${SITE.url}/#website`, locationId(key) = `${SITE.url}/#location-${key}`
- baseGraph(): Organization (name, legalName, url, logo /images/seventh-street-garage-logo.png, telephone, foundingDate, sameAs [instagram, facebook if set], description, knowsAbout, memberOf "California Highway Patrol Rotation Tow Program", location refs) + WebSite + one AutomotiveBusiness per yard (additionalType "http://www.productontology.org/id/Tow_truck", name "Seventh Street Garage — {yard name}", parentOrganization, telephone, image og image, PostalAddress, GeoCoordinates, openingHoursSpecification Mon–Sun 00:00–23:59, areaServed = the cities whose nearest yard is this yard as {"@type":"City","name":"X, CA"}, hasMap, priceRange "Call for quote").
- webPage(path, name, description, crumbs, type = 'WebPage') with BreadcrumbList inside, dateModified = build date.
- breadcrumbList(items), faqPage(faqs, url) (strip HTML from answers), service(...) and howTo(...).
- NEVER output AggregateRating or Review schema.

C) src/components/Seo.astro
Props: title, description, path, ogImage? (default /images/og-seventh-street-garage.jpg), noindex?, graph (array of JSON-LD nodes).
- <title>: append " | Seventh Street Garage" only when the title doesn't already contain the brand and the result stays <= 66 characters.
- meta description, canonical (SITE.url + path), robots "index, follow, max-image-preview:large, max-snippet:-1" (or "noindex, follow"), theme-color #0A1020, Open Graph (type website, site_name, locale en_US, title, description, url, absolute image, 1200x630) and Twitter summary_large_image, geo.region US-CA, geo.position 33.7790;-118.2445, ICBM.
- <link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt">, favicon.svg, site.webmanifest.
- Preconnect + stylesheet for Google Fonts:
  https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,100..125,600..900;1,100..125,600..900&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap
- One <script type="application/ld+json"> containing {"@context":"https://schema.org","@graph":[...]} built from baseGraph() + the page's graph.

D) src/layouts/Base.astro
Props: title, description, path, graph, active? ('areas'|'release'|'auction'|'about'|'contact'), noindex?
Order: Seo in head; body contains: skip link (.skip -> #main), Strip, Header, <main id="main"><slot/></main>, CtaBand, Footer, DispatchBar, then <script> importing src/scripts/site.ts.

E) Components (match the markup/classes in global.css exactly):
- Strip.astro: .strip > .wrap > ul with "<span class=dot> Dispatch open 24/7/365", "LAPD Official Police Garage · Unit 5" (class hide-sm), "CHP Rotation Tow Program" (hide-sm), plus a tel link on the right.
- Header.astro: .site-header > .wrap: .brand wordmark (.brand-lines with three <i>, .brand-text with <b>SEVENTH</b><span>Street Garage</span>); .menu-toggle button (aria-controls="site-nav", aria-expanded); nav#site-nav.nav > ul with: "Services" (li.has-menu > button.nav-trigger with aria-expanded + div.mega listing the 8 PRIMARY_SERVICES as <a>{name}<small>{card}</small></a>, plus a.mega-all "All services & roadside →" to /services/), Service Areas, Claim Your Vehicle (/vehicle-release/), Auction, About, Contact; then a.btn.btn-amber.header-cta tel link with a phone icon. Mark the active item with aria-current="page".
- Footer.astro: .site-footer with .foot-grid of 4 columns: brand + one-line description + big phone + "Dispatch 24 hrs · 7 days · 365 days" + Instagram/Facebook icon links (hide Facebook if empty); "Services" (first 10 services); "Popular areas" (Towing in Wilmington, San Pedro, Long Beach, Carson, Torrance, Compton, Bell Gardens, Downey, Anaheim, Huntington Beach + "All service areas →"); "Yards" with both <address> blocks and an "Office" block (Vehicle release 8am–5pm, links to /vehicle-release/, /auction/, /faq/). .foot-bottom with © year, legal name, "LAPD Official Police Garage Unit 5", and Privacy · Sitemap (/sitemap-index.xml) links.
- CtaBand.astro: section.cta-band: eyebrow "Stuck right now?", h2 "Call 24/7 dispatch", big phone link, .btn.btn-navy "Call for a tow".
- DispatchBar.astro: fixed .dispatch-bar (shown under 760px by CSS): "Call dispatch" (amber, tel) + "Request tow" (ghost, /contact/#request).
- Icon.astro: inline SVG icons: phone, arrow, left, right, down, play, instagram, facebook, pin (stroke = currentColor, aria-hidden).
- Shared building blocks for later prompts: Breadcrumbs.astro (nav.crumbs > ol, last item aria-current="page"); PageHero.astro (section.page-hero.speed > .wrap > Breadcrumbs + .page-hero-grid [solo when no image]: eyebrow p.eyebrow, h1 (set:html), p.lead (set:html), .btn-row with "Call {phone}" amber + "Request service" ghost to /contact/#request, optional .frame image [classes wide/lowres]; the image is eager); Glance.astro (dl.glance with dt/dd); FaqList.astro (div.faq of <details><summary>; answer rendered with set:html inside div.a > p; prop openFirst); CallCard.astro (.call-card with "Dispatch is open", phone, the 24/7 line, Call now button); SideList.astro (.side-list with h2 + ul of links); ServiceCard.astro (a.svc-card > .ph img + .body: span.tagline eyebrow, h3 name, p card, span.go "View service →").

F) src/scripts/site.ts
Port reference/legacy-main.js to typed TypeScript modules (keep behaviour identical): mobile nav toggle (locks body scroll), mega-menu toggle + Escape closes, hero carousel ([data-carousel]: scroll-snap track, generated progress dots with aria-current, prev/next, autoplay by data-interval, pause on hover/focus, respects prefers-reduced-motion, arrow keys, syncs on manual swipe, non-active slide links tabindex -1), Google reviews loader, video click-to-load facade, forms with data-endpoint, footer year. Strict types, no `any`.

G) Temporary src/pages/index.astro using Base with an h1 so the preview renders. Make sure `npm run build` (astro check && astro build) passes with zero type errors.
```

---

## Prompt 2 — Home page

```text
Replace src/pages/index.astro with the full home page using Base (path "/", title "Seventh Street Garage | 24/7 Towing & Roadside, Los Angeles", description "24/7 towing, roadside assistance, heavy-duty recovery, impound and storage in LA & Orange County since 1978. LAPD OPG Unit 5. Call (310) 856-1980."). Page graph = webPage("/") + faqPage(HOME_FAQ). Sections in this exact order, using the global.css classes named:

1. HERO — section.hero.speed > .wrap.hero-grid
   Left: p.eyebrow "Serving Southern California since {SITE.founded}"; h1 "24/7 towing & roadside <em>in LA & Orange County</em>"; p.lead "Light-, medium- and heavy-duty towing, roadside assistance, accident recovery, impound and secure storage. Dispatched around the clock from Wilmington and Bell Gardens by the team that public safety agencies call."; .btn-row: "Call dispatch" (amber tel) + "Claim your vehicle" (ghost, /vehicle-release/); .hero-phone: a.num phone + span.tag "24 hrs · 7 days · 365".
   Right: Carousel.astro built from HERO_SLIDES: div.carousel[data-carousel][data-interval=6000][aria-roledescription=carousel] > div.car-track[tabindex=0] > figure.slide per slide (img + figcaption > a > span.kicker + span.s-title); first image eager; then div.car-ui with button.car-btn[data-prev], div.car-dots, button.car-btn[data-next].

2. TRUST — section.trust: OPG badge image (/images/opg-unit-5-badge.webp, alt "Los Angeles Official Police Garage Unit 5 badge"), span.label "Trusted by", ul: California Highway Patrol / LAPD Harbor Area Division / Port of Los Angeles Police / LA County Sheriff's Dept. Text only. Do not use agency logos.

3. STATS — section.band.band-white.band-tight > .stats with 4 .stat: "1978" / "Towing in Southern California for nearly 50 years"; "24/7" / "Dispatch staffed every hour, 365 days a year"; "~160" / "Vehicles in our gated, monitored storage yard"; "2" / "Yards: Wilmington HQ and Bell Gardens".

4. SERVICES — section.band.band-concrete#services: .section-head.split (eyebrow "What we do", h2 "Towing, recovery and storage under one roof", p.muted "From a dead battery in a Torrance parking lot to a jackknifed trailer on the 710, we send the right truck and a California-licensed operator who has done it before."); .svc-grid of ServiceCard for PRIMARY_SERVICES; then eyebrow "More services" and .chips linking jump-starts, lockout-service, tire-changes, fuel-delivery, motorcycle-towing, long-distance-towing.

5. PROCESS — section.band.band-dark.speed: eyebrow "What happens when you call", h2 "From your call to a hook-up", ol.steps with 4 li (h3 + p): "Call dispatch" / "A live dispatcher answers at (310) 856-1980, day or night."; "Tell us where and what" / "Your exact location, the vehicle and what happened, so we send the right truck."; "Truck dispatched" / "The closest available operator heads out from Wilmington or Bell Gardens with an estimated arrival time."; "Delivered or stored" / "We take the vehicle where you need it, or to our secure yard until you're ready."

6. PORT / HEAVY DUTY — section.band.band-white > .wrap.split: left .frame (aspect-ratio 16/10) with heavy-wrecker-crop image + span.badge "Heavy duty · Class 6–8"; right: eyebrow "Port corridor specialists", h2 "Next door to the busiest ports in America", p.lead.muted "Our Wilmington yard sits between the Port of Los Angeles and the Port of Long Beach. When a drayage tractor, chassis or loaded trailer goes down on the 710, the 110 or the Terminal Island Freeway, we're already close.", ul.ticks (Semi and tractor-trailer towing; Bus, motor coach and RV towing; Equipment and container hauling; Fleet accounts for trucking companies), .btn.btn-navy "Heavy-duty towing →" to /services/heavy-duty-towing/.

7. SERVICE AREA — section.band.band-concrete#service-area: .section-head.split (eyebrow "Service area", h2 "From the Harbor to the 57/60", p.muted "We cover {count} cities and communities across Los Angeles County, northern Orange County and Chino Hills. Pick your city for local details."). Then a reusable ServiceArea.astro: .area-grid with figure.map-frame (service-area-map image + figcaption "Coverage from the coast to Chino Hills" + "Open in Google Maps" link to SITE.gmaps) and a right column with one .region per REGIONS entry (h3 region name + .city-links of every city in it linking to /service-areas/{slug}/) and .yards with two .yard cards (span.k label + address).

8. VIDEOS — section.band.band-dark#videos: .section-head.split (eyebrow "On the job", h2 "See the crew at work", p.muted with a link to Instagram @7thstreetgarageinc). .video-grid with one div.v per VIDEOS item: data-youtube / data-mp4 attributes, poster image, and a button (aria-label "Play video: {title}") containing span.play (play icon), span.soon "Video coming soon" when there's no source (button disabled), span.vt title, span desc. When a video has a youtube ID or mp4, also add a VideoObject node to the page graph (name, description, thumbnailUrl, embedUrl/contentUrl). Leave uploadDate as a TODO if it's unknown; never invent one.

9. GOOGLE REVIEWS — section.band.band-white#reviews: .reviews-head with eyebrow "Google reviews", h2 "What drivers say about us", and a.g-badge "Read all reviews on Google" (SITE.gmaps). div.reviews[data-reviews][data-min=4][data-max=6] pre-filled with 3 skeleton cards (article.review.skeleton aria-hidden). p.reviews-note[data-reviews-placeholder] "Live Google reviews will appear here once the Google Places connection is set up." and p.reviews-note[data-reviews-note][hidden] "Showing recent 4- and 5-star reviews from Google. See all reviews on Google." (link). The client script fetches /data/reviews.json, keeps ONLY rating >= 4, sorts by newest, renders up to 6 cards (stars, quote truncated at 360 chars, author avatar/initial, "relative time · Google"), then shows the note and hides the placeholder. Never hard-code review text.

10. FAQ — section.band.band-concrete#faq: .section-head.split (eyebrow "FAQ", h2 "Common questions", p.muted with a link to /faq/), FaqList of HOME_FAQ with openFirst.

Then create public/data/reviews.json = {"source":"Google Places API","updated":null,"placeUrl":"<SITE.gmaps>","reviews":[]}.
Check the page at 390px and 1440px widths with no horizontal scroll.
```

---

## Prompt 3 — Service pages

```text
Build the services section from SERVICES in src/data/services.ts.

1) src/pages/services/index.astro (path /services/, title "Towing & Roadside Services in Los Angeles", description "24/7 car towing, heavy-duty towing, equipment hauling, roadside assistance, accident recovery, private property towing, impound and storage in LA & OC.")
- PageHero (no image): eyebrow "Services", h1 "Towing & roadside services", lead "Every service is dispatched 24/7 from our Wilmington and Bell Gardens yards. Call (310) 856-1980 or choose a service below."
- section.band.band-concrete: group services by `group` in this order with these labels: Towing → "Towing & recovery", Roadside → "Roadside assistance", Hauling → "Equipment hauling", Property → "Property owners", Agency → "Public agencies", Storage → "Storage". Each group: p.eyebrow label + .svc-grid of ServiceCard.
- graph: webPage(type CollectionPage) + ItemList of all service URLs.

2) src/pages/services/[slug].astro with getStaticPaths over SERVICES (14 pages). Use service.title and service.desc for SEO. Layout:
- PageHero: crumbs Home / Services / {name}; eyebrow; h1; lead = intro (set:html); image = service.img (add class "wide" when service.wide, "lowres" when img is light-duty-tow-truck).
- section.band.band-concrete > .wrap: Glance(facts); then .article-grid.mt-2:
  - article.article.prose (max-width none): each section as h2 + set:html; if service.children has items, add h2 "Roadside services" and a 2-column .svc-grid of those child ServiceCards; div.includes with h2 "What's included" and ul.ticks.cols-2 of includes; if service.hasForm render PrivatePropertyForm (below); h2#faq "{name} FAQ" + FaqList(faqs, openFirst).
  - aside.sidebar: CallCard; SideList "Related services" (service.related); SideList "Popular service areas" (wilmington, san-pedro, long-beach, carson, torrance, compton, downey, anaheim + "All 50 areas →").
- graph: webPage + Service node {"@id": url#service, name, serviceType, description (intro without HTML), url, provider ORG_ID, areaServed Los Angeles County + Orange County (AdministrativeArea), availableChannel ServiceChannel with ContactPoint tel/dispatch/hoursAvailable "Mo-Su 00:00-23:59", image, hasOfferCatalog listing includes as Offer>Service} + faqPage.

3) src/components/PrivatePropertyForm.astro: h2#request "Contact our private property towing manager"; form.form[data-form][data-endpoint={SITE.formEndpoint}][novalidate] with fields Name*, Company/property, Email*, Phone*, Property address*, Property type (select: Apartment / condo, HOA, Shopping center / retail, Office, Industrial / warehouse, School / campus, Other), Details textarea, hidden form=private-property, amber submit "Send to property towing manager", p.status[role=status][hidden], p.fine "For a vehicle that needs removing right now, call (310) 856-1980." Every input has an id and a <label>, plus proper autocomplete attributes.

Service intros and sections contain inline HTML links, so render them with set:html. Do not rewrite any copy.
```

---

## Prompt 4 — 50 city pages (local SEO)

```text
Build the service-area section from CITIES/YARDS via src/lib/geo.ts.

1) src/pages/service-areas/index.astro (path /service-areas/, title "Towing Service Areas | LA & Orange County", description "24/7 towing and roadside assistance in 50 cities across LA County, Orange County and Chino Hills, from yards in Wilmington and Bell Gardens.")
PageHero (no image): eyebrow "Service areas", h1 "Towing service areas", lead "We dispatch from two yards: our Wilmington headquarters near the Port of Los Angeles and our Bell Gardens yard by the I-5 and I-710. Pick your city below for local details, or call (310) 856-1980." Then section.band.band-concrete with the ServiceArea component. graph: CollectionPage + ItemList of city URLs.

2) src/pages/service-areas/[slug].astro with getStaticPaths over getCities(). For each city: short = the name before " & " (e.g. "Los Alamitos & Rossmoor" → "Los Alamitos"); y = YARDS[city.yard]; mi = Math.round(city.yardMiles); here = slug is "wilmington" or "bell-gardens"; distTxt = here ? `Our ${y.name} yard is right here in ${name}.` : `${name} is about ${mi} miles (straight line) from our ${y.name} yard at ${y.addr}.`; joinList() = "a, b and c"; fwNames = the freeways with " (nearby)" removed.
- title `${short} Towing & Roadside Assistance 24/7`; description `24/7 towing, roadside help and heavy-duty recovery in ${name}, CA, dispatched from our ${y.name} yard. Call (310) 856-1980.`
- PageHero: crumbs Home / Service Areas / {name}; eyebrow `${county} County · ${region}`; h1 `Towing & roadside assistance in ${name}, CA`; lead `Seventh Street Garage provides 24/7 towing, roadside assistance and heavy-duty recovery in ${name}. ${distTxt} Call (310) 856-1980 and a live dispatcher will send the nearest truck.`; image rotates by index through [night-tow-truck, police-suv-flatbed, jump-start, heavy-wrecker-square, impound-gate, wilmington-hq-crop].
- Glance: Nearest yard = y.label; Distance = here ? "In the city" : `About ${mi} mi (straight line)`; Main routes = the first token of the first 3 freeways (e.g. "I-110, SR-1, SR-103"); Dispatch = "24/7/365 · (310) 856-1980".
- article (.article.prose, max-width none):
  h2 `Towing and roadside help in ${name}` + p `${note} Whether you're near ${joinList(landmarks)}, broken down on the ${joinList(fwNames)}, or stuck in a driveway or parking lot, our California-licensed operators bring the right truck: a flatbed for AWD, EV and high-value vehicles, a wheel-lift for tight parking, or a heavy wrecker for trucks and buses.` + p `Seventh Street Garage has towed in Southern California since 1978. We are the LAPD Official Police Garage for the South LA / Harbor area and a CHP Rotation Tow participant, and every ${short} customer gets the same crews and standards.`
  h2 `Services in ${name}` + ul.ticks.cols-2 linking to towing, heavy-duty-towing, roadside-assistance, jump-starts, lockout-service, tire-changes, accident-recovery, private-property-towing, heavy-equipment-hauling, motorcycle-towing with anchor text `${service.name} in ${short}`.
  h2 `Freeways and roads we cover in ${short}` + ul.ticks of freeways (full strings) + p.note freeway safety line ("If you're broken down on a freeway, pull to the right shoulder, turn on your hazards and stay in your vehicle with your seatbelt on. Call 911 if anyone is hurt.").
  h2 `If your vehicle was towed in ${short}` + p linking /vehicle-release/.
  h2#faq `${short} towing FAQ` + FaqList with 4 generated Q&As:
   - `Do you offer 24-hour towing in ${short}?` → `Yes. Seventh Street Garage dispatches tow trucks to ${name} 24 hours a day, 7 days a week. Call (310) 856-1980.`
   - `Where are tow trucks dispatched from for ${short}?` → `Calls in ${name} are usually covered from our ${y.name} yard at ${y.addr}, ${y.city}, CA ${y.zip}. [if not here: That is about ${mi} miles away in a straight line.] The dispatcher will give you an estimated arrival time when you call.`
   - `Can you tow semi trucks and commercial vehicles in ${short}?` → `Yes. We send heavy-duty wreckers for semis, buses, RVs and box trucks in ${name}, including on the ${joinList(first two fwNames)}.`
   - `My car was towed in ${short}. Is it at your yard?` → `If it was towed by Seventh Street Garage, call (310) 856-1980 with the plate or VIN to confirm. The registered owner can claim it 8am–5pm with a driver's license, proof of ownership and payment.`
- aside.sidebar: CallCard + SideList "Nearby areas" (city.nearby → `Towing in {name}`) + "All service areas →".
- graph: webPage + Service {"@id": url#service, name `Towing and roadside assistance in ${name}, CA`, serviceType "Towing", provider locationId(city.yard), areaServed City {name `${name}, CA`, containedInPlace AdministrativeArea `${county} County, CA`, geo}, url, availableChannel as on service pages} + faqPage.
Every city must produce unique content from its data; don't add generic filler paragraphs.
```

---

## Prompt 5 — About, Contact, Claim Your Vehicle, Auction, FAQ, Privacy, 404

```text
Build the remaining pages with Base, PageHero and the existing classes. Use SITE, YARDS and the FAQ arrays. Copy below is final; use it verbatim.

1) /about/ (active "about"; title "About Us | Towing Since 1978"; description "Seventh Street Garage has provided towing, recovery, impound and secure storage in Southern California since 1978. LAPD OPG Unit 5 and CHP Rotation Tow participant."; graph type AboutPage)
- PageHero: eyebrow "Serving Southern California since 1978", h1 "About Seventh Street Garage", lead "Seventh Street Garage has provided professional towing, recovery, impound and secure vehicle storage throughout Southern California for nearly 50 years. Today we serve the California Highway Patrol, the LAPD Harbor Area Division, the Port of Los Angeles Police and the Los Angeles County Sheriff's Department.", image wilmington-hq (wide).
- band-white .split: eyebrow "Official Police Garage · Unit 5", h2 "Held to the highest standard", p "As the LAPD Official Police Garage for the South LA / Harbor area, we are held to strict standards of service and professionalism. We also tow for the Housing Authority of the City of Los Angeles and LADOT, and we participate in the CHP Rotation Tow Program." p "Our operators undergo rigorous training and continuous skill updates. Every operator is subject to criminal background checks and drug testing. Our facilities, trucks and equipment are inspected regularly for compliance with commission requirements, and private customers get the same level of service as our agency partners." + OPG badge in a white square .frame.
- band-concrete: eyebrow "Capacity", h2 "Towing and storage capacity", .two-col of two .callout: "Towing capacity": "A centralized dispatch center staffed 24 hours a day, 365 days a year, with experienced California-licensed tow operators handling light-, medium- and heavy-duty towing. Our fleet of light-, medium- and heavy-duty trucks is serviced regularly and equipped with modern towing and recovery tools." / "Storage capacity": "Our storage facility holds about 160 vehicles and has secured perimeter fencing, controlled-access gates, surveillance systems, LED security lighting, and designated areas for investigative and evidentiary vehicle storage."
- band-dark: eyebrow "Agencies we serve", h2 "Public safety partners", ul.ticks.cols-2 of SITE.agencies.
- band-white: eyebrow "Locations", h2 "Two yards, one dispatch", ServiceArea.

2) /contact/ (active "contact"; title "Contact Us | 24/7 Dispatch (310) 856-1980"; description "Contact Seventh Street Garage: 24/7 dispatch (310) 856-1980. Wilmington HQ at 1615 E Mauretania St and Bell Gardens yard at 7535 Scout Ave."; graph type ContactPage)
- PageHero (no image): eyebrow "Contact", h1 "Contact dispatch", lead "For a tow or roadside help right now, call (310) 856-1980. Dispatch answers 24 hours a day. For quotes, fleet accounts and property towing, use the form."
- band-concrete .article-grid: left h2#request "Request service or a quote" + form.form[data-form][data-endpoint] with fields: Name*, Phone*, Email, Service (select of all service names + "Fleet / commercial account" + "Other"), Pickup location (placeholder "Address, cross streets or freeway exit"), Drop-off (if known), Vehicle (placeholder "Year, make, model, color"), Details; hidden form=contact; amber "Send request"; status; fine print "Emergency? Don't wait on a form. Call (310) 856-1980." Right aside: CallCard, one .callout per yard (label eyebrow, address, "Get directions →" Google Maps dir link), SideList "Hours" (Dispatch 24/7/365; Vehicle release office 8am–5pm; Auction, every other Mon 10:00am).
- band-white: figure.map-frame with the service-area-map linking to SITE.gmaps + caption "1615 E Mauretania St, Wilmington, CA 90744". Use a static image, not an iframe embed (better performance).

3) /vehicle-release/ (active "release"; title "Claim Your Towed or Impounded Vehicle | Wilmington"; description "How to claim a towed or impounded vehicle in Wilmington: office open 8am–5pm. Bring a driver's license, proof of ownership and cash or card.")
- PageHero: eyebrow "Towed or impounded", h1 "How to claim your vehicle", lead "If Seventh Street Garage towed your vehicle, the registered owner can claim it at our Wilmington office, 1615 E Mauretania St, between 8am and 5pm. Bring a driver's license, proof of ownership and cash or a credit card. Call (310) 856-1980 first to confirm we have it.", image impound-gate.
- band-concrete: eyebrow "What to bring", h2 "Three things you need", .need with 3 cards: Driver's license / "Valid photo ID for the registered owner."; Proof of ownership / "Current registration or title for the vehicle."; Payment / "Cash or credit card for towing and storage fees."
- band-dark: eyebrow "Step by step", h2 "Getting your vehicle back", ol.steps: "Call dispatch" / "Call (310) 856-1980 with the year, make, model and plate or VIN to confirm we have the vehicle and whether there's a hold."; "Get any agency release" / "If police impounded the vehicle, you may need a release from that agency first."; "Visit the office" / "Come to 1615 E Mauretania St, Wilmington, 8am–5pm, with your documents and payment."; "Pick up the vehicle" / "Many vehicles are stored at a nearby facility, so plan a ride there after your paperwork is done."
- band-white .article-grid: h2 "Vehicle release FAQ" + FaqList(RELEASE_FAQ, openFirst) | aside CallCard.
- graph: webPage + HowTo (the 4 steps) + faqPage(RELEASE_FAQ).

4) /auction/ (active "auction"; title "Public Car Auction | Police Impound Vehicles, Wilmington CA"; description "Seventh Street Garage public police impound car auction every other Monday at 701 Sanford Ave, Wilmington, CA. Registration 8:30am, bidding 10am, cash only.")
- PageHero (no image): eyebrow "Police impound · Public car auction", h1 "Public vehicle auction in Wilmington", lead "Seventh Street Garage holds a public auction of police impound and lien sale vehicles every other Monday at 701 Sanford Ave, Wilmington, CA 90744. Registration opens at 8:30am and bidding starts at 10:00am. Bring your driver's license. Winning bids are paid in full, cash only."
- band-concrete: .auction-meta with 3 .meta-card (When: Every other Monday, "Registration 8:30am · Bidding 10:00am"; Where: 701 Sanford Ave, "Wilmington, CA 90744 · Map"; Payment: Cash only, "Paid in full at time of purchase"); then h2 "From recent auctions", p.muted linking Instagram, .gallery of /images/auction/auction-01..12.webp (alt "Vehicle from a past Seventh Street Garage auction").
- band-white .article-grid: h2 "Auction FAQ" + FaqList(AUCTION_FAQ, openFirst) + p.note "Auction schedule can change. Confirm the next sale date by phone or on Instagram before you come." | aside CallCard.
- graph: webPage + faqPage(AUCTION_FAQ). Do NOT add Event schema (dates are recurring and unconfirmed).

5) /faq/ (title "Towing FAQ | Impound, Roadside, Auction"; description "Answers about Seventh Street Garage towing, roadside assistance, impound and vehicle release, the public auction, private property towing and service areas.")
PageHero (no image): eyebrow "FAQ", h1 "Towing & impound questions, answered", lead "Can't find your answer? Call dispatch at (310) 856-1980, 24/7." Then band-concrete with .faq-group sections (h2 + FaqList): General (HOME_FAQ), Claiming your vehicle (RELEASE_FAQ), Public auction (AUCTION_FAQ), then the FAQs of towing, heavy-duty-towing, roadside-assistance, private-property-towing, police-impound-towing, heavy-equipment-hauling under their service names. De-duplicate questions across groups. graph: faqPage of all.

6) /privacy/ — short policy marked "Draft for legal review" with sections: Information you give us, Analytics and cookies, Third-party content (Google reviews, YouTube), Contact (phone + mailing address).

7) src/pages/404.astro — noindex; PageHero eyebrow "Error 404", h1 "This page got towed", lead with links to /services/, /service-areas/ and the phone number.
```

---

## Prompt 6 — SEO & AI-search files, reviews pipeline, deploy config

```text
Add the machine-readable files and integrations:

1) src/pages/robots.txt.ts (static GET endpoint): "User-agent: *\nAllow: /\nDisallow: /data/\n" then an explicit "User-agent: X\nAllow: /" block for each of: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot, CCBot, Amazonbot, DuckAssistBot, Meta-ExternalAgent; then "Sitemap: {SITE.url}/sitemap-index.xml".

2) src/pages/llms.txt.ts: Markdown per the llmstxt.org format:
"# Seventh Street Garage", a "> " summary paragraph (what we do, since 1978, LAPD OPG Unit 5, CHP rotation, phone, 24/7), "## Key facts" bullets (phone, both yard addresses, release hours + what to bring + registered owner only, auction schedule/location/times/cash only, agencies, storage capacity and security features, fleet and operator vetting), "## Services" (one bullet per service: [name](absolute url): card), "## Key pages" (claim vehicle, auction, about, contact, FAQ, llms-full.txt), "## Service areas" (comma-separated [City](url) links).

3) src/pages/llms-full.txt.ts: llms.txt content plus, for every service: name, URL, intro (HTML stripped), facts, each section (HTML stripped), includes and Q/A pairs; for every city: county, URL, nearest yard + distance, routes, landmarks, note; then all general/release/auction FAQs as Q/A.

4) public/site.webmanifest (name, short_name "7th St Garage", start_url "/", display standalone, background/theme #0A1020, icon /favicon.svg). Confirm the @astrojs/sitemap output includes every page except 404.

5) scripts/fetch-reviews.ts (run with `npm run reviews`, TypeScript via tsx): read GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID from env; GET https://places.googleapis.com/v1/places/{id} with headers X-Goog-Api-Key and X-Goog-FieldMask "rating,userRatingCount,googleMapsUri,reviews"; keep only reviews with rating >= 4 and non-empty text; map to {author, photo, rating, text, relativeTime, time (unix seconds)}; write public/data/reviews.json {source, updated ISO, placeUrl, reviews}. Typed response interfaces, no `any`. Add .env.example with both keys. The key must never be sent to the browser.

6) Add a GitHub Action .github/workflows/reviews.yml that runs the script daily (cron) with repo secrets and commits public/data/reviews.json when it changes. Add netlify.toml (build "npm run build", publish "dist", plus long-cache headers for /images/* and /_astro/*) and a short README section on deploying to Netlify or Vercel.

7) Forms: the client script posts FormData to data-endpoint with Accept: application/json. Document in the README how to set SITE.formEndpoint (Formspree or a Netlify Function). While the endpoint is empty, the form must show "Online requests are not connected yet. Please call dispatch at (310) 856-1980." Never fake a success message.
```

---

## Prompt 7 — QA pass

```text
Run a full QA pass and fix everything you find:
- `npm run build` passes (astro check: 0 errors, 0 warnings that matter). The build outputs 73 indexable pages: home, services index + 14, service-areas index + 50, about, contact, vehicle-release, auction, faq, privacy, plus 404.
- Write a small script, scripts/check-site.ts, that crawls dist/ and fails on: broken internal href/src, pages without exactly one <h1>, duplicate <title>s, titles over 70 chars, meta descriptions over 160 chars, missing canonical, and JSON-LD that fails JSON.parse. Run it and fix any issues.
- Accessibility: visible focus states, every form control labelled, aria-expanded on toggles, carousel slides labelled "n of 5", reduced-motion respected, color contrast AA on amber buttons (dark text on amber).
- Responsive: no horizontal scroll at 360, 390, 768, 1024 and 1440px. Mega menu becomes the full-screen mobile menu under 1060px. Dispatch bar shows under 760px and doesn't cover the footer content (footer has bottom padding).
- Performance: only the first hero/page-hero image is eager. All others are lazy and have width/height. No layout shift from fonts (font-display swap). No JS frameworks shipped. Lighthouse target: 95+ for Performance, Accessibility, Best Practices and SEO on the home page and one city page.
- Confirm no AggregateRating/Review schema, no invented reviews, and the reviews section shows only 4★+ reviews with the "See all reviews on Google" link.
Report a short summary of what you fixed.
```

---

## After the build: launch checklist

1. Confirm the domain in `src/data/site.ts` **and** `astro.config.mjs` (`site`).
2. Confirm the founding year with the client. The main site says 1978, the OPG page says 1953.
3. Add the Facebook page URL, form endpoint, video IDs and Google Places key/Place ID.
4. Replace stand-in photos on the hauling, lockout and tire-change pages with real ones.
5. Have counsel review the private property towing (CVC 22658) copy and the privacy policy.
6. Submit `sitemap-index.xml` to Google Search Console and Bing Webmaster Tools. Make the name, address and phone on both Google Business Profiles (Wilmington, Bell Gardens) match the site exactly.
