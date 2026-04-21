export const masterTipAbi = [
  {
    type: 'function',
    name: 'requestPointToken',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'guildIdentifier', type: 'string' },
      { name: 'displayName', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'supply', type: 'uint256' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
] as const;
