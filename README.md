[English] | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

A tiny bridge so MCP clients in sandboxes can talk to chrome-devtools-mcp running outside, with Chrome auto-launched headless. Ships a single package with two subcommands:

- chrome-devtools-mcp-bridge host — runs a TCP service; for each connection it spawns chrome-devtools-mcp and a headless Chrome, then pipes TCP <-> MCP stdio.
- chrome-devtools-mcp-bridge connect — connects stdin/stdout to the TCP service; ideal for MCP clients that expect stdio (e.g., Codex CLI).

Why
- Fix sandboxed MCP clients (e.g., Codex on Ubuntu/containers) where `chrome-devtools-mcp` cannot start Chrome due to OS sandboxes. Typical messages people search for:
  - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
  - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
  - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
- Bridge WSL Linux and Windows host: run `host` on Windows, `connect` from WSL to drive Windows Chrome DevTools.

Defaults
- host: 127.0.0.1
- port: 8211
- MCP command: npx -y -p chrome-devtools-mcp@latest chrome-devtools-mcp
- Chrome: auto-detected (google-chrome/chromium…); headless=new; ephemeral profile.

Quick Start (npx, no install)
1) Start the bridge (outside sandbox):
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) Connect your MCP client (inside sandbox/container):
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

Tip: keep npx cache local in restricted environments
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

No aliases — keep it simple: only 'host' and 'connect'.

Daemon vs nohup
- Prefer --daemon (writes PID, supports --log-file).
- Or nohup/setsid if you must:
  - `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`
  - `setsid npx -y chrome-devtools-mcp-bridge@latest host >/dev/null 2>&1 < /dev/null &`

Env/flags
- --host / --port: override defaults
- --no-sandbox: launch Chrome with --no-sandbox (dev only)
- --chrome-bin <path>: explicit Chrome executable
- --mcp-cmd <cmd>: override MCP launcher (default: npx)
- --mcp-args "...": extra args (default pulls chrome-devtools-mcp via npx). Native
  chrome-devtools-mcp flags like `--isolated` / `--connect-url=...` pass through
  unchanged, so you can opt out of the auto-launched Chrome when needed. You can
  also tack on any additional chrome-devtools-mcp flags after the bridge options
  (e.g., ``chrome-devtools-mcp-bridge host -- --isolated --foo=bar``) and they'll
  be forwarded verbatim.

WSL ↔ Windows
If host/port route correctly between WSL and Windows, this can bridge WSL MCP to Windows Chrome. On modern WSL2, Windows loopback is mirrored so localhost often works; otherwise, use the Windows host IP (ipconfig.exe) and allow the port in the Windows firewall.
