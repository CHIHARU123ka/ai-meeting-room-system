#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fullauto_loop.py - Full Auto Infinite Restart Loop

Environment variables:
    SCRIPT_DIR   : Working directory for the script
    INSTANCE_ID  : Parallel instance number (1, 2, 3...)

Behavior:
    1. Read CLAUDE_PROMPT.md and execute claude command
    2. Monitor stdout and auto-respond (y/n, Enter, etc.)
    3. Detect PR creation -> exit 0 (success)
    4. On abnormal exit -> wait 5 seconds and restart (infinite loop)
    5. Save logs to logs/ folder
"""

import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# ================================================================
# Constants
# ================================================================

SCRIPT_DIR = Path(os.environ.get("SCRIPT_DIR", ".")).resolve()
INSTANCE_ID = int(os.environ.get("INSTANCE_ID", "1"))

PROMPT_FILE = SCRIPT_DIR / "CLAUDE_PROMPT.md"
LOG_DIR = SCRIPT_DIR / "logs"

RESTART_DELAY = 5
SESSION_TIMEOUT = int(os.environ.get("SESSION_TIMEOUT", "3600"))

# Claude command full path (hardcoded)
CLAUDE_CMD = r"C:\Users\Admin\AppData\Roaming\npm\claude.CMD"

# ================================================================
# Logging
# ================================================================

LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / f"instance_{INSTANCE_ID}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"


def log(level: str, msg: str) -> None:
    """Write to both console and log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] [INST-{INSTANCE_ID}] [{level}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


# ================================================================
# Auto-response patterns
# When a matching line appears in stdout, send the response to stdin
# ================================================================

AUTO_RESPONSES: list[tuple[str, str]] = [
    (r"(?i)(press enter|hit enter)",  "\n"),
    (r"(?i)\(yes/no\)",               "yes\n"),
    (r"(?i)\[y/n\]",                  "y\n"),
    (r"(?i)\(y/n\)",                  "y\n"),
    (r"(?i)do you want to continue",  "y\n"),
    (r"(?i)are you sure",             "y\n"),
    (r"(?i)proceed\?",                "y\n"),
    (r"(?i)continue\?",               "y\n"),
    (r"(?i)confirm",                  "y\n"),
    (r"(?i)overwrite",                "y\n"),
    (r"(?i)allow this action",        "y\n"),
    (r"(?i)approve",                  "y\n"),
    (r"(?i)permission",               "y\n"),
]

# Patterns that indicate PR creation is complete
PR_COMPLETE_PATTERNS = [
    r"(?i)pull request created",
    r"(?i)pr\s+.*created",
    r"(?i)github\.com/.+/pull/\d+",
    r"(?i)successfully created",
]


# ================================================================
# Single execution
# ================================================================

def run_once() -> int:
    """
    Run claude command once.

    Returns:
        0   : PR created (success)
        1   : Error (prompt missing, command not found, etc.)
        2   : Session timeout
        130 : Manual interrupt (Ctrl+C)
        other: claude command exit code (abnormal)
    """
    if not PROMPT_FILE.exists():
        log("ERROR", f"CLAUDE_PROMPT.md not found: {PROMPT_FILE}")
        return 1

    prompt = PROMPT_FILE.read_text(encoding="utf-8")
    if not prompt.strip():
        log("ERROR", "CLAUDE_PROMPT.md is empty")
        return 1

    log("INFO", f"Starting claude (timeout: {SESSION_TIMEOUT}s)")
    log("INFO", f"Claude path: {CLAUDE_CMD}")

    env = dict(os.environ)
    env["PROMPT_FILE"] = str(PROMPT_FILE)

    try:
        proc = subprocess.Popen(
            [CLAUDE_CMD, "--dangerously-skip-permissions", "-p", prompt],
            stdin=None,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=str(SCRIPT_DIR),
            env=env,
        )
    except FileNotFoundError:
        log("ERROR", "claude command not found. Check your PATH.")
        return 1

    start_time = time.time()

    try:
        for line in proc.stdout:
            stripped = line.rstrip("\n\r")

            # Print to console with instance prefix
            sys.stdout.write(f"[INST-{INSTANCE_ID}] {stripped}\n")
            sys.stdout.flush()

            # Write raw output to log file
            try:
                with open(LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(f"[OUTPUT] {stripped}\n")
            except OSError:
                pass

            # Timeout check
            if time.time() - start_time > SESSION_TIMEOUT:
                log("WARN", f"Session timeout ({SESSION_TIMEOUT}s exceeded)")
                proc.terminate()
                try:
                    proc.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    proc.kill()
                return 2

            # Check for PR creation completion
            for pattern in PR_COMPLETE_PATTERNS:
                if re.search(pattern, line):
                    log("INFO", f"PR creation detected: {stripped[:80]}")
                    proc.terminate()
                    try:
                        proc.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                    return 0

            # Log detected prompts (stdin is closed; AutoHotkey handles interactive approval)
            for pattern, response in AUTO_RESPONSES:
                if re.search(pattern, line):
                    log("INFO", f"Detected prompt (handled by AHK): {stripped[:60]}")
                    break

    except KeyboardInterrupt:
        log("WARN", "Ctrl+C detected - stopping process")
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
        return 130

    proc.wait()
    exit_code = proc.returncode
    log("INFO", f"claude exited (code={exit_code})")
    return exit_code


# ================================================================
# Main loop (infinite restart on failure)
# ================================================================

def main() -> None:
    log("INFO", "=" * 50)
    log("INFO", f"Full auto loop started (instance #{INSTANCE_ID})")
    log("INFO", f"  Working dir: {SCRIPT_DIR}")
    log("INFO", f"  Prompt file: {PROMPT_FILE}")
    log("INFO", f"  Log file:    {LOG_FILE}")
    log("INFO", "=" * 50)

    restart_count = 0

    while True:
        restart_count += 1
        log("INFO", f"--- Run #{restart_count} ---")

        exit_code = run_once()

        if exit_code == 0:
            log("INFO", "PR created successfully! Exiting.")
            break
        elif exit_code == 130:
            log("WARN", "Manual interrupt (Ctrl+C) - exiting loop")
            break
        elif exit_code == 2:
            log("WARN", "Timeout - restarting in 2s...")
            time.sleep(2)
        else:
            log("WARN", f"Abnormal exit (code={exit_code}) - restarting in {RESTART_DELAY}s")
            time.sleep(RESTART_DELAY)

    log("INFO", f"Instance #{INSTANCE_ID} finished (total runs: {restart_count})")


if __name__ == "__main__":
    main()
