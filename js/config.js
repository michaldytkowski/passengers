/* Central configuration. Change math, grid, bombs, look and timings here. */
(function (G) {
  G.GAME_CONFIG = {
    title: "PASSENGERS",
    gridSize: 3,                    // 3 => 3x3 = 9 seats
    bombOptions: [3, 4, 5, 6],
    defaultBombs: 3,
    maxMultiplier: 10,
    startingBalance: 1000,          // virtual only
    stake: { min: 1, max: 1000, default: 100, step: 10 },

    // TEMPORARY multipliers: table[bombs][safeRevealed - 1].
    // Replace with the output of your simulation, or set multiplierProvider below.
    multipliers: {
      3: [1.15, 1.45, 1.9, 2.8, 5, 10], // 6 safe seats
      4: [1.25, 1.7, 2.5, 4.5, 10],   // 5 safe seats
      5: [1.4, 2.1, 3.8, 10],         // 4 safe seats
      6: [1.8, 3.8, 10]               // 3 safe seats
    },
    // Optional override: (bombs, safeRevealed, config) => number
    multiplierProvider: null,

    // Random source used by the bomb generator. Swap for a seeded RNG, a replay, etc.
    rng: function () { return Math.random(); },

    // Rarity tiers. `total` = chance (in %) that a seat roll lands in the tier; it is split equally between
    // the animals of that tier (see js/characters.js). Totals should add up to 100.
    rarity: {
      order: ["legendary", "epic", "rare", "uncommon", "common"],
      common:    { label: "Common",    total: 62.99, color: "#9db4d6" },
      uncommon:  { label: "Uncommon",  total: 28,    color: "#4fd38a" },
      rare:      { label: "Rare",      total: 8,     color: "#4aa3ff" },
      epic:      { label: "Epic",      total: 1,     color: "#b56bff" },
      legendary: { label: "Legendary", total: 0.01,  color: "#ffc83a" }
    },

    // Sound: files, default volumes (0-1) and a per-effect gain. Volumes are remembered in the browser.
    audio: {
      files: { music: "audio/jazz-waltz.mp3", click: "audio/click.mp3", boom: "audio/explosion.mp3", win: "audio/reward.mp3" },
      musicVolume: 0.22,
      effectsVolume: 0.7,
      gain: { click: 0.7, boom: 1, win: 1 }
    },

    animation: { multiplierTweenMs: 450, revealAllStaggerMs: 70, endRevealDelayMs: 450 }
  };
})(window.PAX = window.PAX || {});
