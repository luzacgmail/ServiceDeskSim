const FALLBACKS = ["Hi, I'm still having the issue. Can you tell me what to try?", "Sorry, I'm not sure what you mean. Can you explain it simply?", "Still not working on my side. This is blocking my work."];

export async function ai(system: string, contents: { role: 'user' | 'model'; parts: { text: string }[] }[], json = false): Promise<string | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    const messages = [
      { role: 'system', content: json ? system + '\nRespond with only valid JSON, no markdown.' : system },
      ...contents.map(c => ({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts.map(p => p.text).join('\n') })),
    ];
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages, max_tokens: 300, temperature: 0.8 }),
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const data = await r.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

export const fallbackReply = () => FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];