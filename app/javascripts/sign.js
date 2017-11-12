// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import checksign_artifacts from '../../build/contracts/CheckSign.json'

// CheckSign is our usable abstraction, which we'll use through the code below.
var CheckSign = contract(checksign_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var check;

function signString(coinbase, text, cb) {
  /*
  * Sign a string and return (hash, v, r, s) used by ecrecover to regenerate the coinbase address;
  */
  let sha = web3.sha3(text); // is already 'Ox.....', no need to add 'Ox' upfront
  web3.eth.sign(coinbase, sha, function(err, sig) {
    sig = sig.substr(2, sig.length);
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = parseInt(sig.substr(128, 2),16); // no need to add 27 here
    var res = {}
    res.r =r;
    res.s = s;
    res.v = v;
    cb(sha, res);
  });
}

function typedSign(coinbase, value, cb) {
  const data = [{ 'type': 'uint', 'name': 'message', 'value': value }];
  web3.currentProvider.sendAsync({method: 'eth_signTypedData', params: [data, coinbase], jsonrpc: '2.0', id: 1}, function(err,res) {
    var sig = res.result;
    sig = sig.substr(2, sig.length);
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = parseInt(sig.substr(128, 2),16); // no need to add 27 here
    var res = {}
    res.r =r;
    res.s = s;
    res.v = v;
    cb(data, res);
  });
}

function typedSignDb(coinbase, value, msg, cb) {
  const data = [{ 'type': 'string', 'name': 'Message', 'value': msg }, { 'type': 'uint', 'name': 'Amount', 'value': value }];
  web3.currentProvider.sendAsync({method: 'eth_signTypedData', params: [data, coinbase], jsonrpc: '2.0', id: 1}, function(err,res) {
    var sig = res.result;
    sig = sig.substr(2, sig.length);
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = parseInt(sig.substr(128, 2),16); // no need to add 27 here
    var res = {}
    res.r =r;
    res.s = s;
    res.v = v;
    cb(data, res);
  });
}

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the CheckSign abstraction for Use.
    CheckSign.setProvider(web3.currentProvider);

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

      self.runSign('Edouard FISCHER : send 123€');
      self.runTypedSign(123);
      self.runTypedSignDb(1200, 'By signing, I commit to send this amount (€) :');

    });
  },

  runTypedSign: function(value) {
    var self = this;
    console.log('---runTypedSign---');
    typedSign(account, value, function(typedData, sig) {
      self.checkTypedSign(typedData, sig, function(result) {
        console.log("Check typed sign:", result);
      })
    })
  },

  runTypedSignDb: function(value, msg) {
    var self = this;
    console.log('---runTypedSignDb---');
    typedSignDb(account, value, msg, function(typedData, sig) {
      self.checkTypedSignDb(typedData, sig, function(result) {
        console.log("Check typed sign DB:", result);
      })
    })
  },

  // sign hashed value with local metamask plugin
  runSign: function(msg) {
    var self = this;
    console.log("---runSign---");

    console.log("Account:", account);

    signString(account, msg, function(sha, sig) {
      self.checkSign(sha, sig, function(result) {
        //console.log('output addr=',result);
        console.log('Is signed with account:', result);
      })
    })
  },

  checkTypedSign: function(typedData, signature, cb) {
    console.log("---checkTypedSign---");
    // console.log("TypedData:", typedData);
    var r = signature.r;
    var s = signature.s;
    var v = signature.v;
    // console.log("Signature:")
    // console.log('r: ', r);
    // console.log('s: ', s);
    // console.log('v: ', v);

    CheckSign.deployed().then(function(instance) {
      var val = typedData[0].value;
      return instance.recoverTypedSignAddr.call(val, v, r, s);
    }).then(function(data) {
      console.log("RecoverTypedSign address:", data);
    }).catch(function(err) {
      console.log('Got error:', err)
    })

    },

    checkTypedSignDb: function(typedData, signature, cb) {
      console.log("---checkTypedSignDB---");
      // console.log("TypedData:", typedData);
      var r = signature.r;
      var s = signature.s;
      var v = signature.v;
      // console.log("Signature:")
      // console.log('r: ', r);
      // console.log('s: ', s);
      // console.log('v: ', v);

      CheckSign.deployed().then(function(instance) {
        var val = typedData[1].value;
        var msg = typedData[0].value;

        return instance.recoverTypedSignAddrDb.call(val, msg, v, r, s);
      }).then(function(data) {
        console.log("RecoverTypedSign address:", data);
      }).catch(function(err) {
        console.log('Got error:', err)
      })

      },


    checkSign: function(sha, signature, cb) {
      console.log("---checkSign---");
      var r = signature.r;
      var s = signature.s;
      var v = signature.v;
      // console.log('r: ', r);
      // console.log('s: ', s);
      // console.log('v: ', v);

      CheckSign
      .deployed()
      .then(function(instance) {
        //return instance.recoverAddr.call(
        return instance.isSigned.call(account,
          sha, v, r, s )
        })
        .then(function(data) {
          cb(data)
        })
        .catch(function(err) {
          console.log('got error:', e)
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

      App.start();
    });
