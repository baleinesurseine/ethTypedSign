var Channels = artifacts.require("./Channels.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Channels);
  deployer.deploy(Channels);
};
