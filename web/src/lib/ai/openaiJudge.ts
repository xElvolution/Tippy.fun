import OpenAI from 'openai';

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (cached) return cached;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured.');
  cached = new OpenAI({ apiKey: key });
  return cached;
}

export type JudgePersona =
  | 'strict-technical-reviewer'
  | 'creative-reviewer'
  | 'rubric-follower'
  | 'arbiter'
  | (string & {});

const PERSONA_PROMPTS: Record<string, string> = {
  'strict-technical-reviewer':
    'You are a strict technical reviewer. You reward correctness, clarity, and completeness. You are not impressed by marketing language.',
  'creative-reviewer':
    'You are a creative reviewer. You reward originality, narrative quality, and elegance of expression. You do not forgive obvious low-effort spam.',
  'rubric-follower':
    'You are a meticulous rubric-follower. You grade strictly against the stated criteria, weighting each line equally, and do not add bonuses for anything outside the rubric.',
  arbiter:
    'You are the arbiter. You have received independent verdicts from a panel of judges and must produce a single aggregated verdict per submission that balances their views fairly. You may disagree with the judges if the rationale is weak.',
};

function personaPrompt(persona: string) {
  return (
    PERSONA_PROMPTS[persona] ??
    `You are an AI judge with the persona "${persona}". Use good faith judgement based on the stated criteria.`
  );
}

export type JudgeInput = {
  model: string;
  persona: string;
  criteria: string;
  submission: {
    id: string;
    title?: string | null;
    content: string;
    links?: { label: string; url: string }[] | null;
  };
};

export type JudgeVerdict = {
  score: number; // 0–100
  rationale: string;
  flags: string[];
  raw: unknown;
};

export async function runJudge(input: JudgeInput): Promise<JudgeVerdict> {
  const system = `${personaPrompt(
    input.persona,
  )}\n\nYou will respond with a JSON object: { "score": integer 0-100, "rationale": string (<=500 chars), "flags": string[] }. Never include anything outside that JSON.`;

  const user = `JUDGING CRITERIA (set by the organizer):\n${input.criteria || '(no criteria provided; judge by general quality)'}\n\nSUBMISSION:\nTitle: ${input.submission.title ?? '(none)'}\nContent:\n${input.submission.content}\n\nLinks: ${JSON.stringify(input.submission.links ?? [])}`;

  const res = await client().chat.completions.create({
    model: input.model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const text = res.choices[0]?.message?.content ?? '{}';
  let parsed: { score?: number; rationale?: string; flags?: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { score: 0, rationale: 'Could not parse judge response', flags: ['parse-error'] };
  }
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score ?? 0))));
  return {
    score,
    rationale: (parsed.rationale ?? '').toString().slice(0, 500),
    flags: Array.isArray(parsed.flags) ? parsed.flags.map(String) : [],
    raw: res,
  };
}

export type ArbiterInput = {
  model: string;
  criteria: string;
  submission: JudgeInput['submission'];
  judgeVerdicts: Array<{ judgeId: string; persona: string; score: number; rationale: string }>;
};

export type ArbiterVerdict = {
  score: number;
  decision: 'pass' | 'fail';
  rationale: string;
  raw: unknown;
};

export async function runArbiter(
  input: ArbiterInput,
  passThreshold = 70,
): Promise<ArbiterVerdict> {
  const system = `${personaPrompt(
    'arbiter',
  )}\n\nYou will respond with a JSON object: { "score": integer 0-100, "decision": "pass" | "fail", "rationale": string (<=600 chars) }. "pass" means the submission is worth rewarding; "fail" means it is not. Never include anything outside that JSON.`;

  const user = `JUDGING CRITERIA:\n${input.criteria || '(no criteria provided)'}\n\nSUBMISSION:\nTitle: ${input.submission.title ?? '(none)'}\nContent:\n${input.submission.content}\n\nJUDGE PANEL VERDICTS:\n${input.judgeVerdicts
    .map(
      (v) =>
        `- ${v.judgeId} (${v.persona}): score=${v.score}\n  rationale: ${v.rationale}`,
    )
    .join(
      '\n',
    )}\n\nPass threshold: ${passThreshold}. Produce the aggregated verdict now.`;

  const res = await client().chat.completions.create({
    model: input.model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const text = res.choices[0]?.message?.content ?? '{}';
  let parsed: { score?: number; decision?: string; rationale?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { score: 0, decision: 'fail', rationale: 'Could not parse arbiter response' };
  }
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score ?? 0))));
  const decision =
    parsed.decision === 'pass' || (parsed.decision === undefined && score >= passThreshold)
      ? 'pass'
      : parsed.decision === 'fail'
        ? 'fail'
        : score >= passThreshold
          ? 'pass'
          : 'fail';
  return {
    score,
    decision,
    rationale: (parsed.rationale ?? '').toString().slice(0, 600),
    raw: res,
  };
}
