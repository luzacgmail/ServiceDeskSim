const FALLBACKS = ["Hi, I'm still having the issue. Can you tell me what to try?", "Sorry, I'm not sure what you mean. Can you explain it simply?", "Still not working on my side. This is blocking my work."];
export async function gemini(system: string, contents: { role: 'user' | 'model'; parts: { text: string }[] }[], json = false): Promise<string | null> {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent`, {
      method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: json ? { responseMimeType: 'application/json' } : {} }) });
    clearTimeout(t); if (!r.ok) return null;
    return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch { return null; }
}
export const fallbackReply = () => FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
