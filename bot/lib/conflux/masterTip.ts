import { isAddress } from 'viem';
import { getWalletClient } from './client';
import { masterTipAbi } from './abis/masterTip';

export function masterTipContractAddress(): string | null {
  const raw = process.env.MASTER_TIP_CONTRACT?.trim();
  if (!raw) return null;
  return raw;
}

/**
 * Records a guild point-currency intent on the MasterTip contract (same role as CosmWasm `RequestPointToken`).
 * Caller must have CFX for gas on the signing wallet.
 */
export async function broadcastMasterTipRequestPointToken(params: {
  privateKeyHex: string;
  senderAddress: string;
  guildId: string;
  displayName: string;
  symbol: string;
  supplyCap: string;
}): Promise<{ transactionHash: string }> {
  const contract = masterTipContractAddress();
  if (!contract || !isAddress(contract)) {
    throw new Error('MASTER_TIP_CONTRACT is not set or is not a valid 0x address');
  }

  try {
    void BigInt(params.supplyCap);
  } catch {
    throw new Error('supplyCap must be an integer string');
  }

  const wallet = getWalletClient(params.privateKeyHex);
  if (wallet.account.address.toLowerCase() !== params.senderAddress.toLowerCase()) {
    throw new Error('Private key does not match wallet address');
  }

  const hash = await wallet.writeContract({
    address: contract as `0x${string}`,
    abi: masterTipAbi,
    functionName: 'requestPointToken',
    args: [params.guildId.trim(), params.displayName.trim(), params.symbol.trim(), BigInt(params.supplyCap)],
  });

  return { transactionHash: hash };
}
