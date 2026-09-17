/* Optimizely — comportamiento del clon */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Titular del hero curvado sobre un arco (letra por letra)
     --------------------------------------------------------------- */
  function arcTitle(el) {
    var text = el.dataset.arc || el.textContent;
    var chars = text.split('');
    var n = chars.length;
    var maxAngle = 12;   // grados de giro en los extremos
    var lift = 30;       // px que bajan los extremos respecto al centro

    el.textContent = '';

    chars.forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch === ' ' ? ' ' : ch;

      // t va de -1 (izquierda) a 1 (derecha)
      var t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
      var angle = t * maxAngle;
      var y = (t * t) * lift;   // parábola: extremos abajo, centro arriba

      span.style.transform = 'rotate(' + angle.toFixed(2) + 'deg) translateY(' + y.toFixed(1) + 'px)';
      el.appendChild(span);
    });
  }

  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle && window.innerWidth > 832) arcTitle(heroTitle);

  /* ---------------------------------------------------------------
     2. Reveal al entrar en viewport
     --------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     3. Marquee de logos — se duplica para el bucle continuo
     --------------------------------------------------------------- */
  var track = document.getElementById('marquee');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ---------------------------------------------------------------
     5. Menú móvil
     --------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('navMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------------------------------------------------------------
     6. Desplegables de la nav (solo estado visual)
     --------------------------------------------------------------- */
  document.querySelectorAll('.nav__link[aria-expanded]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.nav__link[aria-expanded]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---------------------------------------------------------------
     7. Clics de contacto → dataLayer (GTM)
     Un solo listener delegado cubre todos los enlaces tel: de la
     página, incluidos los que se añadan después. Un tel: no descarga
     la página, así que el push siempre llega a tiempo: no hace falta
     retrasar la navegación con eventCallback.
     --------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!link) return;

    var datos = {
      event: 'contacto_click',
      contacto_metodo: 'llamada',
      contacto_numero: link.getAttribute('href').slice(4),
      contacto_ubicacion: link.getAttribute('data-gtm-ubicacion') || 'sin-marcar',
      contacto_texto: (link.textContent || '').replace(/\s+/g, ' ').trim()
    };

    // Solo los botones de los planes llevan plan asociado
    var plan = link.getAttribute('data-gtm-plan');
    if (plan) datos.contacto_plan = plan;

    window.dataLayer.push(datos);
  });

})();
