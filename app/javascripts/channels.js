// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import channels_artifacts from '../../build/contracts/Channels.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Channels = contract(channels_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.ChApp = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Channels.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.createChannel();
    });
  },

  createChannel: function() {
    var self = this;

    var channels;
    Channels.deployed().then(function(instance) {
      channels = instance;
      return channels.createChannel({}, {from: account, value: 10});
    }).then(function(result) {
      console.log(result);
      var evt = result.logs[0].event;
      var args = result.logs[0].args;
      return args.channel;
    }).then(function(channel) {
      console.log("channel:", channel);
      self.signValue(channel);
    })
  },

  signValue: function(channel) {
    var self = this;
    var channels;

    Channels.deployed().then(function(instance) {
      channels = instance;
      return channels.getHash(channel, account, 5);
    }).then(function(hash) {
      var signature;
      web3.eth.sign(account, hash, function(err, sig) {
        console.log(sig);
        sig = sig.substr(2, sig.length);

        var res = {};
        res.r = "0x" + sig.substr(0, 64);
        res.s = "0x" + sig.substr(64, 64);
        //res.v = web3.toDecimal(sig.substr(128, 2)) + 27;
        res.v = parseInt(sig.substr(128, 2))+27;
        console.log(res.r, res.s, res.v);

        var ver = channels.verify(channel, account, 5, res.v, res.r, res.s);
        ver.then(function(verifiy) {
          console.log(verifiy);
        })
      });
    })
  }


};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
  }

  ChApp.start();
});
