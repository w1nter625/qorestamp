// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title StampRegistry
/// @notice A public bulletin of SHA-256 receipt digests on the QoreChain EVM.
///         The full memo stays with the issuer; anyone who still has the text
///         can re-hash it and check it against a stamp id. Deploying and
///         calling this contract on QoreChain requires a live EVM
///         authorisation window, which itself is a hybrid-signed (secp256k1 +
///         ML-DSA-87) native transaction.
contract StampRegistry {
    struct Stamp {
        bytes32 digest;
        address stamper;
        uint64 stampedAt;
        bool exists;
    }

    /// @notice Number of stamps recorded so far.
    uint256 public total;

    mapping(uint256 => Stamp) private stamps;

    /// @notice First stamp id that used this digest, or zero if none.
    mapping(bytes32 => uint256) public firstIdOf;

    event Stamped(
        uint256 indexed id,
        bytes32 indexed digest,
        address indexed stamper,
        uint64 stampedAt
    );

    /// @notice Record a 32-byte SHA-256 digest of a memo.
    /// @param digest SHA-256 of the exact memo text (UTF-8). Must not be zero.
    /// @return id 1-based stamp identifier.
    function stamp(bytes32 digest) external returns (uint256 id) {
        require(digest != bytes32(0), "empty digest");
        id = ++total;
        uint64 when = uint64(block.timestamp);
        stamps[id] = Stamp({
            digest: digest,
            stamper: msg.sender,
            stampedAt: when,
            exists: true
        });
        if (firstIdOf[digest] == 0) {
            firstIdOf[digest] = id;
        }
        emit Stamped(id, digest, msg.sender, when);
    }

    /// @notice Read one stamp by id.
    function get(uint256 id) external view returns (Stamp memory) {
        require(stamps[id].exists, "unknown stamp");
        return stamps[id];
    }
}
