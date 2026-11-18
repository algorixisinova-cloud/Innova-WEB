/* ============================================================
   ALGORIXIS INNOVA — script.js
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ PRELOADER ============ */
(function preloader() {
  document.body.classList.add('loading');
  const fill = document.getElementById('preloaderFill');
  const pre = document.getElementById('preloader');
  if (!fill || !pre) return;
  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 18;
    if (p >= 100) {
      p = 100;
      clearInterval(tick);
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.remove('loading');
        window.dispatchEvent(new Event('preloaderDone'));
      }, 300);
    }
    fill.style.width = p + '%';
  }, 90);
})();

/* ============ LENIS SMOOTH SCROLL ============ */
let lenis = null;
function initLenis() {
  if (prefersReduced || typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}
initLenis();

/* ============ ANCHOR SCROLL (usa Lenis si está) ============ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
    if (lenis) lenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============ PROGRESS BAR ============ */
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
  progressBar.style.width = pct + '%';
}

/* ============ NAV SCROLLED ============ */
const nav = document.getElementById('nav');
function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

/* Integrar con Lenis si está, si no con scroll nativo */
if (lenis) {
  lenis.on('scroll', () => { updateProgress(); updateNav(); });
} else {
  window.addEventListener('scroll', () => { updateProgress(); updateNav(); }, { passive: true });
}
updateProgress(); updateNav();

/* ============ CUSTOM CURSOR ============ */
(function cursor() {
  if (prefersReduced) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let dx = mx, dy = my, rx = mx, ry = my;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function loop() {
    dx += (mx - dx) * 0.5;
    dy += (my - dy) * 0.5;
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, summary, .chip, .tag, .bento-card, .iso-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
  });
})();

/* ============ EXPLOSION PARTICLES ============ */
(function explosion() {
  const box = document.getElementById('explosion');
  if (!box || prefersReduced) return;
  const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fb923c', '#ffffff'];
  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 160 + Math.random() * 500;
    p.style.setProperty('--x', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--y', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--size', (2 + Math.random() * 6) + 'px');
    p.style.setProperty('--duration', (2.5 + Math.random() * 2) + 's');
    p.style.setProperty('--delay', (Math.random() * 4) + 's');
    p.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
    box.appendChild(p);
  }
})();

