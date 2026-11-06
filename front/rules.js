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
  const PAYS = {   // symbol: [t5, t6, t7_8, t9_11, t12_15, t16plus] - math v14 (2026-11-06)
    H1: [4, 8, 16, 40, 100, 400],
    H2: [0.8, 2, 3.6, 9.2, 24.8, 93.6],
    H3: [0.8, 1.6, 3.2, 7.6, 18.8, 62.4],
    H4: [0.8, 1.2, 2.4, 6.4, 15.2, 50],
    H6: [0.4, 0.8, 2, 4.8, 12.4, 37.6],
    H7: [0.4, 0.8, 1.6, 3.6, 10, 31.2],
    L2: [0.4, 0.4, 0.8, 2.4, 6.4, 18.8],
    L4: [0.4, 0.4, 0.8, 2, 4.8, 15.2],
    L5: [0.4, 0.4, 0.8, 1.6, 3.6, 12.4],
    L6: [0.4, 0.4, 0.8, 1.6, 3.6, 12.4],
    L7: [0.4, 0.4, 0.4, 1.2, 3.2, 10],
    L8: [0.4, 0.4, 0.4, 1.2, 3.2, 10],
    L9: [0.4, 0.4, 0.4, 0.8, 2.4, 7.6],
    L10: [0.4, 0.4, 0.4, 0.8, 2.4, 7.6],
  };
  // (owner, 2026-11-06: "remove the snowball ornament and icicle from the game") - L1 Snowball, L3 Ornament and H5 Icicle
  // are gone from the reels and the paytable
  const NAMES = {
    M: "Present Multi", BS: "Jolly Scatter", ES: "Frost Scatter",
    H1: "Santa's Sack", H2: "Snowman", H3: "Christmas Tree", H4: "Reindeer",
    H6: "Gingerbread Man", H7: "Stuffed Stocking",
    L2: "Candy Cane", L4: "Jingle Bell", L5: "Holly",
    L6: "Hot Cocoa", L7: "Gold Star", L8: "Mitten", L9: "Snowflake", L10: "Wreath",
  };
  const ORDER = ["H2", "H3", "H4", "H6", "H7", "L2", "L4", "L5", "L6", "L7", "L8", "L9", "L10"];
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
    const cost = Object.assign({ ante: 2, bonus: 100, christmas: 250, extremebonus: 400, miracle: 600 }, opts.modeCost || {});
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
    const G = [["L7","L2","L2","L5","L9"],["L4","L2","L7","L5","L6"],["L2","L2","L6","L8","L5"],["L8","L2","L4","L10","L4"]];
    const demo = `<div class="windemo">${G.map((row, r) => row.map((sym, c) => `<img src="assets/flat/${sym}.webp" alt="" draggable="false" class="${sym === "L2" ? "hit" : ""}">`).join("")).join("")}</div>`;
    const html = `
<section class="howwin">
  <h4>${t("How you win")}</h4>
  ${demo}
  <p>${t("There are no paylines. A win - a \"line pay\" - is a CLUSTER: 5 or more of the same symbol touching each other side by side or up and down (not corner to corner), anywhere on the 7 x 7 board. Above, six Candy Canes touch, so they pay the Candy Cane's 6-symbol prize. A win is shown by a candy cane drawn through every square in it, and what it pays counts up over it.")}</p>
  <p>${t("Every cluster on the board pays. Then the winning symbols pop, new ones fall in from the top, and anything new that connects pays again - one spin can win many times. The bigger the cluster, the bigger the pay (see the paytable below).")}</p>
</section>

<section>
  <h4>${t("The features in short")}</h4>
  <table class="guide">
    <tr><td><img class="ptile" src="assets/flat/M.webp" alt="" draggable="false"></td><td><b>${t("Present Multi")}</b> - ${t("bursts open after the wins are paid and leaves its multiplier on its own square and the 4 around it. Any win that lands on those squares is multiplied by them.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/M.webp" alt="" draggable="false" style="box-shadow: 0 0 0 4px #fdfbf7, 0 0 0 7px #d61f2a; border-radius: 10px"></td><td><b>${t("Middle Present")}</b> - ${t("the middle square of the board has a candy-cane border. A present that bursts there puts its value on every square of the board, then every symbol goes and a whole fresh board drops onto the new multipliers.")}</td></tr>
    <tr><td><div class="ptile multi"><span>x1.25</span><small>DROP</small></div></td><td><b>${t("Line Drops")}</b> - ${t("every symbol of a winning cluster turns into a multiplier on its square (x1.25, x1.5 or x2) once the cluster is paid, ready for the symbols that fall onto it.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/BS.webp" alt="" draggable="false"></td><td><b>${t("Jolly Scatter")}</b> - ${t("3 anywhere start Snowed In (10 free spins); 4 or more start Christmas Morning (12 free spins). In free spins every multiplier stays on the board until the bonus ends, and 3 or more Jolly Scatters add more spins.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/ES.webp" alt="" draggable="false"></td><td><b>${t("Frost Scatter")}</b> - ${t("2 anywhere start The Blizzard (17 free spins), where every present is worth x20 or more. One with a Jolly Scatter win turns that bonus into The Blizzard.")}</td></tr>
    <tr><td><img class="ptile" src="assets/flat/H1.webp" alt="" draggable="false"></td><td><b>${t("Santa's Sack")}</b> - ${t("very rare. When it lands, every symbol on the board goes into the sack and every square gets +2 on its multiplier. Fresh symbols then drop onto the new multipliers.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/sleigh.webp" alt="" draggable="false" style="object-fit: contain"></td><td><b>${t("Santa's Sleigh")}</b> - ${t("now and then in the base game his sleigh flies across before a spin and drops 2 to 4 presents onto the board.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/card_gold.webp" alt="" draggable="false"></td><td><b>${t("Bonus buys")}</b> - ${t("the BONUS button opens the shop: Snowed In, Christmas Morning, The Blizzard or the Christmas Miracle, straight away.")}</td></tr>
  </table>
</section>

<section>
  <h4>${t("The bonuses")}</h4>
  <p class="fine">${t("Every bonus keeps every multiplier on the board until it ends, and 3 / 4 / 5 Jolly Scatters on a free spin add 5 / 7 / 10 spins. The presents in a bonus come from the reels. The Christmas Miracle is not a bonus: it is one spin on a board that is all x500 from the start.")}</p>
  <table class="guide">
    <tr><td><img class="ptile" src="assets/xmas/ui/card_red.webp" alt="" draggable="false"></td><td><b>${t("Snowed In")}</b> - ${t("3 Jolly Scatters: 10 free spins in the snowy bar. Every value on the board stays there for the whole bonus, building up spin after spin, and a present that bursts in the middle square sets off the whole board.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/morning.webp" alt="" draggable="false"></td><td><b>${t("Christmas Morning")}</b> - ${t("4 or more Jolly Scatters: 12 free spins by the fire in a cabin's living room, starting with 5 to 8 presents already open on the board (x5 to x250 each). Every present in this bonus is x5 or more, and every value stays for the whole bonus.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/card_ice.webp" alt="" draggable="false"></td><td><b>${t("The Blizzard")}</b> - ${t("2 Frost Scatters (17 free spins), or a Jolly Scatter win with a Frost Scatter (its own 10, 12 or 15 spins): free spins outside the bar in a night-time snowstorm. Every present is worth x20 or more - fewer presents than in the other bonuses, but every one big - and every value stays for the whole bonus.")}</td></tr>
    <tr><td><img class="ptile" src="assets/xmas/ui/card_gold.webp" alt="" draggable="false"></td><td><b>${t("Christmas Miracle")}</b> - ${t("bought only, and not a bonus: ONE spin of the base game, and before its symbols drop every square of the board turns x500. Only winning clusters pay - each is multiplied by the sum of the squares it covers, so a cluster of 5 symbols is multiplied by x2,500, one of 6 by x3,000, and so on - and a spin that lands no cluster pays nothing. Presents that land add their value on top, every symbol of a winning cluster adds a small multiplier to its square, and the board keeps tumbling for as long as clusters keep paying. There are no free spins.")}</td></tr>
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
    <tr><td>${t("Snowed In")}</td><td>${x(cost.bonus)} <em>${money(cost.bonus)}</em></td><td>${t("A spin that lands 3 Jolly Scatters: Snowed In, 10 free spins, every value staying on the board for the whole bonus. RTP ")}${RTP}.</td></tr>
    <tr><td>${t("Christmas Morning")}</td><td>${x(cost.christmas)} <em>${money(cost.christmas)}</em></td><td>${t("A spin that lands 4 or more Jolly Scatters: 12 free spins that start with 5 to 8 presents already opened on the board - their multipliers are on their squares before the first spin and stay for the whole bonus. Every present is x5 or more. RTP ")}${RTP}.</td></tr>
    <tr><td>${t("The Blizzard")}</td><td>${x(cost.extremebonus)} <em>${money(cost.extremebonus)}</em></td><td>${t("A spin guaranteed to trigger The Blizzard (10, 12 or 17 free spins, every present x20 or more). RTP ")}${RTP}.</td></tr>
    <tr><td>${t("Christmas Miracle")}</td><td>${x(cost.miracle)} <em>${money(cost.miracle)}</em></td><td>${t("One spin of the base game with every square of the board already at x500: only winning clusters pay (a 5-symbol cluster pays x2,500 its win), and a spin with no cluster pays nothing. Presents and the clusters' drops add on top. No free spins. RTP ")}${RTP}.</td></tr>
  </table>
  <p class="fine">${t("The four buys are in the Bonus shop. Each shows its price at your current bet: press GET, then CONFIRM to buy it. The max win applies to every mode.")}</p>
</section>

<section>
  <h4>${t("Paytable")}</h4>
  <p class="fine">${t("Pays by cluster size: 5 / 6 / 7-8 / 9-11 / 12-15 / 16 or more matching symbols touching horizontally or vertically. Multiples of the total bet and the amount at your current bet. There is no wild symbol.")}</p>
  <div class="paytable">${payRows}</div>
</section>

<section>
  <h4>${t("Special symbols")}</h4>
  <div class="prow">${tile("M")}<div class="pname">${t("Multi — Multiplier")}<small>M</small></div>
    <div class="ptext">${t(`Lands with a value from ${x(MULTI_MIN)} to ${x(MULTI_MAX)}, shown on the symbol. Every winning cluster on the board is paid first; only then does it blow out: the Multi and the four symbols sharing an edge with it are removed, each of those five cells keeps the Multi's value, and new symbols drop in on top. A winning cluster that covers one or more of those cells is multiplied by the SUM of the values on the cells it covers. When two Multis reach the same cell their values add. In the base game the values last for the rest of the spin, including every tumble; in a bonus they stay on the board for the whole feature. Jolly Scatter and the Frost Scatter are never removed by a Multi. The Multi does not form clusters and has no value of its own. In The Blizzard every Multi is worth ${x(20)} or more, and in Christmas Morning ${x(5)} or more.`)}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/M.webp" alt="" draggable="false" style="box-shadow: 0 0 0 4px #fdfbf7, 0 0 0 7px #d61f2a; border-radius: 10px"><div class="pname">${t("Middle Present")}<small>M</small></div>
    <div class="ptext">${t("The square in the middle of the board has a candy-cane border. A Multi that lands on it waits, like any Multi, until every winning cluster on the board has been paid. Then it bursts over the whole board instead of the 4 squares around it: its value is added to every square of the board (the squares holding a Jolly Scatter or Frost Scatter included), every symbol except the scatters is removed, and a whole fresh board drops in on top of the new multipliers. Play then carries on as usual: new clusters are paid through the values on their squares, and the values last as any Multi's do - for the rest of the spin in the base game, for the whole feature in a bonus. A Multi gets onto the middle square from the reels, or in the base game by dropping from Santa's sleigh. A Present Line and a Present Avalanche never land on it, and Christmas Morning's opened presents never set it off.")}</div></div>
  <div class="prow">${tile("M")}<div class="pname">${t("Present Line and Present Avalanche")}<small>M</small></div>
    <div class="ptext">${t("Base game only. Present Line: a straight line of 3 or 4 Multis can land together, along a row or down a column (never through the middle square); their blasts overlap, so the cells between them collect more than one value - about 1 base spin in 80. Present Avalanche: very rarely, every cell of the board except a Jolly Scatter, a Frost Scatter or the middle square becomes a Multi at once; they all blow out together and the whole board drops in on top of their values.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/xmas/ui/sleigh.webp" alt="" draggable="false" style="object-fit: contain"><div class="pname">${t("Santa's Sleigh")}</div>
    <div class="ptext">${t("Base game only, about 1 spin in 130: Santa's sleigh flies across before the symbols drop and leaves 2 to 4 presents on the board. Each one is a Multi with its own value on a random square - never on a scatter and never on a symbol of a cluster that is about to pay - and blows out like any other Multi once the wins are paid. A present that drops onto the middle square bursts over the whole board (see Middle Present).")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/H1.webp" alt="Santa's Sack" draggable="false"><div class="pname">${t("Santa's Sack — Special")}<small>H1</small></div>
    <div class="ptext">${t("Santa's Sack never comes from the reels: very rarely (about 1 base spin in 550, more often in free spins) it lands on one random square that holds no scatter or Multi. Once the board's wins are paid, the sack collects every symbol on the board (the scatters stay) and adds +2 to the multiplier of every square. The cleared board refills as in a tumble. In the base game the values last for the rest of the spin; in a bonus they stay for the whole feature. The sack does not form clusters and has no value of its own.")}</div></div>
  <div class="prow"><div class="ptile multi"><span>x1.25</span><small>DROP</small></div><div class="pname">${t("Line Drops")}</div>
    <div class="ptext">${t("Every winning cluster, once paid, turns every one of its symbols into a multiplier: each of its squares gets a small value (x1.25, x1.5 or x2, at random). A line drop adds to whatever value that cell already holds and lasts exactly as a Multi's value does: for the rest of the spin in the base game, for the whole feature in a bonus. It never changes the win of the cluster that left it.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/BS.webp" alt="Jolly Scatter" draggable="false"><div class="pname">${t("Jolly Scatter — Bonus Scatter")}<small>BS</small></div>
    <div class="ptext">${t("Appears anywhere. 3 Jolly Scatters on one spin of the base game award Snowed In (10 free spins); 4 or more award Christmas Morning (12 free spins). With a Frost Scatter on the same spin it becomes The Blizzard instead. Jolly Scatter does not form clusters and has no value of its own.")}</div></div>
  <div class="prow"><img class="ptile" src="assets/flat/ES.webp" alt="The Frost Scatter" draggable="false"><div class="pname">${t("Frost Scatter — Blizzard Scatter")}<small>ES</small></div>
    <div class="ptext">${t("2 Frost Scatters anywhere on one spin award 17 free spins in The Blizzard directly. 1 Frost Scatter on the same spin as a Jolly Scatter trigger upgrades that trigger to The Blizzard, keeping its spin count (10, 12 or 15). The Frost Scatter does not form clusters and has no value of its own.")}</div></div>
</section>

<section>
  <h4>${t("Free spins")}</h4>
  <p><b>${t("Snowed In")}</b> — ${t("3 Jolly Scatters in the base game, or bought: 10 free spins. The presents come only from the reels, and every value on the board, a Multi's or a line drop's, stays there for the whole bonus, building up spin after spin.")}</p>
  <p><b>${t("Christmas Morning")}</b> — ${t("4 or more Jolly Scatters in the base game, or bought: 12 free spins that start with 5 to 8 presents already opened on the board (x5 to x250 each). Every present in this bonus is x5 or more: a Multi from the reels is worth x5 to x1000. After the opened presents, the presents come only from the reels. Every value stays for the whole bonus.")}</p>
  <p><b>${t("The Blizzard")}</b> — ${t("2 Frost Scatters award 17 free spins; a Jolly Scatter trigger with a Frost Scatter on the same spin is upgraded to The Blizzard with its own spin count. Every present in this bonus is x20 or more: a Multi from the reels is worth x20 to x1000, and the reels carry fewer of them than in the other bonuses. The presents come only from the reels. Every value stays for the whole bonus.")}</p>
  <p><b>${t("Extra spins")}</b> — ${t("3 / 4 / 5 Jolly Scatters on a free spin award 5 / 7 / 10 more spins, in every bonus. Frost Scatters do nothing during free spins.")}</p>
  <p><b>${t("Santa's Sack in the bonuses")}</b> — ${t("Santa's Sack can land in any bonus, more often than in the base game. Its +2 on every square stays on the board for the rest of the bonus.")}</p>
  <p class="fine">${t("Free spins are played at the bet and mode of the triggering spin. If the connection drops, reload the game to finish the round.")}</p>
</section>

<section>
  <h4>${t("Christmas Miracle")}</h4>
  <p>${t("Bought from the Bonus shop. It is one spin of the base game, not a bonus: before the symbols drop, every square of the board gets x500. The first Christmas Miracle after you turn it on shows its title and the values coming on in a wave out from the middle square; the ones after it go straight to the x500 board. Then the spin plays as usual: every winning cluster is paid through the sum of the values on its squares (5 symbols on x500 squares: x2,500 the cluster's win), its symbols leave a small multiplier on their squares and are removed, and new symbols drop in onto the values - tumbling on until a board pays nothing. A present that lands adds its value to the x500 under it, and one that bursts on the middle square adds its value to every square. Only clusters pay, so a spin that lands none pays nothing. Jolly Scatters and Frost Scatters do not start a bonus in this spin. The max win applies.")}</p>
  <p>${t("Once you play a Christmas Miracle it stays on: every spin after it - the Spin button, the spacebar and Auto play - is another Christmas Miracle at the same price, and the bet on the bar shows that price (Miracle spin). A gold Miracle button appears beside the Bonus button while it is on; press it to turn the Christmas Miracle off and go back to the base game. Every session starts with it off.")}</p>
</section>

<section>
  <h4>${t("How to play")}</h4>
  <table class="guide">
    <tr><td><b>${t("Spin")}</b></td><td>${t("Plays one round at the current bet. The spacebar does the same. While the reels are turning the button reads Skip and lands them at once (clicking the board also skips); every winning cluster is always shown in full.")}</td></tr>
    <tr><td><b>− / +</b></td><td>${t("Lowers or raises the bet through every level offered by the server.")}</td></tr>
    <tr><td><b>${t("Bonus")}</b></td><td>${t("Opens the Bonus shop: Snowed In, Christmas Morning, The Blizzard and the Christmas Miracle, each with its price at the bet set under them. Press GET, then CONFIRM, to buy one.")}</td></tr>
    <tr><td><b>${t("Miracle")}</b></td><td>${t("Shown beside the Bonus button while the Christmas Miracle is on: every spin plays a Christmas Miracle at its price. Press it to turn the Christmas Miracle off.")}</td></tr>
    <tr><td><b>${t("Auto")}</b></td><td>${t("Plays a chosen number of rounds one after another at the current bet. You confirm the number before it starts; press it again to stop. It also stops when the balance can't cover the next round.")}</td></tr>
    <tr><td><b>${t("Rapid")}</b></td><td>${t("Shortens the reel spin and win animations. Results are unaffected.")}</td></tr>
    <tr><td><b>${t("Info")}</b></td><td>${t("Opens this page: the rules, the paytable and your recent rounds.")}</td></tr>
    <tr><td><b>${t("Audio")}</b></td><td>${t("Opens the Sound and Music level bars. Drag a bar to the bottom to silence it; with both at the bottom every sound in the game is off. Levels are remembered on this device.")}</td></tr>
    <tr><td><b>${t("Win / Balance")}</b></td><td>${t("The bar shows your balance in the token you are playing with, and the current round's win while there is one. The balance is always the amount the server reports.")}</td></tr>
  </table>
</section>

<section class="wish">
  <p>${t("Look out the window of the bar every now and then: a shooting star streaks across the night sky. Make a wish for luck! (Just for fun - it doesn't change any result.)")}</p>
</section>

<section>
  <p class="legal">${t("Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.")}</p>
</section>`;
    return html;
  }

  return { render, T, PAYS, TIERS, NAMES, RTP, MAX_WIN };
})();
