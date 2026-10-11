/* Round generator: returns an array of bomb cell indexes. Independent of the user. */
(function (G) {
  G.BombGenerator = {
    generate: function (cells, bombCount, rng) {
      rng = rng || Math.random;
      var idx = [], i, j, t;
      for (i = 0; i < cells; i++) idx.push(i);
      for (i = cells - 1; i > 0; i--) {            // Fisher–Yates
        j = Math.floor(rng() * (i + 1));
        t = idx[i]; idx[i] = idx[j]; idx[j] = t;
      }
      return idx.slice(0, bombCount);
    }
  };
})(window.PAX);
