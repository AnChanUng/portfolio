/* 안찬웅 Portfolio — main.js */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- theme toggle ---------- */
  var themeBtn = document.getElementById('themeBtn');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : mq.matches;
  }
  function syncThemeLabel() {
    if (themeBtn) themeBtn.setAttribute('aria-label', isDark() ? '라이트 모드 전환' : '다크 모드 전환');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }
  syncThemeLabel();

  /* ---------- active section in nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.toc a'));

  function syncActive() {
    var line = window.innerHeight * 0.32;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    /* 페이지 끝에 닿으면 마지막 섹션을 활성화한다 */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && sections.length) {
      current = sections[sections.length - 1].id;
    }
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', syncActive, { passive: true });
  window.addEventListener('resize', syncActive);
  syncActive();

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- expand / collapse all tasks ---------- */
  var tasks = Array.prototype.slice.call(document.querySelectorAll('details.task'));
  var expandBtn = document.getElementById('expandAll');

  function syncExpandBtn() {
    var allOpen = tasks.every(function (d) { return d.open; });
    expandBtn.textContent = allOpen ? '모두 접기' : '모두 펼치기';
    expandBtn.setAttribute('aria-pressed', String(allOpen));
  }
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var open = !tasks.every(function (d) { return d.open; });
      tasks.forEach(function (d) { d.open = open; });
      syncExpandBtn();
    });
    tasks.forEach(function (d) { d.addEventListener('toggle', syncExpandBtn); });
  }

  /* 인쇄(PDF 저장)할 때는 전부 펼치고 모두 보이게 한다 */
  window.addEventListener('beforeprint', function () {
    tasks.forEach(function (d) { d.open = true; });
    reveals.forEach(function (el) { el.classList.add('in'); });
  });

  /* ---------- feature showcase: GIF처럼 빠르게 자동 재생 ---------- */
  (function () {
    var sc = document.getElementById('showcase');
    if (!sc) return;
    var slides = Array.prototype.slice.call(sc.querySelectorAll('.sc-stage figure'));
    var listBtns = Array.prototype.slice.call(sc.querySelectorAll('.sc-list button'));
    var bar = document.getElementById('scBar');
    var pathEl = document.getElementById('scPath');
    var countEl = document.getElementById('scCount');
    var titleEl = document.getElementById('scTitle');
    var descEl = document.getElementById('scDesc');
    var toggle = document.getElementById('scToggle');
    var DURATION = 1700;            /* 한 화면당 노출 시간(ms) */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var idx = 0, elapsed = 0, last = 0, raf = 0;
    var userPaused = reduce, hover = false, visible = false;

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (f, k) { f.classList.toggle('is-active', k === idx); });
      var f = slides[idx];
      pathEl.textContent = f.getAttribute('data-path');
      countEl.textContent = pad(idx + 1) + ' / ' + pad(slides.length);
      titleEl.textContent = f.getAttribute('data-title');
      descEl.textContent = f.getAttribute('data-desc');
      /* 채점 화면(같은 경로의 연속 화면)은 문제 풀이 버튼을 그대로 강조한다 */
      var activeBtn = null;
      listBtns.forEach(function (b) { if (+b.getAttribute('data-i') <= idx) activeBtn = b; });
      listBtns.forEach(function (b) { b.classList.toggle('is-active', b === activeBtn); });
      elapsed = 0;
      bar.style.width = '0%';
      /* 다음 화면 미리 불러오기 */
      var next = slides[(idx + 1) % slides.length].querySelector('img');
      if (next && next.loading === 'lazy') next.loading = 'eager';
    }
    function running() { return !userPaused && !hover && visible; }
    function tick(t) {
      if (!last) last = t;
      var dt = t - last; last = t;
      if (running()) {
        elapsed += dt;
        bar.style.width = Math.min(100, elapsed / DURATION * 100) + '%';
        if (elapsed >= DURATION) show(idx + 1);
      }
      raf = requestAnimationFrame(tick);
    }
    function syncToggle() {
      sc.classList.toggle('is-paused', userPaused);
      toggle.setAttribute('aria-label', userPaused ? '재생' : '일시정지');
    }

    toggle.addEventListener('click', function () { userPaused = !userPaused; syncToggle(); });
    document.getElementById('scStage').addEventListener('click', function () { show(idx + 1); });
    listBtns.forEach(function (b) {
      b.addEventListener('click', function () { show(+b.getAttribute('data-i')); });
    });
    sc.querySelector('.sc-window').addEventListener('mouseenter', function () { hover = true; });
    sc.querySelector('.sc-window').addEventListener('mouseleave', function () { hover = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(sc);
    } else { visible = true; }
    document.addEventListener('visibilitychange', function () { last = 0; });

    show(0);
    syncToggle();
    raf = requestAnimationFrame(tick);
  })();

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
})();
