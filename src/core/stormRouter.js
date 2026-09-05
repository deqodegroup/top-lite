export async function routeStormMessage({ text, language = 'niu' }) {
  const clean = text.trim()
  if (!clean) return ''

  if (language !== 'niu') {
    return 'That language is staged for a later release. TOP Lite is Niue-first in this build.'
  }

  if (/name/i.test(clean) && /your|you/i.test(clean)) {
    return 'I’m STORM, the language intelligence inside TOP Lite. My live language runtime is currently offline.'
  }

  return 'I can hear your request, but my verified Vagahau Niue knowledge service is not connected in this fallback mode. I won’t guess or invent language content. Please try again when the STORM runtime is online.'
}