/* ============ GSAP: REVEALS + SCROLLTRIGGER ============ */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Fallback: mostrar todo
    document.querySelectorAll('.reveal').forEach(el => el.style.opacity = 1);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Hero title: palabras con stagger
  const heroWords = document.querySelectorAll('.hero-title .word');
  if (heroWords.length) {
    gsap.set(heroWords, { y: 40, opacity: 0 });
    gsap.to(heroWords, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.08,
      ease: 'power2.out', delay: 1.4
    });
  }

  // Reveals: fade + slide-up con stagger por contenedor
  document.querySelectorAll('.reveal').forEach(el => {
    const parent = el.parentElement;
    const isStagger = parent && (
      parent.classList.contains('bento') ||
      parent.classList.contains('iso-grid') ||
      parent.classList.contains('stats-row') ||
      parent.classList.contains('faq-list')
    );
    const idx = isStagger ? Array.from(parent.children).indexOf(el) : 0;
    const delay = isStagger ? idx * 0.12 : 0;

    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

/* Esperar a que el preloader termine + GSAP cargado */
window.addEventListener('preloaderDone', () => {
  // Pequeño delay para que Lenis se estabilice
  setTimeout(initGSAP, 50);
});

/* Fallback: si el preloader no dispara el evento (ej: reduce motion), inicializar igual */
setTimeout(() => {
  if (!document.querySelector('.reveal[style*="opacity: 1"]') && !document.querySelector('.hero-title .word[style*="opacity: 1"]')) {
    initGSAP();
  }
}, 2500);

/* ============ COUNTERS ============ */
(function counters() {
  function animate(el) {
    const target = parseInt(el.dataset.counter, 10);
    const dur = 1800;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    (function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(easeOut(t) * target);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(start);
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
})();

/* ============ BENTO GLOW (sigue al cursor) ============ */
(function bentoGlow() {
  if (prefersReduced) return;
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ============ MAGNETIC BUTTONS ============ */
(function magnetic() {
  if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ============ TERMINAL TYPING ============ */
(function terminal() {
  const codeEl = document.getElementById('terminalCode');
  const box = document.getElementById('terminalBox');
  if (!codeEl || !box) return;

  const lines = [
    { t: 'from flask import Flask, render_template, request\n', c: '' },
    { t: 'from models import db, Hallazgo, CAPA\n\n', c: '' },
    { t: 'app = Flask(__name__)\n\n', c: '' },
    { t: '@app.route("/hallazgos")\n', c: 'tk-kw' },
    { t: 'def listar_hallazgos():\n', c: 'tk-fn' },
    { t: '    query = Hallazgo.query.filter_by(\n', c: '' },
    { t: '        estado="abierto"\n', c: 'tk-str' },
    { t: '    ).order_by(Hallazgo.fecha.desc())\n', c: '' },
    { t: '    return render_template("hallazgos.html",\n', c: '' },
    { t: '                           items=query.all())\n\n', c: '' },
    { t: '@app.route("/capa/nueva", methods=["POST"])\n', c: 'tk-kw' },
    { t: 'def nueva_capa():\n', c: 'tk-fn' },
    { t: '    capa = CAPA(\n', c: '' },
    { t: '        hallazgo_id=request.form["id"],\n', c: 'tk-var' },
    { t: '        responsable=request.form["resp"],\n', c: 'tk-var' },
    { t: '        accion=request.form["accion"],\n', c: 'tk-var' },
    { t: '        plazo=request.form["plazo"]\n', c: 'tk-var' },
    { t: '    )\n', c: '' },
    { t: '    db.session.add(capa)\n', c: '' },
    { t: '    db.session.commit()\n', c: '' },
    { t: '    return {"status": "ok", "id": capa.id}\n', c: '' }
  ];

  const full = lines.map(l => l.t).join('');
  let typed = false;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function renderUpTo(index) {
    let html = '';
    let pos = 0;
    for (const line of lines) {
      const end = pos + line.t.length;
      if (index >= end) {
        html += line.c ? `<span class="${line.c}">${esc(line.t)}</span>` : esc(line.t);
      } else if (index > pos) {
        const visible = line.t.slice(0, index - pos);
        html += line.c ? `<span class="${line.c}">${esc(visible)}</span>` : esc(visible);
        break;
      } else break;
      pos = end;
    }
    codeEl.innerHTML = html;
  }

  function start() {
    if (typed) return;
    typed = true;
    let i = 0;
    (function next() {
      if (i > full.length) return;
      renderUpTo(i);
      i += 1;
      setTimeout(next, prefersReduced ? 0 : 16);
    })();
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { start(); obs.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  obs.observe(box);
})();

/* ============ PROCESO CON PINNING ============ */
(function processPin() {
  const pin = document.getElementById('processPin');
  const current = document.getElementById('processCurrent');
  const progress = document.querySelector('.process-progress');
  if (!pin || !current || !progress) return;

  const steps = pin.querySelectorAll('.process-step');
  const total = steps.length;
  const CIRC = 2 * Math.PI * 88; // r=88

  function setStep(n) {
    steps.forEach((s, i) => s.classList.toggle('active', i === n));
    current.textContent = String(n + 1).padStart(2, '0');
    progress.style.strokeDashoffset = String(CIRC * (1 - (n + 1) / total));
  }

  // Estado inicial
  setStep(0);

  if (typeof ScrollTrigger === 'undefined' || prefersReduced) {
    // Fallback: rotar por intervalo
    let i = 0;
    setInterval(() => { i = (i + 1) % total; setStep(i); }, 3000);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: pin,
    start: 'top center',
    end: 'bottom center',
    pin: !prefersReduced,
    pinSpacing: true,
    onUpdate: (self) => {
      const idx = Math.min(total - 1, Math.floor(self.progress * total));
      if (!steps[idx].classList.contains('active')) setStep(idx);
    }
  });
})();

/* ============ SWIPER TESTIMONIOS ============ */
(function swiper() {
  if (typeof Swiper === 'undefined') return;
  new Swiper('.testimonialSwiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: false,
    grabCursor: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1100: { slidesPerView: 3 }
    }
  });
})();

/* ============ SISTEMA SHOWCASE (tabs) ============ */
(function systemShowcase() {
  const mainImg = document.getElementById('systemMainImg');
  const browserPath = document.getElementById('browserPath');
  const tabs = document.querySelectorAll('.system-tab');
  if (!mainImg || !tabs.length) return;

  // Precargar las imágenes para que el cambio sea instantáneo
  const imgNames = ['sistema-panel.png','sistema-operacion.png','sistema-mejora.png','sistema-planificacion.png'];
  imgNames.forEach(n => { const i = new Image(); i.src = 'assets/' + n; });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const newSrc = 'assets/' + tab.dataset.img;
      const newPath = tab.dataset.path || '';

      mainImg.classList.add('changing');
      setTimeout(() => {
        mainImg.src = newSrc;
        if (browserPath) browserPath.textContent = newPath;
        mainImg.onload = () => {
          mainImg.classList.remove('changing');
          mainImg.onload = null;
        };
        // Fallback por si onload no dispara
        setTimeout(() => mainImg.classList.remove('changing'), 350);
      }, 220);
    });
  });

  // Auto-rotación cada 6s mientras está visible (opcional)
  let autoIdx = 0;
  const autoObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const timer = setInterval(() => {
          autoIdx = (autoIdx + 1) % tabs.length;
          tabs[autoIdx].click();
        }, 6000);
        // Detener si sale de vista
        const stopObs = new IntersectionObserver(entries2 => {
          entries2.forEach(e2 => {
            if (!e2.isIntersecting) { clearInterval(timer); stopObs.disconnect(); }
          });
        });
        stopObs.observe(e.target);
      }
    });
  }, { threshold: 0.3 });
  autoObs.observe(document.querySelector('.system-showcase'));
})();

