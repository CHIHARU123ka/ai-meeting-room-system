#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# auto_run.sh — Claude Code 自動応答・無限再起動ループ
# 使用前: chmod +x auto_run.sh && cp .env.example .env
# ═══════════════════════════════════════════════════════════

set -euo pipefail

# ── 設定 ────────────────────────────────────────────────
PROMPT_FILE="${PROMPT_FILE:-./CLAUDE_PROMPT.md}"
LOG_DIR="./logs"
LOG_FILE="${LOG_DIR}/auto_run_$(date +%Y%m%d).log"
MAX_RESTARTS=50
RESTART_INTERVAL=5       # 秒
NOTIFY_SCRIPT="./tool_bridge.py"
SESSION_TIMEOUT=3600     # 1時間でセッション強制リセット

mkdir -p "$LOG_DIR"

# ── ユーティリティ ───────────────────────────────────────
log() {
  local level="$1"; shift
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

notify() {
  local title="$1"
  local body="$2"
  local priority="${3:-default}"
  python3 "$NOTIFY_SCRIPT" notify \
    --title "$title" \
    --body "$body" \
    --priority "$priority" 2>/dev/null || true
}

check_dependencies() {
  local missing=()
  for cmd in claude git gh python3; do
    command -v "$cmd" &>/dev/null || missing+=("$cmd")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    log ERROR "必須コマンドが不足: ${missing[*]}"
    log ERROR "brew install ${missing[*]} などでインストールしてください"
    exit 1
  fi
}

# ── Python expect 代替（stdin自動応答）─────────────────────
run_claude_with_autoresponse() {
  local prompt_content
  prompt_content=$(cat "$PROMPT_FILE")

  python3 - <<'PYEOF'
import subprocess
import sys
import os
import time
import re

PROMPT_FILE = os.environ.get("PROMPT_FILE", "./CLAUDE_PROMPT.md")
with open(PROMPT_FILE, "r") as f:
    prompt = f.read()

# 自動応答パターン定義
AUTO_RESPONSES = [
    # パターン                     応答
    (r"(?i)(press enter|hit enter)",     "\n"),
    (r"(?i)do you want to continue",     "y\n"),
    (r"(?i)\[y/n\]",                     "y\n"),
    (r"(?i)allow this action",           "y\n"),
    (r"(?i)permission",                  "y\n"),
    (r"(?i)are you sure",                "y\n"),
    (r"(?i)\(yes/no\)",                  "yes\n"),
    (r"(?i)proceed\?",                   "y\n"),
    (r"(?i)overwrite",                   "y\n"),
    (r"(?i)continue\?",                  "y\n"),
]

proc = subprocess.Popen(
    ["claude", "--dangerously-skip-permissions", "-p", prompt],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
)

output_buffer = ""
start_time = time.time()
SESSION_TIMEOUT = int(os.environ.get("SESSION_TIMEOUT", "3600"))

try:
    for line in proc.stdout:
        sys.stdout.write(line)
        sys.stdout.flush()
        output_buffer += line

        # タイムアウトチェック
        if time.time() - start_time > SESSION_TIMEOUT:
            print("\n[AUTO_RUN] セッションタイムアウト — 強制終了して再起動します")
            proc.terminate()
            sys.exit(2)

        # 自動応答チェック
        for pattern, response in AUTO_RESPONSES:
            if re.search(pattern, line):
                try:
                    proc.stdin.write(response)
                    proc.stdin.flush()
                    print(f"[AUTO_RESPONSE] パターン検出: '{line.strip()}' → '{response.strip()}'")
                except BrokenPipeError:
                    pass
                break

        # PR作成完了検出
        if re.search(r"(?i)(pull request created|pr.*created|github\.com.*pull)", line):
            print("[AUTO_RUN] ✅ PR作成完了を検出")
            sys.exit(0)

except KeyboardInterrupt:
    proc.terminate()
    sys.exit(130)

proc.wait()
sys.exit(proc.returncode)
PYEOF
}

# ── Git自動コミット ──────────────────────────────────────
auto_commit_progress() {
  cd "${PROJECT_DIR:-.}"
  if git diff --quiet && git diff --staged --quiet; then
    log INFO "コミットする変更なし"
    return 0
  fi
  git add -A
  git commit -m "chore: [AUTO] 進捗自動保存 $(date '+%Y-%m-%d %H:%M:%S')" \
    --allow-empty 2>/dev/null || true
  git push origin HEAD 2>/dev/null || true
  log INFO "進捗をGitHubへ自動プッシュ完了"
}

# ── メインループ ─────────────────────────────────────────
main() {
  check_dependencies

  if [[ ! -f "$PROMPT_FILE" ]]; then
    log ERROR "プロンプトファイルが見つかりません: $PROMPT_FILE"
    log ERROR "CLAUDE_PROMPT.md を作成してから再実行してください"
    exit 1
  fi

  log INFO "═══ フルオート開発パイプライン 起動 ═══"
  log INFO "プロンプト: $PROMPT_FILE"
  log INFO "最大再起動: ${MAX_RESTARTS}回"
  notify "🚀 開発開始" "auto_run.sh が起動しました。監視を開始します。" "default"

  local restart_count=0
  local exit_code=0

  while [[ $restart_count -lt $MAX_RESTARTS ]]; do
    log INFO "─── 起動 #$((restart_count + 1)) / ${MAX_RESTARTS} ───"

    set +e
    run_claude_with_autoresponse
    exit_code=$?
    set -e

    case $exit_code in
      0)
        log INFO "✅ Claude Code が正常終了（PR作成完了）"
        auto_commit_progress
        notify "✅ 開発完了" "PR作成まで到達しました！GitHubを確認してください。" "high"
        exit 0
        ;;
      130)
        log WARN "⚠️  手動中断（Ctrl+C）を検出"
        notify "⚠️ 手動中断" "Ctrl+Cで中断されました。" "high"
        exit 130
        ;;
      2)
        log WARN "🔄 セッションタイムアウト — 再起動します"
        auto_commit_progress
        ;;
      *)
        log WARN "❌ 異常終了 (exit: $exit_code) — ${RESTART_INTERVAL}秒後に再起動"
        auto_commit_progress
        sleep "$RESTART_INTERVAL"
        ;;
    esac

    restart_count=$((restart_count + 1))

    if [[ $restart_count -ge $MAX_RESTARTS ]]; then
      log ERROR "最大再起動回数(${MAX_RESTARTS})に到達。手動確認が必要です。"
      notify "🚨 要確認" \
        "再起動が${MAX_RESTARTS}回に達しました。ログを確認してください: ${LOG_FILE}" \
        "urgent"
      exit 1
    fi
  done
}

main "$@"
