import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { interceptLinks, normalizePath } from './router'
import { matchRoute, preloadRoute } from './routes'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

interceptLinks()

// Yazı/bölüm sayfasında gövde ayrı bir chunk'ta; hydration'dan önce yüklenmeli ki
// statik HTML ile istemci render'ı birebir aynı olsun.
const route = matchRoute(normalizePath(window.location.pathname))
const ready = preloadRoute(route)

ready.finally(() => {
  // Prerender edilmiş sayfada hydrate, geliştirme sunucusunda boş kök üzerinde render.
  if (container.firstElementChild) hydrateRoot(container, app)
  else createRoot(container).render(app)
})
