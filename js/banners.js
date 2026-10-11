/* Result banners (BOOM / WIN) built from the supplied graphics + digit sprites.
   Digits: img/fx/boom_digits/0-9,minus.webp and img/fx/win_digits/0-9,minus.webp. */
(function (G) {
  var base = "img/fx/";
  function num(str, set, dh) {
    return '<div class="num" style="--dh:' + dh + 'px">' + String(str).split("").map(function (ch) {
      if (ch === "-") return '<img src="' + base + set + '/minus.webp" alt="-">';
      if (ch === ".") return '<i class="dot"></i>';
      if (/\d/.test(ch)) return '<img src="' + base + set + '/' + ch + '.webp" alt="' + ch + '">';
      return "";
    }).join("") + "</div>";
  }
  G.Banners = {
    boom: function (amount) {
      var s = "-" + amount, h = s.length <= 5 ? 58 : s.length <= 7 ? 46 : 36;
      return '<img class="gfx" src="' + base + 'boom.webp" alt="BOOM">' + num(s, "boom_digits", h);
    },
    win: function (amount) {
      var s = String(amount), n = s.length, h = n <= 3 ? 84 : n === 4 ? 72 : n === 5 ? 60 : 48;
      return '<img class="gfx" src="' + base + 'win.webp" alt="WIN">' + num(s, "win_digits", h);
    },
    files: function () {
      var f = [base + "boom.webp", base + "win.webp"];
      ["boom_digits", "win_digits"].forEach(function (d) {
        for (var i = 0; i < 10; i++) f.push(base + d + "/" + i + ".webp");
        f.push(base + d + "/minus.webp");
      });
      return f;
    }
  };
})(window.PAX);
