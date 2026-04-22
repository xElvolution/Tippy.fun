import { ethers, network, run } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

/**
 * Deploys the TippyMaker registry. On testnet networks we additionally deploy two mock ERC-20s
 * (tUSDT0 and tAxCNH) so judges can click through the ERC-20 payout flow without needing real
 * USDT0 / AxCNH balances. On mainnet we skip the mocks; real addresses come from env.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deploying TippyMaker`);
  console.log(`  network : ${network.name} (chainId ${network.config.chainId})`);
  console.log(`  deployer: ${deployer.address}`);
  console.log(`  balance : ${ethers.formatEther(balance)} CFX`);

  const Tippy = await ethers.getContractFactory('TippyMaker');
  const tippy = await Tippy.deploy();
  const tippyTx = tippy.deploymentTransaction();
  console.log(`  TippyMaker deploy tx: ${tippyTx?.hash}`);
  await tippy.waitForDeployment();
  const tippyAddress = await tippy.getAddress();
  console.log(`\nDeployed TippyMaker at: ${tippyAddress}`);

  const deployment: Record<string, unknown> = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    tippyMaker: {
      address: tippyAddress,
      txHash: tippyTx?.hash ?? null,
    },
  };

  const isTestnet = network.name === 'confluxEspaceTestnet' || network.name === 'hardhat';
  if (isTestnet) {
    console.log(`\nDeploying mock ERC-20s for testnet demo...`);

    const Erc20 = await ethers.getContractFactory('TestERC20');

    const usdt = await Erc20.deploy('Tippy Test USDT0', 'tUSDT0', 6);
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log(`  tUSDT0 at: ${usdtAddress}`);

    const axcnh = await Erc20.deploy('Tippy Test AxCNH', 'tAxCNH', 18);
    await axcnh.waitForDeployment();
    const axcnhAddress = await axcnh.getAddress();
    console.log(`  tAxCNH at: ${axcnhAddress}`);

    deployment.mocks = {
      tUSDT0: usdtAddress,
      tAxCNH: axcnhAddress,
    };
  }

  const outPath = resolve(__dirname, `../deployments/${network.name}.json`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log(`\nWrote deployment to ${outPath}`);

  console.log(`\nNext: add the following to web/.env.local:`);
  console.log(`  NEXT_PUBLIC_TIPPY_CONTRACT_ADDRESS=${tippyAddress}`);
  const chainEnv = network.config.chainId === 1030 ? 'mainnet' : 'testnet';
  console.log(`  NEXT_PUBLIC_CONFLUX_CHAIN=${chainEnv}`);
  if (deployment.mocks) {
    const mocks = deployment.mocks as { tUSDT0: string; tAxCNH: string };
    console.log(`  NEXT_PUBLIC_USDT0_ADDRESS=${mocks.tUSDT0}`);
    console.log(`  NEXT_PUBLIC_AXCNH_ADDRESS=${mocks.tAxCNH}`);
  }

  if (network.name.startsWith('confluxEspace') && process.env.CONFLUXSCAN_API_KEY) {
    console.log(`\nWaiting 30s before ConfluxScan verification...`);
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      await run('verify:verify', { address: tippyAddress, constructorArguments: [] });
      console.log(`Verified TippyMaker on ConfluxScan.`);
    } catch (err) {
      console.warn(`TippyMaker verification failed (you can retry manually):`, err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
