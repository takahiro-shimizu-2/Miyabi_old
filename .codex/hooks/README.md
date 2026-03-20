# Codex Hooks

## 概要

このディレクトリには、Codex project-scoped config から使う通知 hook を置いています。

## ファイル

- `notify.py`
  - Codex の `notify` 設定から呼ばれる本体
  - `agent-turn-complete` を受けて通知と LDD ログ追記を行う
- `session-end.sh`
  - 手動テスト用ラッパー

## 動作

`notify.py` は以下を行います。

1. JSON payload を受け取る
2. `type == "agent-turn-complete"` のときだけ処理する
3. macOS 通知を試す
4. 端末ベルを鳴らす
5. `.ai/logs/YYYY-MM-DD.md` に通知イベントを追記する

## 手動テスト

```bash
./.codex/hooks/session-end.sh
./.codex/hooks/session-end.sh "Custom completion message"
```
