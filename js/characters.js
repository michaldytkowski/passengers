/* Passenger roster: [file key, display name, rarity tier]. Images: img/animals/<key>_calm|bomb|safe.jpg
   calm = covered seat, bomb = panic with a bomb under the seat, safe = relief.
   The chance of every animal comes from its tier in GAME_CONFIG.rarity (tier total / animals in the tier). */
(function (G) {
  var R = G.GAME_CONFIG.rarity;
  var roster = [
    ["eagle", "Eagle", "legendary"],
    ["peacock", "Peacock", "epic"], ["whale", "Whale", "epic"], ["komodo", "Komodo", "epic"],
    ["lion", "Lion", "rare"], ["tiger", "Tiger", "rare"], ["flamingo", "Flamingo", "rare"], ["shark", "Shark", "rare"], ["snake", "Snake", "rare"],
    ["cheetah", "Cheetah", "uncommon"], ["giraffe", "Giraffe", "uncommon"], ["panda", "Panda", "uncommon"], ["rhino", "Rhino", "uncommon"],
    ["crocodile", "Crocodile", "uncommon"], ["sloth", "Sloth", "uncommon"], ["orangutan", "Orangutan", "uncommon"], ["parrot", "Parrot", "uncommon"],
    ["monkey", "Monkey", "common"], ["bear", "Bear", "common"], ["hippo", "Hippo", "common"], ["husky", "Husky", "common"], ["deer", "Deer", "common"],
    ["penguin", "Penguin", "common"], ["zebra", "Zebra", "common"], ["camel", "Camel", "common"], ["kangaroo", "Kangaroo", "common"],
    ["elephant", "Elephant", "common"], ["gorilla", "Gorilla", "common"]
  ];
  var perTier = {};
  roster.forEach(function (r) { perTier[r[2]] = (perTier[r[2]] || 0) + 1; });
  var list = roster.map(function (r) {
    var t = R[r[2]];
    return { key: r[0], name: r[1], tier: r[2], tierLabel: t.label, color: t.color, chance: t.total / perTier[r[2]],
      calm: "img/animals/" + r[0] + "_calm.jpg", bomb: "img/animals/" + r[0] + "_bomb.jpg", safe: "img/animals/" + r[0] + "_safe.jpg" };
  });

  G.Characters = {
    list: list,
    chanceText: function (a) { return String(parseFloat(a.chance.toFixed(2))) + "%"; },
    // Draw n different animals for a round.
    // Legendary animals: every seat has `chance`% to be one of them, so the round includes it with 1-(1-p)^n.
    // The rest are drawn by weight (rarity) without repeats, then the seats are shuffled.
    draw: function (n, rng) {
      rng = rng || Math.random;
      var out = [], pool = [], i, j, t;
      list.forEach(function (a) {
        if (a.tier === "legendary") { if (out.length < n && rng() < 1 - Math.pow(1 - a.chance / 100, n)) out.push(a); }
        else pool.push(a);
      });
      while (out.length < n && pool.length) {
        var sum = 0;
        for (i = 0; i < pool.length; i++) sum += pool[i].chance;
        var x = rng() * sum;
        for (i = 0; i < pool.length - 1; i++) { x -= pool[i].chance; if (x < 0) break; }
        out.push(pool.splice(i, 1)[0]);
      }
      for (i = out.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); t = out[i]; out[i] = out[j]; out[j] = t; }
      return out;
    }
  };
})(window.PAX);
