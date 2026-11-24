import "./style.css";

const REST = "https://api-testnet.qore.host";
const EXPLORER = "https://explore.qore.network";
const CHAIN = "qorechain-diana";

type QoreXNative = {
  enable: (chainId: string) => Promise<void>;
  getKey: (chainId: string) => Promise<{ bech32Address: string; name?: string }>;
};

declare global {
  interface Window {
    qorex?: { native?: QoreXNative };
  }
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("missing #app");

app.innerHTML = `
  <div class="wrap">
    <header>
      <img src="./logo.png" alt="QoreStamp logo" />
      <div>
        <h1>QoreStamp</h1>
        <p>Post-quantum receipts on the QoreChain testnet. Hash a memo, stamp it, then verify both signatures on chain.</p>
      </div>
    </header>
    <div class="grid">
      <section class="card">
        <h2>1. Compose a receipt</h2>
        <p class="hint">The chain stores only the SHA-256 digest. Keep the exact memo — anyone with the text can re-hash it and check the stamp.</p>
        <label for="memo">Memo</label>
        <textarea id="memo" maxlength="500">Received 20 SGD from Alex for lunch, 24 Nov 2026, Maxwell Food Centre.</textarea>
        <div class="digest" id="digest">sha256: …</div>
        <div class="row">
          <button class="ghost" id="connect" type="button">Connect QoreX</button>
          <button class="ghost" id="copy-digest" type="button">Copy digest</button>
        </div>
        <p class="status" id="wallet">QoreX is optional here. The hybrid-signed transaction that opens the EVM window (and the later stamp call) is sent with the official Hardhat kit after you claim free test QOR.</p>
      </section>
      <section class="card">
        <h2>2. Verify a testnet transaction</h2>
        <p class="hint">Paste a <code>qorechain-diana</code> transaction hash. We look for a successful code, a <code>PQCHybridSignature</code>, and a <code>pqc_hybrid_verify</code> event with status <code>verified</code>.</p>
        <label for="hash">Transaction hash</label>
        <input id="hash" type="text" placeholder="64-character hex hash" spellcheck="false" />
        <div class="row">
          <button class="primary" id="verify" type="button">Verify on testnet</button>
        </div>
        <p class="status" id="verify-status">Nothing checked yet.</p>
        <div class="kv" id="result" hidden></div>
      </section>
    </div>
    <footer>
      Built for Build Before Q-Day, Quantum Pass track. Testnet only — test QOR has no value.
      Explorer: <a href="${EXPLORER}" target="_blank" rel="noreferrer">${EXPLORER}</a>
      (switch the network selector to Testnet).
    </footer>
  </div>
`;

const memoEl = document.querySelector<HTMLTextAreaElement>("#memo")!;
const digestEl = document.querySelector<HTMLDivElement>("#digest")!;
const walletEl = document.querySelector<HTMLParagraphElement>("#wallet")!;
const hashEl = document.querySelector<HTMLInputElement>("#hash")!;
const resultEl = document.querySelector<HTMLDivElement>("#result")!;
const verifyStatus = document.querySelector<HTMLParagraphElement>("#verify-status")!;

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function refreshDigest(): Promise<void> {
  const hex = await sha256Hex(memoEl.value);
  digestEl.textContent = `sha256: 0x${hex}`;
}

void refreshDigest();
memoEl.addEventListener("input", () => void refreshDigest());

document.querySelector("#copy-digest")!.addEventListener("click", async () => {
  const hex = await sha256Hex(memoEl.value);
  await navigator.clipboard.writeText(`0x${hex}`);
  walletEl.textContent = "Digest copied.";
  walletEl.className = "status ok";
});

document.querySelector("#connect")!.addEventListener("click", async () => {
  const native = window.qorex?.native;
  if (!native) {
    walletEl.textContent =
      "QoreX was not found in this browser. Install the QoreX extension or open this page in the QoreX app browser, switched to Testnet.";
    walletEl.className = "status bad";
    return;
  }
  try {
    await native.enable(CHAIN);
    const key = await native.getKey(CHAIN);
    walletEl.textContent = `Connected ${key.bech32Address}${key.name ? ` (${key.name})` : ""}. Still testnet only.`;
    walletEl.className = "status ok";
  } catch (err) {
    walletEl.textContent = err instanceof Error ? err.message : "QoreX request was rejected.";
    walletEl.className = "status bad";
  }
});

function findExtension(node: unknown, names: string[]): unknown {
  if (node == null) return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findExtension(item, names);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (typeof node !== "object") return undefined;
  const obj = node as Record<string, unknown>;
  const typeUrl = String(obj["@type"] ?? obj.typeUrl ?? obj.type_url ?? obj.type ?? "");
  if (names.some((n) => typeUrl.includes(n))) return obj;
  for (const value of Object.values(obj)) {
    const found = findExtension(value, names);
    if (found !== undefined) return found;
  }
  return undefined;
}

function b64Len(value: unknown): number | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const bin = atob(value);
    return bin.length;
  } catch {
    return value.startsWith("0x") ? (value.length - 2) / 2 : undefined;
  }
}

