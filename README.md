# Mr. & Mrs. Claus

A 7x7 cluster-pays Christmas slot for Stake Engine (engine.io, team `smukiez`, game `mrandmrs-claus`, first made as `santas-wonderland`).

* `front/` is the front-end bundle exactly as it goes up to engine.io's **front** scratch area
  (`index.html` at its root).
* `math/` is the math bundle as it goes up to the **math** scratch area (math v14: base, bonus, christmas,
  extremebonus and miracle). Books over GitHub's 100 MB limit are kept as `.partNN` pieces (`tools/split_big.py`);
  `tools/up_tab.js` joins them in the browser and uploads each file under its real name.
