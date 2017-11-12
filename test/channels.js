var Channels = artifacts.require("./Channels.sol");


contract('Channels', function(accounts) {

  it("should create channel correctly", function() {
    var channels;

    var account_one = accounts[0];
    var account_two = accounts[1];

    return Channels.deployed().then(function(instance) {
      channels = instance;
      return channels.createChannel({}, { from: account_one, value: 10 });
    }).then(function(result) {
      var evt = result.logs[0].event;
      var args = result.logs[0].args;
      assert.equal(evt, "LogNewChannel", "event logged is not LogNewChannel");
      assert.equal(args.owner, account_one, "channel not owned by account_one");
      return args.channel;
    }).then(function(channel) {
      return channels.getChannelValue(channel);
    }).then(function(value) {
      assert.equal(value, 10, "channel value is not 10");
    });
  });

});
