/* Seventh Street Garage — site script (no dependencies) */
(function () {
  var root = document.documentElement.getAttribute('data-root') || '/';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav + services menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  document.querySelectorAll('.nav-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.closest('.has-menu');
      var open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.has-menu.open').forEach(function (li) {
      li.classList.remove('open'); var b = li.querySelector('.nav-trigger'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- hero carousel ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var slides = Array.prototype.slice.call(car.querySelectorAll('.slide'));
    var dotsWrap = car.querySelector('.car-dots');
    var dur = parseInt(car.getAttribute('data-interval') || '6000', 10);
    car.style.setProperty('--dur', dur + 'ms');
    var idx = 0, timer = null, paused = reduce;
    if (reduce) car.classList.add('paused');
    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });
    function mark(i) {
      dots.forEach(function (d, j) {
        d.removeAttribute('aria-current');
        if (j === i) { void d.offsetWidth; d.setAttribute('aria-current', 'true'); }
      });
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); s.querySelectorAll('a').forEach(function (a) { a.tabIndex = j === i ? 0 : -1; }); });
    }
    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.scrollTo({ left: track.clientWidth * idx, behavior: reduce ? 'auto' : 'smooth' });
      mark(idx);
      if (user) restart();
    }
    function restart() { clearInterval(timer); if (!paused) timer = setInterval(function () { go(idx + 1); }, dur); }
    var prev = car.querySelector('[data-prev]'), next = car.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { go(idx - 1, true); });
    if (next) next.addEventListener('click', function () { go(idx + 1, true); });
    car.addEventListener('mouseenter', function () { paused = true; car.classList.add('paused'); clearInterval(timer); });
    car.addEventListener('mouseleave', function () { if (!reduce) { paused = false; car.classList.remove('paused'); restart(); } });
    car.addEventListener('focusin', function () { paused = true; car.classList.add('paused'); clearInterval(timer); });
    var st;
    track.addEventListener('scroll', function () {
      clearTimeout(st);
      st = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== idx) { idx = i; mark(idx); restart(); }
      }, 120);
    }, { passive: true });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(idx + 1, true); }
      if (e.key === 'ArrowLeft') { go(idx - 1, true); }
    });
    mark(0); restart();
  });

  /* ---------- Google reviews (4 stars and up only) ----------
     data/reviews.json is written server-side by scripts/fetch-reviews.mjs
     (Google Places API). The API key never reaches the browser. */
  var rv = document.querySelector('[data-reviews]');
  if (rv && window.fetch) {
    var min = parseInt(rv.getAttribute('data-min') || '4', 10);
    var max = parseInt(rv.getAttribute('data-max') || '6', 10);
    fetch(root + 'data/reviews.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      if (!data || !Array.isArray(data.reviews)) return;
      var list = data.reviews.filter(function (r) { return Number(r.rating) >= min && r.text; })
        .sort(function (a, b) { return (b.time || 0) - (a.time || 0); }).slice(0, max);
      if (!list.length) return;
      rv.innerHTML = '';
      list.forEach(function (r) {
        var art = document.createElement('article'); art.className = 'review';
        var stars = document.createElement('div'); stars.className = 'stars';
        stars.setAttribute('aria-label', r.rating + ' out of 5 stars');
        stars.textContent = '★★★★★'.slice(0, Math.round(r.rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(r.rating));
        var q = document.createElement('blockquote'); q.textContent = r.text.length > 360 ? r.text.slice(0, 357).trim() + '…' : r.text;
        var f = document.createElement('footer');
        var av = document.createElement('span'); av.className = 'av';
        if (r.photo) { var im = document.createElement('img'); im.src = r.photo; im.alt = ''; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer'; av.appendChild(im); }
        else av.textContent = (r.author || '?').charAt(0);
        var who = document.createElement('span'); who.innerHTML = '<b></b><br><small></small>';
        who.querySelector('b').textContent = r.author || 'Google user';
        who.querySelector('small').textContent = (r.relativeTime || '') + ' · Google';
        f.appendChild(av); f.appendChild(who);
        art.appendChild(stars); art.appendChild(q); art.appendChild(f);
        rv.appendChild(art);
      });
      var note = document.querySelector('[data-reviews-note]');
      if (note) note.hidden = false;
      var ph = document.querySelector('[data-reviews-placeholder]');
      if (ph) ph.hidden = true;
    }).catch(function () {});
  }

  /* ---------- video slots (click-to-load facade) ---------- */
  document.querySelectorAll('.v[data-youtube], .v[data-mp4]').forEach(function (v) {
    var yt = v.getAttribute('data-youtube'), mp4 = v.getAttribute('data-mp4');
    var btn = v.querySelector('button');
    if (!yt && !mp4) { if (btn) btn.disabled = true; return; }
    btn.addEventListener('click', function () {
      var el;
      if (yt) {
        el = document.createElement('iframe');
        el.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&rel=0';
        el.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        el.allowFullscreen = true; el.title = btn.getAttribute('aria-label') || 'Video';
      } else {
        el = document.createElement('video'); el.src = mp4; el.controls = true; el.autoplay = true; el.playsInline = true;
      }
      v.innerHTML = ''; v.appendChild(el);
    });
  });

  /* ---------- forms ----------
     Set data-endpoint on the <form> (Formspree, Netlify function, your API).
     Without an endpoint the form tells the visitor to call instead. */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.status');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var endpoint = form.getAttribute('data-endpoint');
      status.hidden = false;
      if (!endpoint) {
        status.textContent = 'Online requests are not connected yet. Please call dispatch at (310) 856-1980.';
        return;
      }
      status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          status.textContent = 'Request received. Our office will contact you. For a tow right now, call (310) 856-1980.';
          form.reset();
        })
        .catch(function () { status.textContent = 'We could not send your request. Please call (310) 856-1980.'; });
    });
  });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
