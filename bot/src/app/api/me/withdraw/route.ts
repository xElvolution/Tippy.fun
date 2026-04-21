import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { isAddress } from 'viem';
import { authOptions } from '@/lib/auth';
import { isSupabaseConfigured, isEncryptionConfigured } from '@lib/env';
import { getUserByDiscordId, getPrivateKeyHexForUser } from '@lib/db/users';
import { recordWithdrawal } from '@lib/db/withdrawals';
import { sendNativeCfxTip } from '@lib/conflux/transfer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSupabaseConfigured() || !isEncryptionConfigured()) {
    return NextResponse.json({ error: 'Server is not fully configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  const discordId = session?.user?.id;
  if (!discordId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { toAddress?: string; amount?: string | number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const toAddress = typeof body.toAddress === 'string' ? body.toAddress.trim() : '';
  const amountNum = typeof body.amount === 'number' ? body.amount : parseFloat(String(body.amount ?? ''));

  if (!toAddress || !isAddress(toAddress)) {
    return NextResponse.json({ error: 'Enter a valid Conflux eSpace address (0x…)' }, { status: 400 });
  }
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
  }

  try {
    const user = await getUserByDiscordId(discordId);
    if (!user) {
      return NextResponse.json({ error: 'Register with /register in Discord first' }, { status: 400 });
    }

    const pk = await getPrivateKeyHexForUser(discordId);
    if (!pk) {
      return NextResponse.json({ error: 'Could not unlock wallet key' }, { status: 500 });
    }

    try {
      const { txHash } = await sendNativeCfxTip({
        privateKeyHex: pk,
        fromAddress: user.evm_address,
        toAddress,
        amountHuman: amountNum,
      });
      await recordWithdrawal({
        userId: user.id,
        toAddress,
        denom: 'cfx',
        amount: String(amountNum),
        txHash,
        status: 'success',
      });
      return NextResponse.json({ ok: true, txHash });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await recordWithdrawal({
        userId: user.id,
        toAddress,
        denom: 'cfx',
        amount: String(amountNum),
        txHash: null,
        status: 'failed',
        error: msg,
      });
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Withdraw failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
