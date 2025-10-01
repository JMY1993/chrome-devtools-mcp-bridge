[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español]

chrome-devtools-mcp-bridge
=================================

Un puente ligero para que clientes MCP dentro de sandboxes/contenedores (p. ej., Codex) puedan comunicarse con `chrome-devtools-mcp` ejecutado fuera del sandbox, iniciando automáticamente un Chrome headless dedicado.

Dos subcomandos:
- `chrome-devtools-mcp-bridge host` — inicia un servicio TCP; por cada conexión arranca `chrome-devtools-mcp` y un Chrome headless independiente, y encamina TCP ↔ MCP stdio.
- `chrome-devtools-mcp-bridge connect` — conecta stdin/stdout al servicio; ideal para clientes MCP basados en stdio (p. ej., Codex CLI).

Por qué
1) Evitar los problemas de sandbox en Ubuntu/contenedores donde `chrome-devtools-mcp` no puede iniciar Chrome. Mensajes de error comunes (para SEO/búsqueda):
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) Tender un puente entre WSL y el host Windows: ejecute `host` en Windows y `connect` desde WSL para controlar Chrome DevTools en Windows.

Inicio rápido (npx, sin instalación)
1) Iniciar el puente (fuera del sandbox):
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) Conectar su cliente MCP (dentro de WSL/contenedor):
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

Consejo: en entornos restringidos, mantenga la caché de npx dentro del repositorio
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

Demonio y registros
- Recomendado `--daemon` (escribe PID y permite `--log-file`):
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- O bien nohup/setsid:
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- Iniciar en Windows: `npx -y chrome-devtools-mcp-bridge@latest host`
- Conectar desde WSL: `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- Si localhost no funciona, use la IP del host Windows y permita el puerto en el firewall.
