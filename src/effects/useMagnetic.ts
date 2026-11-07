import { useEffect, useRef } from 'react';
import { motionAllowed } from './field';

/**
 * Öğe, fare yakınına geldiğinde ona doğru hafifçe esner; uzaklaşınca yay gibi yerine oturur.
 * Yalnızca transform kullanır (yerleşim kaymaz). `strength`: imlece göre çekilme oranı,
 * `radius`: öğenin kenarından itibaren etki mesafesi, `max`: en fazla kayma (px).
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.25, radius = 110, max = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;

    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const tick = () => {
      vx = (vx + (tx - x) * 0.14) * 0.76;
      vy = (vy + (ty - y) * 0.14) * 0.76;
      x += vx;
      y += vy;
      const settled = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) < 0.02;
      if (settled && tx === 0 && ty === 0) {
        x = y = 0;
        el.style.transform = '';
        raf = 0;
        return;
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      // Ölçüm, öğenin kaydırılmamış (dinlenme) konumuna göre yapılır.
      const rect = el.getBoundingClientRect();
      const left = rect.left - x;
      const top = rect.top - y;
      const ex = Math.max(left - e.clientX, 0, e.clientX - (left + rect.width));
      const ey = Math.max(top - e.clientY, 0, e.clientY - (top + rect.height));
      const distance = Math.hypot(ex, ey);
      if (distance < radius) {
        const fall = 1 - distance / radius;
        const clamp = (v: number) => Math.max(-max, Math.min(max, v));
        tx = clamp((e.clientX - (left + rect.width / 2)) * strength * fall);
        ty = clamp((e.clientY - (top + rect.height / 2)) * strength * fall);
      } else {
        tx = ty = 0;
      }
      kick();
    };
    const reset = () => {
      tx = ty = 0;
      kick();
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) reset();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);
    window.addEventListener('blur', reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onLeave);
      window.removeEventListener('blur', reset);
      el.style.transform = '';
    };
  }, [strength, radius, max]);

  return ref;
}
