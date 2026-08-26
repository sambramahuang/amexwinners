import 'dotenv/config'
import express from 'express'
import OpenAI from 'openai'

const PORT = process.env.PORT || 8787

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY — set it in .env before starting the server.')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const app = express()
app.use(express.json())

app.post('/api/explain-match', async (req, res) => {
  const { anchor, candidate, personality } = req.body ?? {}

  if (!anchor || !candidate?.name) {
    res.status(400).json({ error: 'Missing anchor or candidate merchant data.' })
    return
  }

  const personalityQA = Array.isArray(personality)
    ? personality
        .filter((qa) => qa && typeof qa.question === 'string' && typeof qa.answer === 'string')
        .slice(0, 8)
        .map((qa) => `- ${qa.question} → ${qa.answer}`)
        .join('\n')
    : ''

  const personalityBlock = personalityQA
    ? `\n\n${anchor.name}'s self-reported partnership-preference answers (qualitative only, from a short
questionnaire — a secondary, self-reported layer, NOT transaction data):
${personalityQA}
Use these only to add context about partnership fit. Never let them override or contradict the transaction numbers
above, which remain the primary, authoritative signal.`
    : ''

  const prompt = `You are the explainability layer inside a merchant-partnership tool for small businesses.
Given the graph signal below for two merchants that were just matched, write a short explanation (2-3 sentences,
plain language, no bullet points) of why this partnership makes sense for both sides. Ground every claim in the
numbers given — do not invent new statistics or merchant details. If the signal is weak or auto-rebalanced, say so
plainly rather than oversell it.

Anchor merchant: ${anchor.name} (${anchor.category ?? 'unknown category'})
Candidate merchant: ${candidate.name} (${candidate.category})
Customer overlap: ${candidate.overlapPct}%
Sequential-visit signal: ${candidate.sequential}
Projected uplift — anchor: +${candidate.upliftYou}%, candidate: +${candidate.upliftThem}%
Balance note: ${candidate.balanceNote}
Suggested terms: ${candidate.terms}${personalityBlock}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 220,
    })

    const explanation = completion.choices[0]?.message?.content?.trim()
    if (!explanation) throw new Error('Empty completion')

    res.json({ explanation })
  } catch (err) {
    console.error('OpenAI request failed:', err.message)
    res.status(502).json({ error: 'AI explanation unavailable right now.' })
  }
})

app.post('/api/pitch-copy', async (req, res) => {
  const { prospect } = req.body ?? {}

  if (!prospect?.name || !prospect?.category || !prospect?.cluster || !prospect?.upliftRange) {
    res.status(400).json({ error: 'Missing prospect data.' })
    return
  }

  const waitingList = Array.isArray(prospect.waiting)
    ? prospect.waiting
        .filter((w) => w && typeof w.name === 'string' && typeof w.why === 'string')
        .map((w) => `- ${w.name}: ${w.why}`)
        .join('\n')
    : ''

  const prompt = `You are writing a short recruitment pitch (2-3 sentences, plain language, no bullet points)
inviting a small business to join a merchant-partnership program. Ground every claim in the data given below —
do not invent new statistics, customer counts, or merchant claims beyond what's provided. This prospect has no
transaction history with the program yet, so these numbers are a category-level projected estimate, not measured
from this merchant's own data — keep the tone confident but honest about that (e.g. "businesses like yours
typically see...", never "you will see...").

Prospect: ${prospect.name} (${prospect.category})
Cluster: ${prospect.cluster}
Why this gap matters: ${prospect.reasoning ?? 'not provided'}
Projected uplift range: ${prospect.upliftRange}
Merchants in the cluster already waiting for a partner like this:
${waitingList || 'none provided'}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 180,
    })

    const pitch = completion.choices[0]?.message?.content?.trim()
    if (!pitch) throw new Error('Empty completion')

    res.json({ pitch })
  } catch (err) {
    console.error('OpenAI request failed:', err.message)
    res.status(502).json({ error: 'AI pitch unavailable right now.' })
  }
})

app.listen(PORT, () => {
  console.log(`AI backend listening on http://localhost:${PORT}`)
})
