/* Sound: looping background music + effects (click, boom, win) with two volume sliders. */
(function (G) {
  var A = G.GAME_CONFIG.audio, KEY = "pax.audio.v1";
  var vol = { music: A.musicVolume, effects: A.effectsVolume };
  function clamp(v) { v = Number(v); return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0; }
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) { vol.music = clamp(saved.music); vol.effects = clamp(saved.effects); }
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(vol)); } catch (e) {} }

  var music = new Audio(A.files.music); music.loop = true; music.preload = "auto"; music.volume = vol.music;
  var fx = {};
  Object.keys(A.gain).forEach(function (n) { fx[n] = new Audio(A.files[n]); fx[n].preload = "auto"; });
  var started = false;

  function startMusic() {
    if (started) return; started = true;
    var p = music.play(); if (p && p.catch) p.catch(function () { started = false; });  // retried on the next click
  }
  function play(name) {
    var base = fx[name]; if (!base || vol.effects <= 0) return;
    var a = base.cloneNode(); a.volume = clamp(vol.effects * (A.gain[name] || 1));
    var p = a.play(); if (p && p.catch) p.catch(function () {});
  }
  function setMusic(v) { vol.music = clamp(v); music.volume = vol.music; save(); }
  function setEffects(v) { vol.effects = clamp(v); save(); }

  G.Audio = { play: play, start: startMusic, setMusic: setMusic, setEffects: setEffects, get: function () { return { music: vol.music, effects: vol.effects }; } };

  /* browsers block sound until the first gesture: start the music on it */
  ["pointerdown", "keydown"].forEach(function (ev) { document.addEventListener(ev, startMusic); });
  document.addEventListener("visibilitychange", function () {
    if (!started) return;
    if (document.hidden) music.pause(); else music.play().catch(function () {});
  });
  /* click sound for every enabled button (seats play their own sound from the round events) */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (b && !b.disabled && !b.classList.contains("tile")) play("click");
  }, true);   // capture phase: runs before the button's own handler can disable it

  /* ---------- volume menu (top-right) ---------- */
  var box = document.getElementById("audio"), btn = document.getElementById("audioBtn"), pop = document.getElementById("audioPop");
  var sm = document.getElementById("volMusic"), se = document.getElementById("volEffects");
  var pm = document.getElementById("pctMusic"), pe = document.getElementById("pctEffects");
  function show() {
    sm.value = Math.round(vol.music * 100); se.value = Math.round(vol.effects * 100);
    pm.textContent = sm.value + "%"; pe.textContent = se.value + "%";
    btn.classList.toggle("muted", vol.music === 0 && vol.effects === 0);
  }
  function toggle(open) {
    var o = open === undefined ? pop.hidden : open;
    pop.hidden = !o; btn.setAttribute("aria-expanded", String(o));
  }
  btn.addEventListener("click", function () { toggle(); });
  document.addEventListener("pointerdown", function (e) { if (!box.contains(e.target)) toggle(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
  sm.addEventListener("input", function () { setMusic(sm.value / 100); show(); });
  se.addEventListener("input", function () { setEffects(se.value / 100); show(); });
  se.addEventListener("change", function () { play("click"); });   // preview of the effects level
  show();
})(window.PAX);
