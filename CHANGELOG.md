# Changelog

## v1.3 - Mr. & Mrs. Claus (2026-11-05)

Front only (math v12 unchanged).

**The bar and the shop**
- The bottom bar is stretched out, with WIN always in its middle (gold, dim at 0.00). Each cluster's win figure is pulled
  down off the board into it, and WIN pops and counts up as it lands. Balance and WIN shrink together only when they must.
- Bonus Buy is a shop of four cards - Bonus, Christmas Morning, The Blizzard, Christmas Miracle - each with its own
  Christmas scene and icon, a heat rating in snowflakes, the max win, the price at the current bet, and GET, which asks
  once more (CONFIRM) before it buys. Balance and bet sit in a bar under the cards.
- In a bonus the plate shows the free spins only; the bar's WIN carries the money (Big / Mega / Xtreme / Total Win stay).

**The board**
- A multiplier's value sits on a splat of snow (six of them, picked at random) instead of a plain square, and pops in
  only once the tile over it has finished exploding.
- The lean-in zoom for a third Jolly Scatter eases in and out (it was snapping), the camera goes home while the bonus
  intro has the screen dark, and the board glides back to size as a bonus ends.

**Phones and speed**
- Santa stands beside the sign with a mug of milk on a phone held upright; the Bonus button and Santa are always on
  screen there; no Claus in the bonuses on a phone; the wall is cut to its middle on narrow phones.
- The animated symbols draw on one canvas each; the candy-cane frame is drawn once; the characters stop drawing while
  off screen or behind a bonus scene; the bonuses' snow, blizzard, wind, confetti and window snow are canvas particles
  (Christmas Morning went from ~200 running animations to ~17, The Blizzard from ~360 to ~11); no filter on the board
  in the bonuses; the spin arrows turn on the compositor.
- The TOTAL WIN numerals no longer squeeze on narrow screens.

## v1.2 - Mr. & Mrs. Claus (2026-11-01)

**Math v12: The Blizzard** - every present in it is x20 or more (x20 to x1000; the pop-in present x20 or x50), with far
fewer of them: about 11 a bonus instead of ~55, so wins come bigger and less often. Price still x400, every mode RTP 96.7%,
max win 10,000x. The base game's natural Blizzards play the same rules.

**Front**
- The Icicle symbol (one cartoon icicle) in place of the ice block.
- The bar elf has new faces: wide-eyed on big wins, laughing on wins, wincing on a miss, a sly look at sleeping Santa and a
  whistle (with notes) between spins.
- The opening screen's six plates in two rows of three; the milk glass beside Santa's shoulder.
- The bonus cards: a foil shine, twinkling stars (snowflakes on The Blizzard), a glow under each picture, golden rays behind
  the Christmas Miracle, the prices on gold plates.
- The bonus TOTAL WIN no longer flickers while counting or blinks out before TOTAL WIN; Santa sleeps through it.
- The information page brought up to date (The Blizzard's x20 presents, the Present Bar, the Christmas Miracle staying on).

## v1.1 - Mr. & Mrs. Claus (2026-10-31)

**New**
- The Christmas Miracle (x600 buy): one base spin on a board whose 49 squares all start at x500. Clusters pay through
  the sum of their squares, so the smallest win is 1,000x; a spin with no cluster pays nothing. Once bought it stays on
  for every spin until the player turns it off with the gold "Miracle on" badge, and its title screen plays only once.
- The Middle Present: the centre square wears a candy-cane border, and a present on it adds its value to every square.
- Christmas Morning: a new Mrs. Claus seated in her rocking chair, opening a present on her lap.
- Bonus panel: the chosen bonus gets a thick gold outline and a ray of light behind it.
- The bar: milk and chocolate milk drip from the two taps; a pile of wrapped presents in place of the kegs.
- The Total Win figure sits on a bank of snow that stretches to fit the number.

**Math (v11b; every mode RTP 96.7%, max win 10,000x)**
- Santa's Wake-Up removed; every winning symbol leaves a multiplier on its square.
- Sleigh Ride: the sleigh drops a x10, x20 or x50 present on about every other free spin.
- Christmas Morning: every present x5 or more; Santa throws x10+ presents on about two free spins in three.
- 3 Jolly Scatters in the base game start the Sleigh Ride, 4 or more start Christmas Morning; retriggers +5/+7/+10.
- New mode `miracle` (cost 600).

## v1.0 - Mr. & Mrs. Claus (2026-10-30)

Mr. & Mrs. Claus: a 7x7 cluster-pays Christmas slot for Stake Engine, drawn in a cartoon style.

**What's in this build**
- Santa asleep at the bar: he wakes for "Ho ho ho" when 3+ Jolly Scatters land, and says "Merry Christmas" as the bonus total starts counting.
- Every symbol has its own win animation and sound: the snowball splat, the candy cane snap, the green ornament, the bell, holly, cocoa, star, mitten, snowflake, wreath, sack, snowman, tree, reindeer with lights, the present with the elf, the gingerbread man's "yippee" and the stocking.
- Presents are the multipliers. They burst open with confetti, candy canes and sleigh bells, and their values come out of soft snow to "jin-gle bells".
- Straight candy-cane borders with Christmas lights on the HUD, the free-spins counter, the Bonus panel, the rules panel, the Auto Play picker and the intro boxes.
- Christmas Big / Mega / Xtreme / Total Win screens on a snowy scene, with candy-cane numerals and a bigger Total Win.
- The bar: snow and a shooting star outside the window, twinkling tree lights, metal kegs and a flickering neon sign.
- 1930s-style holiday swing music. The bonus plays louder and faster, and the music ducks under Santa's lines.

**Math:** unchanged and published on engine.io (math v1; RTP 96.7%, max win 10,000x).

`front/` is the engine.io front bundle; `santas-wonderland-front.zip` is the same bundle zipped.
