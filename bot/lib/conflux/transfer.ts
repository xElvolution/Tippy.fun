import { isAddress } from 'viem';
import { humanAmountToBaseUnits } from './amount';
import { getWalletClient } from './client';
import { erc20Abi } from './erc20Abi';

export { humanAmountToBaseUnits } from './amount';

export async function sendNativeCfxTip(params: {
  privateKeyHex: string;
  fromAddress: string;
  toAddress: string;
  amountHuman: number;
}): Promise<{ txHash: string }> {
  if (!isAddress(params.fromAddress) || !isAddress(params.toAddress)) {
    throw new Error('Invalid Conflux eSpace address (0x…).');
  }
  const wallet = getWalletClient(params.privateKeyHex);
  if (wallet.account.address.toLowerCase() !== params.fromAddress.toLowerCase()) {
    throw new Error('Private key does not match wallet address');
  }
  const value = BigInt(humanAmountToBaseUnits(params.amountHuman, 18));
  const hash = await wallet.sendTransaction({
    to: params.toAddress as `0x${string}`,
    value,
  });
  return { txHash: hash };
}

export async function sendErc20HumanTip(params: {
  privateKeyHex: string;
  fromAddress: string;
  toAddress: string;
  contractAddress: string;
  amountHuman: number;
  decimals: number;
}): Promise<{ txHash: string }> {
  if (!isAddress(params.fromAddress) || !isAddress(params.toAddress) || !isAddress(params.contractAddress)) {
    throw new Error('Invalid Conflux eSpace address (0x…).');
  }
  const wallet = getWalletClient(params.privateKeyHex);
  if (wallet.account.address.toLowerCase() !== params.fromAddress.toLowerCase()) {
    throw new Error('Private key does not match wallet address');
  }
  const amountBase = humanAmountToBaseUnits(params.amountHuman, params.decimals);
  const hash = await wallet.writeContract({
    address: params.contractAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [params.toAddress as `0x${string}`, BigInt(amountBase)],
  });
  return { txHash: hash };
}
