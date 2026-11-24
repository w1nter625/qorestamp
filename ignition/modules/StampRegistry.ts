import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys StampRegistry. On QoreChain the deployer needs a registered
 * ML-DSA-87 key and a live EVM authorisation window first
 * (`pnpm window register` then `pnpm window open`).
 */
export default buildModule("StampRegistryModule", (m) => {
  const registry = m.contract("StampRegistry");
  return { registry };
});
