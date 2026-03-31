import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mediaDescription, options } = req.body;

  if (!mediaDescription) {
    return res.status(400).json({ error: "Missing mediaDescription" });
  }

  const optList = [];
  if (options?.transcript) optList.push("TRANSCRIPT");
  if (options?.summary) optList.push("SHORT_SUMMARY");
  if (options?.actions) optList.push("ACTION_ITEMS");
  if (options?.bullets) optList.push("KEY_POINTS");

  if (optList.length === 0) {
    return res.status(400).json({ error: "No output options selected" });
  }

  const prompt = `You are a media analysis AI. The user has provided a media description or URL.
  
Description: ${mediaDescription}

Since we are currently simulating the transcription process for this prototype, please do the following:
1. Acknowledge the input professionally.
2. Generate a REASONABLE and helpful simulated analysis based on the description.
3. Provide the following sections: ${optList.join(", ")}

Respond ONLY with valid JSON in this structure:
{
  "transcript": "300+ word realistic dialogue (if TRANSCRIPT requested, else null)",
  "summary": "2-3 paragraphs (if SHORT_SUMMARY requested, else null)",
  "actions": ["task 1", "task 2", ...] (if ACTION_ITEMS requested, else null),
  "bullets": ["point 1", "point 2", ...] (if KEY_POINTS requested, else null)
}

Do not include markdown outside the JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "AI service error. Check your API key. " + err.message });
  }
}
