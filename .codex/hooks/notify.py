#!/usr/bin/env python3
"""Codex notify hook for the Miyabi repository."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def repo_root() -> Path:
    try:
        output = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if output:
            return Path(output)
    except Exception:
        pass
    return Path.cwd()


def append_log(root: Path, notification: dict[str, object]) -> None:
    log_dir = root / ".ai" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now()
    log_path = log_dir / f"{now:%Y-%m-%d}.md"
    timestamp = now.isoformat(timespec="seconds")

    if not log_path.exists():
        log_path.write_text(
            f"# Log-Driven Development Log - {now:%Y-%m-%d}\n\n",
            encoding="utf-8",
        )

    message = str(notification.get("last-assistant-message", "")).strip()
    cwd = str(notification.get("cwd", ""))
    user_inputs = notification.get("input-messages", [])
    if isinstance(user_inputs, list):
        prompt = " / ".join(str(item).strip() for item in user_inputs if str(item).strip())
    else:
        prompt = ""

    entry = (
        f"\n## Codex Notify [{timestamp}]\n"
        f"- type: `{notification.get('type', '')}`\n"
        f"- cwd: `{cwd}`\n"
        f"- thread_id: `{notification.get('thread-id', '')}`\n"
        f"- turn_id: `{notification.get('turn-id', '')}`\n"
        f"- input: {prompt or '(none)'}\n"
        f"- assistant: {message or '(empty)'}\n"
    )

    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(entry)


def notify_macos(title: str, message: str) -> None:
    script = (
        'display notification "{}" with title "{}" sound name "Glass"'
    ).format(message.replace('"', '\\"'), title.replace('"', '\\"'))
    subprocess.run(["osascript", "-e", script], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def ring_terminal_bell() -> None:
    sys.stdout.write("\a")
    sys.stdout.flush()


def main() -> int:
    if len(sys.argv) < 2:
        return 0

    try:
        notification = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        return 0

    if notification.get("type") != "agent-turn-complete":
        return 0

    root = repo_root()
    assistant_message = str(notification.get("last-assistant-message", "Turn complete")).strip() or "Turn complete"
    first_line = assistant_message.splitlines()[0][:120]
    title = "Codex: Miyabi turn complete"
    message = first_line

    if sys.platform == "darwin" and shutil_which("osascript"):
        notify_macos(title, message)

    ring_terminal_bell()
    append_log(root, notification)
    return 0


def shutil_which(command: str) -> str | None:
    for path in os.environ.get("PATH", "").split(os.pathsep):
        candidate = Path(path) / command
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


if __name__ == "__main__":
    raise SystemExit(main())
