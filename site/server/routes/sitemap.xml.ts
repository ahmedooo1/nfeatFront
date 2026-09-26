import { restaurant } from '../../app/restaurant.config'

// Plan du site pré-rendu au build : pages publiques et fiches de plats.
export default defineEventHandler(async (event) => {
  const { public: config } = useRuntimeConfig(event)
  const rows = await $fetch<unknown[]>(`${config.apiBase}/api/menu`).catch(() => [])
  const ids = (rows as Record<string, unknown>[]).map((r) => ((0 in r ? r[0] : r) as { id: number }).id).filter(Boolean)
  const today = new Date().toISOString().slice(0, 10)
  const pages = ['/', '/carte', '/a-propos', '/contact', '/mentions-legales', '/confidentialite', ...ids.map((id) => `/carte/${id}`)]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${restaurant.siteUrl}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
})
