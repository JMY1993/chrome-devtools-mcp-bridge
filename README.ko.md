[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어] | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

샌드박스/컨테이너 안의 MCP 클라이언트(예: Codex)에서, 외부에서 실행되는 `chrome-devtools-mcp` 와 통신하고 Headless Chrome 을 자동 실행하기 위한 경량 브리지입니다.

두 가지 서브커맨드를 제공합니다:
- `chrome-devtools-mcp-bridge host` — TCP 서비스를 시작합니다. 연결마다 `chrome-devtools-mcp` 와 독립 Headless Chrome 을 띄우고 TCP ↔ MCP stdio 를 중계합니다.
- `chrome-devtools-mcp-bridge connect` — 현재 프로세스의 stdin/stdout 을 브리지에 연결합니다(Codex CLI 등 stdio 기대 MCP 클라이언트용).

왜 필요한가 (Why)
1) Ubuntu/컨테이너 샌드박스로 인해 `chrome-devtools-mcp` 가 Chrome 을 시작하지 못하는 문제를 우회합니다. 흔한 에러 메시지:
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) WSL ↔ Windows 호스트 브리지: Windows 에서 `host` 실행, WSL 에서 `connect` 로 접속하면 Windows Chrome DevTools 를 제어할 수 있습니다.

빠른 시작 (npx, 설치 불필요)
1) 브리지 시작(샌드박스 밖):
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) MCP 클라이언트에서 연결(WSL/컨테이너 등):
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

팁: 제한된 환경에서는 npx 캐시를 리포지토리 아래로
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

데몬/로그
- 내장 `--daemon` 권장(PID/로그 지원):
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- 또는 nohup/setsid:
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- Windows 에서 시작: `npx -y chrome-devtools-mcp-bridge@latest host`
- WSL 에서 연결: `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- localhost 가 안되면 Windows 호스트 IP 와 방화벽 설정을 확인하세요.
