export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const systemPrompt = system || `You are a helpful assistant for NannyConnect, a verified childcare marketplace in Germany. 
Help parents find the right sitter and help sitters understand the verification process.
Be warm, helpful and concise. Answer in the same language the user writes in.
Key facts: Führungszeugnis (police clearance) is required for all sitters. Platform is free during beta. Based in Berlin, Germany-wide.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
