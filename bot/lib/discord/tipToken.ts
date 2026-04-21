import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import { optionalTestErc20Address, testErc20Decimals } from '../conflux/erc20';
import { listDashboardTokensForUser } from '../db/dashboardTokens';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_AUTOCOMPLETE = 25;

export type ResolvedTipToken =
  | { kind: 'native'; displayLabel: string; recordDenom: string }
  | {
      kind: 'erc20';
      contract: string;
      decimals: number;
      displayLabel: string;
      recordDenom: string;
    };

/** `tippyUserId` = Supabase `users.id` (not Discord id). Omit when user has not `/register` yet. */
export async function tipTokenAutocompleteChoices(
  tippyUserId: string | null,
): Promise<ApplicationCommandOptionChoiceData[]> {
  const out: ApplicationCommandOptionChoiceData[] = [{ name: 'CFX (native)', value: 'cfx' }];

  const testAddr = optionalTestErc20Address();
  if (testAddr) {
    out.push({ name: 'Test ERC-20 (env)', value: 'test_erc20' });
  }

  let watch: Awaited<ReturnType<typeof listDashboardTokensForUser>> = [];
  if (tippyUserId) {
    try {
      watch = await listDashboardTokensForUser(tippyUserId);
    } catch {
      watch = [];
    }
  }

  for (const t of watch) {
    if (out.length >= MAX_AUTOCOMPLETE) break;
    if (t.token_type === 'bank') continue;
    const name = `${t.label} (ERC-20)`.trim().slice(0, 100);
    out.push({ name: name || 'Token', value: `watch:${t.id}` });
  }

  return out.slice(0, MAX_AUTOCOMPLETE);
}

/** `tippyUserId` = Supabase `users.id` (required for `watch:…` tokens). */
export async function resolveTipTokenInput(
  raw: string | null | undefined,
  tippyUserId: string,
): Promise<ResolvedTipToken> {
  const t = (raw ?? '').trim().toLowerCase();
  if (!t || t === 'cfx' || t === 'inj') {
    return { kind: 'native', displayLabel: 'CFX', recordDenom: 'cfx' };
  }

  if (t === 'test_erc20') {
    const contract = optionalTestErc20Address();
    if (!contract) {
      throw new Error('Test ERC-20 is not configured (`TEST_ERC20_CONTRACT`).');
    }
    return {
      kind: 'erc20',
      contract,
      decimals: testErc20Decimals(),
      displayLabel: 'Test ERC-20',
      recordDenom: `erc20:${contract.toLowerCase()}`,
    };
  }

  const watchMatch = (raw ?? '').trim().match(/^watch:(.+)$/i);
  if (watchMatch) {
    const id = watchMatch[1].trim();
    if (!UUID_RE.test(id)) {
      throw new Error('Invalid watchlist token id. Pick **token** from the list or leave empty for CFX.');
    }
    const rows = await listDashboardTokensForUser(tippyUserId);
    const row = rows.find((r) => r.id === id);
    if (!row) {
      throw new Error('That watchlist token was not found. Add tokens under the web dashboard, or pick from the list.');
    }
    if (row.token_type === 'bank') {
      throw new Error('Bank-style tokens are not supported on Conflux eSpace. Remove this watchlist entry and add an ERC-20 contract (0x…).');
    }
    return {
      kind: 'erc20',
      contract: row.ref.trim(),
      decimals: row.decimals,
      displayLabel: row.label || 'Token',
      recordDenom: `erc20:${row.ref.trim().toLowerCase()}`,
    };
  }

  throw new Error(
    'Unknown **token**. Leave **token** empty for CFX, or pick the test ERC-20 / a dashboard watchlist token from the list.',
  );
}
