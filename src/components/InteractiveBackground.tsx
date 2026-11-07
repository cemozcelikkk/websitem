import { useEffect, useRef } from 'react';
import { motionAllowed, startField } from '../effects/field';

/**
 * Royal Blue fare takip ışığı (CSS --x/--y), esnek ızgara, ışık izi ve toz parçacıkları. Etkin olduğunda <html>'e `field-active`
 * eklenir ve statik CSS ızgarası canvas'a devredilir. Hareket azaltma tercihinde,
 * dokunmatik cihazlarda ve JS yüklenmeden önce statik ızgara görünür.
 */
export default function InteractiveBackground() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const queries = [window.matchMedia('(hover: hover) and (pointer: fine)'), window.matchMedia('(prefers-reduced-motion: reduce)')];
    let stop: (() => void) | undefined;

    const update = () => {
      stop?.();
      stop = undefined;
      root.classList.remove('field-active');
      if (motionAllowed() && gridRef.current && fxRef.current) {
        root.classList.add('field-active');
        stop = startField(gridRef.current, fxRef.current, spotRef.current ?? undefined);
      }
    };

    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => {
      queries.forEach((q) => q.removeEventListener('change', update));
      stop?.();
      root.classList.remove('field-active');
    };
  }, []);

  return (
    <div aria-hidden="true" className="field pointer-events-none fixed inset-0 -z-10">
      <div ref={spotRef} className="field-spotlight" />
      <canvas ref={fxRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={gridRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
