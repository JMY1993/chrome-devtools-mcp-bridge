"use strict";

const net = require("net");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { parseArgv, whichSync } = require("./util");

function defaults() {
  return {
    host: process.env.MCP_BRIDGE_HOST || "127.0.0.1",
    port: Number(process.env.MCP_BRIDGE_PORT || 8211),
    noSandbox: process.env.NO_SANDBOX === "1",
    chromeBin: process.env.CHROME_BIN || "",
    mcpCmd: process.env.MCP_CMD || "npx",
    mcpArgs: (process.env.MCP_ARGS || "-y -p chrome-devtools-mcp@latest chrome-devtools-mcp").split(" ")
  };
}

function parse(argv) {
  const d = defaults();
  const args = parseArgv(argv, [
    { name: "host", alias: ["H"], type: "string" },
    { name: "port", alias: ["p"], type: "number" },
    { name: "noSandbox", alias: ["no-sandbox"], type: "boolean" },
    { name: "chromeBin", alias: ["chrome-bin"], type: "string" },
    { name: "mcpCmd", alias: ["mcp-cmd"], type: "string" },
    { name: "mcpArgs", alias: ["mcp-args"], type: "string" },
    { name: "daemon", alias: [], type: "boolean" },
    { name: "logFile", alias: ["log-file"], type: "string" },
    { name: "pidFile", alias: ["pid-file"], type: "string" }
  ]);
  return {
    host: args.host || d.host,
    port: args.port || d.port,
    noSandbox: args.noSandbox || d.noSandbox,
    chromeBin: args.chromeBin || d.chromeBin,
    mcpCmd: args.mcpCmd || d.mcpCmd,
    mcpArgs: (args.mcpArgs ? args.mcpArgs.split(" ") : d.mcpArgs),
    forwardArgs: args._ || [],
    daemon: !!args.daemon,
    logFile: args.logFile || process.env.MCP_BRIDGE_LOG || "",
    pidFile: args.pidFile || process.env.MCP_BRIDGE_PID || ""
  };
}

function findFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen({ port: 0, host }, () => {
      const address = srv.address();
      const p = address && address.port;
      srv.close(() => resolve(p));
    });
  });
}

function mkTempDir(prefix = "chrome-mcp-bridge-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function resolveChrome(chromeBin) {
  if (chromeBin) return chromeBin;
  const candidates = [
    "google-chrome",
    "google-chrome-stable",
    "chromium-browser",
    "chromium",
    "msedge"
  ];
  for (const c of candidates) {
    const p = whichSync(c);
    if (p) return p;
  }
  return "google-chrome";
}

function hasFlag(args, name) {
  const prefix = `${name}=`;
  return args.some((arg) => arg === name || arg.startsWith(prefix));
}

async function launchChrome(host, noSandbox, chromeBin) {
  const port = await findFreePort(host);
  const userDataDir = mkTempDir("chrome-mcp-bridge-ud-");
  const bin = resolveChrome(chromeBin);
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--headless=new"
  ];
  if (noSandbox) args.push("--no-sandbox");
  const proc = spawn(bin, args, { stdio: ["ignore", "ignore", "inherit"] });
  const url = `http://${host}:${port}`;
  await new Promise((r) => setTimeout(r, 600));
  const cleanup = () => {
    try { proc.kill("SIGTERM"); } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  };
  return { url, cleanup };
}

module.exports = function main(argv) {
  const cfg = parse(argv || process.argv);

  const passthrough = [...cfg.mcpArgs, ...cfg.forwardArgs];
  const userProvidedTarget =
    hasFlag(passthrough, "--connect-url") || hasFlag(passthrough, "--isolated");

  // Optional daemonize
  if (cfg.daemon && process.env.MCP_BRIDGE_DAEMON_CHILD !== "1") {
    try {
      const bin = path.join(__dirname, "../bin/mcp-bridge.js");
      const childArgv = [
        bin,
        "host",
        "--host", String(cfg.host),
        "--port", String(cfg.port)
      ];
      if (cfg.noSandbox) childArgv.push("--noSandbox");
      if (cfg.chromeBin) childArgv.push("--chromeBin", cfg.chromeBin);
      if (cfg.mcpCmd) childArgv.push("--mcpCmd", cfg.mcpCmd);
      if (cfg.mcpArgs && cfg.mcpArgs.length) childArgv.push("--mcpArgs", cfg.mcpArgs.join(" "));
      if (cfg.forwardArgs && cfg.forwardArgs.length) childArgv.push(...cfg.forwardArgs);

      const outFd = cfg.logFile ? fs.openSync(cfg.logFile, "a") : "ignore";
      const errFd = outFd;
      const child = spawn(process.execPath, childArgv, {
        detached: true,
        stdio: ["ignore", outFd, errFd],
        env: { ...process.env, MCP_BRIDGE_DAEMON_CHILD: "1" }
      });
      if (cfg.pidFile) {
        try { fs.writeFileSync(cfg.pidFile, String(child.pid)); } catch {}
      }
      child.unref();
      console.log(`[mcp-bridge] daemon started pid=${child.pid}${cfg.logFile ? ` log=${cfg.logFile}` : ""}`);
      return;
    } catch (e) {
      console.error("[mcp-bridge] failed to daemonize:", e && e.message ? e.message : e);
      // fallthrough to foreground
    }
  }

  const server = net.createServer(async (socket) => {
    const childArgs = [...cfg.mcpArgs, ...cfg.forwardArgs];
    let cleanupChrome = null;
    let connectUrl = null;

    if (!userProvidedTarget) {
      try {
        const { url, cleanup } = await launchChrome(cfg.host, cfg.noSandbox, cfg.chromeBin);
        connectUrl = url;
        cleanupChrome = cleanup;
      } catch (e) {
        console.error("[mcp-bridge] Failed to launch Chrome:", e && e.message ? e.message : e);
      }

      if (connectUrl) {
        childArgs.push("--connect-url", connectUrl);
      } else {
        childArgs.push("--isolated");
      }
    }

    const child = spawn(cfg.mcpCmd, childArgs, { stdio: ["pipe", "pipe", "inherit"] });
    socket.pipe(child.stdin);
    child.stdout.pipe(socket);

    const cleanup = () => {
      try { socket.destroy(); } catch {}
      try { child.kill("SIGTERM"); } catch {}
      try { cleanupChrome && cleanupChrome(); } catch {}
    };

    socket.on("error", () => {});
    child.on("error", () => {});
    socket.on("close", cleanup);
    child.on("exit", cleanup);
  });

  server.listen(cfg.port, cfg.host, () => {
    console.log(`[mcp-bridge] listening on ${cfg.host}:${cfg.port}`);
  });

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
};