function sizeHybrid(ext: Record<string, unknown>): { mldsa?: number; secp?: number } {
  let mldsa: number | undefined;
  let secp: number | undefined;
  for (const [k, v] of Object.entries(ext)) {
    const n = b64Len(v);
    if (!n) continue;
    if (n > 1000) mldsa = n;
    if (n === 64) secp = n;
    void k;
  }
  return { mldsa, secp };
}

document.querySelector("#verify")!.addEventListener("click", async () => {
  const hash = hashEl.value.trim().replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(hash)) {
    verifyStatus.textContent = "Paste a 64-character hex transaction hash.";
    verifyStatus.className = "status bad";
    resultEl.hidden = true;
    return;
  }
  verifyStatus.textContent = "Reading the public testnet API…";
  verifyStatus.className = "status";
  resultEl.hidden = true;
  try {
    const res = await fetch(`${REST}/cosmos/tx/v1beta1/txs/${hash}`);
    if (!res.ok) throw new Error(`Testnet API returned HTTP ${res.status}. Check the hash and that it is on qorechain-diana.`);
    const body = (await res.json()) as {
      tx?: { body?: { memo?: string } };
      tx_response?: {
        code?: number;
        txhash?: string;
        events?: Array<{ type: string; attributes?: Array<{ key: string; value: string }> }>;
      };
    };
    const code = body.tx_response?.code ?? -1;
    const events = body.tx_response?.events ?? [];
    const verify = events.filter((e) => e.type === "pqc_hybrid_verify");
    const status = verify.flatMap((e) => e.attributes ?? []).find((a) => a.key === "status")?.value;
    const ext = findExtension(body, ["PQCHybridSignature", "pqc_hybrid", "PqcHybrid"]) as Record<string, unknown> | undefined;
    const sizes = ext ? sizeHybrid(ext) : {};
    const ok = code === 0 && Boolean(ext) && status === "verified";
    verifyStatus.innerHTML = ok
      ? `Verified on chain. <span class="badge ok">pqc_hybrid_verify = verified</span>`
      : `Not a verified hybrid transaction. <span class="badge no">${status ?? "no pqc_hybrid_verify"}</span>`;
    verifyStatus.className = ok ? "status ok" : "status bad";
    resultEl.hidden = false;
    resultEl.innerHTML = `
      <div><dt>tx</dt><dd>${body.tx_response?.txhash ?? hash}</dd></div>
      <div><dt>code</dt><dd>${code}${code === 0 ? " (success)" : ""}</dd></div>
      <div><dt>memo</dt><dd>${body.tx?.body?.memo || "—"}</dd></div>
      <div><dt>hybrid ext.</dt><dd>${ext ? "PQCHybridSignature present" : "not found"}</dd></div>
      <div><dt>ML-DSA-87</dt><dd>${sizes.mldsa ? `${sizes.mldsa} bytes` : "—"}</dd></div>
      <div><dt>secp256k1</dt><dd>${sizes.secp ? `${sizes.secp} bytes` : "—"}</dd></div>
      <div><dt>event</dt><dd>${status ? `pqc_hybrid_verify status=${status}` : "not found"}</dd></div>
      <div><dt>explorer</dt><dd><a href="${EXPLORER}" target="_blank" rel="noreferrer">explore.qore.network</a> — switch to Testnet, then search the hash</dd></div>
    `;
  } catch (err) {
    verifyStatus.textContent = err instanceof Error ? err.message : "Lookup failed.";
    verifyStatus.className = "status bad";
  }
});
