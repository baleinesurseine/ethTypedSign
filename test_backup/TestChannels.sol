pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Channels.sol";

contract TestChannels {
    function testInitialBalanceUsingDeployedContract() public {
    Channels channel = Channels(DeployedAddresses.Channels());

    uint expected =0;

    Assert.equal(channel.balance, expected, "Owner should have 0 initially");
  }

}