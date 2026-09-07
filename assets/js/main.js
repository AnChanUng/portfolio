/* 안찬웅 Portfolio — main.js */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ----------
     본문 가시성이 걸린 로직이므로 가장 먼저 실행한다. */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero line reveal ---------- */
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { document.body.classList.add('loaded'); });
  });

  /* ---------- cursor spotlight (.spot) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- count-up numbers ([data-count]) ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- theme ----------
     초기값은 <head>의 인라인 스크립트가 이미 확정했다. */
  if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'light');

  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- nav: scrolled state + progress bar ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('scrollProgress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', y > 12);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('navBurger');
  var links = document.querySelector('.nav-links');

  function closeMenu() {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', function (e) {
    if (!links.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });


  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImage = document.getElementById('lbImage');
  var lbCaption = document.getElementById('lbCaption');
  var lastFocused = null;

  function openLightbox(btn) {
    lastFocused = btn;
    lbImage.src = btn.getAttribute('data-full');
    lbImage.alt = btn.querySelector('img').alt;
    lbCaption.textContent = btn.getAttribute('data-caption') || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    lbImage.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.gallery .shot').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.closest('.lb-figure') === null) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLightbox();
  });

  /* ---------- work filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter .chip-btn'));
  var workCards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
  var workEmpty = document.getElementById('workEmpty');

  function applyFilter(key) {
    var shown = 0;
    workCards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
      var on = key === 'all' || tags.indexOf(key) !== -1;
      card.hidden = !on;
      if (on) { shown++; card.classList.add('in'); }
    });
    if (workEmpty) workEmpty.hidden = shown > 0;
    filterBtns.forEach(function (b) {
      var active = b.getAttribute('data-filter') === key;
      b.classList.toggle('is-on', active);
      b.setAttribute('aria-selected', String(active));
    });
  }
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); });
  });

  /* ---------- active section in nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  function syncActive() {
    var line = window.innerHeight * 0.32;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', syncActive, { passive: true });
  window.addEventListener('resize', syncActive);
  syncActive();
})();
