#!/bin/bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MESSAGE="${1:-Miyabi Codex session complete.}"

PAYLOAD="$(python3 - <<'PY' "$ROOT_DIR" "$MESSAGE"
import json
import os
import sys

root = sys.argv[1]
message = sys.argv[2]
payload = {
    "type": "agent-turn-complete",
    "thread-id": "manual-session-end",
    "turn-id": "manual-session-end",
    "cwd": root,
    "input-messages": ["manual session-end hook"],
    "last-assistant-message": message,
}
print(json.dumps(payload, ensure_ascii=False))
PY
)"

exec python3 "$ROOT_DIR/.codex/hooks/notify.py" "$PAYLOAD"
