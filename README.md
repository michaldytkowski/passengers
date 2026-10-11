# PASSENGERS — demo prototype

Run: open `index.html` in a browser (no build, no server needed).
Optional: `python3 -m http.server 8000` and open http://localhost:8000

Where to change things (all in `js/`):
- config.js        — GAME_CONFIG: grid size, bomb options, max multiplier, stake limits, RNG, timings
- multipliers.js   — multiplier lookup (temporary table in config, or set `multiplierProvider`)
- bombGenerator.js — how a round is generated
- round.js         — round state machine (no DOM)
- cashout.js       — payout formula
- wallet.js, stake.js — virtual balance and stake
- characters.js    — look of passengers and bombs
- ui.js + css/style.css — interface and animations
Console helper: `PAX.debug` (config, round, wallet).
