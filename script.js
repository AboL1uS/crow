'use strict';

const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════════════════════════
   ИНТРО
══════════════════════════════════════════════════════════════ */
const IntroAttack = (() => {
  const overlay = $('introOverlay');
  const canvas  = $('introCanvas');
  if (!overlay || !canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let W, H, birds, raf, startTime;
  const DURATION = 4000;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

  class AttackBird {
    constructor() { this.reset(); }
    reset() {
      const angle  = Math.random() * Math.PI * 2;
      const dist   = Math.random() * 50 + 5;
      this.cx      = W / 2 + Math.cos(angle) * dist;
      this.cy      = H / 2 + Math.sin(angle) * dist;
      this.vx      = (Math.cos(angle) + (Math.random() - 0.5) * 0.4) * 0.8;
      this.vy      = (Math.sin(angle) + (Math.random() - 0.5) * 0.4) * 0.8;
      this.scale   = 0.04 + Math.random() * 0.07;
      this.scaleSpd= 0.016 + Math.random() * 0.022;
      this.phase   = Math.random() * Math.PI * 2;
      this.freq    = 0.06 + Math.random() * 0.04;
      this.alpha   = 0;
      this.dead    = false;
    }
    drawShape() {
      const beat = Math.sin(this.phase) * 14;
      ctx.beginPath(); ctx.ellipse(0,0,13,5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(13,-3,5.5,4,-0.25,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(18,-3); ctx.lineTo(26,-2); ctx.lineTo(18,1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-22,3); ctx.lineTo(-20,-1); ctx.lineTo(-11,0); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2,-2); ctx.bezierCurveTo(-2,-(beat+5),-13,-(beat+12),-22,-(beat+5)); ctx.bezierCurveTo(-13,-(beat-4),-5,1,2,-2); ctx.fill();
      const b2 = beat*0.35;
      ctx.beginPath();
      ctx.moveTo(1,2); ctx.bezierCurveTo(-3,b2+3,-11,b2+6,-20,b2+3); ctx.bezierCurveTo(-12,b2,-4,3,1,2); ctx.fill();
    }
    update() {
      const spd = 1 + this.scale * 8;
      this.cx += this.vx * spd; this.cy += this.vy * spd;
      this.scale = Math.min(this.scale + this.scaleSpd, 6);
      this.phase += this.freq;
      this.alpha = Math.min(this.alpha + 0.04, 0.9);
      if (this.cx < -400 || this.cx > W+400 || this.cy < -400 || this.cy > H+400) this.dead = true;
    }
    draw() {
      ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = '#0a0a0a';
      ctx.translate(this.cx, this.cy); ctx.scale(this.scale, this.scale);
      this.drawShape(); ctx.restore();
    }
  }

  const spawnWave = () => {
    const n = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) birds.push(new AttackBird());
  };

  const loop = ts => {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    ctx.clearRect(0, 0, W, H);
    birds = birds.filter(b => !b.dead);
    birds.forEach(b => { b.update(); b.draw(); });
    if (elapsed < DURATION) { raf = requestAnimationFrame(loop); }
    else { cancelAnimationFrame(raf); dismiss(); }
  };

  const dismiss = () => {
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.hidden = true; overlay.remove(); }, 1300);
  };

  const init = () => {
    resize();
    window.addEventListener('resize', resize);
    birds = []; startTime = null;
    spawnWave();
    const wt = setInterval(spawnWave, 900);
    setTimeout(() => clearInterval(wt), DURATION - 500);
    raf = requestAnimationFrame(loop);
    overlay.addEventListener('click', () => { cancelAnimationFrame(raf); dismiss(); }, { once: true });
  };

  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ФОНОВЫЕ ВОРОНЫ
══════════════════════════════════════════════════════════════ */
const BgCanvas = (() => {
  const canvas = $('bgCanvas');
  if (!canvas) return { init: () => {} };
  const ctx = canvas.getContext('2d');
  let W, H, birds;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

  class BgBird {
    constructor(rndX = false) { this.spawn(rndX); }
    spawn(rndX = false) {
      this.dir   = Math.random() < 0.15 ? -1 : 1;
      this.x     = rndX ? Math.random() * W : (this.dir === 1 ? -100 : W + 100);
      this.y     = Math.random() * H * 0.7 + H * 0.03;
      this.speed = 0.28 + Math.random() * 0.5;
      this.scale = 0.35 + Math.random() * 0.5;
      this.alpha = 0.04 + Math.random() * 0.1;
      this.phase = Math.random() * Math.PI * 2;
      this.freq  = 0.03 + Math.random() * 0.022;
      this.wobY  = (Math.random() - 0.5) * 0.014;
      this.dY    = 0;
    }
    offscreen() { return this.dir === 1 ? this.x > W+120 : this.x < -120; }
    drawShape() {
      const beat = Math.sin(this.phase) * 15;
      ctx.beginPath(); ctx.ellipse(0,0,13,5.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(13,-3,5.5,4.5,-0.25,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(18,-3); ctx.lineTo(26,-2); ctx.lineTo(18,1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-11,0); ctx.lineTo(-24,4); ctx.lineTo(-22,-1.5); ctx.lineTo(-11,0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2,-2); ctx.bezierCurveTo(-2,-(beat+5),-13,-(beat+12),-22,-(beat+5)); ctx.bezierCurveTo(-13,-(beat-4),-5,1,2,-2); ctx.fill();
      const b2 = beat*0.35;
      ctx.beginPath(); ctx.moveTo(1,2); ctx.bezierCurveTo(-3,b2+3,-11,b2+6,-20,b2+3); ctx.bezierCurveTo(-12,b2,-4,3,1,2); ctx.fill();
    }
    update() {
      this.x += this.speed * this.dir;
      this.phase += this.freq;
      this.dY += this.wobY;
      if (Math.abs(this.dY) > 10) this.wobY *= -1;
    }
    render() {
      if (this.offscreen()) { this.spawn(); return; }
      ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = '#0a0a0a';
      ctx.translate(this.x, this.y + this.dY); ctx.scale(this.scale * this.dir, this.scale);
      this.drawShape(); ctx.restore();
    }
  }

  const populate = () => {
    const n = Math.min(10, Math.max(4, Math.floor(W / 180)));
    birds = Array.from({ length: n }, () => new BgBird(true));
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    birds.forEach(b => { b.update(); b.render(); });
    if (Math.random() < 0.002 && birds.length < 14) birds.push(new BgBird(false));
    requestAnimationFrame(loop);
  };

  const init = () => {
    resize(); populate(); loop();
    window.addEventListener('resize', () => { resize(); populate(); });
  };

  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   СМЕНА ФОНА 
══════════════════════════════════════════════════════════════ */
const BgShift = (() => {
  const STATES = [null, 'bg-shift-2', 'bg-shift-3'];
  let current = 0;
  const next = () => {
    document.body.classList.remove('bg-shift-2', 'bg-shift-3');
    current = (current + 1) % STATES.length;
    if (STATES[current]) document.body.classList.add(STATES[current]);
  };
  const init = () => setInterval(next, 10000);
  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   МУЗЫКА
══════════════════════════════════════════════════════════════ */
const Music = (() => {
  const audio = $('bgMusic');
  const btn   = $('musicBtn');
  let playing = false, started = false;

  const fadeIn = () => {
    let v = 0;
    const step = () => { v = Math.min(v + 0.01, 0.72); audio.volume = v; if (v < 0.72) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  const tryPlay = () => {
    if (!audio || started) return;
    started = true;
    audio.volume = 0;
    audio.play().then(() => {
      playing = true; btn?.classList.add('playing'); fadeIn();
    }).catch(() => { started = false; });
  };

  const toggle = () => {
    if (!audio) return;
    if (!started) { tryPlay(); return; }
    if (playing) { audio.pause(); playing = false; btn?.classList.remove('playing'); }
    else { audio.play(); playing = true; btn?.classList.add('playing'); }
  };

  const init = () => {
    btn?.addEventListener('click', toggle);
    btn?.addEventListener('touchend', e => { e.preventDefault(); toggle(); });
    const auto = () => { tryPlay(); document.removeEventListener('click', auto); document.removeEventListener('touchstart', auto); document.removeEventListener('keydown', auto); };
    document.addEventListener('click', auto, { once: true });
    document.addEventListener('touchstart', auto, { once: true, passive: true });
    document.addEventListener('keydown', auto, { once: true });
  };

  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ГЛИТЧ-ЗАГОЛОВОК
══════════════════════════════════════════════════════════════ */
const GlitchTitle = (() => {
  const POOL = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ','∀','∂','∇','∈','∏','∑','√','∞','∫','≠','≡','≈','⊕','⊗','Ψ','Ξ','Λ','Γ','Σ','Φ','Ω','Δ','☽','☿','♄','♃','⚙','⚗','✦','✧','┼','╬','▓','░','▒','0','1','Ø','𝔄','𝔅','𝔇','𝔈','𝔉','𝔊','𝔍','𝔎','𝔏','𝔐'];
  const rand = () => POOL[Math.floor(Math.random() * POOL.length)];
  const letters = document.querySelectorAll('.t-letter');
  const TARGET  = 'RAVEN';

  const scrambleLetter = (el, final, frames = 9) => {
    let f = 0; el.classList.add('scrambling','glitch');
    const tick = () => { if (f < frames) { el.textContent = rand(); f++; requestAnimationFrame(tick); } else { el.textContent = final; el.classList.remove('scrambling','glitch'); } };
    requestAnimationFrame(tick);
  };
  const scrambleAll = () => { letters.forEach((el,i) => setTimeout(() => scrambleLetter(el, TARGET[i], 7+Math.floor(Math.random()*10)), i*75+Math.random()*50)); };
  const scrambleMicro = () => {
    const n = Math.random() < 0.35 ? 2 : 1, picks = [];
    while (picks.length < n) { const i = Math.floor(Math.random()*TARGET.length); if (!picks.includes(i)) picks.push(i); }
    picks.forEach(i => scrambleLetter(letters[i], TARGET[i], 4+Math.floor(Math.random()*7)));
  };
  const schedule = () => {
    const full = 7000+Math.random()*7000, micro = 1800+Math.random()*2500; let elapsed = 0;
    const mt = setInterval(() => { elapsed += micro; if (elapsed < full) scrambleMicro(); }, micro);
    setTimeout(() => { clearInterval(mt); scrambleAll(); schedule(); }, full);
  };
  const init = () => { setTimeout(scrambleAll, 1200); setTimeout(schedule, 4500); };
  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ПАСХАЛКА 1 — КОНСОЛЬ
══════════════════════════════════════════════════════════════ */
const ConsoleEgg = (() => {
  const init = () => {
    const S = { logo:'color:#c8b49a;font-size:1.8rem;font-family:serif;letter-spacing:0.25em;', rune:'color:#7a8fa6;font-size:1rem;font-family:monospace;letter-spacing:0.5em;', body:'color:#6a6460;font-size:0.75rem;font-family:monospace;line-height:1.8;', accent:'color:#c8b49a;font-size:0.72rem;font-family:monospace;', faint:'color:#2e2e2e;font-size:0.6rem;font-family:monospace;' };
    console.log('%c R A V E N ', S.logo);
    console.log('%cᚱ  ᚨ  ᚹ  ᛖ  ᚾ', S.rune);
    console.log('%c\n"The raven does not sing because it has answers.\nIt sings because it has outlived every question."\n', S.body);
    console.log('%c— ты должен был найти эту консоль.', S.accent);
    console.log('%c\n51.5081° N, 0.0759° W — The Tower of London.\nВороны там никогда не улетают. И ты тоже.\n', S.faint);
  };
  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ПАСХАЛКА 2 — ГЛАЗ ВОРОНА (3 клика)
══════════════════════════════════════════════════════════════ */
const EyeEgg = (() => {
  const eye     = $('ravenEye');
  const overlay = $('secretOverlay');
  const closeBtn = $('overlayClose');
  let clicks = 0, timer = null;

  const show = () => { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('visible')); document.body.style.overflow = 'hidden'; };
  const hide = () => { overlay.classList.remove('visible'); document.body.style.overflow = ''; setTimeout(() => { overlay.hidden = true; }, 900); };

  const handle = () => {
    clicks++;
    clearTimeout(timer);
    const gleam = $('ravenGleam');
    if (gleam) { gleam.style.fill = '#8a9abf'; setTimeout(() => { gleam.style.fill = ''; }, 200); }
    if (clicks >= 3) { clicks = 0; show(); return; }
    timer = setTimeout(() => { clicks = 0; }, 2500);
  };

  const init = () => {
    if (!eye || !overlay) return;
    eye.addEventListener('click', handle);
    eye.addEventListener('touchend', e => { e.preventDefault(); handle(); });
    eye.setAttribute('tabindex','0');
    eye.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') handle(); });
    closeBtn?.addEventListener('click', hide);
    closeBtn?.addEventListener('touchend', e => { e.preventDefault(); hide(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') hide(); });
    overlay.addEventListener('click', e => { if (e.target===overlay) hide(); });
  };

  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ПАСХАЛКА 3 — КОМБО R+A+V+E+N
══════════════════════════════════════════════════════════════ */
const ComboEgg = (() => {
  const KEYS  = new Set(['r','a','v','e','n']);
  const held  = new Set();
  const flash = $('comboFlash');
  const hint  = $('comboHint');
  let revealed = false;
  let flashActive = false;
  let revealTimer = null;

  const showFlash = (cb) => {
    if (flashActive) return;
    flashActive = true;
    flash?.classList.add('active');
    setTimeout(() => { flash?.classList.remove('active'); flashActive = false; if (cb) cb(); }, 1600);
  };

  const reveal = () => {
    document.body.classList.add('raven-revealed');
    document.body.classList.remove('bg-shift-2','bg-shift-3');
    console.log('%c☀ RAVEN REVEALED — завеса тьмы поднята.', 'color:#c8b49a;font-size:0.8rem;font-family:serif;letter-spacing:0.1em;');
  };

  const conceal = () => {
    document.body.classList.remove('raven-revealed');
  };

  const trigger = () => {
    if (flashActive) return;
    showFlash(() => {
      if (!revealed) { reveal(); revealed = true; }
      else { conceal(); revealed = false; }
    });
  };

  const initKeyboard = () => {
    document.addEventListener('keydown', e => {
      held.add(e.key.toLowerCase());
      if ([...KEYS].every(k => held.has(k))) trigger();
      if (hint && KEYS.has(e.key.toLowerCase())) hint.style.opacity = '0.22';
    });
    document.addEventListener('keyup', e => held.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => held.clear());
  };

  const initTouch = () => {
    const raven = $('perchedRaven');
    if (!raven) return;
    let tapBuf = [], burstCount = 0, burstTimer = null;
    raven.addEventListener('touchend', e => {
      if (e.target.id === 'ravenEye') return;
      e.preventDefault();
      const now = Date.now();
      tapBuf.push(now);
      tapBuf = tapBuf.filter(t => now - t < 1500);
      clearTimeout(burstTimer);
      if (tapBuf.length >= 3) {
        burstCount++; tapBuf = [];
        if (burstCount >= 2) { burstCount = 0; trigger(); }
        else burstTimer = setTimeout(() => { burstCount = 0; }, 3000);
      }
    }, { passive: false });
  };

  const init = () => { initKeyboard(); initTouch(); };
  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   ПАСХАЛКА 4 — НОЧНАЯ СТРАЖА (00:00 – 04:00)
══════════════════════════════════════════════════════════════ */
const NightEgg = (() => {
  const init = () => {
    const h = new Date().getHours();
    if (h >= 4) return;
    document.body.classList.add('night-mode');
    const banner = $('nightBanner');
    if (!banner) return;
    banner.hidden = false;
    setTimeout(() => banner.classList.add('visible'), 2400);
    const m = String(new Date().getMinutes()).padStart(2,'0');
    console.log(`%c🌑 ${h}:${m} — ночная стража видит тебя.`, 'color:#5a6a8a;font-family:monospace;');
  };
  return { init };
})();


/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */
const App = {
  init() {
    IntroAttack.init();
    BgCanvas.init();
    BgShift.init();
    Music.init();
    GlitchTitle.init();
    ConsoleEgg.init();
    EyeEgg.init();
    ComboEgg.init();
    NightEgg.init();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}