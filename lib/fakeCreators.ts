// Variable list for all creator images to be used elsewhere
export const PERSON_IMAGES = [
  '/images/person_1.jpeg',
  '/images/person_2.jpg',
  '/images/person_3.jpeg',
  '/images/person_4.jpeg',
  '/images/person_5.jpeg',
  '/images/person_6.jpeg',
  '/images/person_7.jpeg',
  '/images/person_8.jpeg',
  '/images/person_9.jpeg',
  '/images/person_10.avif',
  '/images/person_11.jpg',
  '/images/person_12.webp',
  '/images/person_13.jpg',
  '/images/person_14.avif',
  '/images/person_15.jpg',
  '/images/person_16.jpg',
  '/images/person_17.jpg',
  '/images/person_18.webp',
  '/images/person_19.jpeg',
  '/images/person_20.webp',
] as const;

// Hardcoded — visual/demographic context only, never changes
export type CreatorBase = {
  ageRange: string;
  ethnicity: string;
  gender: string;
};

// The rest of the creator details that Andy fills in based on the image and startup details
export type FakeCreator = CreatorBase & {
  name: string;
  age: number;
  handle: string;
  platform: string;
  secondary_platform?: string;
  tertiary_platform?: string;
  niche: string;
  secondary_niche?: string;
  tertiary_niche?: string;
  audience: string;
  one_liner?: string;
  why_fit?: string;
};

// JSON structure for loosley created creator profiles. Just a basic setup to get Andy started on generating those fictional creators
export const CREATOR_BASES: Record<string, CreatorBase> = {
  '/images/person_1.jpeg':  {ageRange: '22-32', ethnicity: 'african',    gender: 'male'     },
  '/images/person_2.jpg':   {ageRange: '20-30', ethnicity: 'caucasian',  gender: 'male'     },
  '/images/person_3.jpeg':  {ageRange: '27-38', ethnicity: 'caucasian',  gender: 'male'     },
  '/images/person_4.jpeg':  {ageRange: '29-40', ethnicity: 'caucasian',  gender: 'male'     },
  '/images/person_5.jpeg':  {ageRange: '23-34', ethnicity: 'latino',     gender: 'male'     },
  '/images/person_6.jpeg':  {ageRange: '21-32', ethnicity: 'caucasian',  gender: 'female'   },
  '/images/person_7.jpeg':  {ageRange: '23-34', ethnicity: 'indian',     gender: 'female'   },
  '/images/person_8.jpeg':  {ageRange: '25-36', ethnicity: 'caucasian',  gender: 'female'   },
  '/images/person_9.jpeg':  {ageRange: '19-30', ethnicity: 'african',    gender: 'female'   },
  '/images/person_10.avif': {ageRange: '44-58', ethnicity: 'caucasian',  gender: 'female'   },
  '/images/person_11.jpg':  {ageRange: '24-35', ethnicity: 'arab',       gender: 'male'     },
  '/images/person_12.webp': {ageRange: '23-34', ethnicity: 'japanese',   gender: 'male'     },
  '/images/person_13.jpg':  {ageRange: '20-31', ethnicity: 'chinese',    gender: 'male'     },
  '/images/person_14.avif': {ageRange: '25-36', ethnicity: 'african',    gender: 'male'     },
  '/images/person_15.jpg':  {ageRange: '24-35', ethnicity: 'arab',       gender: 'female'   },
  '/images/person_16.jpg':  {ageRange: '19-30', ethnicity: 'asian',      gender: 'female'   },
  '/images/person_17.jpg':  {ageRange: '18-29', ethnicity: 'african',    gender: 'female'   },
  '/images/person_18.webp': {ageRange: '28-55', ethnicity: 'caucasian',  gender: 'couple'   },
  '/images/person_19.jpeg': {ageRange: '18-29', ethnicity: 'caucasian',  gender: 'nonbinary'},
  '/images/person_20.webp': {ageRange: '19-30', ethnicity: 'african',    gender: 'nonbinary'},
};

const PLATFORM_COLORS: Record<string, string> = {
  Instagram:  '#ff4f98',
  TikTok:     '#c026d3',
  YouTube:    '#ff0000',
  Newsletter: '#0d9488',
  Podcast:    '#f97316',
  Spotify:    '#1db954',
  LinkedIn:   '#0a66c2',
  Facebook:   '#00b4ff',
  X:          '#e7e9ea',
  Pinterest:  '#ffdc5d',
  Twitch:     '#9146ff',
};

// Check platform color, otherwise return default
export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform] ?? '#474776';
}

// Fake platforms and URLs for demo purposes only
export function platformUrl(platform: string, handle: string): string {
  const slug = handle.replace('@', '');
  switch (platform) {
    case 'Instagram':  return `https://www.instagram.com/${slug}`;
    case 'TikTok':     return `https://www.tiktok.com/@${slug}`;
    case 'YouTube':    return `https://www.youtube.com/@${slug}`;
    case 'LinkedIn':   return `https://www.linkedin.com/in/${slug}`;
    case 'Newsletter': return `https://${slug}.substack.com`;
    case 'Podcast':    return `https://open.spotify.com/show/${slug}`;
    case 'Spotify':    return `https://open.spotify.com/show/${slug}`;
    case 'Facebook':   return `https://www.facebook.com/${slug}`;
    case 'X':          return `https://www.x.com/${slug}`;
    case 'Pinterest':  return `https://www.pinterest.com/${slug}`;
    case 'Twitch':     return `https://www.twitch.tv/${slug}`;
    default:           return '#';
  }
}
