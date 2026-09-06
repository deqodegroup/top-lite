function decodeHtml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function unwrapDuckUrl(href = '') {
  try {
    const url = new URL(href, 'https://html.duckduckgo.com')
    const uddg = url.searchParams.get('uddg')
    return uddg ? decodeURIComponent(uddg) : url.href
  } catch {
    return href
  }
}

export async function searchFreeWeb(query, limit = 6) {
  if (!query) return []

  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 TOP-Lite-STORM/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!response.ok) return []

    const html = await response.text()
    const blocks = html.split('class="result results_links')[1] ? html.split('class="result results_links').slice(1) : html.split('class="result"').slice(1)
    const results = []

    for (const block of blocks) {
      if (results.length >= limit) break

      const linkMatch = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
      if (!linkMatch) continue

      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i)
      const title = decodeHtml(linkMatch[2])
      const url = unwrapDuckUrl(decodeHtml(linkMatch[1]))
      const content = decodeHtml(snippetMatch?.[1] || snippetMatch?.[2] || '')

      if (!title || !url || !/^https?:\/\//i.test(url)) continue

      results.push({
        title,
        url,
        content,
        provider: 'duckduckgo-html',
        searchedAt: new Date().toISOString(),
        cache: 'miss',
        score: null,
      })
    }

    return results
  } catch {
    return []
  }
}
