/* Round logic. Knows nothing about the DOM. Events: start, safe, lose, win. */
(function (G) {
  G.createRound = function (cfg, wallet, Mult, Bombs, CashOut) {
    var listeners = {};
    var cells = cfg.gridSize * cfg.gridSize;
    var s = { phase: "idle", stake: 0, bombs: 0, bombSet: new Set(), revealed: new Set(), mult: 1, payout: 0 };

    function on(e, f) { (listeners[e] = listeners[e] || []).push(f); }
    function emit(e, d) { (listeners[e] || []).forEach(function (f) { f(d); }); }

    function start(stake, bombCount) {
      if (s.phase === "playing") return false;
      if (!wallet.debit(stake)) return false;
      s.phase = "playing"; s.stake = stake; s.bombs = bombCount;
      s.bombSet = new Set(Bombs.generate(cells, bombCount, cfg.rng));
      s.revealed = new Set(); s.mult = 1; s.payout = stake;
      emit("start", s);
      return true;
    }
    function reveal(i) {
      if (s.phase !== "playing" || s.revealed.has(i)) return;
      if (s.bombSet.has(i)) { s.phase = "lost"; s.payout = 0; emit("lose", { index: i }); return; }
      s.revealed.add(i);
      s.mult = Mult.get(s.bombs, s.revealed.size);
      s.payout = CashOut.compute(s.stake, s.mult);
      emit("safe", { index: i });
      if (s.revealed.size === cells - s.bombs) cashOut(true);   // all safe seats found
    }
    function cashOut(auto) {
      if (s.phase !== "playing" || s.revealed.size === 0) return;
      s.phase = "won"; wallet.credit(s.payout);
      emit("win", { auto: !!auto });
    }
    return { state: s, cells: cells, on: on, start: start, reveal: reveal, cashOut: cashOut };
  };
})(window.PAX);
