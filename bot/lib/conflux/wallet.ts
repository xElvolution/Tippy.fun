import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

/** 64 hex chars (no `0x`), checksummed `0x` address. Matches Tippy vault storage format. */
export function generateEvmWallet(): { privateKeyHex: string; evmAddress: string } {
  const pk = generatePrivateKey();
  const account = privateKeyToAccount(pk);
  return { privateKeyHex: pk.replace(/^0x/i, ''), evmAddress: account.address };
}
