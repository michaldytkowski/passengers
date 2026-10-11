/* UI layer: wires DOM to the round, wallet and stake modules. */
(function (G) {
  var C = G.GAME_CONFIG;
  var $ = function (s) { return document.querySelector(s); };
  var wallet = G.createWallet(C.startingBalance);
  var stake = G.createStake(C.stake);
  var round = G.createRound(C, wallet, G.Multipliers, G.BombGenerator, G.CashOut);
  var st = round.state;
  var bombChoice = C.defaultBombs, roundsPlayed = 0;
  var tiles = [], shownMult = 1, tw = 0, timers = [];

  var el = {
    grid: $("#grid"), mult: $("#mult"), next: $("#next"), payout: $("#payout"), balance: $("#balance"),
    cashout: $("#cashout"), bombs: $("#bombs"), stake: $("#stake"), play: $("#play"),
    banner: $("#banner"), board: $(".board"), cashtxt: $("#cashtxt"), hint: $("#hint"), reset: $("#reset")
  };
  var fmt = function (n) { return Number.isInteger(n) ? String(n) : n.toFixed(2); };

  /* ---------- build ---------- */
  el.grid.style.setProperty("--n", C.gridSize);
  for (var i = 0; i < round.cells; i++) (function (i) {
    var b = document.createElement("button");
    b.className = "tile"; b.setAttribute("aria-label", "Miejsce " + (i + 1));
    b.innerHTML = '<img class="calm" alt=""><img class="bomb" alt=""><img class="safe" alt=""><span class="tag"></span>';
    b.addEventListener("click", function () { onTile(i); });
    el.grid.appendChild(b); tiles.push(b);
  })(i);

  C.bombOptions.forEach(function (n) {
    var b = document.createElement("button");
    b.textContent = n; b.dataset.n = n;
    b.addEventListener("click", function () { if (st.phase !== "playing") { bombChoice = n; renderBombs(); } });
    el.bombs.appendChild(b);
  });
  function renderBombs() {
    [].forEach.call(el.bombs.children, function (b) { b.classList.toggle("on", +b.dataset.n === bombChoice); });
  }

  /* ---------- helpers ---------- */
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function tweenTo(target) {
    cancelAnimationFrame(tw);
    var from = shownMult, t0 = performance.now(), ms = C.animation.multiplierTweenMs;
    (function step(t) {
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      shownMult = from + (target - from) * e;
      el.mult.textContent = "×" + shownMult.toFixed(2);
      el.payout.textContent = fmt(Math.round(G.CashOut.compute(st.phase === "idle" ? stake.get() : st.stake, shownMult) * 100) / 100);
      if (k < 1) tw = requestAnimationFrame(step);
    })(t0);
  }
  function pulse(node) { node.classList.remove("pulse"); void node.offsetWidth; node.classList.add("pulse"); }

  function flip(i, kind, ghost) {
    tiles[i].classList.add(kind === "bomb" ? "bomb" : "safe");
    if (ghost) tiles[i].classList.add("ghost");
  }
  // Draw a new cast for the seats (weighted by rarity) and play the "deal" animation.
  function newFlight() {
    var f = G.Flights.random(C.rng), box = $("#flight");
    $("#flId").textContent = f.id;
    $("#flFrom").textContent = f.from.code; $("#flFromCity").textContent = f.from.city;
    $("#flTo").textContent = f.to.code; $("#flToCity").textContent = f.to.city;
    box.classList.remove("change"); void box.offsetWidth; box.classList.add("change");
  }
  var cast = [];
  function dealAnimals() {
    cast = G.Characters.draw(round.cells, C.rng);
    tiles.forEach(function (t, i) {
      var a = cast[i], imgs = t.querySelectorAll("img"), tag = t.querySelector(".tag");
      imgs[0].src = a.calm; imgs[1].src = a.bomb; imgs[2].src = a.safe;
      t.dataset.tier = a.tier;
      tag.textContent = a.tier === "common" ? "" : a.tierLabel.toUpperCase(); tag.style.setProperty("--c", a.color);
      t.setAttribute("aria-label", "Miejsce " + (i + 1));
      t.classList.remove("dealing"); void t.offsetWidth;
      t.style.animationDelay = (i * 40) + "ms"; t.classList.add("dealing");
    });
  }
  function preload() {
    G.Banners.files().forEach(function (s) { new Image().src = s; });
  }
  function revealRest() {
    var k = 0;
    tiles.forEach(function (t, i) {
      if (t.classList.contains("flipped")) return;
      later(function () { flip(i, st.bombSet.has(i) ? "bomb" : "safe", true); }, C.animation.endRevealDelayMs + k++ * C.animation.revealAllStaggerMs);
    });
  }
  function showBanner(html, cls) {
    el.banner.innerHTML = html; el.banner.className = "banner"; void el.banner.offsetWidth;
    el.banner.className = "banner show " + cls; el.board.classList.add("dim");
    later(function () { el.board.classList.remove("dim"); }, 2300);
  }

  function sync() {
    var playing = st.phase === "playing";
    var nxt = playing ? G.Multipliers.next(st.bombs, st.revealed.size) : null;
    el.next.textContent = nxt ? "next ×" + nxt.toFixed(2) : "";
    el.cashout.disabled = !(playing && st.revealed.size > 0);
    el.cashtxt.textContent = playing && st.revealed.size > 0 ? "CASH OUT " + fmt(st.payout) : "CASH OUT";
    el.play.disabled = playing; el.stake.disabled = playing; el.reset.disabled = playing;
    ["half", "double", "max", "minus", "plus"].forEach(function (id) { $("#" + id).disabled = playing; });
    [].forEach.call(el.bombs.children, function (b) { b.disabled = playing; });
    el.grid.classList.toggle("live", playing);
    el.stake.value = stake.get();
    el.play.textContent = st.phase === "idle" ? "START ROUND" : "NEW ROUND";
  }

  /* ---------- round events ---------- */
  round.on("start", function () {
    clearTimers();
    tiles.forEach(function (t) { t.className = "tile"; t.style.animationDelay = ""; });
    if (roundsPlayed++ > 0) { dealAnimals(); newFlight(); }   // seats change places every round
    el.grid.classList.remove("shake"); el.banner.className = "banner"; el.board.classList.remove("dim");
    el.hint.textContent = "WYBIERZ MIEJSCE LUB ZRÓB CASH OUT";
    shownMult = 1; tweenTo(1); sync();
  });
  round.on("safe", function (e) {
    G.Audio.play("click");
    G.Codex.rescue(cast[e.index]);   // rescued passenger goes to the collection
    flip(e.index, "safe"); tiles[e.index].classList.add("glow");
    tweenTo(st.mult); pulse(el.payout); pulse(el.mult); sync();
  });
  round.on("lose", function (e) {
    G.Audio.play("boom");
    flip(e.index, "bomb"); tiles[e.index].classList.add("boom");
    el.grid.classList.add("shake");
    revealRest();
    later(function () { showBanner(G.Banners.boom(fmt(st.stake)), "lose"); }, 350);
    el.hint.textContent = "BOMBA! STRATA " + fmt(st.stake);
    tweenTo(1); sync(); el.stake.value = stake.get();
  });
  round.on("win", function (e) {
    G.Audio.play("win");
    revealRest();
    showBanner(G.Banners.win(fmt(st.payout)), "win"); pulse(el.balance);
    el.hint.textContent = e.auto ? "WSZYSTKIE MIEJSCA ODKRYTE!" : "WYPŁATA " + fmt(st.payout);
    sync();
  });
  wallet.subscribe(function (b) { el.balance.textContent = fmt(b); });

  /* ---------- user actions ---------- */
  function begin() {
    if (st.phase === "playing") return false;
    if (!wallet.canAfford(stake.get())) {
      el.hint.textContent = "ZA MAŁO ŚRODKÓW — ZMIEŃ STAWKĘ LUB ZRESETUJ SALDO";
      el.stake.classList.remove("bad"); void el.stake.offsetWidth; el.stake.classList.add("bad");
      return false;
    }
    return round.start(stake.get(), bombChoice);
  }
  function onTile(i) {
    if (st.phase !== "playing" && !begin()) return;   // touching a seat also starts a round
    round.reveal(i);
  }
  el.play.addEventListener("click", begin);
  el.cashout.addEventListener("click", function () { round.cashOut(); });
  el.stake.addEventListener("change", function () { stake.set(el.stake.value); sync(); if (st.phase !== "playing") tweenTo(1); });
  $("#minus").addEventListener("click", function () { stake.step(-1); sync(); tweenTo(1); });
  $("#plus").addEventListener("click", function () { stake.step(1); sync(); tweenTo(1); });
  $("#half").addEventListener("click", function () { stake.half(); sync(); tweenTo(1); });
  $("#double").addEventListener("click", function () { stake.double(); sync(); tweenTo(1); });
  $("#max").addEventListener("click", function () { stake.max(wallet.get()); sync(); tweenTo(1); });
  el.reset.addEventListener("click", function () { wallet.reset(); el.hint.textContent = "SALDO ZRESETOWANE"; });

  preload(); dealAnimals(); newFlight();
  renderBombs(); sync(); tweenTo(1);
  /* ---------- fit to the screen ----------
     The panel keeps a fixed "design size" and is scaled to fit the window. Short landscape screens switch to a
     two-column layout; if even that would be too small, the page scrolls instead of shrinking the controls. */
  var sky = document.querySelector(".sky"), panel = $("#panel"), fuselage = $("#fuselage");
  function fit() {
    if (document.activeElement && document.activeElement.id === "stake") return;   // on-screen keyboard open
    var vv = window.visualViewport, vw = Math.round(vv ? vv.width : innerWidth), vh = Math.round(vv ? vv.height : innerHeight);
    function dims(wide) { panel.classList.toggle("wide", wide); return { w: panel.offsetWidth, h: panel.offsetHeight }; }
    function scale(d, h) { return Math.min(h / d.h, (vw - 8) / (d.w + 8), 2); }
    var d = dims(false), top = 0, s = scale(d, vh);
    if (vh < 520 && vw > vh * 1.3) {                                     // short landscape: try the two-column layout
      var w = dims(true), sw = scale(w, vh);
      if (sw > s * 1.15) { d = w; s = sw; } else dims(false);
    }
    if ((vw - d.w * s) / 2 < 112) { top = 52; s = scale(d, vh - top); }   // keep the corner buttons clear of the panel
    // Phones/tablets: never shrink the controls below a comfortable size, scroll instead. Mouse screens always fit.
    var coarse = window.matchMedia && matchMedia("(pointer:coarse)").matches;
    if (coarse && s < (d.w > 600 ? 0.55 : 0.7)) s = Math.min(d.w > 600 ? 0.62 : 0.8, (vw - 8) / (d.w + 8));
    var ph = d.h * s, scroll = ph + top > vh + 1;
    sky.style.setProperty("--s", s.toFixed(3));
    sky.style.setProperty("--fw", (d.w * s).toFixed(1) + "px");
    sky.style.overflowY = scroll ? "auto" : "hidden";
    fuselage.style.height = scroll ? Math.ceil(ph + top + 16) + "px" : "100%";
    panel.style.marginTop = scroll ? top + "px" : Math.max(top, top + (vh - top - ph) / 2) + "px";
    sky.classList.toggle("no-wings", scroll || (vw - d.w * s) / 2 < 120);
  }
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  $("#stake").addEventListener("blur", fit);
  document.querySelector(".logo").addEventListener("load", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();

  G.debug = { config: C, round: round, wallet: wallet };   // handy in the console
})(window.PAX);
