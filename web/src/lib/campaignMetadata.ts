/**
 * Off-chain metadata schema for a Tippy campaign. Stored at the URI referenced by the contract
 * (IPFS, https, or a data: URL for small demo payloads). Keeping this tiny so the demo can inline
 * the JSON as a data URL — no IPFS dependency required to get a live demo on-chain.
 */

export type JudgeModelChoice = {
  id: string; // stable client id
  provider: 'openai'; // v1 supports OpenAI only; extend when more providers are wired
  model: string; // e.g. "gpt-4o", "gpt-4o-mini"
  persona: string; // short system-prompt tag ("technical reviewer", "creative reviewer", "rubric-follower")
};

export type JudgingConfig = {
  criteria: string; // free-form rubric written by the organizer
  judges: JudgeModelChoice[]; // multi-judge panel
  arbiter: JudgeModelChoice; // one arbiter
  rewardPerSubmission?: string; // Tip mode: human-readable amount (e.g. "0.5") in the campaign's token
  passThreshold?: number; // Tip mode: arbiter score (0–100) a submission must clear to auto-pay
};

export type CampaignMetadata = {
  title: string;
  description: string;
  channel?: 'discord' | 'telegram' | 'twitter' | 'web' | 'other';
  tags?: string[];
  image?: string;
  prizeBreakdown?: { label: string; value: string }[];
  organizer?: { name: string; handle?: string };
  links?: { label: string; url: string }[];
  judging?: JudgingConfig;
  version?: 2;
};

export function encodeMetadataToDataUri(meta: CampaignMetadata): string {
  const payload: CampaignMetadata = { version: 2, ...meta };
  const json = JSON.stringify(payload);
  if (typeof window === 'undefined') {
    return `data:application/json;base64,${Buffer.from(json, 'utf8').toString('base64')}`;
  }
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `data:application/json;base64,${btoa(binary)}`;
}

export async function fetchCampaignMetadata(
  uri: string,
  signal?: AbortSignal,
): Promise<CampaignMetadata | null> {
  if (!uri) return null;
  try {
    if (uri.startsWith('data:application/json;base64,')) {
      const b64 = uri.slice('data:application/json;base64,'.length);
      const json =
        typeof window === 'undefined'
          ? Buffer.from(b64, 'base64').toString('utf8')
          : decodeURIComponent(
              atob(b64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
            );
      return JSON.parse(json) as CampaignMetadata;
    }
    if (uri.startsWith('data:application/json,')) {
      return JSON.parse(decodeURIComponent(uri.slice('data:application/json,'.length)));
    }
    const normalized = uri.startsWith('ipfs://')
      ? `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`
      : uri;
    const res = await fetch(normalized, { signal, cache: 'force-cache' });
    if (!res.ok) return null;
    return (await res.json()) as CampaignMetadata;
  } catch {
    return null;
  }
}

/**
 * Default AI panel: three OpenAI judges with different personas plus one arbiter. The personas
 * are embedded as `persona` strings that the judging service uses to craft system prompts.
 */
export function defaultJudgingConfig(criteria = ''): JudgingConfig {
  return {
    criteria,
    judges: [
      {
        id: 'judge-a',
        provider: 'openai',
        model: 'gpt-4o',
        persona: 'strict-technical-reviewer',
      },
      {
        id: 'judge-b',
        provider: 'openai',
        model: 'gpt-4o',
        persona: 'creative-reviewer',
      },
      {
        id: 'judge-c',
        provider: 'openai',
        model: 'gpt-4o-mini',
        persona: 'rubric-follower',
      },
    ],
    arbiter: {
      id: 'arbiter',
      provider: 'openai',
      model: 'gpt-4o',
      persona: 'arbiter',
    },
    passThreshold: 70,
  };
}
