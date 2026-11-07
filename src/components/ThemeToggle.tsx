import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, currentTheme, setTheme, storedTheme, systemTheme } from '../theme';

/**
 * Açık / koyu tema düğmesi. İki ikon da her zaman render edilir, hangisinin görüneceğini
 * CSS (data-theme) seçer; böylece prerender edilen HTML ile istemci render'ı aynı kalır.
 */
export default function ThemeToggle() {
  useEffect(() => {
    // Kullanıcı henüz seçim yapmadıysa cihazın tercihini izle.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!storedTheme()) applyTheme(systemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme() === 'dark' ? 'light' : 'dark')}
      aria-label="Açık ve koyu tema arasında geçiş yap"
      title="Temayı değiştir"
      className="focus-ring block cursor-pointer p-1.5 text-ink opacity-60 transition-[opacity,translate] duration-300 ease-out hover:-translate-y-0.5 hover:opacity-100 focus-visible:opacity-100"
    >
      <Sun className="theme-icon-sun" size={18} strokeWidth={1.75} aria-hidden="true" />
      <Moon className="theme-icon-moon" size={18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
