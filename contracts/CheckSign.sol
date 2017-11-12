pragma solidity ^0.4.11;


contract CheckSign {
  function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(msgHash, v, r, s);
  }

  function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
    return ecrecover(msgHash, v, r, s) == _addr;
  }

  function recoverTypedSignAddr(uint value, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(hashTyped(value), v, r, s);
  }

  function isTypedSigned(address _addr, uint value, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
    return ecrecover(hashTyped(value), v, r, s) == _addr;
  }

  function recoverTypedSignAddrDb(uint value, string mess, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(hashTypedDb(value, mess), v, r, s);
  }

  function hashTyped(uint value) internal pure returns (bytes32) {
    var h1 = keccak256("uint message");
    var h2 = keccak256(value);
    return keccak256(h1, h2);
  }

  function hashTypedDb(uint value, string mess) internal pure returns (bytes32) {
    var h1 = keccak256("string Message", "uint Amount");
    var h2 = keccak256(mess, value);
    return keccak256(h1, h2);
  }
}
