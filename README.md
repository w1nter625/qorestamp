# QoreStamp

A small QoreChain app that turns a short receipt, IOU or memo into a
**post-quantum stamp**. You write the text, QoreStamp shows its SHA-256 digest,
and a hybrid-signed testnet transaction plus an optional EVM registry make that
digest publicly checkable.

Built for [Build Before Q-Day](https://build.qorechain.io/) in the
**Quantum Pass** category (teams of 1). MIT licensed.

> Testnet only. Test QOR has no value. Do not send mainnet funds to the
> throwaway account used here.

## What it does

1. You write a memo, for example: `Received 20 SGD from Alex for lunch, 24 Nov 2026, Maxwell Food Centre.`
2. The web UI (and `pnpm digest`) compute the SHA-256 of the exact UTF-8 text.
   The chain never needs the full memo; anyone who still has the text can
   re-hash it and compare.
3. On QoreChain, an EVM call is admitted only after the sender opens an
   **authorisation window** with a **hybrid signature** (secp256k1 + ML-DSA-87,
   FIPS 204). That window-open transaction is the Quantum Pass proof.
4. `StampRegistry` then records the digest, the stamper and a timestamp.
5. Anyone can paste the window-open (or later) transaction hash into the
   verifier. It reads the public testnet API and looks for:
   - `tx_response.code == 0`
   - a `PQCHybridSignature` extension (ML-DSA-87 is 4,627 bytes)
   - a `pqc_hybrid_verify` event with `status = verified`

## Credit

Scaffolded with the official [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp)
**hardhat** template (SDK 0.14.0), then replaced the sample `Counter` with
`StampRegistry` and a verifier UI. `scripts/window.ts` and the Hardhat
network wiring come from that template and are used as documented in
[Workshop 1](https://docs.qorechain.io/build-before-qday/workshop-1/).

## Prerequisites

- Node.js 22 or later and [pnpm](https://pnpm.io/)
- A throwaway **testnet** account (created below)
- Free test QOR from the [faucet](https://dashboard.qorechain.io/faucet)
  (sign-in required; 100 QOR every 24 hours; paste the `qor1…` address)

## Setup

```sh
pnpm install
pnpm --dir web install
pnpm account:new          # writes gitignored .env and .secrets/
pnpm window status        # prints 0x… and qor1… addresses
```

`pnpm account:new` prints only the addresses. The classical private key and
the `QRC1` recovery code stay in `.secrets/` and `.env`, both gitignored.
This account is for `qorechain-diana` (EVM chain id 9800) only.

Claim test QOR, then:

```sh
pnpm test
pnpm window register      # once: bind the ML-DSA-87 key
pnpm window open          # hybrid-signed window; save the `opened:` hash
# wait ~10 seconds
pnpm deploy:testnet       # deploys StampRegistry
pnpm verify <opened-hash> # should report pqc_hybrid_verify = verified
pnpm --dir web dev        # compose memos + verify a hash in the browser
```

QoreX is optional for the web verifier (it only reads the public REST API).
The Connect QoreX button, if the extension or in-app browser is present,
shows your testnet `qor1…` address. Switch QoreX to Testnet first.

## Project layout

```
contracts/StampRegistry.sol     EVM registry of SHA-256 receipt digests
test/StampRegistry.ts           local Hardhat tests (no live endpoint)
ignition/modules/StampRegistry.ts
scripts/window.ts               official window helper (register / open)
scripts/new-account.ts          throwaway testnet account
scripts/verify.ts               hybrid-signature checker
scripts/digest.ts               SHA-256 of a memo
web/                            Vite + TypeScript composer + verifier
```

## Networks

| Network | Chain id | EVM chain id | REST | EVM RPC |
| --- | --- | --- | --- | --- |
| Testnet | `qorechain-diana` | 9800 | `https://api-testnet.qore.host` | `https://evm-testnet.qore.host` |

Explorer: [explore.qore.network](https://explore.qore.network) — switch the
network selector to Testnet, then search the hash.

## Tests

```sh
pnpm test
```

Runs on Hardhat's simulated network. Coverage: empty start, stamp + event,
zero-digest rejection, two stampers with the same digest, unknown id, and
SHA-256 versus keccak.

## License

MIT. See [LICENSE](LICENSE).
