// Arka plan etkileşim alanı: esnek ızgara + akışkan ışık izi + toz parçacıkları.
// İki canvas kullanır: `fx` (ışık + toz, her karede çizilir) ve `grid` (yalnızca ızgara
// hareket ederken ya da sayfa kayınca yeniden çizilir). CSS'teki 28px ızgarayla birebir hizalıdır.

const GRID = 28;

// Esnek ızgara
const RADIUS = 150; // fare etki yarıçapı
const PUSH = 0.85; // itme kuvveti
const DRAG = 0.045; // fare hızının çizgileri sürüklemesi
const SPRING = 0.07; // yay sertliği
const DAMPING = 0.86; // sönümleme (düşük = daha çok salınım)
const MAX_OFFSET = 12;

// Toz parçacıkları
const ATTRACT_RADIUS = 190;
const ATTRACT = 0.32;

interface Colors {
  grid: string;
  gridActive: string;
  glow: string; // "r, g, b"
  glowStrength: number;
  dust: string;
}

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
  orbit: number;
  speed: number;
}

interface TrailNode {
  x: number;
  y: number;
  r: number;
  life: number;
}

function readColors(): Colors {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    grid: v('--grid'),
    gridActive: v('--field-grid-active'),
    glow: v('--field-glow'),
    glowStrength: Number(v('--field-glow-strength')) || 0.1,
    dust: v('--field-dust'),
  };
}

