/* Suvorya — theme behaviour: header scroll state, banner rotator,
   nav overflow, dropdowns, product rails, card image cycling. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- fixed chrome heights -> CSS vars ---------------------------------- */
  function measureChrome() {
    var banner = document.querySelector('[data-sv-banner]');
    var header = document.querySelector('[data-sv-header]');
    var root = document.documentElement;
    if (banner) root.style.setProperty('--banner-h', Math.ceil(banner.offsetHeight) + 'px');
    if (header) root.style.setProperty('--header-h', Math.ceil(header.offsetHeight) + 'px');
  }

  /* --- header scroll state ---------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('[data-sv-header]');
    if (!header) return;
    var transparent = header.hasAttribute('data-sv-transparent');
    function apply() {
      var on = !transparent || window.scrollY > 80;
      header.classList.toggle('is-scrolled', on);
    }
    apply();
    window.addEventListener('scroll', apply, { passive: true });

    if ('ResizeObserver' in window) {
      new ResizeObserver(measureChrome).observe(header);
    }
    initNavOverflow(header);
    initDropdowns(header);
  }

  /* --- nav overflow into "More" ----------------------------------------- */
  function initNavOverflow(header) {
    var row = header.querySelector('[data-sv-row]');
    var nav = header.querySelector('[data-sv-nav]');
    var icons = header.querySelector('[data-sv-icons]');
    var measure = header.querySelector('[data-sv-measure]');
    var moreItem = header.querySelector('[data-sv-more]');
    if (!row || !nav || !icons || !measure || !moreItem) return;

    var items = Array.prototype.slice.call(nav.querySelectorAll('[data-sv-nav-item]'));
    var overflowList = moreItem.querySelector('[data-sv-more-list]');
    var ghosts = Array.prototype.slice.call(measure.querySelectorAll('[data-ghost]'));
    var moreGhost = measure.querySelector('[data-ghost-more]');

    function recompute() {
      var gap = parseFloat(getComputedStyle(measure).gap) || 24;
      var available = row.clientWidth - icons.offsetWidth - gap;
      var moreWidth = (moreGhost ? moreGhost.offsetWidth : 40) + gap;
      var total = 0, count = 0;
      for (var i = 0; i < ghosts.length; i++) {
        var w = ghosts[i].offsetWidth + (i > 0 ? gap : 0);
        var reserve = (ghosts.length - 1 - i) > 0 ? moreWidth : 0;
        if (total + w + reserve > available) break;
        total += w; count++;
      }
      items.forEach(function (el, i) { el.hidden = i >= count; });
      Array.prototype.slice.call(overflowList.children).forEach(function (el, i) {
        el.hidden = i < count;
      });
      moreItem.hidden = count >= items.length;
    }

    recompute();
    if ('ResizeObserver' in window) new ResizeObserver(recompute).observe(row);
    window.addEventListener('resize', recompute);
  }

  /* --- dropdown panels -------------------------------------------------- */
  function initDropdowns(scope) {
    var wraps = Array.prototype.slice.call(scope.querySelectorAll('[data-sv-dropdown]'));
    wraps.forEach(function (wrap) {
      var trigger = wrap.querySelector('[data-sv-dropdown-trigger]');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var open = wrap.classList.contains('is-open');
        wraps.forEach(function (w) { w.classList.remove('is-open'); });
        wrap.classList.toggle('is-open', !open);
        trigger.setAttribute('aria-expanded', String(!open));
      });
    });
    document.addEventListener('click', function (e) {
      wraps.forEach(function (w) {
        if (!w.contains(e.target)) {
          w.classList.remove('is-open');
          var t = w.querySelector('[data-sv-dropdown-trigger]');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') wraps.forEach(function (w) { w.classList.remove('is-open'); });
    });
  }

  /* --- mobile nav drawer -------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('[data-sv-menu-toggle]');
    var nav = document.querySelector('[data-sv-mobile-nav]');
    if (!toggle || !nav) return;
    var closeBtn = nav.querySelector('[data-sv-mobile-close]');
    var scrim = nav.querySelector('[data-sv-mobile-scrim]');

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) close(); else open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 749) close();
    });

    Array.prototype.slice.call(nav.querySelectorAll('[data-sv-mobile-trigger]')).forEach(function (trigger) {
      var sub = trigger.parentElement.querySelector('[data-sv-mobile-sub]');
      if (!sub) return;
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        sub.style.maxHeight = isOpen ? '' : sub.scrollHeight + 'px';
      });
    });
  }

  /* --- announcement bar rotator ----------------------------------------- */
  function initBanner() {
    var banner = document.querySelector('[data-sv-banner]');
    if (!banner) return;
    var msgs = Array.prototype.slice.call(banner.querySelectorAll('[data-sv-msg]'));
    var confetti = banner.querySelector('[data-sv-confetti]');
    if (!msgs.length) return;
    var i = 0;
    var interval = parseInt(banner.getAttribute('data-interval'), 10) || 5500;

    function paint() {
      msgs.forEach(function (m, n) {
        m.style.transform = 'translateY(' + ((n - i) * 100) + '%)';
      });
      if (confetti) {
        confetti.classList.toggle('is-on', msgs[i].getAttribute('data-confetti') === 'true');
      }
    }
    paint();
    if (msgs.length > 1) {
      setInterval(function () { i = (i + 1) % msgs.length; paint(); }, interval);
    }

    // confetti pieces are generated here so the markup stays clean
    if (confetti && !reduce) {
      var colors = ['#FFC300', '#FF8A00', '#F5E6C8', '#FFA700', '#FFE9A8', '#E8792A'];
      var shapes = [[3, 8, '0'], [5, 5, '50%'], [6, 3, '0']];
      var frag = document.createDocumentFragment();
      for (var n = 0; n < 52; n++) {
        var piece = document.createElement('i');
        var s = shapes[n % 3];
        piece.style.left = (0.8 + n * 1.93).toFixed(1) + '%';
        piece.style.width = s[0] + 'px';
        piece.style.height = s[1] + 'px';
        piece.style.background = colors[n % colors.length];
        piece.style.animationDuration = (3.2 + (n % 6) * 0.5).toFixed(2) + 's';
        piece.style.animationDelay = ((n * 0.29) % 5).toFixed(2) + 's';
        frag.appendChild(piece);
      }
      confetti.appendChild(frag);
    }
  }

  /* --- product rails ---------------------------------------------------- */
  function initRails() {
    Array.prototype.slice.call(document.querySelectorAll('[data-sv-rail-wrap]')).forEach(function (wrap) {
      var rail = wrap.querySelector('[data-sv-rail]');
      var prev = wrap.querySelector('[data-sv-prev]');
      var next = wrap.querySelector('[data-sv-next]');
      var thumb = wrap.querySelector('[data-sv-thumb]');
      if (!rail) return;
      var anim;

      function measure() {
        var max = rail.scrollWidth - rail.clientWidth;
        var ratio = rail.scrollWidth ? Math.min(1, rail.clientWidth / rail.scrollWidth) : 1;
        var progress = max > 0 ? rail.scrollLeft / max : 0;
        if (thumb) {
          thumb.style.width = (ratio * 100).toFixed(2) + '%';
          thumb.style.left = (progress * (1 - ratio) * 100).toFixed(2) + '%';
        }
        if (prev) prev.classList.toggle('is-available', rail.scrollLeft > 2);
        if (next) next.classList.toggle('is-available', rail.scrollLeft < max - 2);
      }

      function step(dir) {
        var card = rail.firstElementChild;
        var gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 20;
        var pitch = card ? card.getBoundingClientRect().width + gap : rail.clientWidth * 0.75;
        var steps = Math.max(1, Math.floor((rail.clientWidth * 0.8) / pitch));
        var max = rail.scrollWidth - rail.clientWidth;
        var from = rail.scrollLeft;
        var target = Math.max(0, Math.min(max, Math.round((from + dir * steps * pitch) / pitch) * pitch));
        if (reduce) { rail.scrollLeft = target; measure(); return; }
        cancelAnimationFrame(anim);
        var start = performance.now(), dur = 420;
        (function tick(now) {
          var p = Math.min(1, ((now || start) - start) / dur);
          var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          rail.scrollLeft = from + (target - from) * e;
          measure();
          if (p < 1) anim = requestAnimationFrame(tick);
        })(start);
      }

      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });
      rail.addEventListener('scroll', measure, { passive: true });
      window.addEventListener('resize', measure);
      requestAnimationFrame(measure);
    });
  }

  /* --- card image cycling on hover -------------------------------------- */
  function initCardHover() {
    Array.prototype.slice.call(document.querySelectorAll('[data-sv-slide]')).forEach(function (media) {
      var imgs = Array.prototype.slice.call(media.querySelectorAll('img'));
      if (imgs.length < 2) return;
      var i = 0, timer;
      function show(n) {
        imgs.forEach(function (img, k) { img.classList.toggle('is-active', k === n); });
      }
      media.closest('.sv-card').addEventListener('mouseenter', function () {
        if (reduce) return;
        clearInterval(timer);
        timer = setInterval(function () { i = (i + 1) % imgs.length; show(i); }, 900);
      });
      media.closest('.sv-card').addEventListener('mouseleave', function () {
        clearInterval(timer); i = 0; show(0);
      });
    });
  }

  function boot() {
    initHeader();
    initMobileMenu();
    initBanner();
    initRails();
    initCardHover();
    measureChrome();
    window.addEventListener('resize', measureChrome);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Theme-editor reloads re-render sections in place
  document.addEventListener('shopify:section:load', boot);
})();
