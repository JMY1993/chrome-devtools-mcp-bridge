[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский] | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

Лёгкий мост для клиентов MCP в песочнице/контейнере (например, Codex), позволяющий подключаться к `chrome-devtools-mcp`, запущенному вне песочницы, с автоматическим запуском headless Chrome.

Две подкоманды:
- `chrome-devtools-mcp-bridge host` — запускает TCP‑сервис; для каждого подключения стартует `chrome-devtools-mcp` и отдельный headless Chrome, проксируя TCP ↔ MCP stdio.
- `chrome-devtools-mcp-bridge connect` — подключает stdin/stdout к сервису; подходит для клиентов MCP, работающих через stdio (например, Codex CLI).

Зачем это нужно
1) Обход проблем с песочницей в Ubuntu/контейнерах, когда `chrome-devtools-mcp` не может запустить Chrome. Частые сообщения об ошибках (для поиска):
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) Связка WSL и Windows‑хоста: запускайте `host` в Windows и подключайтесь из WSL через `connect`, чтобы управлять Chrome DevTools в Windows.

Быстрый старт (npx, без установки)
1) Запустите мост (вне песочницы):
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) Подключите MCP‑клиент (внутри WSL/контейнера):
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

Подсказка: в ограниченных средах храните кеш npx в репозитории
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

Демон и логи
- Рекомендуется `--daemon` (PID и лог‑файлы):
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- Или nohup/setsid:
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- Запуск в Windows: `npx -y chrome-devtools-mcp-bridge@latest host`
- Подключение из WSL: `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- Если localhost не работает, используйте IP Windows и разрешите порт в файерволе.
