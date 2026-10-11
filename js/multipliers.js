/* Multiplier system: the only place that turns progress into a multiplier. */
(function (G) {
  var C = G.GAME_CONFIG;
  G.Multipliers = {
    get: function (bombs, safeRevealed) {
      if (safeRevealed <= 0) return 1;
      var m;
      if (typeof C.multiplierProvider === "function") {
        m = C.multiplierProvider(bombs, safeRevealed, C);
      } else {
        var t = C.multipliers[bombs] || [];
        m = t[Math.min(safeRevealed, t.length) - 1] || 1;
      }
      return Math.min(m, C.maxMultiplier);
    },
    // Multiplier for the next safe pick, or null when none is left.
    next: function (bombs, safeRevealed) {
      var safeTotal = C.gridSize * C.gridSize - bombs;
      return safeRevealed >= safeTotal ? null : this.get(bombs, safeRevealed + 1);
    }
  };
})(window.PAX);
