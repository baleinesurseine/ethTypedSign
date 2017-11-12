pragma solidity ^0.4.11;

contract CheckSign {
  function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(msgHash, v, r, s);
  }

  function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
    return ecrecover(msgHash, v, r, s) == _addr;
  }

  function recoverTypedSignAddr(uint value, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(test(value), v, r, s);
  }

  function isTypedSigned(address _addr, uint value, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
    return ecrecover(hashTyped(value), v, r, s) == _addr;
  }

  function hashTyped(uint value) internal pure returns (bytes32) {
    var h1 = keccak256("uint message");
    var h2 = keccak256(value);
    return keccak256(h1, h2);
  }

}
