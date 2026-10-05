/* GUÄVA Tavira */
(() => {
  document.documentElement.classList.add('js');

  // ===== CONFIG — mudar aqui =====
  const WHATSAPP = '351900000000'; // TODO: número real do WhatsApp (só dígitos, com 351)
  const HERO_PHOTO = ''; // opcional: 'img/hero.jpg' para usar uma foto real no topo

  const EVENTS = [
    { date: '2026-10-10', tag: 'House · Afro', name: 'Golden Hour Gilão', lineup: 'Kaya b2b Rio Sul', price: 15, art: 'linear-gradient(160deg,#e2604a 0%,#7a2c3b 45%,#1a1c28 80%)', url: '' },
    { date: '2026-10-17', tag: 'Disco · Funk', name: 'Noite das Cerejas', lineup: 'DJ Marisa + live sax', price: 15, art: 'linear-gradient(160deg,#d6262b 0%,#5b1830 50%,#1a1c28 85%)', url: '' },
    { date: '2026-10-24', tag: 'Latin · Reggaeton', name: 'Calor Tropical', lineup: 'Tropikal Crew', price: 12, art: 'linear-gradient(160deg,#f2a65a 0%,#a2453e 45%,#1a1c28 82%)', url: '' },
    { date: '2026-10-31', tag: 'Halloween', name: 'Guäva Noir', lineup: 'Line-up secreto', price: 20, art: 'linear-gradient(160deg,#5d3a6e 0%,#2b1a35 50%,#1a1c28 85%)', url: '', soldOut: false },
  ];

  // ===== NAV =====
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelectorAll('.nav-links a');

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // active link
  const sections = [...links].map((a) => document.querySelector(a.getAttribute('href')));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && spy.observe(s));

  // ===== EVENTS =====
  const fmtDay = new Intl.DateTimeFormat('pt-PT', { day: '2-digit' });
  const fmtMon = new Intl.DateTimeFormat('pt-PT', { month: 'short' });
  const fmtWd = new Intl.DateTimeFormat('pt-PT', { weekday: 'long' });
  const fmtLong = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
  const toDate = (s) => new Date(s + 'T23:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = EVENTS.filter((e) => toDate(e.date) >= today);

  const list = document.getElementById('eventsList');
  list.innerHTML = upcoming.map((e) => {
    const d = toDate(e.date);
    const cta = e.soldOut
      ? '<span class="event-sold">Esgotado</span>'
      : `<a class="btn btn-coral" href="${e.url || '#bilhetes'}"${e.url ? ' target="_blank" rel="noopener"' : ''}>Comprar</a>`;
    return `
      <article class="event reveal" style="--art:${e.art}">
        <div class="event-date"><strong>${fmtDay.format(d)}</strong><span>${fmtMon.format(d).replace('.', '')}</span></div>
        <div class="event-body">
          <p class="event-tag">${e.tag}</p>
          <h3>${e.name}</h3>
          <p class="event-meta">${fmtWd.format(d)} · 23h · ${e.lineup}</p>
          <div class="event-foot">
            <span class="event-price">${e.price}€ <small>desde</small></span>
            ${cta}
          </div>
        </div>
      </article>`;
  }).join('') || '<p class="sec-lead" style="text-align:center">Novas datas em breve. Segue-nos no Instagram.</p>';

  // ===== RESERVE FORM =====
  const form = document.getElementById('reserveForm');
  const night = document.getElementById('rNight');
  const pax = document.getElementById('rPax');
  const sum = document.getElementById('reserveSum');
  const err = document.getElementById('formError');

  night.innerHTML = upcoming.map((e) => `<option value="${e.date}">${fmtLong.format(toDate(e.date))} — ${e.name}</option>`).join('');

  const mesa = () => document.querySelector('input[name="mesa"]:checked');
  const maxPax = { 'Mesa Rio': 4, 'Mesa Palmeira': 6, 'Camarote da Ponte': 10 };
  const updateSum = () => {
    const m = mesa();
    const label = m.closest('.table-opt');
    pax.max = maxPax[m.value];
    if (+pax.value > +pax.max) pax.value = pax.max;
    sum.innerHTML = `Seleção: <strong>${m.value}</strong> · ${label.querySelector('.t-price').textContent}`;
  };
  document.querySelectorAll('input[name="mesa"]').forEach((r) => r.addEventListener('change', updateSum));
  updateSum();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.textContent = '';
    const fields = [...form.querySelectorAll('[required]')];
    fields.forEach((f) => f.classList.toggle('invalid', !f.checkValidity()));
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) {
      err.textContent = bad.id === 'rPax' ? `Esta mesa leva no máximo ${pax.max} pessoas.` : 'Preenche os campos em falta.';
      bad.focus();
      return;
    }
    const ev = upcoming.find((x) => x.date === night.value);
    const msg = [
      'Olá GUÄVA! Quero reservar:',
      `• ${mesa().value}`,
      `• Noite: ${fmtLong.format(toDate(ev.date))} (${ev.name})`,
      `• Pessoas: ${pax.value}`,
      `• Nome: ${form.nome.value.trim()}`,
      form.notas.value.trim() && `• Notas: ${form.notas.value.trim()}`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  // ===== REVEAL =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== HERO PHOTO (opcional) =====
  if (HERO_PHOTO) document.querySelector('.hero-photo').style.backgroundImage = `url("${HERO_PHOTO}")`;

  // ===== HERO SCENE =====
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };
  const $ = (id) => document.getElementById(id);
  const WATER = 618;

  // stars
  for (let i = 0; i < 60; i++) {
    el('circle', { cx: rnd() * 1600, cy: rnd() * 360, r: rnd() * 1.2 + .3, fill: '#fff', class: 'star', style: `animation-delay:${(rnd() * 3).toFixed(2)}s` }, $('stars'));
  }

  // town windows
  for (let i = 0; i < 46; i++) {
    const x = 1070 + rnd() * 520, y = 580 + rnd() * 30;
    el('rect', { x, y, width: 3, height: 4, fill: '#ffc976', opacity: .5 + rnd() * .5 }, $('windows'));
    el('rect', { x: x - 2, y: WATER + (WATER - y) * .6 + 8, width: 7, height: 1.4, fill: '#ffc976', opacity: .35, class: 'ripple', style: `animation-delay:${(rnd() * 5).toFixed(2)}s` }, $('reflections'));
  }

  // Roman bridge (7 arches)
  const bx = 455, arch = 70, pier = 24, deckTop = 584, base = 642, n = 7;
  const bw = n * arch + (n + 1) * pier;
  let d = `M${bx} ${deckTop} H${bx + bw} V${base} H${bx} Z`;
  for (let i = 0; i < n; i++) {
    const x0 = bx + pier + i * (arch + pier), x1 = x0 + arch;
    d += ` M${x0} ${base} V${WATER - 4} A${arch / 2} 24 0 0 1 ${x1} ${WATER - 4} V${base} Z`;
  }
  const bridge = $('bridge');
  el('path', { d, 'fill-rule': 'evenodd' }, bridge);
  el('rect', { x: bx - 6, y: deckTop - 10, width: bw + 12, height: 10, rx: 2 }, bridge);
  el('path', { d, 'fill-rule': 'evenodd', fill: '#100d12', opacity: .45, transform: `translate(0 ${WATER * 2 + 6}) scale(1 -1)` }, $('reflections'));
  // bridge lamps
  for (let i = 0; i <= n; i++) {
    const x = bx + pier / 2 + i * (arch + pier);
    el('rect', { x: x - 1, y: deckTop - 30, width: 2, height: 20 }, bridge);
    el('circle', { cx: x, cy: deckTop - 32, r: 26, fill: 'url(#halo)' }, bridge);
    el('circle', { cx: x, cy: deckTop - 32, r: 3, fill: '#ffe0a8', class: 'bulb', style: `animation-delay:${(rnd() * 4).toFixed(2)}s` }, bridge);
    el('rect', { x: x - 5, y: WATER + 30 + rnd() * 30, width: 10, height: 2, fill: '#ffb766', opacity: .55, class: 'ripple', style: `animation-delay:${(rnd() * 5).toFixed(2)}s` }, $('reflections'));
  }

  // palms
  [[1300, 400, .62], [1385, 340, .78], [1500, 390, .66], [1575, 350, .74]].forEach(([x, y, s]) => {
    el('use', { href: '#palm', x: x - 100 * s, y: y - 40 * s, width: 200 * s, height: 440 * s }, $('palms'));
  });

  // string lights
  const lights = $('lights');
  const strings = [[[-30, 470], [250, 500], 40], [[250, 500], [560, 560], 46], [[-30, 560], [320, 585], 34], [[320, 585], [640, 620], 30]];
  strings.forEach(([[x1, y1], [x2, y2], sag]) => {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag * 2;
    el('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: '#1a1416', 'stroke-width': 1.5 }, lights);
    const count = Math.round((x2 - x1) / 26);
    for (let i = 1; i < count; i++) {
      const t = i / count, u = 1 - t;
      const x = u * u * x1 + 2 * u * t * cx + t * t * x2;
      const y = u * u * y1 + 2 * u * t * cy + t * t * y2 + 5;
      el('circle', { cx: x, cy: y, r: 18, fill: 'url(#halo)' }, lights);
      el('circle', { cx: x, cy: y, r: 3.2, fill: '#ffe2ae', class: 'bulb', style: `animation-delay:${(rnd() * 4).toFixed(2)}s` }, lights);
    }
  });
  // poles + lanterns
  [[250, 500], [560, 560], [320, 585]].forEach(([x, y]) => {
    el('rect', { x: x - 2, y, width: 4, height: 900 - y, fill: '#06070b' }, lights);
  });
  [[90, 540], [420, 580], [200, 600]].forEach(([x, y]) => {
    el('rect', { x: x - 9, y, width: 18, height: 24, rx: 3, fill: '#ffc27a' }, lights);
    el('circle', { cx: x, cy: y + 12, r: 60, fill: 'url(#halo)' }, lights);
  });

  // narrow screens: frame the church, palms and bridge end instead of the centre
  const svg = $('scene');
  const frame = () => svg.setAttribute('viewBox', innerWidth / innerHeight < .8 ? '820 0 780 900' : '0 0 1600 900');
  frame();
  addEventListener('resize', frame);

  // crowd
  const crowd = $('crowd');
  const people = [];
  for (let i = 0; i < 70; i++) {
    const depth = rnd();
    const s = .6 + depth * 1.1;
    const x = rnd() * 780 - 40 + (1 - depth) * 60;
    const y = 690 + depth * 150;
    people.push({ x, y, s, depth });
  }
  people.sort((a, b) => a.depth - b.depth).forEach(({ x, y, s, depth }) => {
    const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`, opacity: (.75 + depth * .25).toFixed(2) }, crowd);
    el('ellipse', { cx: 0, cy: 0, rx: 12, ry: 14 }, g);
    el('path', { d: 'M-26 140 C -28 60, -24 26, 0 22 C 24 26, 28 60, 26 140 Z' }, g);
  });
})();
