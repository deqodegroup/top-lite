import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sources = JSON.parse(await readFile(path.join(root, 'data/storm/sources.json'), 'utf8'))
const policy = JSON.parse(await readFile(path.join(root, 'data/storm/ingest-policy.json'), 'utf8'))
const outDir = path.join(root, '.cache/top-language-candidates')
await mkdir(outDir, { recursive: true })

const decode = (s) => s
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')

function htmlToLines(html) {
  const text = decode(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/li>|<\/tr>|<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')

  return [...new Set(text.split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 3 && line.length <= 220))]
}

function likelyLanguageCandidate(line) {
  // Conservative candidate filter: short bilingual/glossary-like lines or lines
  // explicitly mentioning Vagahau Niue. Humans must still validate/promote.
  return /vagahau niue|niuean|\s[-–—:=]\s/i.test(line) || /\([^)]{1,60}\)/.test(line)
}

for (const rule of policy.sources.filter((item) => item.enabled && item.mode === 'review-candidates')) {
  const source = sources.sources.find((item) => item.id === rule.source_id)
  if (!source) throw new Error(`Unknown source_id: ${rule.source_id}`)
  if (rule.content !== 'html') continue

  const response = await fetch(source.url, {
    headers: { 'User-Agent': 'TOP-Lite-Language-Vault/1.0 (+https://github.com/deqodegroup/top-lite)' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`)

  const html = (await response.text()).slice(0, rule.max_chars || 50000)
  const candidates = htmlToLines(html).filter(likelyLanguageCandidate).slice(0, 300)
  const capturedAt = new Date().toISOString()
  const artifact = {
    source_id: source.id,
    source_title: source.title,
    publisher: source.publisher,
    source_url: source.url,
    captured_at: capturedAt,
    sha256: createHash('sha256').update(html).digest('hex'),
    status: 'UNVERIFIED_CANDIDATES',
    rule: rule.mode,
    candidate_count: candidates.length,
    candidates,
  }

  const out = path.join(outDir, `${source.id}.json`)
  await writeFile(out, JSON.stringify(artifact, null, 2) + '\n')
  console.log(`${source.id}: ${candidates.length} review candidates -> ${path.relative(root, out)}`)
}

console.log('Done. Nothing was promoted into verified knowledge automatically.')
