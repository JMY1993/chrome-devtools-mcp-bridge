[English](README.md) | [简体中文] | [日本語](README.ja.md) | [韩国语](README.ko.md) | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

一个轻量桥接工具：让处于沙箱/容器中的 MCP 客户端（如 Codex）与沙箱外运行的 `chrome-devtools-mcp` 通讯，并由桥接自动启动独立的 Headless Chrome。

它提供两个子命令：
- `chrome-devtools-mcp-bridge host` — 在宿主机启动 TCP 服务，每次连接都会拉起 `chrome-devtools-mcp` 与一个独立的 Headless Chrome，并转发 TCP ↔ MCP stdio。
- `chrome-devtools-mcp-bridge connect` — 将当前进程的 stdin/stdout 与桥接服务对接（非常适合需要 stdio 的 MCP 客户端，如 Codex CLI）。

用途（Why）
1) 解除 Codex 在 Ubuntu/容器里“沙箱”导致 `chrome-devtools-mcp` 无法正常启动 Chrome 的问题。常见报错（利于搜索）：
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) 打通 WSL 与 Windows 宿主机：在 Windows 上运行 `host`，在 WSL 中运行 `connect`，即可驱动 Windows 的 Chrome DevTools。

快速开始（npx，免安装）
1) 在宿主机启动桥接：
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) 在 Codex/WSL（或任何沙箱/容器）中连接：
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

提示：受限环境建议将 npx 缓存落到仓库目录
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

守护模式与日志
- 推荐使用内置 `--daemon`（可写入 PID 与日志）：
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- 或使用 nohup/setsid：
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- 在 Windows 上启动：`npx -y chrome-devtools-mcp-bridge@latest host`
- 在 WSL 中连接：`codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- 若 localhost 不通，请改用 Windows 主机 IP 并允许防火墙放行端口。
