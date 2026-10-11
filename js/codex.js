/* Collection: saves rescued passengers in the browser and shows them in the book (top-right). */
(function (G) {
  var C = G.GAME_CONFIG, R = C.rarity, KEY = "pax.collection.v1";
  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  function found() { return G.Characters.list.filter(function (a) { return data[a.key]; }).length; }

  var $ = function (id) { return document.getElementById(id); };
  var el = { btn: $("bookBtn"), badge: $("bookBadge"), box: $("codex"), grid: $("codexGrid"), count: $("codexCount"),
    bar: $("codexBar"), close: $("codexClose"), toast: $("collectToast") };
  var unseen = 0, toastTimer = 0;

  function render() {
    var total = G.Characters.list.length, n = found();
    el.count.textContent = n + " / " + total;
    el.bar.style.width = (n / total * 100) + "%";
    var sorted = G.Characters.list.slice().sort(function (a, b) { return R.order.indexOf(a.tier) - R.order.indexOf(b.tier); });
    el.grid.innerHTML = sorted.map(function (a) {
      var got = data[a.key];
      return '<div class="card t-' + a.tier + (got ? " found" : " locked") + '" style="--c:' + a.color + '">' +
        '<div class="pic"><img src="' + a.calm + '" alt="' + (got ? a.name : "?") + '" loading="lazy">' + (got ? "" : '<i class="q">?</i>') + '</div>' +
        '<b class="nm">' + (got ? a.name : "???") + '</b>' +
        '<span class="rt">' + a.tierLabel.toUpperCase() + " · " + G.Characters.chanceText(a) + '</span>' +
        (got ? '<em class="cnt">×' + got + '</em>' : "") + '</div>';
    }).join("");
  }
  function setBadge() { el.badge.textContent = unseen; el.badge.hidden = unseen === 0; }
  function open() { unseen = 0; setBadge(); render(); el.box.hidden = false; el.close.focus(); }
  function closeBook() { el.box.hidden = true; el.btn.focus(); }

  function toast(a) {
    el.toast.style.setProperty("--c", a.color);
    el.toast.className = "collect-toast t-" + a.tier;
    el.toast.innerHTML = '<img src="' + a.calm + '" alt=""><div><small>NEW PASSENGER!</small><b>' + a.name + '</b><span>' + a.tierLabel.toUpperCase() + " · " + G.Characters.chanceText(a) + '</span></div>';
    void el.toast.offsetWidth; el.toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 3300);
  }

  el.btn.addEventListener("click", open);
  el.close.addEventListener("click", closeBook);
  el.box.addEventListener("pointerdown", function (e) { if (e.target === el.box) closeBook(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !el.box.hidden) closeBook(); });
  setBadge();

  G.Codex = {
    // A passenger was rescued (safe seat revealed): add it to the collection.
    rescue: function (a) {
      var isNew = !data[a.key];
      data[a.key] = (data[a.key] || 0) + 1; save();
      if (isNew) { unseen++; setBadge(); toast(a); }
      return isNew;
    },
    reset: function () { data = {}; save(); unseen = 0; setBadge(); render(); },
    get: function () { return data; }
  };
})(window.PAX);
