const SUPABASE_URL = process.env.STORM_SUPABASE_URL || 'https://jxxvtjaqklzfpaejhrgz.supabase.co'
const SUPABASE_KEY = process.env.STORM_SUPABASE_PUBLISHABLE_KEY || process.env.STORM_SUPABASE_ANON_KEY || 'sb_publishable_OYhwE3h-VtP9TBtxu_I-Tw_9ZY4cgQZ'

export async function searchStormMemory(query, limit = 12) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return []

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/storm_memory_search`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: String(query || ''), result_limit: limit }),
    })

    if (!response.ok) return []
    const rows = await response.json().catch(() => [])
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export function formatStormMemory(rows = []) {
  if (!rows.length) return 'No persistent STORM memory matched this turn.'

  return rows
    .slice(0, 12)
    .map((row, index) => {
      const body = [row.title, row.original_text, row.translated_text, row.summary_en, row.summary_niu]
        .filter(Boolean)
        .join(' | ')
      return `${index + 1}. [${row.source_type}] ${body}`
    })
    .join('\n')
}
