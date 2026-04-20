import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const ZERO = '0x0000000000000000000000000000000000000000';
const MODE_BOUNTY = 0;
const MODE_TIP = 1;

const hash = (s: string) => ethers.keccak256(ethers.toUtf8Bytes(s));

async function deployFixture() {
  const [organizer, alice, bob, charlie, funder] = await ethers.getSigners();

  const Tippy = await ethers.getContractFactory('TippyMaker');
  const tippy = await Tippy.deploy();
  await tippy.waitForDeployment();

  const Erc20 = await ethers.getContractFactory('TestERC20');
  const usdt = await Erc20.deploy('Tippy Test USDT0', 'tUSDT0', 6);
  await usdt.waitForDeployment();

  // fund a few balances
  for (const signer of [organizer, alice, bob, charlie, funder]) {
    await usdt.faucet(signer.address, 1_000_000_000n); // 1000 tUSDT0 (6 decimals)
  }

  return { tippy, usdt, organizer, alice, bob, charlie, funder };
}

describe('TippyMaker', () => {
  describe('createCampaign', () => {
    it('creates a native CFX bounty with seed and emits events', async () => {
      const { tippy, organizer } = await deployFixture();
      const seed = ethers.parseEther('5');
      const submissionsClose = Math.floor(Date.now() / 1000) + 3600;
      const claimDeadline = submissionsClose + 7 * 24 * 3600;

      await expect(
        tippy
          .connect(organizer)
          .createCampaign(
            ZERO,
            MODE_BOUNTY,
            'ipfs://meta-1',
            submissionsClose,
            claimDeadline,
            seed,
            { value: seed },
          ),
      )
        .to.emit(tippy, 'CampaignCreated')
        .withArgs(
          0,
          organizer.address,
          ZERO,
          MODE_BOUNTY,
          'ipfs://meta-1',
          submissionsClose,
          claimDeadline,
          seed,
        )
        .and.to.emit(tippy, 'Funded')
        .withArgs(0, organizer.address, seed);

      const c = await tippy.getCampaign(0);
      expect(c.organizer).to.equal(organizer.address);
      expect(c.token).to.equal(ZERO);
      expect(c.mode).to.equal(MODE_BOUNTY);
      expect(c.prizePool).to.equal(seed);
      expect(c.totalFunded).to.equal(seed);
      expect(c.claimDeadline).to.equal(claimDeadline);
      expect(c.finalized).to.equal(false);
    });

    it('creates an ERC-20 tip campaign with seed pulled via transferFrom', async () => {
      const { tippy, usdt, organizer } = await deployFixture();
      const seed = 500_000_000n;

      await usdt.connect(organizer).approve(await tippy.getAddress(), seed);
      await tippy
        .connect(organizer)
        .createCampaign(await usdt.getAddress(), MODE_TIP, 'ipfs://tip-meta', 0, 0, seed);

      const c = await tippy.getCampaign(0);
      expect(c.token).to.equal(await usdt.getAddress());
      expect(c.mode).to.equal(MODE_TIP);
      expect(c.prizePool).to.equal(seed);
      expect(await usdt.balanceOf(await tippy.getAddress())).to.equal(seed);
    });

    it('rejects Bounty with no claim deadline', async () => {
      const { tippy, organizer } = await deployFixture();
      await expect(
        tippy.connect(organizer).createCampaign(ZERO, MODE_BOUNTY, 'x', 0, 0, 0),
      ).to.be.revertedWithCustomError(tippy, 'WrongMode');
    });

    it('rejects Tip with a claim deadline', async () => {
      const { tippy, organizer } = await deployFixture();
      await expect(
        tippy.connect(organizer).createCampaign(ZERO, MODE_TIP, 'x', 0, 123, 0),
      ).to.be.revertedWithCustomError(tippy, 'WrongMode');
    });

    it('rejects native CFX value when ERC-20 token is used', async () => {
      const { tippy, usdt, organizer } = await deployFixture();
      await usdt.connect(organizer).approve(await tippy.getAddress(), 100n);
      await expect(
        tippy
          .connect(organizer)
          .createCampaign(await usdt.getAddress(), MODE_TIP, 'x', 0, 0, 100n, {
            value: 1n,
          }),
      ).to.be.revertedWithCustomError(tippy, 'NativeValueNotAllowed');
    });
  });

  describe('fund & tip', () => {
    it('tracks totals for tip() on native campaigns', async () => {
      const { tippy, organizer, funder } = await deployFixture();
      const submissionsClose = Math.floor(Date.now() / 1000) + 3600;
      await tippy
        .connect(organizer)
        .createCampaign(ZERO, MODE_BOUNTY, 'x', submissionsClose, submissionsClose + 1000, 0);

      await expect(tippy.connect(funder).tip(0, ethers.parseEther('1'), 'gm', { value: ethers.parseEther('1') }))
        .to.emit(tippy, 'Tipped')
        .withArgs(0, funder.address, ethers.parseEther('1'), 'gm');

      const c = await tippy.getCampaign(0);
      expect(c.prizePool).to.equal(ethers.parseEther('1'));
      expect(c.totalTipped).to.equal(ethers.parseEther('1'));
      expect(c.totalFunded).to.equal(ethers.parseEther('1'));
    });

    it('pulls ERC-20 via transferFrom on fund()', async () => {
      const { tippy, usdt, organizer, funder } = await deployFixture();
      await tippy
        .connect(organizer)
        .createCampaign(await usdt.getAddress(), MODE_TIP, 'x', 0, 0, 0);

      const amt = 25_000_000n;
      await usdt.connect(funder).approve(await tippy.getAddress(), amt);
      await tippy.connect(funder).fund(0, amt);

      const c = await tippy.getCampaign(0);
      expect(c.prizePool).to.equal(amt);
      expect(c.totalFunded).to.equal(amt);
    });
  });

  describe('Bounty settle / claim / reclaim', () => {
    async function bounty(withSeed = ethers.parseEther('10')) {
      const fx = await deployFixture();
      const now = (await ethers.provider.getBlock('latest'))!.timestamp;
      const submissionsClose = now + 3600;
      const claimDeadline = submissionsClose + 7 * 24 * 3600;
      await fx.tippy
        .connect(fx.organizer)
        .createCampaign(ZERO, MODE_BOUNTY, 'meta', submissionsClose, claimDeadline, withSeed, {
          value: withSeed,
        });
      return { ...fx, submissionsClose, claimDeadline };
    }

    it('settles winners and deducts from prize pool into entitlements', async () => {
      const { tippy, organizer, alice, bob } = await bounty();
      const a = ethers.parseEther('3');
      const b = ethers.parseEther('2');

      await expect(
        tippy
          .connect(organizer)
          .settleWinners(
            0,
            [alice.address, bob.address],
            [a, b],
            [hash('sub-a'), hash('sub-b')],
            hash('verdict-1'),
            'round 1',
          ),
      )
        .to.emit(tippy, 'WinnerSettled')
        .withArgs(0, alice.address, a, hash('sub-a'), hash('verdict-1'), 'round 1')
        .and.to.emit(tippy, 'WinnerSettled')
        .withArgs(0, bob.address, b, hash('sub-b'), hash('verdict-1'), 'round 1');

      const c = await tippy.getCampaign(0);
      expect(c.prizePool).to.equal(ethers.parseEther('5'));
      expect(c.totalEntitled).to.equal(ethers.parseEther('5'));
      expect(c.latestVerdictHash).to.equal(hash('verdict-1'));

      const [aAmt, aClaimed] = await tippy.entitlementOf(0, alice.address);
      expect(aAmt).to.equal(a);
      expect(aClaimed).to.equal(false);
    });

    it('winner can claim before deadline and receives native CFX', async () => {
      const { tippy, organizer, alice } = await bounty();
      const a = ethers.parseEther('3');
      await tippy
        .connect(organizer)
        .settleWinners(0, [alice.address], [a], [hash('s1')], hash('v1'), 'note');

      const before = await ethers.provider.getBalance(alice.address);
      const tx = await tippy.connect(alice).claim(0);
      const rc = await tx.wait();
      const gas = rc!.gasUsed * rc!.gasPrice;
      const after = await ethers.provider.getBalance(alice.address);
      expect(after - before + gas).to.equal(a);

      const c = await tippy.getCampaign(0);
      expect(c.totalEntitled).to.equal(0n);
      expect(c.totalPaidOut).to.equal(a);

      await expect(tippy.connect(alice).claim(0)).to.be.revertedWithCustomError(tippy, 'AlreadyClaimed');
    });

    it('cannot claim after claim deadline', async () => {
      const { tippy, organizer, alice, claimDeadline } = await bounty();
      await tippy
        .connect(organizer)
        .settleWinners(0, [alice.address], [ethers.parseEther('1')], [hash('s')], hash('v'), '');

      await ethers.provider.send('evm_setNextBlockTimestamp', [claimDeadline + 1]);
      await ethers.provider.send('evm_mine', []);

      await expect(tippy.connect(alice).claim(0)).to.be.revertedWithCustomError(tippy, 'ClaimWindowClosed');
    });

    it('organizer can reclaim unclaimed after deadline', async () => {
      const { tippy, organizer, alice, bob, claimDeadline } = await bounty();
      const a = ethers.parseEther('3');
      const b = ethers.parseEther('2');
      await tippy
        .connect(organizer)
        .settleWinners(0, [alice.address, bob.address], [a, b], [hash('1'), hash('2')], hash('v'), '');

      // alice claims, bob doesn't
      await tippy.connect(alice).claim(0);

      await ethers.provider.send('evm_setNextBlockTimestamp', [claimDeadline + 1]);
      await ethers.provider.send('evm_mine', []);

      await expect(tippy.connect(organizer).reclaimUnclaimed(0, [bob.address]))
        .to.emit(tippy, 'UnclaimedReclaimed')
        .withArgs(0, bob.address, b, organizer.address);

      // 10 seed -> settle(3+2)=5 -> pool=5, entitled=5.
      // alice claims 3 -> pool=5, entitled=2, paidOut=3.
      // reclaim bob 2 -> pool=7, entitled=0.
      const c = await tippy.getCampaign(0);
      expect(c.totalEntitled).to.equal(0n);
      expect(c.prizePool).to.equal(ethers.parseEther('7'));
      expect(c.totalPaidOut).to.equal(ethers.parseEther('3'));
    });

    it('cannot reclaim before deadline', async () => {
      const { tippy, organizer, alice } = await bounty();
      await tippy
        .connect(organizer)
        .settleWinners(0, [alice.address], [ethers.parseEther('1')], [hash('s')], hash('v'), '');

      await expect(
        tippy.connect(organizer).reclaimUnclaimed(0, [alice.address]),
      ).to.be.revertedWithCustomError(tippy, 'ClaimWindowOpen');
    });

    it('finalize with outstanding entitlements before deadline is blocked', async () => {
      const { tippy, organizer, alice } = await bounty();
      await tippy
        .connect(organizer)
        .settleWinners(0, [alice.address], [ethers.parseEther('1')], [hash('s')], hash('v'), '');
      await expect(tippy.connect(organizer).finalize(0)).to.be.revertedWithCustomError(
        tippy,
        'ClaimWindowOpen',
      );
    });
  });

  describe('Tip mode payTip', () => {
    it('transfers instantly on payTip and prevents double-pay per submission', async () => {
      const { tippy, usdt, organizer, alice } = await deployFixture();
      const seed = 100_000_000n;
      await usdt.connect(organizer).approve(await tippy.getAddress(), seed);
      await tippy
        .connect(organizer)
        .createCampaign(await usdt.getAddress(), MODE_TIP, 'tip', 0, 0, seed);

      const amount = 10_000_000n;
      const subHash = hash('post-1');
      const verdictHash = hash('verdict-post-1');

      await expect(
        tippy
          .connect(organizer)
          .payTip(0, alice.address, amount, subHash, verdictHash, 'pass'),
      )
        .to.emit(tippy, 'TipPaid')
        .withArgs(0, alice.address, amount, subHash, verdictHash, 'pass');

      expect(await usdt.balanceOf(alice.address)).to.equal(1_000_000_000n + amount);

      await expect(
        tippy
          .connect(organizer)
          .payTip(0, alice.address, amount, subHash, verdictHash, 'pass'),
      ).to.be.revertedWithCustomError(tippy, 'AlreadyPaid');
    });

    it('rejects payTip on a Bounty mode campaign', async () => {
      const { tippy, organizer, alice } = await deployFixture();
      const now = (await ethers.provider.getBlock('latest'))!.timestamp;
      await tippy
        .connect(organizer)
        .createCampaign(ZERO, MODE_BOUNTY, 'x', 0, now + 1000, ethers.parseEther('1'), {
          value: ethers.parseEther('1'),
        });

      await expect(
        tippy
          .connect(organizer)
          .payTip(0, alice.address, 1n, hash('s'), hash('v'), ''),
      ).to.be.revertedWithCustomError(tippy, 'WrongMode');
    });
  });

  describe('access control', () => {
    it('non-organizer cannot settle or pay', async () => {
      const { tippy, organizer, alice, bob } = await deployFixture();
      const now = (await ethers.provider.getBlock('latest'))!.timestamp;
      await tippy
        .connect(organizer)
        .createCampaign(ZERO, MODE_BOUNTY, 'x', 0, now + 1000, ethers.parseEther('1'), {
          value: ethers.parseEther('1'),
        });

      await expect(
        tippy
          .connect(alice)
          .settleWinners(0, [bob.address], [1n], [hash('s')], hash('v'), ''),
      ).to.be.revertedWithCustomError(tippy, 'NotOrganizer');
    });
  });

  describe('view helpers', () => {
    it('returns recent campaigns newest first', async () => {
      const { tippy, organizer } = await deployFixture();
      const now = (await ethers.provider.getBlock('latest'))!.timestamp;
      for (let i = 0; i < 3; i++) {
        await tippy
          .connect(organizer)
          .createCampaign(ZERO, MODE_BOUNTY, `m${i}`, 0, now + 1000 + i, 0);
      }
      const [page, ids] = await tippy.getRecentCampaigns(0, 10);
      expect(ids.map((x) => Number(x))).to.deep.equal([2, 1, 0]);
      expect(page[0].metadataURI).to.equal('m2');
    });
  });
});
