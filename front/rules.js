/* Game rules, paytable and UI guide — the content behind the (i) button.
 *
 * Every number here mirrors math-sdk/games/smukiez_tag_run/game_config.py; the reviewer
 * checks wins against this page, so it must never drift from the paytable the books were
 * generated with. Pays are multiples of the TOTAL bet, per cluster, stepped by cluster size.
 *
 * Social mode (Stake.us) forbids a list of gambling terms. Copy is written once in the
 * normal vocabulary and passed through T() which swaps the restricted words when the game
 * is loaded with social=true — see the jurisdiction-requirements guideline.
 */
const RULES = (() => {
  // Cluster size tiers: a cluster of 5, 6, 7-8, 9-11, 12-15 or 16+ matching symbols. One
  // entry per tier, in that order — verbatim from game_config.py.
  const TIERS = ["5", "6", "7-8", "9-11", "12-15", "16+"];
  const PAYS = {   // symbol: [t5, t6, t7_8, t9_11, t12_15, t16plus]
    H1: [4, 8, 16, 40, 100, 400],
    H2: [3.2, 6, 12, 30, 80, 300],
    H3: [2.4, 4.8, 10, 24, 60, 200],
    H4: [2, 4, 8, 20, 48, 160],
    H5: [1.6, 3.2, 6.4, 16, 40, 120],
    H6: [1.6, 3.2, 6.4, 16, 40, 120],
    H7: [1.2, 2.4, 4.8, 12, 32, 100],
    L1: [0.8, 1.6, 3.2, 8, 20, 60],
    L2: [0.8, 1.6, 3.2, 8, 20, 60],
    L3: [0.8, 1.2, 2.4, 6, 16, 48],
    L4: [0.4, 1.2, 2.4, 6, 16, 48],
    L5: [0.4, 0.8, 2, 4.8, 12, 40],
    L6: [0.4, 0.8, 2, 4.8, 12, 40],
    L7: [0.4, 0.8, 1.6, 4, 10, 32],
    L8: [0.4, 0.8, 1.6, 4, 10, 32],
    L9: [0.4, 0.8, 1.2, 3.2, 8, 24],
    L10: [0.4, 0.8, 1.2, 3.2, 8, 24],
  };
  const NAMES = {
    M: "Present Multi", BS: "Jolly Scatter", ES: "Frost Scatter",
    H1: "Santa's Sack", H2: "Snowman", H3: "Christmas Tree", H4: "Reindeer", H5: "Ice Block",
    H6: "Gingerbread Man", H7: "Stuffed Stocking",
    L1: "Snowball", L2: "Candy Cane", L3: "Ornament", L4: "Jingle Bell", L5: "Holly",
    L6: "Hot Cocoa", L7: "Gold Star", L8: "Mitten", L9: "Snowflake", L10: "Wreath",
  };
  const ORDER = ["H2", "H3", "H4", "H5", "H6", "H7",
                 "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"];
  const RTP = "96.70%", MAX_WIN = 10000;
  const MULTI_MIN = 1.25, MULTI_MAX = 1000;

  // Restricted phrase -> replacement, from Stake's jurisdiction-requirements table. Longer
  // phrases first so "buy bonus" is swapped before "buy" gets a chance at it.
  const SWEEPS = [
    ["bonus buys", "bonuses"], ["paylines", "win lines"], ["paying", "winning"], ["buys", "gets"],
    ["costs", "is played for"], ["charges", "uses"], ["charge", "amount"], ["price", "amount"],
    ["pay table", "win table"], ["paytable", "win table"], ["payouts", "wins"], ["payout", "win"],
    ["buying", "getting"], ["gambling", "play"],
    ["buy bonus", "get bonus"], ["bonus buy", "bonus"], ["total bet", "total play"],
    ["at the cost of", "for"], ["cost of", "can be played for"], ["pays out", "wins"],
    ["paid out", "won"], ["pay out", "win"], ["win feature", "play feature"],
    ["place your bets", "come and play"], ["betting", "playing"], ["bets", "plays"], ["bet", "play"],
    ["bought", "instantly triggered"], ["buy", "get"], ["purchase", "play"],
    ["cash", "coins"], ["money", "coins"], ["currency", "token"], ["credit", "balance"],
    ["wager", "play"], ["gamble", "play"], ["stake", "play amount"],
    ["pays", "wins"], ["paid", "won"], ["pay", "win"], ["cost", "amount"],
  ];
  // Each replacement word borrows the case of the word it replaces ("Buy Bonus" -> "Get
  // Bonus", "BET" -> "PLAY"), so headings and buttons keep their look.
  function recase(from, to) {
    const src = from.split(" "), out = to.split(" ");
    return out.map((w, i) => {
      const s = src[Math.min(i, src.length - 1)];
      if (s === s.toUpperCase() && /[A-Z]/.test(s)) return w.toUpperCase();
      if (s[0] === s[0].toUpperCase()) return w[0].toUpperCase() + w.slice(1);
      return w;
    }).join(" ");
  }
  function T(text, social) {
    if (!social) return text;
    let out = text;
    for (const [from, to] of SWEEPS) {
      out = out.replace(new RegExp("\\b" + from + "\\b", "gi"), m => recase(m, to));
    }
    return out;
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const x = v => "x" + (Number.isInteger(v) ? v : String(v));

  function tile(sym, social) {
    if (sym === "M") return `<div class="ptile multi"><span>x5</span><small>MULTI</small></div>`;
    return `<img class="ptile" src="assets/flat/${sym}.webp" alt="${esc(T(NAMES[sym], social))}" draggable="false">`;
  }

  /**
   * opts: { bet: integer 6dp, fmt(amount) -> string, social: bool, modeCost: {bonus, extremebonus} }
   */
  function render(opts) {
    const { bet, fmt, social } = opts;
    const cost = Object.assign({ ante: 2, bonus: 100, christmas: 250, extremebonus: 400 }, opts.modeCost || {});
    const t = s => T(s, social);
    const money = mult => fmt(Math.round(mult * bet));

    const payRows = ORDER.map(sym => {
      const p = PAYS[sym];
      return `<div class="prow">
        ${tile(sym, social)}
        <div class="pname">${esc(t(NAMES[sym]))}<small>${sym}</small></div>
        <div class="pvals">
          ${TIERS.map((tier, i) => `<div><b>${tier}</b> ${x(p[i])} <em>${money(p[i])}</em></div>`).join("")}
        </div>
      </div>`;
    }).join("");

    // the "how you win" picture: a little board with one cluster of six Candy Canes lit up (5 or more touching wins)
    const G = [["L1","L2","L2","L5","L9"],["L4","L2","L7","L5","L3"],["L2","L2","L6","L1","L5"],["L8","L2","L3","L10","L4"]];
    const demo = `<div class="windemo">${G.map((row, r) => row.map((sym, c) => `<img src="assets/flat/${sym}.webp" alt="" draggable="false" class="${sym === "L2" ? "hit" : ""}">`).join("")).join("")}</div>`;
    const html = `
<section class="howwin">
  <h4>${t("How you win")}</h4>
  ${demo}
  <p>${t("There are no paylines. A win - a \"line pay\" - is a CLUSTER: 5 or more of the same symbol touching each other side by side or up and down (not corner to corner), anywhere on the 7 x 7 board. Above, six Candy Canes touch, so they pay the Candy Cane's 6-symbol prize. A win is shown by a wreath wrapped in Christmas lights running through the centre of every square in it.")}</p>
  <p>${t("Every cluster on the board pays. Then the winning symbols pop, new ones fall in from the top, and anything new that connects pays again - one spin can win many times. The bigger the cluster, the bigger the pay (see the paytable below).")}</p>
</section>

<section>
  <h4>${t("The features in short")}</h4>
  <table class="guide">
    <tr><td><img class="ptile" src="assets/flat/M.webp" alt="" draggable="false"></td><td><b>${t("Present Multi")}</b> - ${t("bursts open after the wins are paid and leaves its multiplier on its own square and the 4 around it. Any win that lands on those squares is multiplied by them.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/BS.webp" alt="" draggable="false"></td><td><b>${t("Jolly Scatter")}</b> - ${t("3, 4 or 5 anywhere start 10, 12 or 15 free spins. In free spins every multiplier stays on the board until the bonus ends, and 3 or more Jolly Scatters add more spins.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/ES.webp" alt="" draggable="false"></td><td><b>${t("Frost Scatter")}</b> - ${t("2 anywhere start The Blizzard: every Multi is worth x2 or more, a random number of extra presents appear every spin, and the presents you collect fill a bar across the top of the board that adds spins and takes the lowest symbols out of the bonus.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/H1.webp" alt="" draggable="false"></td><td><b>${t("Santa's Sack")}</b> - ${t("very rare. When it lands, every symbol on the board goes into the sack and every square gets +2 on its multiplier. Fresh symbols then drop onto the new multipliers.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/wfx/elf.webp" alt="" draggable="false"></td><td><b>${t("Santa's Wake-Up and the Sleigh")}</b> - ${t("Santa sometimes wakes up and throws presents onto the board, and now and then his sleigh flies across before a spin and drops a few. A present never lands on a symbol that is part of a winning cluster.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/morning.webp" alt="" draggable="false"></td><td><b>${t("Bonus buys")}</b> - ${t("the BONUS button lets you start the Bonus (Sleigh Ride), Christmas Morning or The Blizzard straight away. Each bonus has its own feature - see The three bonuses below.")}</td></tr>
  </table>
</section>

<section>
  <h4>${t("The three bonuses")}</h4>
  <p class="fine">${t("Every bonus keeps every multiplier on the board until it ends, and 3 / 4 / 5 Jolly Scatters add 5 / 7 / 10 spins. On top of that each one has its own feature - from good, to better, to best.")}</p>
  <table class="guide">
    <tr><td><img class="ptile" src="assets/xmas/ui/card_red.webp" alt="" draggable="false"></td><td><b>${t("Sleigh Ride (Standard Bonus)")}</b> - ${t("10, 12 or 15 free spins in the snowy bar. Sleigh Drop: at the start of every spin, before the symbols drop, Santa's sleigh flies across the middle of the board and drops 1 or 2 presents (x1.25 or x1.5) onto it.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/morning.webp" alt="" draggable="false"></td><td><b>${t("Christmas Morning")}</b> - ${t("12 free spins by the fire in the living room, starting with 8 to 12 presents already open. Present Toss: at the start of every spin, before the symbols drop, Santa tosses 3 presents onto the board. Each one multiplies the square it hits and the 4 squares around it.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/card_ice.webp" alt="" draggable="false"></td><td><b>${t("The Blizzard")}</b> - ${t("17 free spins out in the storm with Santa and Mrs Claus shivering. Every Multi is worth x2 or more, and after the symbols land a random number of extra presents (none to 4, x1.25 or x1.5) appear on the board every spin, never on a symbol of a winning cluster. Every present that bursts fills a slot on the bar across the top of the board: the 10th present of each bar (the 10th and the 30th of the bonus, marked in gold) adds 5 spins, and every time the bar fills (20 presents) the lowest-paying symbol still in play - first the Wreath, then the Snowflake - leaves the bonus for good and the bar starts over.")}</td></tr>
  </table>
</section>

<section>
  <h4>${t("About the game")}</h4>
  <p>${t(`Mr. & Mrs. Claus is a 7-reel, 7-row video slot with cluster pays and tumbling reels. A cluster is 5 or more matching symbols touching horizontally or vertically, anywhere on the board; every cluster on the board pays, winning symbols are removed, new ones drop in, and the new board is paid again. The values below are multiples of the total bet, shown at your current bet of ${fmt(bet)}.`)}</p>
  <div class="kvgrid">
    <div><span>RTP</span><b>${RTP}</b><small>${t("every mode")}</small></div>
    <div><span>${t("Max win")}</span><b>${x(MAX_WIN)}</b><small>${t("of the total bet")} · ${money(MAX_WIN)}</small></div>
    <div><span>${t("Volatility")}</span><b>${t("High")}</b><small>${t("the Multi carries the big wins")}</small></div>
  </div>
  <p class="fine">${t("The expected return is calculated over many plays. A round's total win is capped at the max win; once the cap is reached the round ends and any remaining feature is void.")}</p>
</section>

<section>
  <h4>${t("Game modes")}</h4>
  <table class="modes">
    <tr><th>${t("Mode")}</th><th>${t("Cost")}</th><th>${t("What you get")}</th></tr>
    <tr><td>${t("Base game")}</td><td>${x(1)} <em>${money(1)}</em></td><td>${t("One spin. Free spins trigger naturally from Jolly Scatter and Frost Scatter symbols.")}</td></tr>
    <tr><td>${t("Buy Bonus")}</td><td>${x(cost.bonus)} <em>${money(cost.bonus)}</em></td><td>${t("A spin guaranteed to trigger the Standard Bonus, Sleigh Ride (10, 12 or 15 free spins with the Sleigh Drop before every spin). RTP ")}${RTP}.</td></tr>
    <tr><td>${t("Christmas Morning")}</td><td>${x(cost.christmas)} <em>${money(cost.christmas)}</em></td><td>${t("12 free spins that start with 8 to 12 presents already opened on the board: their multipliers are on their cells before the first spin and stay for the whole bonus, and Santa tosses 3 more presents onto the board at the start of every spin. RTP ")}${RTP}.</td></tr>
    <tr><td>${t("The Blizzard")}</td><td>${x(cost.extremebonus)} <em>${money(cost.extremebonus)}</em></td><td>${t("A spin guaranteed to trigger The Blizzard (17 free spins, every Multi x2 or more, extra presents every spin and the Present Bar). RTP ")}${RTP}.</td></tr>
  </table>
  <p class="fine">${t("The three buys are chosen from the Bonus panel, which shows the exact total before you press Play. The max win applies to every mode.")}</p>
</section>

<section>
  <h4>${t("Paytable")}</h4>
  <p class="fine">${t("Pays by cluster size: 5 / 6 / 7-8 / 9-11 / 12-15 / 16 or more matching symbols touching horizontally or vertically. Multiples of the total bet and the amount at your current bet. There is no wild symbol.")}</p>
  <div class="paytable">${payRows}</div>
</section>

<section>
  <h4>${t("Special symbols")}</h4>
  <div class="prow">${tile("M")}<div class="pname">${t("Multi — Multiplier")}<small>M</small></div>
    <div class="ptext">${t(`Lands with a value from ${x(MULTI_MIN)} to ${x(MULTI_MAX)}, shown on the symbol. Every winning cluster on the board is paid first; only then does it blow out: the Multi and the four symbols sharing an edge with it are removed, each of those five cells keeps the Multi's value, and new symbols drop in on top. A winning cluster that covers one or more of those cells is multiplied by the SUM of the values on the cells it covers. When two Multis reach the same cell their values add. In the base game the values last for the rest of the spin, including every tumble; in a bonus they stay on the board for the whole feature. Jolly Scatter and the Frost Scatter are never removed by a Multi. The Multi does not form clusters and has no value of its own.`)}</div></div>
  <div class="prow">${tile("M")}<div class="pname">${t("Present Line and Present Avalanche")}<small>M</small></div>
    <div class="ptext">${t("Present Line: a straight line of 3 or 4 Multis can land together, along a row or down a column; their blasts overlap, so the cells between them collect more than one value. It can land on any spin, and far more often in a bonus. Present Avalanche: very rarely, in the base game, every cell of the board except a Jolly Scatter or Frost Scatter becomes a Multi at once; they all blow out together and the whole board drops in on top of their values.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/M.webp" alt="" draggable="false"><div class="pname">${t("Santa's Wake-Up")}</div>
    <div class="ptext">${t("On any spin, at random, Santa wakes up at the bar and throws 3 to 6 presents onto the board. Each one is a Multi that lands on a random cell - never on a scatter and never on a symbol of a cluster that is about to pay - with its own value, and blows out like any other Multi once the wins are paid. It can happen in the base game and, more often, in the free spins. Santa's Sleigh: rarely, in the base game, his sleigh flies across before the symbols drop and leaves 2 to 4 presents on the board in the same way.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/H1.webp" alt="Santa's Sack" draggable="false"><div class="pname">${t("Santa's Sack — Special")}<small>H1</small></div>
    <div class="ptext">${t("Santa's Sack never comes from the reels: very rarely (about 1 spin in 400 in the base game, more often in free spins) it lands on one random square that holds no scatter or Multi. Once the board's wins are paid, the sack collects every symbol on the board (the scatters stay) and adds +2 to the multiplier of every square. The cleared board refills as in a tumble. In the base game the values last for the rest of the spin; in a bonus they stay for the whole feature. The sack does not form clusters and has no value of its own.")}</div></div>
  <div class="prow"><div class="ptile multi"><span>x1.25</span><small>DROP</small></div><div class="pname">${t("Line Drops")}</div>
    <div class="ptext">${t("Every winning cluster, once paid, leaves a small multiplier (x1.25, x1.5 or x2) on one of its own cells for every five symbols it held, chosen at random. A line drop adds to whatever value that cell already holds and lasts exactly as a Multi's value does: for the rest of the spin in the base game, for the whole feature in a bonus. It never changes the win of the cluster that left it.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/BS.webp" alt="Jolly Scatter" draggable="false"><div class="pname">${t("Jolly Scatter — Bonus Scatter")}<small>BS</small></div>
    <div class="ptext">${t("Appears anywhere. 3, 4 or 5 Jolly Scatters on one spin award 10, 12 or 15 free spins (the Standard Bonus). Jolly Scatter does not form clusters and has no value of its own.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/ES.webp" alt="The Frost Scatter" draggable="false"><div class="pname">${t("Frost Scatter — Blizzard Scatter")}<small>ES</small></div>
    <div class="ptext">${t("2 Frost Scatters anywhere on one spin award 17 free spins in The Blizzard directly. 1 Frost Scatter on the same spin as a Jolly Scatter trigger upgrades that trigger to The Blizzard, keeping its spin count. The Frost Scatter does not form clusters and has no value of its own.")}</div></div>
</section>

<section>
  <h4>${t("Free spins")}</h4>
  <p><b>${t("Standard Bonus - Sleigh Ride")}</b> — ${t("3 / 4 / 5 Jolly Scatters award 10 / 12 / 15 free spins. Sleigh Drop: on every free spin with no other present event, before the symbols drop, Santa's sleigh flies across the board and drops 1 or 2 presents (Multis worth x1.25 or x1.5) onto squares that will not take a symbol from a winning cluster. Every value on the board - a Multi's or a line drop's - stays there for the whole bonus.")}</p>
  <p><b>${t("The Blizzard")}</b> — ${t("2 Frost Scatters award 17 free spins; a Jolly Scatter trigger with a Frost Scatter on the same spin is upgraded to The Blizzard with its own spin count. Every Multi is worth x2 or more. On every free spin with no other present event, once the symbols have landed, a random number of extra presents - often none, at most 4 - appear on random squares (x1.25 or x1.5), never on a scatter or on a symbol of a cluster that is about to pay. The Present Bar: every Multi that bursts in the bonus fills one of the bar's 20 slots. The 10th present of each bar - the 10th and the 30th of the bonus, marked on the bar in gold - adds 5 free spins. Each time the bar fills, the lowest-paying symbol still in play leaves the reels for the rest of the bonus - the Wreath on the first fill, the Snowflake on the second - its places taken by the other low symbols, and the bar empties and starts over. Every value stays for the whole bonus.")}</p>
  <p><b>${t("Christmas Morning")}</b> — ${t("bought only: 12 free spins that start with 8 to 12 presents already opened on the board. Present Toss: at the start of every free spin, while the board is empty, Santa tosses 3 presents onto the board. Each lands on a square and adds its value (x1.25, x1.5 or x2) to that square and the 4 squares above, below, left and right of it; then the symbols drop. Every value stays for the whole bonus.")}</p>
  <p><b>${t("Extra spins")}</b> — ${t("3 / 4 / 5 Jolly Scatters on a free spin award 5 / 7 / 10 more spins, in every bonus. In The Blizzard the Present Bar adds 5 more spins at the 10th and the 30th present. Frost Scatters do nothing during free spins.")}</p>
  <p><b>${t("Santa's Sack in the bonuses")}</b> — ${t("Santa's Sack can land in any bonus, more often than in the base game. Its +2 on every square stays on the board for the rest of the bonus.")}</p>
  <p class="fine">${t("Free spins are played at the bet and mode of the triggering spin. If the connection drops, reload the game to finish the round.")}</p>
</section>

<section>
  <h4>${t("How to play")}</h4>
  <table class="guide">
    <tr><td><b>${t("Spin")}</b></td><td>${t("Plays one round at the current bet. The spacebar does the same. While the reels are turning the button reads Skip and lands them at once (clicking the board also skips); every winning cluster is always shown in full.")}</td></tr>
    <tr><td><b>− / +</b></td><td>${t("Lowers or raises the bet through every level offered by the server.")}</td></tr>
    <tr><td><b>${t("Bonus")}</b></td><td>${t("Opens the bonus chooser: pick the Bonus, Christmas Morning or The Blizzard, set the bet, and the total charge is shown before you press Play.")}</td></tr>
    <tr><td><b>${t("Auto")}</b></td><td>${t("Plays a chosen number of rounds one after another at the current bet. You confirm the number before it starts; press it again to stop. It also stops when the balance can't cover the next round.")}</td></tr>
    <tr><td><b>${t("Rapid")}</b></td><td>${t("Shortens the reel spin and win animations. Results are unaffected.")}</td></tr>
    <tr><td><b>${t("Info")}</b></td><td>${t("Opens this page: the rules, the paytable and your recent rounds.")}</td></tr>
    <tr><td><b>${t("Audio")}</b></td><td>${t("Opens the Sound and Music level bars. Drag a bar to the bottom to silence it; with both at the bottom every sound in the game is off. Levels are remembered on this device.")}</td></tr>
    <tr><td><b>${t("Win / Balance")}</b></td><td>${t("The bar shows your balance in the token you are playing with, and the current round's win while there is one. The balance is always the amount the server reports.")}</td></tr>
  </table>
</section>

<section>
  <p class="legal">${t("Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.")}</p>
</section>`;
    return html;
  }

  return { render, T, PAYS, TIERS, NAMES, RTP, MAX_WIN };
})();
