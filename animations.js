(function () {
  'use strict';
  var root = document.documentElement;
  try {
    if (/[?&]captura=1(&|$)/.test(location.search)) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    var DUR = 700, STEP = 100;
    var items = [];

    function arr(l) { return Array.prototype.slice.call(l); }
    function isCard(el) { return /\brounded-(xl|2xl|3xl)\b/.test(el.className || ''); }
    function isStarGroup(el) {
      var k = arr(el.children);
      return k.length >= 2 && k.every(function (s) { return /^star$/.test((s.textContent || '').trim()); });
    }
    function isStagger(el) {
      var k = arr(el.children);
      return k.length >= 2 && /(^|\s)(grid|flex-col)(\s|$)/.test(el.className || '') && k.every(isCard);
    }
    function add(el, delay, card) {
      if (!el || el.__an) return;
      el.__an = true;
      el.classList.add('an-r');
      el.style.transitionDelay = delay + 'ms';
      items.push({ el: el, delay: delay, card: card });
    }

    ['view-desktop', 'view-mobile'].forEach(function (id) {
      var c = document.getElementById(id);
      if (!c) return;
      var secs = arr(c.querySelectorAll('main section'));
      var heroItems = [];

      secs.forEach(function (s, i) {
        if (i === 0) {
          var host = s.querySelector('.grid') || s;
          var kids = arr(host.children).sort(function (a, b) {
            return (a.querySelector('img') ? 1 : 0) - (b.querySelector('img') ? 1 : 0);
          });
          kids.forEach(function (k, j) { add(k, j * 200, false); heroItems.push(k); });
          return;
        }
        arr(s.children).forEach(function (ch) {
          if (/\babsolute\b/.test(ch.className || '')) return;
          if (isStagger(ch)) {
            arr(ch.children).forEach(function (k, j) { add(k, j * STEP, true); });
          } else {
            add(ch, 0, isCard(ch));
          }
        });
      });

      arr(c.querySelectorAll('footer')).forEach(function (f) {
        arr(f.children).forEach(function (ch) { add(ch, 0, false); if (ch.__an) ch.classList.add('an-nt'); });
      });

      arr(c.querySelectorAll('div')).forEach(function (d) {
        if (!isStarGroup(d)) return;
        arr(d.children).forEach(function (s, j) {
          s.classList.add('an-s');
          s.style.transitionDelay = (j * 90) + 'ms';
          items.push({ el: s, delay: j * 90, star: true, hero: false });
        });
      });

      heroItems.forEach(function (h) {
        var it = items.filter(function (x) { return x.el === h; })[0];
        if (it) it.hero = true;
      });
    });

    var pulse = document.querySelector('#view-mobile .fixed.bottom-20 a');
    if (pulse) pulse.classList.add('an-pulse');

    function settle(it) {
      var el = it.el;
      el.classList.remove('an-r', 'an-s', 'an-in', 'an-nt');
      el.style.transitionDelay = '';
      if (it.card) {
        el.classList.add('an-card');
        var cs = getComputedStyle(el);
        if (cs.transitionProperty.indexOf('all') === -1) {
          el.style.transition = (cs.transitionDuration.replace(/[0s,\s]/g, '') ? cs.transition + ', ' : '') + 'translate 300ms ease-out';
        }
      }
    }
    function show(it) {
      it.el.classList.add('an-in');
      setTimeout(function () { settle(it); }, (it.star ? 300 : DUR) + it.delay + 80);
    }

    var byEl = new Map();
    items.forEach(function (it) { byEl.set(it.el, it); });

    var starParents = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var it = byEl.get(e.target);
        if (it) show(it);
        else (starParents.get(e.target) || []).forEach(show);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (it) {
      if (it.star) {
        var p = it.el.parentNode;
        if (!starParents.has(p)) { starParents.set(p, []); io.observe(p); }
        starParents.get(p).push(it);
      } else if (!it.hero) {
        io.observe(it.el);
      }
    });

    root.classList.add('an-on');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        items.forEach(function (it) { if (it.hero) show(it); });
      });
    });

    // Botones de WhatsApp: transicion suave de elevacion en hover (sin pisar las transiciones existentes)
    arr(document.querySelectorAll('a[href*="wa.me"]')).forEach(function (a) {
      var cs = getComputedStyle(a);
      if (cs.transitionProperty.indexOf('all') === -1) {
        a.style.transition = (cs.transitionDuration.replace(/[0s,\s]/g, '') ? cs.transition + ', ' : '') + 'translate 300ms ease-out, box-shadow 300ms ease-out';
      }
    });
  } catch (err) {
    root.classList.remove('an-on');
    arr0(document.querySelectorAll('.an-r,.an-s'));
  }
  function arr0(l) {
    Array.prototype.forEach.call(l, function (e) { e.classList.remove('an-r', 'an-s', 'an-in'); e.style.transitionDelay = ''; });
  }
})();
