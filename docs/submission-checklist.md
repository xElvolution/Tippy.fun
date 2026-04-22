# Global Hackfest 2026: Tippy submission checklist

Track the items the hackfest rules require. Check each off as you complete it.

## Project

- [x] Runs and does what we demo (Next.js app + Hardhat contract + tests).
- [x] Built in the hackathon window.
- [x] Uses Conflux in a real way (non-custodial on-chain campaign escrow on eSpace).
- [ ] Team of 1–5, all registered (fill in team in `README.md`).
- [x] Own work (generated/assisted code properly attributed; see Acknowledgments).

## Repo

- [x] Public on GitHub, clear name (`tippy-fun` or similar).
- [x] README per hackathon template (`README.md`), license `MIT` (`LICENSE`).
- [x] Code builds and runs: `pnpm -C web dev`, `pnpm -C contracts test`.

## Docs

- [x] README with setup and usage.
- [x] Go-to-market plan: `docs/go-to-market.md`.
- [x] Architecture section in README.
- [x] Known issues / roadmap noted under _Future Improvements_.

## Demo

- [ ] 3–5 min demo video (`projects/tippy/demo/demo-video.mp4`).
- [ ] 30–60 s participant intro video (`projects/tippy/demo/participant-intro.mp4`).
- [ ] Live link deployed to Vercel (`projects/tippy/links.md`).
- [ ] Screenshots under `projects/tippy/demo/screenshots/`.
- [ ] Pitch deck (optional).

## Ecosystem steps (required by hackathon rules)

- [ ] PR to [`electric-capital/open-dev-data`](https://github.com/electric-capital/open-dev-data)
      with a migration file:
      ```
      repadd Conflux https://github.com/<your-org>/tippy-fun
      ```
- [ ] Tweet / X post tagging **@ConfluxDevs @ConfluxNetwork** with
      **#globalhackfest26 #ConfluxHackathon** and a link to the repo / demo.
- [ ] Optional +5 pts: grant proposal on the
      [Conflux Forum](https://forum.conflux.fun/c/English/grant-proposals).
- [ ] Submission PR to `conflux-fans/global-hackfest-2026` with `/projects/tippy/` folder
      (scaffolded at `projects/tippy/`; paste `SUBMISSION.md` into the PR body), including
      links to the Electric Capital PR and the social post.

## Technical (per submission guide)

- [ ] `TippyMaker` + `TestERC20` mocks deployed to Conflux eSpace testnet (chainId `71`),
      addresses + tx hashes captured in `contracts/deployments/confluxEspaceTestnet.json`.
- [ ] Frontend deployed to Vercel with `NEXT_PUBLIC_*` env vars pointed at the deployed contract.
- [ ] All user flows tested end-to-end: connect wallet → create campaign → tip → pay winner →
      finalize.
- [ ] Contract verified on ConfluxScan (either automatically via the deploy script if
      `CONFLUXSCAN_API_KEY` is set, or manually via
      `pnpm -C contracts verify:testnet 0x<address>`).

## Last-mile (before you submit)

- [ ] Double-check every link in the README.
- [ ] Make sure no `.env`, `.env.local`, or private key is committed.
- [ ] Run `pnpm -C web build` once to ensure the production build passes.
- [ ] Tag a release / push a main-branch commit at the submission deadline.
