import { NextRequest } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { requireAuth, authErrorResponse } from '@/lib/auth/privyServer';
import { hashCanonical } from '@/lib/hash';
import { getActiveChain } from '@/lib/conflux';

export const dynamic = 'force-dynamic';

type SubmissionBody = {
  campaignId: string | number;
  title?: string;
  content: string;
  links?: { label: string; url: string }[];
  attachments?: { name: string; url: string }[];
  submitterWallet?: string;
};

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 501 },
    );
  }
  try {
    const user = await requireAuth(req);
    const body = (await req.json()) as SubmissionBody;
    if (!body.campaignId || !body.content) {
      return Response.json({ error: 'campaignId and content are required' }, { status: 400 });
    }
    const chain = getActiveChain();
    const canonical = {
      chainId: chain.id,
      campaignId: String(body.campaignId),
      submitterPrivyId: user.privyId,
      title: body.title ?? null,
      content: body.content,
      links: body.links ?? [],
      attachments: body.attachments ?? [],
    };
    const submissionHash = hashCanonical(canonical);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from('submissions')
      .insert({
        chain_id: chain.id,
        campaign_id: String(body.campaignId),
        submitter_privy_id: user.privyId,
        submitter_wallet: body.submitterWallet?.toLowerCase() ?? null,
        title: body.title ?? null,
        content: body.content,
        links: body.links ?? null,
        attachments: body.attachments ?? null,
        submission_hash: submissionHash,
      })
      .select('id, submission_hash, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return Response.json(
          { error: 'You have already submitted this exact content.' },
          { status: 409 },
        );
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ submission: data }, { status: 201 });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return Response.json({ submissions: [] });
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  if (!campaignId) {
    return Response.json({ error: 'campaignId is required' }, { status: 400 });
  }
  const chain = getActiveChain();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('submissions')
    .select(
      'id, chain_id, campaign_id, submitter_privy_id, submitter_wallet, title, content, links, attachments, submission_hash, status, score, created_at',
    )
    .eq('chain_id', chain.id)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ submissions: data ?? [] });
}
