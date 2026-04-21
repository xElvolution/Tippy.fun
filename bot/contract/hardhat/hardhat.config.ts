import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pkRaw = process.env.CONTRACT_DEPLOYER_PRIVATE_KEY?.trim().replace(/^0x/i, '') ?? '';
const accounts = pkRaw.length === 64 && /^[0-9a-fA-F]+$/.test(pkRaw) ? [`0x${pkRaw}` as const] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    confluxESpaceTestnet: {
      url: process.env.CONFLUX_TESTNET_RPC_URL || 'https://evmtestnet.confluxrpc.com',
      chainId: 71,
      accounts: accounts as string[],
    },
    confluxESpace: {
      url: process.env.CONFLUX_MAINNET_RPC_URL || 'https://evm.confluxrpc.com',
      chainId: 1030,
      accounts: accounts as string[],
    },
  },
};

export default config;
