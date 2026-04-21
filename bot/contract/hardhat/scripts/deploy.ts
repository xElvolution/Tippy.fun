import * as fs from 'fs';
import * as path from 'path';
import { ethers, network } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error('No signer: set CONTRACT_DEPLOYER_PRIVATE_KEY (64 hex chars, optional 0x) in .env');
  }

  const admin = process.env.MASTER_TIP_ADMIN?.trim() || deployer.address;
  const usdtRecipient = process.env.TEST_USDT_RECIPIENT?.trim() || deployer.address;

  console.log('Network:', network.name, 'chainId:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('Deployer:', deployer.address);
  console.log('MasterTip admin:', admin);
  console.log('TestUSDT initial recipient:', usdtRecipient);

  const MasterTip = await ethers.getContractFactory('MasterTip');
  const masterTip = await MasterTip.deploy(admin);
  await masterTip.waitForDeployment();
  const masterTipAddress = await masterTip.getAddress();

  const TestUSDT = await ethers.getContractFactory('TestUSDT');
  const testUsdt = await TestUSDT.deploy(usdtRecipient);
  await testUsdt.waitForDeployment();
  const testUsdtAddress = await testUsdt.getAddress();

  const out = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    masterTip: masterTipAddress,
    testUSDT: testUsdtAddress,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, '..', 'deployments', `${network.name}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');

  console.log('\nDeployed:');
  console.log('  MasterTip:', masterTipAddress);
  console.log('  TestUSDT :', testUsdtAddress);
  console.log('\nWrote', outPath);
  console.log('\nAdd to repo root .env (Tippy app + bot):');
  console.log(`  MASTER_TIP_CONTRACT=${masterTipAddress}`);
  console.log(`  TEST_ERC20_CONTRACT=${testUsdtAddress}`);
  console.log('  TEST_ERC20_DECIMALS=6');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
