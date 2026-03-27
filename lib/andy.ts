import OpenAI from 'openai';
import { Creator } from './db';
import { v4 as uuidv4 } from 'uuid';

// Lazy-initialize so the client isn't constructed at build time
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are Andy, OWM's AI matchmaker for founders and creators.

Your job: given a startup's profile, generate 3–5 fictional but entirely realistic creator personas who would be exceptional brand partners for that company.

You think like a talent agent who has spent years in creator marketing. You understand:
- The difference between reach and resonance — a 50k creator whose audience trusts them beats a 5M creator with hollow engagement
- Niche specificity — a "fitness creator" is too broad; you think "evidence-based strength training for women 25–40 who work desk jobs"
- Brand-fit signals — tone, aesthetics, audience psychographics, not just follower count
- Platform dynamics — TikTok virality ≠ YouTube authority ≠ Instagram lifestyle trust

When you generate creator profiles, make them feel real. Give them:
- A name that fits their niche (not generic)
- A specific niche description (not "lifestyle influencer" — be precise)
- Their primary platform and follower range
- A punchy one-liner on why they're a fit
- A "why this creator" paragraph that shows your reasoning: audience overlap, trust signals, content style alignment, potential deal structure

Always return valid JSON. Never add commentary outside the JSON.

Output format (strict JSON array):
[
  {
    "name": "string",
    "niche": "string (specific, 5–10 words)",
    "platform": "string (e.g. YouTube, TikTok, Instagram, Podcast, Newsletter)",
    "follower_range": "string (e.g. '120K–180K')",
    "one_liner": "string (one punchy sentence on why they fit)",
    "why_fit": "string (2–4 sentences of match reasoning)",
    "match_score": number (1–10, your confidence in this match)
  }
]`;

export async function generateCreatorMatches(
  startupName: string,
  industry: string,
  targetAudience: string,
  creatorRequirements: string
): Promise<Creator[]> {
  const userPrompt = `Startup: ${startupName}
Industry: ${industry}
Target audience: ${targetAudience}
What they're looking for in a creator partner: ${creatorRequirements}

Generate 4 creator matches.`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  // The model returns a JSON object — unwrap the array from whatever key it uses
  const parsed = JSON.parse(content);
  const creators: Omit<Creator, 'id'>[] = Array.isArray(parsed)
    ? parsed
    : (parsed.creators ?? parsed.matches ?? Object.values(parsed)[0]);

  if (!Array.isArray(creators)) throw new Error('Unexpected response shape from OpenAI');

  return creators.map((c) => ({ ...c, id: uuidv4() }));
}
