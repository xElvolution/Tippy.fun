import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import * as dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';
const CONFLUX_ESPACE_RPC = process.env.CONFLUX_ESPACE_RPC ?? 'https://evm.confluxrpc.com';
const CONFLUX_ESPACE_TESTNET_RPC =
  process.env.CONFLUX_ESPACE_TESTNET_RPC ?? 'https://evmtestnet.confluxrpc.com';
const CONFLUXSCAN_API_KEY = process.env.CONFLUXSCAN_API_KEY ?? '';

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    confluxEspaceTestnet: {
      url: CONFLUX_ESPACE_TESTNET_RPC,
      chainId: 71,
      accounts,
    },
    confluxEspace: {
      url: CONFLUX_ESPACE_RPC,
      chainId: 1030,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      confluxEspaceTestnet: CONFLUXSCAN_API_KEY || 'any',
      confluxEspace: CONFLUXSCAN_API_KEY || 'any',
    },
    customChains: [
      {
        network: 'confluxEspaceTestnet',
        chainId: 71,
        urls: {
          apiURL: 'https://evmapi-testnet.confluxscan.io/api',
          browserURL: 'https://evmtestnet.confluxscan.io',
        },
      },
      {
        network: 'confluxEspace',
        chainId: 1030,
        urls: {
          apiURL: 'https://evmapi.confluxscan.io/api',
          browserURL: 'https://evm.confluxscan.io',
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
