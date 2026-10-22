// Seventh Street Garage — site script (typed, no dependencies)
type Slides = HTMLElement[];
type DotEls = HTMLButtonElement[];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- mobile nav + services menu ---------- */
function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Close mobile menu when any nav link is tapped
  nav?.querySelectorAll<HTMLAnchorElement>('a:not([href^="tel"])').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.querySelectorAll<HTMLElement>('.has-menu.open').forEach((li) => {
        li.classList.remove('open');
        const b = li.querySelector<HTMLButtonElement>('.nav-trigger');
        b?.setAttribute('aria-expanded', 'false');
      });
    });
  });

  const triggers = document.querySelectorAll<HTMLButtonElement>('.nav-trigger');
  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const li = btn.closest('.has-menu');
      if (!li) return;
      const wasOpen = li.classList.contains('open');
      // Close any other open menus first
      document.querySelectorAll<HTMLElement>('.has-menu.open').forEach((other) => {
        if (other !== li) {
          other.classList.remove('open');
          const ob = other.querySelector<HTMLButtonElement>('.nav-trigger');
          ob?.setAttribute('aria-expanded', 'false');
        }
      });
      li.classList.toggle('open', !wasOpen);
      btn.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
    });
  });

  // Click-away closes the dropdown
  document.addEventListener('click', (e: MouseEvent) => {
    document.querySelectorAll<HTMLElement>('.has-menu.open').forEach((li) => {
      if (!li.contains(e.target as Node)) {
        li.classList.remove('open');
        const b = li.querySelector<HTMLButtonElement>('.nav-trigger');
        b?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.querySelectorAll<HTMLElement>('.has-menu.open').forEach((li) => {
      li.classList.remove('open');
      const b = li.querySelector<HTMLButtonElement>('.nav-trigger');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- hero carousel ---------- */
interface CarouselState {
  idx: number;
  timer: number | null;
  paused: boolean;
}

function initCarousel(car: HTMLElement): void {
  const trackEl = car.querySelector<HTMLElement>('.car-track')!;
  if (!trackEl) return;
  const slides: Slides = Array.from(car.querySelectorAll<HTMLElement>('.slide'));
  const dotsWrap = car.querySelector<HTMLElement>('.car-dots');
  if (!dotsWrap || slides.length === 0) return;

  const dur = parseInt(car.getAttribute('data-interval') ?? '6000', 10);
  car.style.setProperty('--dur', `${dur}ms`);

  const state: CarouselState = { idx: 0, timer: null, paused: reduce };
  if (reduce) car.classList.add('paused');

  const dots: DotEls = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function mark(i: number): void {
    dots.forEach((d, j) => {
      d.removeAttribute('aria-current');
      if (j === i) {
        void d.offsetWidth;
        d.setAttribute('aria-current', 'true');
      }
    });
    slides.forEach((s, j) => {
      s.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      s.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
        a.tabIndex = j === i ? 0 : -1;
      });
    });
  }

  function go(i: number, user = false): void {
    state.idx = ((i % slides.length) + slides.length) % slides.length;
    trackEl.scrollTo({
      left: trackEl.clientWidth * state.idx,
      behavior: reduce ? 'auto' : 'smooth',
    });
    mark(state.idx);
    if (user) restart();
  }

  function restart(): void {
    if (state.timer !== null) clearInterval(state.timer);
    if (!state.paused) {
      state.timer = window.setInterval(() => go(state.idx + 1), dur);
    }
  }

  const prev = car.querySelector<HTMLButtonElement>('[data-prev]');
  const next = car.querySelector<HTMLButtonElement>('[data-next]');
  prev?.addEventListener('click', () => go(state.idx - 1, true));
  next?.addEventListener('click', () => go(state.idx + 1, true));

  car.addEventListener('mouseenter', () => {
    state.paused = true;
    car.classList.add('paused');
    if (state.timer !== null) clearInterval(state.timer);
  });
  car.addEventListener('mouseleave', () => {
    if (!reduce) {
      state.paused = false;
      car.classList.remove('paused');
      restart();
    }
  });
  car.addEventListener('focusin', () => {
    state.paused = true;
    car.classList.add('paused');
    if (state.timer !== null) clearInterval(state.timer);
  });

  let st: number | undefined;
  trackEl.addEventListener(
    'scroll',
    () => {
      if (st !== undefined) clearTimeout(st);
      st = window.setTimeout(() => {
        const i = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
        if (i !== state.idx) {
          state.idx = i;
          mark(state.idx);
          restart();
        }
      }, 120);
    },
    { passive: true },
  );

  car.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(state.idx + 1, true);
    if (e.key === 'ArrowLeft') go(state.idx - 1, true);
  });

  mark(0);
  restart();
}

/* ---------- Google reviews ---------- */
interface ReviewData {
  rating: number;
  text: string;
  author?: string;
  time?: number;
  photo?: string;
  relativeTime?: string;
  reviewUrl?: string;
}
interface ReviewsResponse {
  reviews: ReviewData[];
}

function initReviews(): void {
  const rv = document.querySelector<HTMLElement>('[data-reviews]');
  if (!rv || !window.fetch) return;
  const min = parseInt(rv.getAttribute('data-min') ?? '4', 10);
  const max = parseInt(rv.getAttribute('data-max') ?? '6', 10);

  fetch('/data/reviews.json', { cache: 'no-cache' })
    .then((r): Promise<ReviewsResponse | null> =>
      r.ok ? (r.json() as Promise<ReviewsResponse>) : Promise.resolve(null),
    )
    .then((data) => {
      if (!data || !Array.isArray(data.reviews)) return;
      const list = data.reviews
        .filter((r) => Number(r.rating) >= min && r.text)
        .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
        .slice(0, max);
      if (!list.length) return;

      rv.innerHTML = '';
      list.forEach((r) => {
        const art = document.createElement('article');
        art.className = 'review';
        const link = document.createElement('a');
        link.className = 'review-link';
        link.href = r.reviewUrl ?? 'https://share.google/8N4ZyLwZZcBRbKcqC';
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute('aria-label', `Read ${r.author ?? 'Google user'}'s review on Google`);

        const stars = document.createElement('div');
        stars.className = 'stars';
        stars.setAttribute('aria-label', `${r.rating} out of 5 stars`);
        const rounded = Math.round(r.rating);
        stars.textContent = '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);

        const q = document.createElement('blockquote');
        q.textContent = r.text.length > 360 ? r.text.slice(0, 357).trim() + '…' : r.text;

        const f = document.createElement('footer');
        const av = document.createElement('span');
        av.className = 'av';
        if (r.photo) {
          const im = document.createElement('img');
          im.src = r.photo;
          im.alt = '';
          im.loading = 'lazy';
          im.referrerPolicy = 'no-referrer';
          av.appendChild(im);
        } else {
          av.textContent = (r.author ?? '?').charAt(0);
        }

        const who = document.createElement('span');
        const b = document.createElement('b');
        b.textContent = r.author ?? 'Google user';
        const sm = document.createElement('small');
        sm.textContent = `${r.relativeTime ?? ''} · Google`;
        who.appendChild(b);
        who.appendChild(document.createElement('br'));
        who.appendChild(sm);

        f.appendChild(av);
        f.appendChild(who);
        link.appendChild(stars);
        link.appendChild(q);
        link.appendChild(f);
        art.appendChild(link);
        rv.appendChild(art);
      });

      const note = document.querySelector<HTMLElement>('[data-reviews-note]');
      if (note) note.hidden = false;
      const ph = document.querySelector<HTMLElement>('[data-reviews-placeholder]');
      if (ph) ph.hidden = true;
    })
    .catch(() => {});
}

/* ---------- video slots (click-to-load facade) ---------- */
function initVideos(): void {
  document
    .querySelectorAll<HTMLElement>('.v[data-youtube], .v[data-mp4]')
    .forEach((v) => {
      const yt = v.getAttribute('data-youtube');
      const mp4 = v.getAttribute('data-mp4');
      const btn = v.querySelector<HTMLButtonElement>('button');
      if (!btn) return;
      if (!yt && !mp4) {
        btn.disabled = true;
        return;
      }
      btn.addEventListener('click', () => {
        let el: HTMLIFrameElement | HTMLVideoElement;
        if (yt) {
          el = document.createElement('iframe');
          el.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0`;
          el.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
          el.allowFullscreen = true;
          el.title = btn.getAttribute('aria-label') ?? 'Video';
        } else {
          el = document.createElement('video');
          el.src = mp4 ?? '';
          el.controls = true;
          el.autoplay = true;
          el.playsInline = true;
        }
        v.innerHTML = '';
        v.appendChild(el);
      });
    });
}

/* ---------- forms ---------- */
async function submitToSupabase(form: HTMLFormElement): Promise<boolean> {
  const fd = new FormData(form);
  const formType = (fd.get('form') as string) || 'contact';
  const payload: Record<string, string | null> = {
    name: (fd.get('name') as string) ?? null,
    email: (fd.get('email') as string) ?? null,
    phone: (fd.get('phone') as string) ?? null,
    service: (fd.get('service') as string) ?? null,
    pickup_location: (fd.get('pickup_location') as string) ?? null,
    vehicle: (fd.get('vehicle') as string) ?? null,
    details: (fd.get('details') as string) ?? null,
    form_type: formType,
  };
  if (formType === 'private-property') {
    payload.service = (fd.get('property_type') as string) ?? null;
    payload.pickup_location = (fd.get('address') as string) ?? null;
  }
  if (!payload.name || !payload.email) return false;
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return false;
    const res = await fetch(`${url}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function initForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault();
      const status = form.querySelector<HTMLElement>('.status');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (status) { status.hidden = false; status.textContent = 'Sending…'; }
      const endpoint = form.getAttribute('data-endpoint');
      let success = false;
      if (endpoint) {
        try {
          const r = await fetch(endpoint, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
          });
          success = r.ok;
        } catch { success = false; }
      } else {
        success = await submitToSupabase(form);
      }
      if (success) {
        if (status) status.textContent = 'Request received. Our office will contact you. For a tow right now, call (310) 856-1980.';
        form.reset();
      } else if (endpoint) {
        if (status) status.textContent = 'We could not send your request. Please call (310) 856-1980.';
      } else {
        if (status) status.textContent = 'We could not send your request online. Please call dispatch at (310) 856-1980.';
      }
    });
  });
}

function initScrollReveal(): void {
  if (reduce || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll<HTMLElement>(
    'section.band, h1, h2, h3, .eyebrow, .lead, .svc-card, .chip, .stat, .steps li, .frame, .v, .review, .call-card, .callout, .side-list, .meta-card, .need > div, .map-frame, .glance',
  );
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' },
  );

  targets.forEach((target, index) => {
    target.classList.add('scroll-reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
    observer.observe(target);
  });
}

/* ---------- footer year ---------- */
function initYear(): void {
  const y = document.querySelector<HTMLElement>('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ---------- run ---------- */
function init(): void {
  initNav();
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initCarousel);
  initReviews();
  initVideos();
  initForms();
  initScrollReveal();
  initYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
