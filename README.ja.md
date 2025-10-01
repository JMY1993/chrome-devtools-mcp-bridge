[English](README.md) | [简体中文](README.zh-CN.md) | [日本語] | [한국어](README.ko.md) | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

サンドボックス/コンテナ内の MCP クライアント（例: Codex）から、外部で実行される `chrome-devtools-mcp` に接続し、ヘッドレス Chrome を自動起動するための軽量ブリッジです。

2 つのサブコマンドを提供します:
- `chrome-devtools-mcp-bridge host` — TCP サービスを起動。接続ごとに `chrome-devtools-mcp` と独立した Headless Chrome を立ち上げ、TCP ↔ MCP stdio を中継します。
- `chrome-devtools-mcp-bridge connect` — 現在のプロセスの stdin/stdout をブリッジに接続（Codex CLI など stdio が必要な MCP クライアント向け）。

なぜ必要か（Why）
1) Ubuntu/コンテナでのサンドボックスにより、`chrome-devtools-mcp` が Chrome を起動できない問題を回避します。よく検索されるエラーメッセージ:
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) WSL と Windows ホストのブリッジ: Windows で `host` を実行し、WSL から `connect` で接続すれば Windows の Chrome DevTools を操作できます。

クイックスタート（npx、インストール不要）
1) ブリッジを起動（サンドボックス外）:
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) MCP クライアントから接続（WSL/コンテナ内など）:
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

メモ: 制限環境では npx キャッシュをリポジトリ配下に
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

デーモン/ログ
- 内蔵 `--daemon` 推奨（PID/ログ対応）:
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- もしくは nohup/setsid:
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- Windows で起動: `npx -y chrome-devtools-mcp-bridge@latest host`
- WSL から接続: `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- localhost で繋がらない場合は、Windows ホストの IP とファイアウォール設定をご確認ください。
