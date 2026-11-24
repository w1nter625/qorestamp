# QoreStamp — Build Before Q-Day submission notes

**Do not register, connect X, post, email, or submit until Wynnter approves.**
This file is a paste-ready pack. Nothing below has been sent to the organiser.

- Event: [Build Before Q-Day](https://build.qorechain.io/) (QoreChain Developer Fest)
- Official pages: [start](https://build.qorechain.io/start) · [rules](https://build.qorechain.io/rules) · [prizes](https://build.qorechain.io/prizes) · [terms](https://build.qorechain.io/terms) · [privacy](https://build.qorechain.io/privacy)
- Deadline: **2 December 2026, 23:59 UTC = 3 December 2026, 07:59 SGT**
- Category / level: **Quantum Pass** (teams of 1 to 2). Solo.
- Builder: Wynnter (GitHub `w1nter625`), Singapore, 20 (rules say “18 or older”; no age-of-majority clause).
- Country on the project form: **Singapore** (Asia-Pacific regional award, only if the project wins no other prize).

There is **no separate Submit button**. At the deadline the project page becomes read-only, and that version is what they check.

---

## Paste-ready fields

### Project name
QoreStamp

### One-line description / tagline
Post-quantum receipts: hash a short memo, stamp it on the QoreChain testnet, and verify both signatures on chain.

### Category
**Quantum Pass**

### How it's made (short)
Scaffolded with official `create-qorechain-dapp` (hardhat, SDK 0.14.0). A `StampRegistry` contract stores a SHA-256 digest, stamper and timestamp. The Quantum Pass proof is the hybrid-signed EVM window (`pnpm window open`: secp256k1 + ML-DSA-87). A small web page composes the memo and verifies a testnet transaction against the public REST API (`PQCHybridSignature` + `pqc_hybrid_verify`).

### GitHub repository
https://github.com/w1nter625/qorestamp

Public, **MIT** (`LICENSE`). Official template credited in the README.

### Demo video (≤ 3 minutes)
jsDelivr (prefer this in the form):
https://cdn.jsdelivr.net/gh/w1nter625/qorestamp@gh-pages/demo.mp4

GitHub Pages copy:
https://w1nter625.github.io/qorestamp/demo.mp4

Local file (not submitted from disk): `/workspace/competitions-2/qorechain-qorestamp/demo.mp4`
— 69.8 seconds, 1920×1080, H.264 + AAC, English `en-US-AndrewNeural` TTS, burned-in captions. Slides only; no on-camera appearance.

### Cover / logo
- Cover (16:9, 1920×1080 PNG, under 5 MB): `/workspace/competitions-2/qorechain-qorestamp/cover.png`
  https://github.com/w1nter625/qorestamp/blob/main/cover.png
- Logo (1024×1024 PNG): `/workspace/competitions-2/qorechain-qorestamp/logo.png`
  https://github.com/w1nter625/qorestamp/blob/main/logo.png

### Website / live demo
The verifier UI lives in `web/` and is also on the `gh-pages` branch. https://w1nter625.github.io/qorestamp/ will work once GitHub Pages is enabled on that branch (the token used to push the repo could not flip the Pages switch). Until then, run `pnpm --dir web dev`, or skip this optional field. The required demo video is already public on jsDelivr.

### Testnet address the project uses
`qor1vu4c2yqydsqssxmavx6mhc3a2nnslcyucmuk2a`  
(same account as EVM `0x672b8510046C01081B7D61b5BBE23d54E70Fe09C`)

Throwaway **testnet-only** account, generated for this project. After a faucet claim, add the `opened:` window-open hash and the `StampRegistry` contract address here.

**Not yet on chain:** the official faucet at https://dashboard.qorechain.io/faucet requires a dashboard sign-in. That step was not taken. Once Wynnter signs in (or approves it), claim 100 test QOR to the `qor1…` address above, then run:

```
pnpm window register
pnpm window open          # save the opened: hash — this is the hybrid-signed proof
# wait ~10 seconds
pnpm deploy:testnet
pnpm verify <opened-hash>
```

### Kits / features to tick (only what is actually in the repo)
- `create-qorechain-dapp` hardhat template / `@qorechain/sdk` + `@qorechain/evm` 0.14.0
- hybrid transaction (`pnpm window open`)
- PQC key registration (`pnpm window register`)
- EVM authorisation window
- Solidity contract on the QoreChain EVM (testnet 9800)
- QoreX connect in the web UI (optional; `window.qorex.native`)

Do not tick QoreSeal, Cross-VM, RDK/rollup, IBC, or mainnet features — they are not in this repo.

### Special awards to tick
- **Best AI-Native Build** — `AI_USAGE.md` is in the repository. Tick the AI-native option on the form.
- **Quantum Campus** — only if Wynnter is enrolled at a university, college or school during the fest and is willing to email student-enrolment proof if the jury asks. Proof is deleted after the check.
- Regional (Asia-Pacific / Singapore) is automatic from the country field; it only pays if the project wins no other prize.

### Longer description (English)

**Problem.** A lunch IOU in a chat can be edited, lost or denied. After Q-Day, a classical secp256k1 signature alone may also be forgeable.

**What QoreStamp does.** You write a short receipt or memo. The app shows its SHA-256 digest. The chain stores only that hash, plus the stamper and a timestamp, in `StampRegistry`. Anyone who still has the exact text can re-hash it and compare.

**How the post-quantum part works.** QoreChain admits an EVM transaction only after the sender opens an authorisation window with a hybrid signature: secp256k1 and ML-DSA-87 (FIPS 204). That window-open transaction is the Quantum Pass proof. The public testnet API must return code 0, a `PQCHybridSignature`, and a `pqc_hybrid_verify` event with status `verified`. The web verifier (and `pnpm verify`) check exactly that.

**What is original.** This is not the official Counter or Hybrid Inspector sample. The product is a receipt stamp: SHA-256 (not keccak) of a human memo, a registry, and a verifier aimed at that proof.

**What already existed.** The official `create-qorechain-dapp` hardhat template, `@qorechain/sdk` / `@qorechain/evm` 0.14.0, and `scripts/window.ts` from the kit, all credited in the README. All QoreStamp application code was written during the fest window (after 4 November 2026).

---

## Registration and project-page steps (do this only after Wynnter approves)

1. Open https://build.qorechain.io/register. **Do not start this until approved.**
2. Sign in with GitHub. Official text: they read the public profile and verified email, and “never get access to your repositories.” Use `w1nter625`.
3. Details: level **Quantum Pass**, mode **solo**, confirm **18 or older**, accept the Terms. Leave marketing unticked unless he wants email.
4. Connect X (required to finish registration). See the next section. **Do not post or click Connect until he chooses an account and a method.**
5. Connect QoreX on **Testnet**, or send the on-page proof (a tiny transfer to self, about 0.1 test QOR). The project’s throwaway `qor1…` can be used after the faucet claim. Official text: they store the testnet address and the proof transaction or signature.
6. Create the project early (name, description, plan, category Quantum Pass). Link the public repo, upload the 16:9 cover, add the video URL, add the `qor1…` address, tick only the kits actually used, and tick AI-native.
7. Optional: install the “QoreChain Build” GitHub App from My space so commits appear in the fest feed. This is separate from GitHub sign-in and is not required by the written checks.
8. Keep building until **2 Dec 23:59 UTC**. From 3–5 Dec they check: public repo, MIT or Apache-2.0, README, cover, video, testnet addresses, team size, every member registered, commits during the fest, and kits they can detect in the repo.

### X account — what connecting actually does

Official start guide: “Connect X: sign in with X, **or** publish the short verification post the page gives you and paste the link to it.”

Official register UI copy (from the live page, 2026-11-24):

- Body: “Your X account is where you share progress. We read your username, nothing else.”
- OAuth scopes line: **“Permissions asked: read your profile. We cannot post for you.”**
- Privacy policy: they collect the X username and, if you connect through X, the user id. **“We do not keep GitHub or X access tokens. They are used once, when you connect, and discarded.”**

On the unauthenticated register page the flag `xOAuth` was **false**, so the default path may be the **verification post**, not OAuth. If OAuth is off, the page asks you to publish a short public post (template includes `@QoreChain`, a `$20,000` prize-pool line, https://build.qorechain.io, `#BuildBeforeQDay`, and a one-time code) and paste the `x.com/…/status/…` link. That post is written by the user, not by an app with tweet-write permission.

Sharing later progress with `#BuildBeforeQDay` is encouraged (“helps the jury see how the project came together”) but is **not** listed in the submission checks. Connecting X is required for registration to be complete; a public promotional thread is not a listed requirement.

**Ask Wynnter:** which X account to use, and whether he prefers OAuth (profile read only, if offered) or a one-time public verification post.

### What he must still do for a complete, on-chain entry

1. Choose and approve an X account (and the connect method).
2. Approve GitHub sign-in on build.qorechain.io (and later, if he wants, the optional Build GitHub App).
3. Sign in to the dashboard faucet and send 100 test QOR to `qor1vu4c2yqydsqssxmavx6mhc3a2nnslcyucmuk2a`.
4. After that, the agent can register the PQC key, open the hybrid window, deploy `StampRegistry`, and fill in the tx hash / contract address.
5. Create the project on the fest site and link repo, cover, video, and address — still only after approval.
6. If Quantum Campus is desired: confirm student status.

### What is not required

- No purchase, no staking, no mainnet QOR to enter. People’s Choice voting later uses QoreX on **mainnet** and costs a minimal fee; that is optional and separate.
- No camera, no live English pitch. The 16 December live demo show is the winners announcement.
- The Q-Day Drill (18 November) is already over.
- Prizes are paid in **stablecoin** (17–22 December) if you win. They may ask for payout details; regional winners may be asked for proof of residence. Not a blanket KYC form in the published rules.

---

## Judging reminder (official FAQ)

Same five criteria for every category: Works as described 25%, QoreChain tech usage 25%, post-quantum correctness and security 20%, originality 15%, clarity / UX / documentation 15%.
