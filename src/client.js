"use strict";

const net = require("net");
const { parseArgv } = require("./util");

function defaults() {
  return {
    host: process.env.MCP_BRIDGE_HOST || "127.0.0.1",
    port: Number(process.env.MCP_BRIDGE_PORT || 8211)
  };
}

function parse(argv) {
  const d = defaults();
  const args = parseArgv(argv, [
    { name: "host", alias: ["H"], type: "string" },
    { name: "port", alias: ["p"], type: "number" }
  ]);
  return {
    host: args.host || d.host,
    port: args.port || d.port
  };
}

module.exports = function main(argv) {
  const cfg = parse(argv || process.argv);
  const socket = net.createConnection({ host: cfg.host, port: cfg.port }, () => {
    process.stdin.pipe(socket);
    socket.pipe(process.stdout);
  });
  const cleanup = () => {
    try { socket.destroy(); } catch {}
  };
  socket.on("error", (e) => {
    console.error("[mcp-bridge] connection error:", e && e.message ? e.message : e);
    cleanup();
    process.exit(1);
  });
  socket.on("end", () => { cleanup(); process.exit(0); });
  process.on("SIGINT", () => { cleanup(); process.exit(0); });
  process.on("SIGTERM", () => { cleanup(); process.exit(0); });
};