export function startField(gridCanvas: HTMLCanvasElement, fxCanvas: HTMLCanvasElement, spotlight?: HTMLElement): () => void {
  const g = gridCanvas.getContext('2d')!;
  const f = fxCanvas.getContext('2d')!;

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let dx = new Float32Array(0);
  let dy = new Float32Array(0);
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let particles: Particle[] = [];
  const trail: TrailNode[] = [];
  let colors = readColors();
  let gridDirty = true;
  let raf = 0;
  let frameCount = 0;

  const mouse = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, inside: false, lastX: 0, lastY: 0 };

  const scrollOffset = () => window.scrollY % GRID;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    for (const [canvas, ctx] of [[gridCanvas, g], [fxCanvas, f]] as const) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    cols = Math.ceil(w / GRID) + 2;
    rows = Math.ceil(h / GRID) + 2;
    const n = cols * rows;
    dx = new Float32Array(n);
    dy = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);

    const count = Math.max(30, Math.min(110, Math.round((w * h) / 15000)));
    particles = Array.from({ length: count }, () => {
      const hx = Math.random() * w;
      const hy = Math.random() * h;
      return {
        hx, hy, x: hx, y: hy, vx: 0, vy: 0,
        r: 0.6 + Math.random() * 0.9,
        alpha: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        orbit: 6 + Math.random() * 18,
        speed: (0.00012 + Math.random() * 0.00028) * (Math.random() < 0.5 ? -1 : 1),
      };
    });
    gridDirty = true;
  }

  /** Izgara fiziği; çizgiler hâlâ hareket ediyorsa true döner. */
  function stepGrid(): boolean {
    const oy = scrollOffset();
    const r2 = RADIUS * RADIUS;
    let motion = 0;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        let ax = -SPRING * dx[k];
        let ay = -SPRING * dy[k];
        if (mouse.inside) {
          const ex = i * GRID + dx[k] - mouse.x;
          const ey = j * GRID - oy + dy[k] - mouse.y;
          const d2 = ex * ex + ey * ey;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const fall = 1 - d / RADIUS;
            const force = PUSH * fall * fall;
            ax += (ex / d) * force + mouse.vx * DRAG * fall;
            ay += (ey / d) * force + mouse.vy * DRAG * fall;
          }
        }
        vx[k] = (vx[k] + ax) * DAMPING;
        vy[k] = (vy[k] + ay) * DAMPING;
        dx[k] = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx[k] + vx[k]));
        dy[k] = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy[k] + vy[k]));
        motion += Math.abs(vx[k]) + Math.abs(vy[k]);
      }
    }
    return motion > 0.02;
  }

  function drawGrid() {
    const oy = scrollOffset();
    const px = (k: number, i: number) => i * GRID + dx[k] + 0.5;
    const py = (k: number, j: number) => j * GRID - oy + dy[k] + 0.5;

    g.clearRect(0, 0, w, h);
    g.lineWidth = 1;
    g.strokeStyle = colors.grid;
    g.beginPath();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const k = j * cols + i;
        if (j === 0) g.moveTo(px(k, i), py(k, j));
        else g.lineTo(px(k, i), py(k, j));
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (i === 0) g.moveTo(px(k, i), py(k, j));
        else g.lineTo(px(k, i), py(k, j));
      }
    }
    g.stroke();

    // Farenin çevresinde çizgiler hafifçe belirginleşir; esneme böylece görünür olur.
    const reach = RADIUS * 1.25;
    const i0 = Math.max(0, Math.floor((mouse.x - reach) / GRID));
    const i1 = Math.min(cols - 1, Math.ceil((mouse.x + reach) / GRID));
    const j0 = Math.max(0, Math.floor((mouse.y + oy - reach) / GRID));
    const j1 = Math.min(rows - 1, Math.ceil((mouse.y + oy + reach) / GRID));
    g.strokeStyle = colors.gridActive;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = j * cols + i;
        const x = px(k, i);
        const y = py(k, j);
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        const energy = Math.min(1, (Math.abs(dx[k]) + Math.abs(dy[k])) / 6);
        const alpha = Math.max(0, 1 - d / reach) * (mouse.inside ? 1 : energy);
        if (alpha < 0.02) continue;
        g.globalAlpha = alpha;
        g.beginPath();
        if (i + 1 < cols) {
          g.moveTo(x, y);
          g.lineTo(px(k + 1, i + 1), py(k + 1, j));
        }
        if (j + 1 < rows) {
          g.moveTo(x, y);
          g.lineTo(px(k + cols, i), py(k + cols, j + 1));
        }
        g.stroke();
      }
    }
    g.globalAlpha = 1;
  }

  function stepTrail() {
    if (mouse.inside) {
      const last = trail.at(-1);
      const radius = 70 + Math.min(mouse.speed, 70) * 1.3;
      if (!last) {
        trail.push({ x: mouse.x, y: mouse.y, r: radius, life: 1 });
      } else {
        // Hızlı harekette aradaki boşluk doldurulur: kuyruklu yıldız izi.
        const dist = Math.hypot(mouse.x - last.x, mouse.y - last.y);
        const steps = Math.min(8, Math.floor(dist / 22));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          trail.push({ x: last.x + (mouse.x - last.x) * t, y: last.y + (mouse.y - last.y) * t, r: radius, life: 1 });
        }
      }
    }
    for (const node of trail) node.life *= 0.92;
    while (trail.length && (trail[0].life < 0.03 || trail.length > 45)) trail.shift();
  }

  function drawGlow() {
    const { glow, glowStrength } = colors;
    const blob = (x: number, y: number, r: number, a: number) => {
      const grad = f.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${glow}, ${a})`);
      grad.addColorStop(1, `rgba(${glow}, 0)`);
      f.fillStyle = grad;
      f.fillRect(x - r, y - r, r * 2, r * 2);
    };
    // İmlecin altındaki sabit ışık CSS spotlight'ta; canvas yalnızca hızlı hareketin izini çizer.
    for (const node of trail) blob(node.x, node.y, node.r, glowStrength * 0.35 * node.life);
  }

  function stepAndDrawParticles(time: number) {
    f.fillStyle = colors.dust;
    for (const p of particles) {
      const angle = p.phase + time * p.speed;
      const homeX = p.hx + Math.cos(angle) * p.orbit;
      const homeY = p.hy + Math.sin(angle) * p.orbit * 0.7;
      let ax = (homeX - p.x) * 0.012;
      let ay = (homeY - p.y) * 0.012;
      let near = 0;
      if (mouse.inside) {
        const ex = mouse.x - p.x;
        const ey = mouse.y - p.y;
        const d = Math.hypot(ex, ey);
        if (d < ATTRACT_RADIUS && d > 1) {
          near = 1 - d / ATTRACT_RADIUS;
          // İmlecin tam üstüne çökmesinler: çok yakında çekim zayıflar.
          const force = ATTRACT * near * Math.min(1, d / 30);
          ax += (ex / d) * force;
          ay += (ey / d) * force;
        }
      }
      p.vx = (p.vx + ax) * 0.9;
      p.vy = (p.vy + ay) * 0.9;
      p.x += p.vx;
      p.y += p.vy;
      f.globalAlpha = Math.min(1, p.alpha * (0.55 + near));
      f.beginPath();
      f.arc(p.x, p.y, p.r + near * 0.6, 0, Math.PI * 2);
      f.fill();
    }
    f.globalAlpha = 1;
  }

  function frame(time: number) {
    raf = requestAnimationFrame(frame);

    const dxm = mouse.x - mouse.lastX;
    const dym = mouse.y - mouse.lastY;
    mouse.vx = mouse.vx * 0.6 + dxm * 0.4;
    mouse.vy = mouse.vy * 0.6 + dym * 0.4;
    mouse.speed = mouse.speed * 0.8 + Math.hypot(dxm, dym) * 0.2;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;

    const moving = stepGrid();
    if (moving || gridDirty || (mouse.inside && mouse.speed > 0.05)) {
      drawGrid();
      gridDirty = moving;
    }

    // Boştayken (fare dışarıda, iz sönmüş, ızgara durgun) toz 30 fps ile güncellenir.
    const idle = !mouse.inside && !moving && trail.length === 0;
    if (idle && frameCount++ % 2) return;

    f.clearRect(0, 0, w, h);
    stepTrail();
    drawGlow();
    stepAndDrawParticles(time);
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (!mouse.inside) {
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.inside = true;
    // CSS spotlight: konum doğrudan değişken olarak verilir, radial-gradient onu izler.
    spotlight?.style.setProperty('--x', `${e.clientX}px`);
    spotlight?.style.setProperty('--y', `${e.clientY}px`);
    spotlight?.style.setProperty('--spot', '1');
  };
  const leave = () => {
    mouse.inside = false;
    gridDirty = true;
    spotlight?.style.setProperty('--spot', '0');
  };
  const onLeave = (e: MouseEvent) => {
    if (!e.relatedTarget) leave();
  };
  const onBlur = leave;
  const onScroll = () => {
    gridDirty = true;
  };
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  };
  // Tema (<html data-theme>) değişince renkler yeniden okunur.
  const themeObserver = new MutationObserver(() => {
    colors = readColors();
    gridDirty = true;
  });

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('mouseout', onLeave);
  window.addEventListener('blur', onBlur);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('mouseout', onLeave);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    themeObserver.disconnect();
    g.clearRect(0, 0, w, h);
    f.clearRect(0, 0, w, h);
  };
}

/** Efektler yalnızca fareli cihazlarda ve hareket azaltma tercihi yokken çalışır. */
export function motionAllowed(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
