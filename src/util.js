"use strict";

const { spawnSync } = require("child_process");

function parseArgv(argv, spec) {
  const out = { _: [] };
  const map = new Map(spec.map((s) => [s.name, s]));
  const aliasTo = new Map();
  spec.forEach((s) => (s.alias || []).forEach((a) => aliasTo.set(a, s.name)));
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const name = map.has(key) ? key : aliasTo.get(key);
      const def = name ? map.get(name) : null;
      if (!def) continue;
      if (def.type === "boolean") {
        out[name] = true;
      } else {
        const v = argv[i + 1];
        if (v == null) continue;
        out[name] = def.type === "number" ? Number(v) : v;
        i++;
      }
    } else if (a.startsWith("-")) {
      const key = a.slice(1);
      const name = aliasTo.get(key);
      const def = name ? map.get(name) : null;
      if (!def) continue;
      if (def.type === "boolean") {
        out[name] = true;
      } else {
        const v = argv[i + 1];
        if (v == null) continue;
        out[name] = def.type === "number" ? Number(v) : v;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function whichSync(cmd) {
  const r = spawnSync("bash", ["-lc", `command -v ${cmd}`], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  return null;
}

module.exports = { parseArgv, whichSync };

