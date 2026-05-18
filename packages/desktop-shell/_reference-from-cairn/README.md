# `_reference-from-cairn/` — 仅供参考，**不进 Pace runtime**

这些文件是从 `D:\lll\cairn\packages\desktop-shell` 复制起手时保留的 cairn 原版，**不在 Pace 运行时引用**。保留它们是为了：(a) Pace 写自己 IPC / DB / cc-bridge 时参考 cairn 已 wired 的 pattern；(b) 万一 Pace 演化中需要某个能力，cairn 这边已有现成实现可看。

| 文件 | cairn 原用途 | 在 Pace 里的参考价值 |
|---|---|---|
| `cairn-main.cjs` | Electron 主进程：app lifecycle / 多窗口（panel / pet / legacy） / 100+ IPC handlers / SQLite read-only handle 管理 / tray icons / hooks turn protocol 接入 | DB 句柄管理、IPC handler 注册模式、tray 初始化、git toplevel canonicalize 工具函数 |
| `cairn-panel.html` | cairn panel 主 UI——多 tab（Tasks / Conflicts / Dispatch / Inspector / Mentor）+ 状态密集面板 | UI 结构 / CSS layout patterns（**视觉差异化** per ARCHITECTURE §1.5 后 Pace 不应保留 cairn 视觉特征） |
| `cairn-panel.js` | panel UI 逻辑：状态机、IPC 调用、渲染逻辑（277KB） | IPC 调用模式、Markdown 渲染、滚动加载等通用片段 |
| `cairn-preload.cjs` | contextBridge 暴露 100+ IPC API 给 renderer | preload 结构 + invoke/send 模式 |
| `cairn-preview.html` / `cairn-preview.js` | cairn-pet 浮窗（拖拽的 ambient pet） | Pace 不要 pet，无价值，可删 |
| `claude-stream-launcher.cjs` | spawn cc，双向 stdio，解析 stream-json NDJSON → 写 audit log | transcript / stream-json schema 知识；hook event 解析；session_id 抽取逻辑 |
| `claude-mcp-config.cjs` | 每次 spawn cc 时构造临时 MCP config | Pace 若 opt-in 装 cc hook 时可参考此 pattern |

**约束**：

- 这个目录在 `package.json` `build.files` 里被显式 exclude（不打进 release）
- Pace 代码**绝不** `require('./_reference-from-cairn/...')`
- 演化中如果完全确认不再需要，删掉
