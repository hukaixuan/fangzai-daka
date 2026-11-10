#!/usr/bin/env node
/**
 * Local screenshot helper for 方仔打工人生存指南.
 * Forces start / event / ending states via injected JS (FangzaiDaka.*), not URL params.
 *
 * Usage:
 *   python3 -m http.server 8770
 *   node tools/screenshot.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import http from "node:http";

const PORT = process.env.PORT || "8770";
const BASE = (process.env.BASE || `http://127.0.0.1:${PORT}/`).replace(/\/?$/, "/");
const OUT = process.env.OUT || "/tmp/fangzai-daka-shots";
const CHROME = process.env.CHROME || "google-chrome";
const DEBUG_PORT = Number(process.env.DEBUG_PORT || "9336");
const W = 390;
const H = 844;

fs.mkdirSync(OUT, { recursive: true });

function waitHttp(port, path, ms) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: "127.0.0.1", port, path, timeout: 600 }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      });
      req.on("error", () => {
        if (Date.now() - start > ms) reject(new Error("timeout waiting for :" + port + path));
        else setTimeout(tryOnce, 80);
      });
      req.on("timeout", () => {
        req.destroy();
        if (Date.now() - start > ms) reject(new Error("timeout waiting for :" + port + path));
        else setTimeout(tryOnce, 80);
      });
    };
    tryOnce();
  });
}

function connectWs(url) {
  const ws = new WebSocket(url);
  let nextId = 0;
  const pending = new Map();
  const consoleMessages = [];
  const pageErrors = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.method + " " + JSON.stringify(msg.error)));
      else resolve(msg.result);
      return;
    }
    const m = msg.method;
    const p = msg.params || {};
    if (m === "Runtime.consoleAPICalled") {
      const text = (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(" ");
      consoleMessages.push({ type: p.type, text });
    } else if (m === "Runtime.exceptionThrown") {
      const d = p.exceptionDetails || {};
      pageErrors.push(d.text || (d.exception && d.exception.description) || "exception");
    }
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  function send(method, params, sessionId) {
    const id = ++nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 20000);
    });
  }
  return { ws, ready, send, consoleMessages, pageErrors };
}

const userDir = "/tmp/fangzai-daka-chrome-profile-" + process.pid;
fs.mkdirSync(userDir, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-http-cache",
  "--force-device-scale-factor=2",
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${userDir}`,
  "about:blank"
], { stdio: ["ignore", "pipe", "pipe"] });

let stderr = "";
chrome.stderr.on("data", (d) => { stderr += d.toString(); });

let failed = false;
try {
  await waitHttp(DEBUG_PORT, "/json/version", 10000);
  const ver = JSON.parse((await waitHttp(DEBUG_PORT, "/json/version", 2000)).body);
  const browser = connectWs(ver.webSocketDebuggerUrl);
  await browser.ready;

  const created = await browser.send("Target.createTarget", { url: "about:blank" });
  const attached = await browser.send("Target.attachToTarget", {
    targetId: created.targetId,
    flatten: true
  });
  const sid = attached.sessionId;
  const send = (method, params) => browser.send(method, params, sid);

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: W,
    height: H,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });

  const failedRequests = [];
  browser.ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.method === "Network.responseReceived" && msg.sessionId === sid) {
      const r = msg.params.response;
      const status = r.status;
      if (status >= 400) failedRequests.push({ url: r.url, status });
    }
    if (msg.method === "Network.loadingFailed" && msg.sessionId === sid) {
      const p = msg.params;
      failedRequests.push({ url: (p.requestId || "") + " " + (p.errorText || "failed"), status: 0 });
    }
  });

  async function screenshot(name) {
    const res = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
    const file = `${OUT}/${name}.png`;
    fs.writeFileSync(file, Buffer.from(res.data, "base64"));
    console.log("wrote", file, fs.statSync(file).size);
    return file;
  }

  async function evaluate(expression) {
    const res = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error("eval failed: " + JSON.stringify(res.exceptionDetails.text || res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  const nav = await send("Page.navigate", { url: BASE + "index.html" });
  await send("Page.loadEventFired").catch(() => {});
  await sleep(250);
  await evaluate(`
    (async function () {
      if (document.fonts) await document.fonts.ready;
      var start = Date.now();
      while (!window.FangzaiDaka && Date.now() - start < 4000) {
        await new Promise(function (r) { setTimeout(r, 50); });
      }
      return !!window.FangzaiDaka;
    })()
  `);
  await sleep(200);

  const startInfo = await evaluate(`({
    title: document.title,
    hasLogo: !!document.querySelector('.logo'),
    screen: document.getElementById('screen-start') && !document.getElementById('screen-start').hidden,
    slotCount: window.FangzaiDaka && window.FangzaiDaka.SLOTS.length,
    titleCount: window.FangzaiDaka && Object.keys(window.FangzaiDaka.TITLES).length,
    href: location.href,
    search: location.search
  })`);
  console.log("start", JSON.stringify(startInfo));
  if (!startInfo || startInfo.slotCount !== 8 || startInfo.titleCount < 6) {
    throw new Error("start API unexpected: " + JSON.stringify(startInfo));
  }
  if (startInfo.search) {
    throw new Error("page opened with query string, refused: " + startInfo.search);
  }
  await screenshot("start");

  const eventInfo = await evaluate(`
    (async function () {
      window.FangzaiDaka.goToEvent(3, { seed: 7, variants: [0, 0, 0, 0, 0, 0, 0, 0] });
      await new Promise(function (r) { setTimeout(r, 80); });
      var opts = document.querySelectorAll("#event-options .opt");
      return {
        ok: true,
        title: document.getElementById("event-title") && document.getElementById("event-title").textContent,
        body: document.getElementById("event-body") && document.getElementById("event-body").textContent,
        optionCount: opts.length,
        eventShown: document.getElementById("screen-event") && !document.getElementById("screen-event").hidden,
        time: document.getElementById("event-time") && document.getElementById("event-time").textContent,
        progress: document.getElementById("event-progress") && document.getElementById("event-progress").textContent,
        energy: document.getElementById("val-energy") && document.getElementById("val-energy").textContent
      };
    })()
  `);
  console.log("event", JSON.stringify(eventInfo));
  if (!eventInfo || eventInfo.optionCount < 2 || !eventInfo.eventShown) {
    throw new Error("event screen unexpected: " + JSON.stringify(eventInfo));
  }
  await sleep(200);
  await screenshot("event");

  // 卷王 path sample from simulation: all option 0, variants 0
  const grindInfo = await evaluate(`
    (async function () {
      window.FangzaiDaka.showEnding({
        meters: { energy: 28, mood: 50, salary: 82 },
        flags: { slack: 1, grind: 4, punctual: 1, break: 1, spend: 0 },
        animate: false
      });
      await new Promise(function (r) { setTimeout(r, 160); });
      var card = document.getElementById("card");
      var res = window.FangzaiDaka.computeEnding(
        { energy: 28, mood: 50, salary: 82 },
        { slack: 1, grind: 4, punctual: 1, break: 1, spend: 0 },
        null
      );
      var again = window.FangzaiDaka.computeEnding(
        { energy: 28, mood: 50, salary: 82 },
        { slack: 1, grind: 4, punctual: 1, break: 1, spend: 0 },
        null
      );
      return {
        ok: true,
        resultShown: document.getElementById("screen-result") && !document.getElementById("screen-result").hidden,
        cardSize: card ? [card.width, card.height] : null,
        title: res.title,
        text: res.text,
        deterministic: res.title === again.title && res.text === again.text && res.hash === again.hash
      };
    })()
  `);
  console.log("ending", JSON.stringify(grindInfo));
  if (!grindInfo || !grindInfo.deterministic) {
    throw new Error("ending is not deterministic");
  }
  if (grindInfo.title !== "卷王") {
    console.warn("expected 卷王, got", grindInfo.title);
  }
  await sleep(200);
  await screenshot("ending");

  const dataUrl = await evaluate(`document.getElementById("card").toDataURL("image/png")`);
  if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) {
    const buf = Buffer.from(dataUrl.split(",")[1], "base64");
    const file = `${OUT}/card-export.png`;
    fs.writeFileSync(file, buf);
    console.log("wrote", file, buf.length);
  }

  const extras = [
    ["ending-slack", { meters: { energy: 54, mood: 80, salary: 60 }, flags: { slack: 4, grind: 2, punctual: 1, break: 1, spend: 0 } }],
    ["ending-punctual", { meters: { energy: 52, mood: 70, salary: 66 }, flags: { slack: 1, grind: 3, punctual: 2, break: 1, spend: 0 } }],
    ["ending-early", { meters: { energy: 0, mood: 26, salary: 94 }, flags: { slack: 0, grind: 5, punctual: 0, break: 0, spend: 0 }, early: "energy" }]
  ];
  for (const [name, payload] of extras) {
    const info = await evaluate(
      "(async function () { var opt = " + JSON.stringify(payload) + ";" +
      "opt.animate = false;" +
      "window.FangzaiDaka.showEnding(opt);" +
      "await new Promise(function (r) { setTimeout(r, 160); });" +
      "var res = window.FangzaiDaka.computeEnding(opt.meters, opt.flags, opt.early || null);" +
      "var url = document.getElementById('card').toDataURL('image/png');" +
      "return { title: res.title, text: res.text, early: res.early, url: url };" +
      "})()"
    );
    console.log(name, JSON.stringify({ title: info.title, early: info.early, text: info.text }));
    await sleep(160);
    await screenshot(name);
    if (info && typeof info.url === "string" && info.url.startsWith("data:image/png")) {
      const buf = Buffer.from(info.url.split(",")[1], "base64");
      const file = OUT + "/card-" + name + ".png";
      fs.writeFileSync(file, buf);
      console.log("wrote", file, buf.length);
    }
  }

  const logic = await evaluate(`
    (function () {
      var G = window.FangzaiDaka;
      var hrefHasDebug = /[?&](shot|debug|autotest|demo|over)=/.test(location.href);
      var src = document.documentElement.innerHTML;
      var srcHasDebug = /URLSearchParams|location\\.search|\\?shot=|\\?autotest|\\?demo=|\\?over=/.test(src);
      var titles = Object.keys(G.TITLES).map(function (k) { return G.TITLES[k].title; });
      var slotCount = G.SLOTS.length;
      var variantCounts = G.SLOTS.map(function (s) { return s.variants.length; });
      var optCounts = G.SLOTS.map(function (s) {
        return s.variants.map(function (v) { return v.options.length; });
      });
      return {
        titles: titles,
        titleCount: titles.length,
        slotCount: slotCount,
        variantCounts: variantCounts,
        optCounts: optCounts,
        hrefHasDebug: hrefHasDebug,
        srcLooksLikeDebugParams: srcHasDebug
      };
    })()
  `);
  console.log("logic", JSON.stringify(logic));
  if (logic.titleCount < 6 || logic.slotCount !== 8) {
    failed = true;
    console.error("title or slot count unexpected");
  }
  if (logic.hrefHasDebug || logic.srcLooksLikeDebugParams) {
    failed = true;
    console.error("debug URL params detected");
  }

  const errors = browser.pageErrors.slice();
  const consoleErrs = browser.consoleMessages.filter((m) => m.type === "error" || m.type === "warning");
  console.log("pageErrors", JSON.stringify(errors));
  console.log("console", JSON.stringify(consoleErrs));
  console.log("failedRequests", JSON.stringify(failedRequests));
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify({
    startInfo, eventInfo, grindInfo, logic, errors,
    console: browser.consoleMessages, failedRequests
  }, null, 2));
  if (errors.length || failedRequests.length) failed = true;
  if (consoleErrs.some((m) => m.type === "error")) failed = true;
} catch (err) {
  failed = true;
  console.error("SCREENSHOT FAILED", err);
  console.error("chrome stderr:", stderr.slice(-2000));
} finally {
  try { chrome.kill("SIGTERM"); } catch (e) {}
  await sleep(200);
  try { chrome.kill("SIGKILL"); } catch (e) {}
}

process.exit(failed ? 1 : 0);
