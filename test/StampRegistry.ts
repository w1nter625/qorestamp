import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { keccak256, stringToBytes, toHex } from "viem";

function sha256Bytes(text: string): `0x${string}` {
  const hash = createHash("sha256").update(text, "utf8").digest();
  return toHex(hash);
}

describe("StampRegistry", async () => {
  // Simulated Hardhat network only — no QoreChain endpoint is needed.
  const { viem } = await network.create();
  const [issuer, other] = await viem.getWalletClients();

  it("starts empty", async () => {
    const registry = await viem.deployContract("StampRegistry");
    assert.equal(await registry.read.total(), 0n);
  });

  it("records a digest, stamper and timestamp, and emits Stamped", async () => {
    const registry = await viem.deployContract("StampRegistry");
    const digest = sha256Bytes("Received 20 SGD from Alex for lunch, 2026-11-24.");
    const tx = registry.write.stamp([digest]);
    await viem.assertions.emit(tx, registry, "Stamped");
    assert.equal(await registry.read.total(), 1n);
    const stamp = (await registry.read.get([1n])) as {
      digest: `0x${string}`;
      stamper: `0x${string}`;
      stampedAt: bigint;
      exists: boolean;
    };
    assert.equal(stamp.digest, digest);
    assert.equal(stamp.stamper.toLowerCase(), issuer.account.address.toLowerCase());
    assert.equal(stamp.exists, true);
    assert.ok(stamp.stampedAt > 0n);
    assert.equal(await registry.read.firstIdOf([digest]), 1n);
  });

  it("rejects a zero digest", async () => {
    const registry = await viem.deployContract("StampRegistry");
    await assert.rejects(registry.write.stamp([`0x${"00".repeat(32)}`]));
    assert.equal(await registry.read.total(), 0n);
  });

  it("lets two parties stamp the same digest; firstIdOf keeps the first id", async () => {
    const registry = await viem.deployContract("StampRegistry");
    const digest = sha256Bytes("same memo");
    await registry.write.stamp([digest], { account: issuer.account });
    await registry.write.stamp([digest], { account: other.account });
    assert.equal(await registry.read.total(), 2n);
    assert.equal(await registry.read.firstIdOf([digest]), 1n);
    const second = (await registry.read.get([2n])) as { stamper: `0x${string}` };
    assert.equal(second.stamper.toLowerCase(), other.account.address.toLowerCase());
  });

  it("reverts on an unknown id", async () => {
    const registry = await viem.deployContract("StampRegistry");
    await assert.rejects(registry.read.get([1n]));
  });

  it("uses SHA-256, not keccak, so a keccak digest of the same text is a different stamp", async () => {
    const registry = await viem.deployContract("StampRegistry");
    const text = "pay 12.50 for kopi peng";
    const sha = sha256Bytes(text);
    const kec = keccak256(stringToBytes(text));
    assert.notEqual(sha, kec);
    await registry.write.stamp([sha]);
    assert.equal(await registry.read.firstIdOf([sha]), 1n);
    assert.equal(await registry.read.firstIdOf([kec]), 0n);
  });
});