/* ============ WHATSAPP + BACK TO TOP + SIDE NAV ============ */
(function globalExtras() {
  const wa = document.getElementById('waFloat');
  const btt = document.getElementById('backToTop');
  const sideNav = document.getElementById('sideNav');
  const bttCircle = btt ? btt.querySelector('.btt-progress circle') : null;
  const CIRC = 2 * Math.PI * 20;

  function update() {
    const y = window.scrollY;
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);

    if (wa) wa.classList.toggle('visible', y > 300);
    if (btt) btt.classList.toggle('visible', y > 600);
    if (sideNav) sideNav.classList.toggle('visible', y > 400);

    if (bttCircle) {
      bttCircle.style.strokeDashoffset = String(CIRC * (1 - pct));
    }

    // Side nav activo
    if (sideNav) {
      const sections = sideNav.querySelectorAll('a');
      let active = null;
      sections.forEach(a => {
        const target = document.getElementById(a.dataset.section);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
          active = a;
        }
      });
      sections.forEach(a => a.classList.toggle('active', a === active));
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  if (btt) {
    btt.addEventListener('click', () => {
      if (window.lenis) window.lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ============ FORM VALIDACIÓN + ÉXITO ============ */
(function formSuccess() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Crear bloque de éxito si no existe
  if (!form.querySelector('.form-success')) {
    const div = document.createElement('div');
    div.className = 'form-success';
    div.innerHTML = `
      <div class="form-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3>Mensaje enviado</h3>
      <p>Gracias por escribirnos. Te vamos a responder dentro de las próximas 24 horas.</p>
    `;
    form.appendChild(div);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const action = form.getAttribute('action');
    const data = new FormData(form);

    // Validación básica
    const nombre = data.get('nombre')?.trim();
    const email = data.get('email')?.trim();
    const mensaje = data.get('mensaje')?.trim();
    if (!nombre || !email || !mensaje) {
      alert('Por favor completá nombre, email y mensaje.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok || res.status === 302) {
        form.classList.add('success');
      } else {
        throw new Error('Error en el envío');
      }
    } catch (err) {
      // Fallback: enviar de la forma tradicional
      btn.textContent = originalText;
      btn.disabled = false;
      form.submit();
    }
  });
})();

/* ============ GLOBAL EXTRAS ============ */
(function globalExtras() {
  const wa = document.getElementById('waFloat');
  const btt = document.getElementById('backToTop');
  const sideNav = document.getElementById('sideNav');
  const bttCircle = btt ? btt.querySelector('.btt-progress circle') : null;
  const CIRC = 2 * Math.PI * 20;

  function update() {
    const y = window.scrollY;
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);

    // WhatsApp: aparece a los 300px
    if (wa) wa.classList.toggle('visible', y > 300);
    // Back to top: aparece a los 500px
    if (btt) btt.classList.toggle('visible', y > 500);
    // Side nav: aparece a los 400px
    if (sideNav) sideNav.classList.toggle('visible', y > 400);

    if (bttCircle) {
      bttCircle.style.strokeDashoffset = String(CIRC * (1 - pct));
    }

    // Side nav activo
    if (sideNav) {
      const links = sideNav.querySelectorAll('a');
      let active = null;
      links.forEach(a => {
        const target = document.getElementById(a.dataset.section);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
          active = a;
        }
      });
      links.forEach(a => a.classList.toggle('active', a === active));
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  if (btt) {
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ============ FORM SUCCESS ============ */
(function formSuccess() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  if (!form.querySelector('.form-success')) {
    const div = document.createElement('div');
    div.className = 'form-success';
    div.innerHTML = '<div class="form-success-icon">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<h3>Mensaje enviado</h3>' +
      '<p>Gracias por escribirnos. Te vamos a responder dentro de las próximas 24 horas.</p>';
    form.appendChild(div);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get('nombre') || '').trim();
    const email = (data.get('email') || '').trim();
    const mensaje = (data.get('mensaje') || '').trim();
    if (!nombre || !email || !mensaje) {
      alert('Por favor completá nombre, email y mensaje.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    fetch(form.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function(res) {
      form.classList.add('success');
    }).catch(function() {
      // Fallback: enviar tradicional
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      form.submit();
    });
  });
})();

/* ============ CALCULADORA ROI ============ */
(function calculadoraROI() {
  const emp = document.getElementById('calcEmpleados');
  const hor = document.getElementById('calcHoras');
  const cos = document.getElementById('calcCosto');
  if (!emp || !hor || !cos) return;

  const empOut = document.getElementById('calcEmpleadosOut');
  const horOut = document.getElementById('calcHorasOut');
  const cosOut = document.getElementById('calcCostoOut');
  const res = document.getElementById('calcResult');
  const horasTotal = document.getElementById('calcHorasTotal');
  const costoTotal = document.getElementById('calcCostoTiempo');
  const costoAud = document.getElementById('calcCostoAuditoria');
  const pills = document.querySelectorAll('.calc-pill');

  // Semanas laborales por año (descontando vacaciones y feriados)
  const SEMANAS = 46;
  // Costo estimado de una auditoría (horas de preparación + documentación)
  const HORAS_AUDITORIA = 25;
  // Ahorro base por automatizar hallazgos y CAPA
  const FACTOR_AHORRO = 0.72;
  // Porcentaje del tiempo que se recupera con el sistema
  const FACTOR_TIEMPO = 0.75;

  let auditorias = 3;

  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      auditorias = parseFloat(p.dataset.value);
      calcular();
    });
  });

  function animarValor(el, valorFinal) {
    const actual = parseInt(el.textContent.replace(/\D/g, '')) || 0;
    const pasos = 20;
    const diff = valorFinal - actual;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      const v = Math.round(actual + (diff * i / pasos));
      el.textContent = v.toLocaleString('es-AR');
      if (i >= pasos) {
        clearInterval(timer);
        el.textContent = valorFinal.toLocaleString('es-AR');
      }
    }, 20);
  }

  function calcular() {
    const e = parseFloat(emp.value);
    const h = parseFloat(hor.value);
    const c = parseFloat(cos.value);

    // Actualizar outputs
    empOut.textContent = e;
    horOut.textContent = h + ' h';
    cosOut.textContent = 'USD ' + c;

    // Cálculos
    const horasAnio = e * h * SEMANAS;
    const costoAnio = horasAnio * c;
    const recuperado = horasAnio * FACTOR_TIEMPO;
    const costoAudit = auditorias * HORAS_AUDITORIA * c * FACTOR_AHORRO;
    const total = Math.round(costoAnio * FACTOR_AHORRO + costoAudit);

    // Render
    animarValor(res, total);
    horasTotal.textContent = Math.round(recuperado).toLocaleString('es-AR') + ' h';
    costoTotal.textContent = 'USD ' + Math.round(costoAnio).toLocaleString('es-AR');
    costoAud.textContent = 'USD ' + Math.round(costoAudit).toLocaleString('es-AR');
  }

  [emp, hor, cos].forEach(el => {
    el.addEventListener('input', calcular);
  });

  calcular();
})();



