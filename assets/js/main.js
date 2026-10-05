/* 안찬웅 Portfolio — main.js */
(function () {
  'use strict';

  /* ---------- cursor glow ---------- */
  var glow = document.getElementById('glow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    var glowTick = false;
    window.addEventListener('pointermove', function (e) {
      if (glowTick) return;
      glowTick = true;
      window.requestAnimationFrame(function () {
        glow.style.setProperty('--gx', e.clientX + 'px');
        glow.style.setProperty('--gy', e.clientY + 'px');
        glowTick = false;
      });
    }, { passive: true });
  }

  /* ---------- active section in side nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.toc a'));

  function syncActive() {
    var line = window.innerHeight * 0.32;
    var current = sections.length ? sections[0].id : null;
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

  /* 인쇄(PDF 저장)할 때는 전부 펼친다 */
  window.addEventListener('beforeprint', function () {
    tasks.forEach(function (d) { d.open = true; });
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
})();
