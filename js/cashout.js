/* Cash out system: payout = stake × multiplier. */
(function (G) {
  G.CashOut = {
    compute: function (stake, multiplier) {
      return Math.round(stake * multiplier * 100) / 100;
    }
  };
})(window.PAX);
