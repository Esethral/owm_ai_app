import OpenAI from 'openai';
import { Creator, CreatorRating } from './db';
import { CreatorBase } from './fakeCreators';
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

Output format (strict JSON object with a "creators" array):
{
  "creators": [
    {
      "name": "string",
      "niche": "string (specific, 5–10 words)",
      "platform": "string (e.g. YouTube, TikTok, Instagram, Podcast, Newsletter)",
      "follower_range": "string (e.g. '120K–180K')",
      "one_liner": "string (one punchy sentence on why they fit)",
      "why_fit": "string (2–4 sentences of match reasoning)",
      "match_score": number (1–10, your confidence in this match)
    }
  ]
}`;

export async function generateCreatorMatches(
  startupName: string,
  industry: string,
  targetAudience: string,
  creatorRequirements: string,
  signal?: AbortSignal
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
  }, { signal });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content);
  const creators: Omit<Creator, 'id'>[] = parsed.creators;

  if (!Array.isArray(creators)) throw new Error('Unexpected response shape from OpenAI');

  return creators.map((c) => ({ ...c, id: uuidv4() }));
}

const RATING_SYSTEM_PROMPT = `You are Andy, OWM's AI matchmaker. Given a startup's profile and a list of people described by age range, ethnicity, and gender, you invent a realistic creator persona for each person that would make sense as a brand partner for that startup — then rate the match.

You think like a sharp talent agent: invent a name, pick a platform, niche, handle, and audience size that genuinely fits both the person's demographic AND the startup's needs.

Rules:
- name must be a realistic first + last name that fits the person's ethnicity and gender
- age must be a single integer within the given ageRange (e.g. ageRange "25-30" → age 27)
- Handles must look like real social media usernames — mostly name-based but occasionally hint at their niche (e.g. @marcuswebb, @ryanlifts, @zara.j, @priya.wellness) — keep it natural, not forced
- platforms must be an array of 1–2 platforms, each one of: Instagram, TikTok, YouTube, LinkedIn, Newsletter, Podcast — only give 2 if it genuinely makes sense for the persona
- Niche must be specific (5–10 words), not generic
- Audience must be a realistic follower count string (e.g. "284K", "1.2M", "58K subs")
- matchPercent is 0–100, your honest confidence in this match — use specific irregular numbers (e.g. 73, 81, 67, 94, 58), never round multiples of 5 or 10
- reason is a single punchy sentence, max 10 words

Always return valid JSON. Never add commentary outside the JSON.

Output format:
{
  "profiles": [
    {
      "imagePath": "string",
      "name": "string",
      "age": number,
      "handle": "@string",
      "platforms": ["string"],
      "niche": "string",
      "audience": "string",
      "matchPercent": number,
      "reason": "string"
    }
  ]
}`;

export async function generateCreatorRatings(
  startupName: string,
  industry: string,
  targetAudience: string,
  creatorRequirements: string,
  creators: Array<CreatorBase & { imagePath: string }>,
  signal?: AbortSignal
): Promise<Record<string, CreatorRating>> {
  const creatorList = creators
    .map((c, i) => `${i + 1}. imagePath="${c.imagePath}" — ${c.ageRange}yo range, ${c.ethnicity} ${c.gender}`)
    .join('\n');

  const userPrompt = `Startup: ${startupName}
Industry: ${industry}
Target audience: ${targetAudience}
Looking for: ${creatorRequirements}

For each person below, invent a creator persona tailored to this startup and rate the match:
${creatorList}`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: RATING_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.75,
  }, { signal });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.profiles)) throw new Error('Unexpected profiles shape from OpenAI');

  const result: Record<string, CreatorRating> = {};
  for (const p of parsed.profiles) {
    result[p.imagePath] = {
      matchPercent: Math.round(p.matchPercent),
      reason: p.reason,
      name: p.name,
      age: p.age,
      handle: p.handle,
      platforms: Array.isArray(p.platforms) ? p.platforms : [p.platforms],
      niche: p.niche,
      audience: p.audience,
    };
  }
  return result;
}
