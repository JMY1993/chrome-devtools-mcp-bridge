[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français] | [العربية](README.ar.md) | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

Un pont léger pour permettre à des clients MCP en sandbox/conteneur (ex: Codex) de parler à `chrome-devtools-mcp` lancé hors sandbox, avec démarrage automatique d’un Chrome headless.

Deux sous-commandes :
- `chrome-devtools-mcp-bridge host` — lance un service TCP; pour chaque connexion, démarre `chrome-devtools-mcp` et un Chrome headless dédié, et relaie TCP ↔ MCP stdio.
- `chrome-devtools-mcp-bridge connect` — connecte stdin/stdout au service, idéal pour les clients MCP orientés stdio (ex: Codex CLI).

Pourquoi
1) Contourne les problèmes de sandbox (Ubuntu/conteneurs) où `chrome-devtools-mcp` ne peut pas lancer Chrome. Messages d’erreur fréquents (SEO) :
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) Relie WSL et l’hôte Windows : exécutez `host` sous Windows et `connect` depuis WSL pour piloter Chrome DevTools côté Windows.

Démarrage rapide (npx, sans installation)
1) Démarrer le pont (hors sandbox) :
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) Connecter le client MCP (dans WSL/conteneur) :
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

Astuce : dans les environnements restreints, stocker le cache npx dans le dépôt
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

Daemon et logs
- Préférez `--daemon` (écrit un PID et des logs) :
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- Ou nohup/setsid :
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ Windows
- Lancer sur Windows : `npx -y chrome-devtools-mcp-bridge@latest host`
- Se connecter depuis WSL : `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- Si localhost ne fonctionne pas, utiliser l’IP Windows et autoriser le port dans le pare-feu.
