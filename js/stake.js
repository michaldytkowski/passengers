/* Stake system: value, limits, quick actions. */
(function (G) {
  G.createStake = function (cfg) {
    var value = cfg.default;
    function clamp(v) {
      v = Math.round(Number(v));
      if (!isFinite(v)) v = cfg.default;
      return Math.max(cfg.min, Math.min(cfg.max, v));
    }
    return {
      get: function () { return value; },
      set: function (v) { value = clamp(v); return value; },
      step: function (dir) { return this.set(value + dir * cfg.step); },
      half: function () { return this.set(value / 2); },
      double: function () { return this.set(value * 2); },
      max: function (balance) { return this.set(Math.min(cfg.max, balance)); }
    };
  };
})(window.PAX);
