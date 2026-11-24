/**
 * Print the SHA-256 digest of a memo, the same way the web UI and the
 * StampRegistry contract expect it.
 *
 *   pnpm digest "Received 20 SGD from Alex for lunch, 2026-11-24."
 */
import { createHash } from "node:crypto";

const text = process.argv.slice(2).join(" ");
if (!text) {
  console.error('Usage: pnpm digest "your memo"');
  process.exitCode = 1;
} else {
  const digest = createHash("sha256").update(text, "utf8").digest("hex");
  console.log(`memo:   ${text}`);
  console.log(`sha256: 0x${digest}`);
}
