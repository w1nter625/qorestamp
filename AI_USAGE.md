# AI_USAGE.md

QoreStamp was built with a coding agent (Grok Bot) driven by Wynnter, for the
Build Before Q-Day **Best AI-Native Build** special award.

## Workflow

- Wynnter set the goal: evaluate the official fest pages, then build a small
  original Quantum Pass project on the QoreChain testnet, without registering
  or submitting until he approves the accounts that must be connected.
- The agent read the official rules, prizes, start guide, terms, privacy
  policy, Workshop 1, and the `create-qorechain-dapp` hardhat template
  documentation, then scaffolded the project with
  `create-qorechain-dapp@0.14.0` and replaced the sample Counter with an
  original receipt-stamp design.
- The agent wrote the Solidity contract, Hardhat tests, verify/digest/account
  scripts, the Vite verifier UI, this file, the README, the submission notes,
  and a narrated demo (screen slides, English TTS, burned-in captions). No
  on-camera appearance.
- A throwaway testnet-only account was generated locally and kept in
  gitignored `.secrets/`. The agent did not register on
  build.qorechain.io, did not connect an X account, and did not submit.

## What the model generated

- `contracts/StampRegistry.sol` and `test/StampRegistry.ts`
- `scripts/new-account.ts`, `scripts/verify.ts`, `scripts/digest.ts`
- `web/` composer and on-chain verifier
- Documentation (`README.md`, `SUBMISSION.md`, this file)
- Cover, logo, and demo video assets

## What stayed official / human

- `scripts/window.ts`, Hardhat network wiring and the scaffold layout come
  from the official QoreChain hardhat template and are credited in the README.
- Eligibility, prize and X-connection facts were copied from the official
  fest pages, not invented.
- Wynnter remains the registrant and the person who must approve connecting
  GitHub and X, claiming faucet tokens (dashboard sign-in), and submitting.

## How to check

- `pnpm test` must pass on the simulated network.
- After a faucet claim, `pnpm window open` produces a hybrid-signed hash that
  `pnpm verify` (and the web verifier) should report as
  `pqc_hybrid_verify = verified`.
