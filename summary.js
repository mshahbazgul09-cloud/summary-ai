import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Verify API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY not configured on server. Add it in Vercel → Settings → Environment Variables.',
    });
  }

  try {
    const { text, url, options = {} } = req.body || {};

    // Need either transcript text or a URL
    const inputContent = text || url;
    if (!inputContent) {
      return res.status(400).json({
        error: 'Missing input. Provide either "text" (transcript) or "url".',
      });
    }

    const {
      transcript = true,
      summary = true,
      actionItems = true,
      keyPoints = true,
    } = options;

    // Build the requested output sections
    const sections = [];
    if (transcript) sections.push('"transcript": a clean, formatted version of the transcript');
    if (summary) sections.push('"summary": a concise 3-5 sentence summary');
    if (actionItems) sections.push('"actionItems": an array of clear action items (or empty array if none)');
    if (keyPoints) sections.push('"keyPoints": an array of 3-7 key points');

    if (sections.length === 0) {
      return res.status(400).json({ error: 'Select at least one output option.' });
    }

    const systemPrompt = `You are a media analysis assistant. Analyze the provided content and respond ONLY with valid JSON containing these fields: ${sections.join(', ')}. No markdown, no code fences, just raw JSON.`;

    const userPrompt = text
      ? `Analyze this transcript:\n\n${text}`
      : `Analyze the content at this URL: ${url}\n\nIf you cannot access the URL directly, work from the URL text and any context.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({
        error: 'Model returned non-JSON response',
        raw: responseText,
      });
    }

    return res.status(200).json({
      success: true,
      ...parsed,
    });
  } catch (err) {
    console.error('Summarize error:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error',
    });
  }
}
