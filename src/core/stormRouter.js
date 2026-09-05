const greetings = [/^(hi|hello|hey|kia ora|fakaalofa)/i]

export async function routeStormMessage({ text, language = 'niu' }) {
  const clean = text.trim()
  if (!clean) return ''

  if (greetings.some((pattern) => pattern.test(clean))) {
    return 'Fakaalofa lahi atu. I’m STORM. Ask me a word, phrase, greeting, or something you want to practise in Vagahau Niue.'
  }

  if (/thank/i.test(clean)) return 'Fakaaue lahi. You’re welcome.'

  if (/good morning/i.test(clean)) {
    return 'A natural way to begin is “Monuina e pogipogi.” We can also practise the pronunciation together.'
  }

  if (/how are you/i.test(clean)) {
    return 'You can ask “Malolo nakai a koe?” A simple reply is “Malolo.”'
  }

  if (/name/i.test(clean) && /your|you/i.test(clean)) {
    return 'Ko STORM au. I’m the language intelligence inside TOP Lite.'
  }

  if (language !== 'niu') {
    return 'That language is staged for the next release. TOP Lite is Niue-first for this build.'
  }

  return `I heard: “${clean}”. The live STORM language service is designed to plug in here through the provider router. For this build, try a greeting, “good morning”, or “how are you?”`
}
