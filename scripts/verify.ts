/**
 * Read a testnet transaction and print the hybrid-signature proof
 * (PQCHybridSignature + pqc_hybrid_verify).
 *
 *   pnpm verify <txhash>
 */
const REST = "https://api-testnet.qore.host";
const EXPLORER = "https://explore.qore.network";

type TxResponse = {
  tx?: {
    body?: { memo?: string; messages?: unknown[] };
    auth_info?: { signer_infos?: unknown[] };
    signatures?: string[];
  };
  tx_response?: {
    code?: number;
    txhash?: string;
    raw_log?: string;
    events?: Array<{ type: string; attributes?: Array<{ key: string; value: string }> }>;
  };
};

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
  const typeUrl = String(obj["@type"] ?? obj.typeUrl ?? obj.type_url ?? "");
  if (names.some((n) => typeUrl.includes(n) || String(obj.type ?? "").includes(n))) return obj;
  for (const value of Object.values(obj)) {
    const found = findExtension(value, names);
    if (found !== undefined) return found;
  }
  return undefined;
}

function byteLengthOf(value: unknown): number | undefined {
  if (typeof value === "string") {
    // Cosmos proto JSON typically uses base64 for bytes.
    try {
      return Buffer.from(value, "base64").length;
    } catch {
      return value.startsWith("0x") ? (value.length - 2) / 2 : undefined;
    }
  }
  if (value && typeof value === "object" && "length" in (value as object)) {
    const n = Number((value as { length: number }).length);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

async function main(): Promise<void> {
  const hash = (process.argv[2] ?? "").trim().replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(hash)) {
    console.error("Usage: pnpm verify <64-hex testnet tx hash>");
    process.exitCode = 1;
    return;
  }
  const url = `${REST}/cosmos/tx/v1beta1/txs/${hash}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`REST ${res.status} for ${url}`);
  }
  const body = (await res.json()) as TxResponse;
  const code = body.tx_response?.code ?? -1;
  const events = body.tx_response?.events ?? [];
  const verifyEvents = events.filter((e) => e.type === "pqc_hybrid_verify");
  const status = verifyEvents
    .flatMap((e) => e.attributes ?? [])
    .find((a) => a.key === "status" || a.key === "result")?.value;

  const ext = findExtension(body, ["PQCHybridSignature", "pqc_hybrid", "PqcHybrid"]);
  let mldsaBytes: number | undefined;
  let secpBytes: number | undefined;
  if (ext && typeof ext === "object") {
    const rec = ext as Record<string, unknown>;
    mldsaBytes = byteLengthOf(rec.mlDsaSignature ?? rec.mldsa_signature ?? rec.pqcSignature ?? rec.pqc_signature ?? rec.ml_dsa_signature);
    secpBytes = byteLengthOf(rec.secp256k1Signature ?? rec.secp256k1_signature ?? rec.classicalSignature);
    if (mldsaBytes === undefined) {
      // Fall back: any suspiciously large bytes field is likely ML-DSA-87 (4627).
      for (const [k, v] of Object.entries(rec)) {
        const n = byteLengthOf(v);
        if (n && n > 1000) mldsaBytes = n, console.log(`(sized field ${k})`);
        if (n === 64) secpBytes = n;
      }
    }
  }

  const memo = body.tx?.body?.memo ?? "";
  console.log(`tx:       ${body.tx_response?.txhash ?? hash}`);
  console.log(`code:     ${code}${code === 0 ? " (success)" : ""}`);
  console.log(`memo:     ${memo || "(none)"}`);
  console.log(`explorer: ${EXPLORER}  (switch to Testnet, then search the hash)`);
  console.log(`hybrid:   ${ext ? "PQCHybridSignature present" : "PQCHybridSignature not found"}`);
  if (mldsaBytes !== undefined) console.log(`ML-DSA:   ${mldsaBytes} bytes`);
  if (secpBytes !== undefined) console.log(`secp256k1:${secpBytes} bytes`);
  console.log(`event:    ${verifyEvents.length ? `pqc_hybrid_verify status=${status ?? "?"}` : "pqc_hybrid_verify not found"}`);
  if (code !== 0 || !ext || status !== "verified") {
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
