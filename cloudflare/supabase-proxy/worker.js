// Cloudflare Worker served at https://api.habbitflows.com.
//
// Some Indian ISPs (seen on ACT Fibernet, 2026-11) hijack DNS for *.supabase.co,
// so the app could not reach its backend there. Browsers talk to this Worker on
// our own domain instead; it forwards to Supabase from Cloudflare's network.
// Everything (auth, REST, Edge Functions, storage, websockets) passes through
// unchanged, including Supabase's own CORS headers.

const UPSTREAM = 'udugejhizotqfmzqpnzf.supabase.co'
const ALLOWED_PREFIXES = ['/auth/v1/', '/rest/v1/', '/functions/v1/', '/storage/v1/', '/realtime/v1/']

export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (!ALLOWED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
      return new Response('Not found', { status: 404 })
    }
    url.protocol = 'https:'
    url.hostname = UPSTREAM
    url.port = ''
    return fetch(new Request(url, request))
  },
}
