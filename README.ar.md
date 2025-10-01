[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Français](README.fr.md) | [العربية] | [Русский](README.ru.md) | [Español](README.es.md)

chrome-devtools-mcp-bridge
=================================

أداة جسر خفيفة تُمكّن عملاء MCP داخل الـsandbox/الحاويات (مثل Codex) من الاتصال بـ `chrome-devtools-mcp` خارج الـsandbox، مع تشغيل Chrome headless تلقائيًا.

أوامر فرعية:
- `chrome-devtools-mcp-bridge host` — تشغيل خدمة TCP؛ لكل اتصال يتم تشغيل `chrome-devtools-mcp` ونسخة Chrome headless مستقلة، وتمرير TCP ↔ MCP stdio.
- `chrome-devtools-mcp-bridge connect` — ربط stdin/stdout بالخدمة؛ مناسب لعملاء MCP الذين يعتمدون على stdio (مثل Codex CLI).

لماذا؟
1) تجاوز مشاكل الـsandbox على أوبونتو/الحاويات حيث يفشل `chrome-devtools-mcp` في تشغيل Chrome. رسائل أخطاء شائعة (لتحسين البحث):
   - "Some MCP clients allow sandboxing the MCP server ... As a workaround, either disable sandboxing ... or use --connect-url"
   - "Failed to fetch browser webSocket URL from http://localhost:9222/json/version: fetch failed"
   - "The browser is already running for /home/me/.cache/chrome-devtools-mcp/chrome-profile. Use --isolated to run multiple browser instances."
2) ربط WSL مع نظام ويندوز المضيف: شغّل `host` على ويندوز، و`connect` من داخل WSL للتحكم في Chrome DevTools على ويندوز.

بدء سريع (npx بدون تثبيت)
1) تشغيل الجسر (خارج الـsandbox):
   `npx -y chrome-devtools-mcp-bridge@latest host`

2) الاتصال من عميل MCP (داخل WSL/الحاوية):
   `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect`

نصيحة: في البيئات المقيدة، استخدم مسارات محلية لذاكرة npx المؤقتة
   `XDG_CACHE_HOME=$PWD/.cache NPM_CONFIG_CACHE=$PWD/.npm-cache npx -y chrome-devtools-mcp-bridge@latest host`

وضع الـdaemon والسجلات
- يُفضل `--daemon` (يكتب PID وملفات السجل):
  `npx -y chrome-devtools-mcp-bridge@latest host --daemon --log-file mcp-bridge.log --pid-file mcp-bridge.pid`
- أو استخدام nohup/setsid:
  `nohup npx -y chrome-devtools-mcp-bridge@latest host > mcp-bridge.log 2>&1 & echo $! > mcp-bridge.pid`

WSL ↔ ويندوز
- شغّل على ويندوز: `npx -y chrome-devtools-mcp-bridge@latest host`
- اتصل من WSL: `codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp-bridge@latest connect --host 127.0.0.1 --port 8211`
- إذا لم يعمل localhost، استخدم عنوان IP الخاص بويندوز واسمح بالمنفذ في الجدار الناري.
