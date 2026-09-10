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
    lbImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.shot').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.closest('.lb-figure') === null) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLightbox();
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
