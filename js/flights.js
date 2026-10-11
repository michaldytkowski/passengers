/* Flight info shown above the passengers: flight number + origin -> destination. A new flight every round. */
(function (G) {
  var cities = [
    ["Warsaw", "WAW"], ["London", "LHR"], ["Paris", "CDG"], ["Amsterdam", "AMS"], ["Frankfurt", "FRA"], ["Madrid", "MAD"],
    ["Barcelona", "BCN"], ["Rome", "FCO"], ["Vienna", "VIE"], ["Prague", "PRG"], ["Copenhagen", "CPH"], ["Stockholm", "ARN"],
    ["New York", "JFK"], ["Los Angeles", "LAX"], ["Miami", "MIA"], ["Toronto", "YYZ"], ["Vancouver", "YVR"], ["Tokyo", "HND"],
    ["Seoul", "ICN"], ["Singapore", "SIN"], ["Bangkok", "BKK"], ["Sydney", "SYD"], ["Melbourne", "MEL"], ["S\u00e3o Paulo", "GRU"]
  ].map(function (c) { return { city: c[0], code: c[1] }; });
  var AIRLINE = "PX";

  G.Flights = {
    cities: cities,
    random: function (rng) {
      rng = rng || Math.random;
      var a = Math.floor(rng() * cities.length), b = Math.floor(rng() * (cities.length - 1));
      if (b >= a) b++;                                    // destination always differs from origin
      return { id: AIRLINE + " " + (100 + Math.floor(rng() * 900)), from: cities[a], to: cities[b] };
    }
  };
})(window.PAX);
