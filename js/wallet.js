/* Virtual balance only. No real money. */
(function (G) {
  G.createWallet = function (initial) {
    var balance = initial, subs = [];
    function notify() { subs.forEach(function (f) { f(balance); }); }
    return {
      get: function () { return balance; },
      canAfford: function (n) { return n <= balance; },
      debit: function (n) { if (n > balance) return false; balance = round2(balance - n); notify(); return true; },
      credit: function (n) { balance = round2(balance + n); notify(); },
      reset: function () { balance = initial; notify(); },
      subscribe: function (f) { subs.push(f); f(balance); }
    };
    function round2(x) { return Math.round(x * 100) / 100; }
  };
})(window.PAX);
