#!/usr/bin/env node
/**
 * Balance check for 方仔打工人生存指南.
 *
 * Plays many random runs, plus greedy "worst-energy" / "worst-mood" /
 * "worst-wallet" strategies over every variant combination (2^8 = 256).
 *
 * Greedy rule: at each event, pick the option with the lowest (most negative)
 * delta for the target meter. Ties go to the lowest option index.
 *
 * Usage:
 *   node tools/simulate.mjs
 *   node tools/simulate.mjs --runs 20000
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "simulate.mjs"));
const G = require(path.join(here, "..", "js", "app.js"));

const RUNS = Number((process.argv.includes("--runs")
  ? process.argv[process.argv.indexOf("--runs") + 1]
  : 20000) || 20000);

function emptyFlags() {
  return { slack: 0, grind: 0, punctual: 0, break: 0, spend: 0 };
}

function worstIndex(event, stat) {
  let best = 0;
  let bestV = Infinity;
  event.options.forEach((opt, i) => {
    const v = (opt.d && opt.d[stat]) || 0;
    if (v < bestV) {
      bestV = v;
      best = i;
    }
  });
  return best;
}

function playPlan(plan, pickFn) {
  const meters = Object.assign({}, G.START_METERS);
  const flags = emptyFlags();
  const history = [];
  let early = null;
  for (let i = 0; i < plan.length; i++) {
    const ev = plan[i].event;
    const idx = pickFn(ev, meters, flags, i);
    const opt = ev.options[idx];
    G.applyDelta(meters, flags, opt);
    history.push({
      slot: plan[i].slot.id,
      variant: ev.id,
      optionIndex: idx,
      d: Object.assign({}, opt.d)
    });
    early = G.detectEarly(meters);
    if (early) break;
  }
  const result = G.computeEnding(meters, flags, early);
  return {
    title: result.title,
    id: result.id,
    early: early,
    meters: result.meters,
    flags: Object.assign({}, flags),
    steps: history.length
  };
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPickFn(seed) {
  const rng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  return (ev) => Math.floor(rng() * ev.options.length);
}

function tally(rows) {
  const titles = {};
  const early = { energy: 0, mood: 0, salary: 0, none: 0 };
  for (const r of rows) {
    titles[r.title] = (titles[r.title] || 0) + 1;
    if (r.early) early[r.early] += 1;
    else early.none += 1;
  }
  return { titles, early, n: rows.length };
}

function fmtDist(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${k}\t${v}\t${((v / n) * 100).toFixed(2)}%`)
    .join("\n");
}

function pct(v, n) {
  return ((v / n) * 100).toFixed(2) + "%";
}

const randomRows = [];
for (let i = 0; i < RUNS; i++) {
  randomRows.push(playPlan(G.pickPlan(i), randomPickFn(i)));
}
const randomT = tally(randomRows);

console.log("START_METERS", JSON.stringify(G.START_METERS));
console.log("RANDOM_RUNS", RUNS);
console.log("title distribution:");
console.log(fmtDist(randomT.titles, RUNS));
console.log(
  "early endings:",
  `energy ${randomT.early.energy} (${pct(randomT.early.energy, RUNS)}),`,
  `mood ${randomT.early.mood} (${pct(randomT.early.mood, RUNS)}),`,
  `salary ${randomT.early.salary} (${pct(randomT.early.salary, RUNS)}),`,
  `normal ${randomT.early.none} (${pct(randomT.early.none, RUNS)})`
);

const STATS = [
  ["energy", "电量耗尽"],
  ["mood", "心态先下班"],
  ["salary", "钱包先行下班"]
];

const greedy = {};
for (const [stat, expectedTitle] of STATS) {
  const rows = [];
  let otherEarly = 0;
  let finished = 0;
  for (let mask = 0; mask < 256; mask++) {
    const variants = [];
    for (let i = 0; i < 8; i++) variants.push((mask >> i) & 1);
    const row = playPlan(G.pickPlan(0, variants), (ev) => worstIndex(ev, stat));
    rows.push(row);
    if (row.early && row.early !== stat) otherEarly += 1;
    if (!row.early) finished += 1;
  }
  const t = tally(rows);
  greedy[stat] = {
    hit: t.early[stat],
    otherEarly,
    finished,
    titles: t.titles
  };
  const ok = t.early[stat] === 256;
  console.log(
    `\nGREEDY worst-${stat}: ${t.early[stat]}/256 hit ${expectedTitle}` +
      (ok ? " (all variant combos)" : "")
  );
  if (!ok) {
    console.log("  other early:", otherEarly, "finished normally:", finished);
    console.log("  titles:\n" + fmtDist(t.titles, 256));
  }
}

const issues = [];
for (const [stat] of STATS) {
  if (greedy[stat].hit !== 256) {
    issues.push(`greedy ${stat} did not hit 0 in every variant combo (${greedy[stat].hit}/256)`);
  }
}
const targets = { energy: randomT.early.energy, mood: randomT.early.mood, salary: randomT.early.salary };
for (const [stat, count] of Object.entries(targets)) {
  const p = (count / RUNS) * 100;
  if (p < 5 || p > 15) {
    issues.push(`random ${stat}-zero is ${p.toFixed(2)}% (target about 5–15%)`);
  }
}
const normalTitles = Object.entries(randomT.titles).filter(([k]) =>
  !["电量耗尽", "心态先下班", "钱包先行下班"].includes(k)
);
if (normalTitles.length < 6) {
  issues.push(`only ${normalTitles.length} normal titles appeared in random runs`);
}

if (issues.length) {
  console.log("\nWARNINGS:");
  issues.forEach((m) => console.log(" -", m));
  process.exitCode = 2;
} else {
  console.log("\nOK: greedy strategies all reach their zero-endings; random early rates are in range; normal titles stay diverse.");
}
