# `_reference-from-cairn/` — 仅供参考，**不进 Pace runtime**

这里的文件是从 `D:\lll\cairn\packages\desktop-shell` 复制起手时**没删但也不在 Pace 运行时**的模块。

保留它们是因为 Pace 写 `cc-bridge.cjs`（按需 lazy 读取 transcript / cc session 元数据）时，cairn 这些文件里有可参考的 NDJSON / stream-json 解析逻辑 + hook 配置模式。

| 文件 | cairn 原用途 | 在 Pace 里的参考价值 |
|---|---|---|
| `claude-stream-launcher.cjs` | spawn cc，双向 stdio，解析 stream-json NDJSON → 写 audit log | transcript / stream-json schema 知识；hook event 解析；session_id 抽取逻辑 |
| `claude-mcp-config.cjs` | 每次 spawn cc 时构造临时 MCP config | Pace 若要 opt-in 装 cc hook，可参考此文件构造 `~/.claude/settings.json` 的模式（虽然 Pace 主要参考 `claude-settings-config.cjs` 那一份） |

**约束**：

- 这个目录在 `package.json` `build.files` 里被显式 exclude（不打进 release）
- Pace 代码**绝不** `require('./_reference-from-cairn/...')`
- 演化中如果完全确认不再需要，删掉