/* ============ FORM SUCCESS ============ */
(function formSuccess() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  if (!form.querySelector('.form-success')) {
    const div = document.createElement('div');
    div.className = 'form-success';
    div.innerHTML = '<div class="form-success-icon">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<h3>Mensaje enviado</h3>' +
      '<p>Gracias por escribirnos. Te vamos a responder dentro de las próximas 24 horas.</p>';
    form.appendChild(div);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get('nombre') || '').trim();
    const email = (data.get('email') || '').trim();
    const mensaje = (data.get('mensaje') || '').trim();
    if (!nombre || !email || !mensaje) {
      alert('Por favor completá nombre, email y mensaje.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Cambiar el action a /ajax/ para que devuelva JSON
    let action = form.getAttribute('action');
    if (action.indexOf('/ajax/') === -1) {
      action = action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    }

    fetch(action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(res) {
      console.log('FormSubmit response status:', res.status);
      return res.json().catch(function() { return { status: res.status }; });
    })
    .then(function(json) {
      console.log('FormSubmit response:', json);
      if (json.success === 'true' || json.success === true || json.status === 200) {
        form.classList.add('success');
      } else {
        // FormSubmit no confirmado todavía o error
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Hubo un problema al enviar el mensaje. Detalle: ' + JSON.stringify(json));
      }
    })
    .catch(function(err) {
      console.error('Error al enviar:', err);
      btn.textContent = originalText;
      btn.disabled = false;
      alert('Error de red al enviar el mensaje. Verificá tu conexión e intentá de nuevo.');
    });
  });
})();
