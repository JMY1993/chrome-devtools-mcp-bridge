#!/usr/bin/env node
"use strict";

const path = require("path");

function printHelp() {
  const self = path.basename(process.argv[1]) || "chrome-devtools-mcp-bridge";
  console.log(`${self} <command> [options]

Commands:
  host        Start the bridge service (auto-launch Chrome + MCP)
  connect     Connect stdio to the bridge service

Examples:
  ${self} host --host 127.0.0.1 --port 8211
  ${self} connect --host 127.0.0.1 --port 8211
`);
}

const cmd = process.argv[2];
if (!cmd || cmd === "-h" || cmd === "--help") {
  printHelp();
  process.exit(0);
}

const subArgv = [process.argv[0], process.argv[1], ...process.argv.slice(3)];
if (cmd === "host") {
  require(path.join(__dirname, "../src/server"))(subArgv);
} else if (cmd === "connect") {
  require(path.join(__dirname, "../src/client"))(subArgv);
} else {
  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}
