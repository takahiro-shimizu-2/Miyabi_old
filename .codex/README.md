# `.codex/` for Miyabi

このディレクトリは、Miyabi リポジトリ向けの Codex project-scoped 設定をまとめたものです。

## 含まれるもの

- `config.toml`
  - Codex の project-scoped override
  - Miyabi 向けの safer default と運用補助設定
- `agents/*.toml`
  - subagent role ごとの設定
- `hooks/notify.py`
  - Codex の `notify` から呼ばれる通知スクリプト
- `hooks/session-end.sh`
  - 手動で通知を鳴らすためのラッパー

## 方針

- root の `AGENTS.md` を主たる repo ルールとして使う
- `.codex/config.toml` では、Codex 固有の挙動だけを補う
- repo 共有のため、絶対パスは避ける
- `.env` ではなく `.env.example` を参照する
- LDD 前提で `.ai/logs/YYYY-MM-DD.md` と `@memory-bank.mdc` を運用する

## 初回確認

1. このリポジトリを Codex で trusted project として開く
2. `codex --help` が動くことを確認する
3. 必要なら `npx` 経由の MCP サーバー初回取得を許可する
4. セッション完了通知を試す

```bash
./.codex/hooks/session-end.sh "Miyabi Codex setup is ready."
```

## 注意

- `notify` は `agent-turn-complete` を受けて動く
- macOS では `osascript` 通知を使い、失敗時は端末ベルにフォールバックする
- `.ai/logs/*.md` は `.gitignore` 対象なので Git には乗らない
