import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// AdSense site ownership: Google's crawler needs to see the publisher id on the page,
// but the ad script itself only loads after consent (AdSlot). The meta tag and ads.txt
// verify the site without loading ads or setting cookies. No id = nothing is added.
function adsense(clientId: string): Plugin {
  const valid = /^ca-pub-\d{10,20}$/.test(clientId)
  if (clientId && !valid) throw new Error(`VITE_ADSENSE_CLIENT_ID must look like ca-pub-1234567890123456, got "${clientId}"`)
  return {
    name: 'adsense-verification',
    transformIndexHtml() {
      if (!valid) return
      return [{ tag: 'meta', attrs: { name: 'google-adsense-account', content: clientId }, injectTo: 'head' }]
    },
    generateBundle() {
      if (!valid) return
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${clientId.slice(3)}, DIRECT, f08c47fec0942fa0\n`,
      })
    },
  }
}

// The site uses real paths (/dashboard, /help/…), so assets need an absolute base:
//   '/'           – local dev, Capacitor (Android), a custom domain
//   '/habbitflows/' – GitHub Pages project site (set VITE_BASE_PATH in the workflow)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = (process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/').replace(/\/?$/, '/')
  return {
    base,
    plugins: [react(), tailwindcss(), adsense((process.env.VITE_ADSENSE_CLIENT_ID || env.VITE_ADSENSE_CLIENT_ID || '').trim())],
    build: {
      chunkSizeWarningLimit: 900,
    },
  }
})
