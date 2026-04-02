# ═══════════════════════════════════════════════════════════
# start_all.ps1 — 全システム一括起動スクリプト（Windows）
# 使用: PowerShellで .\start_all.ps1
# ═══════════════════════════════════════════════════════════

param(
    [string]$Requirement = "",
    [switch]$SkipAutoHotkey = $false,
    [switch]$SkipVoice = $false
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ── カラー出力 ───────────────────────────────────────────
function Write-Step { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }

Write-Host @"

╔═══════════════════════════════════════════╗
║   🤖 フルオート開発システム 起動           ║
║   Claude Code + CrewAI + 音声AI           ║
╚═══════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# ── .env読み込み ─────────────────────────────────────────
Write-Step ".env 読み込み"
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)\s*$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
    Write-OK ".env 読み込み完了"
} else {
    Write-Fail ".env が見つかりません。cp .env.example .env を実行してください"
    exit 1
}

# ── Python確認 ───────────────────────────────────────────
Write-Step "Python確認"
try {
    $pythonVersion = python --version 2>&1
    Write-OK "Python: $pythonVersion"
} catch {
    Write-Fail "Pythonが見つかりません。https://python.org からインストールしてください"
    exit 1
}

# ── 依存関係インストール ──────────────────────────────────
Write-Step "依存関係インストール"
python -m pip install -q crewai langchain-anthropic python-dotenv crewai-tools 2>&1 | Out-Null
Write-OK "依存関係インストール完了"

# ── AutoHotkey起動 ───────────────────────────────────────
if (-not $SkipAutoHotkey) {
    Write-Step "AutoHotkey 自動応答スクリプト起動"
    $ahkPath = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"
    $ahkScript = Join-Path $ScriptDir "autohotkey_enter.ahk"

    if (Test-Path $ahkPath) {
        if (Test-Path $ahkScript) {
            Start-Process $ahkPath -ArgumentList $ahkScript -WindowStyle Hidden
            Write-OK "AutoHotkey 起動完了（トレイに表示）"
        } else {
            Write-Warn "autohotkey_enter.ahk が見つかりません"
        }
    } else {
        Write-Warn "AutoHotkeyが未インストールです"
        Write-Warn "https://www.autohotkey.com/ からインストールしてください"
    }
}

# ── 接続テスト ───────────────────────────────────────────
Write-Step "接続テスト"
python tool_bridge.py test 2>&1 | Out-Null
Write-OK "tool_bridge 接続テスト完了"

# ── 音声起動通知 ─────────────────────────────────────────
if (-not $SkipVoice) {
    Write-Step "起動音声通知"
    python voice_agent.py notify start --details "全システムが起動しました。" 2>&1 | Out-Null
    Write-OK "音声通知送信完了"
}

# ── 開発要件の入力 ───────────────────────────────────────
if ($Requirement -eq "") {
    Write-Host "`n" -NoNewline
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
    $Requirement = Read-Host "📝 開発要件を入力してください（例: ブリーダー向け犬販売管理アプリ）"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
}

if ($Requirement -eq "") {
    Write-Warn "要件が入力されませんでした。CrewAIは起動しません。"
    Write-OK "Claude Codeのみ起動します"
} else {
    # ── CrewAI起動（別ウィンドウ） ───────────────────────
    Write-Step "CrewAI AIチーム起動"
    $crewArgs = "crew_config.py `"$Requirement`""
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "python $crewArgs" -WindowStyle Normal
    Write-OK "CrewAI 起動完了（別ウィンドウで実行中）"
}

# ── Claude Code起動（メインウィンドウ） ──────────────────
Write-Step "Claude Code 起動（bypass permissions モード）"
Write-Host "`n以下のプロンプトをClaude Codeに貼り付けてください:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan
Write-Host @"
要件: $Requirement

以下を全て実行せよ。省略禁止・確認待ち禁止:
1. docs/specification.md を読み込む
2. docs/architecture.md を読み込む
3. 設計に従い完全実装する（テストコード込み）
4. git add -A && git commit && git push
5. gh pr create でPR作成
6. python3 tool_bridge.py notify --title '✅ 実装完了' --body '$Requirement の実装が完了しました'
"@ -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkCyan

claude --dangerously-skip-permissions


# ═══════════════════════════════════════════════════════════
# .env 追記内容
# 以下を .env ファイルに追加してください
# ═══════════════════════════════════════════════════════════

<#
# ── Anthropic APIキー ────────────────────────────────────
ANTHROPIC_API_KEY_MAIN=sk-ant-api03-ここに「claude-code-main」のキーを貼る
ANTHROPIC_API_KEY_CREWAI=sk-ant-api03-ここに「完全自動」のキーを貼る
ANTHROPIC_API_KEY_TOOL=sk-ant-api03-ここに「フルオート」のキーを貼る

# ── 通知（設定済み） ─────────────────────────────────────
NTFY_TOPIC=breeder-dev-nana-2026

# ── ElevenLabs音声AI ─────────────────────────────────────
# 取得先: https://elevenlabs.io/ → Profile → API Key
ELEVENLABS_API_KEY=ここにElevenLabsのAPIキーを貼る
# 音声ID（空欄でデフォルト日本語音声を使用）
ELEVENLABS_VOICE_ID=

# ── GitHub ───────────────────────────────────────────────
GITHUB_TOKEN=ここにGitHubのPersonal Access Tokenを貼る

# ── プロジェクト設定 ─────────────────────────────────────
PROMPT_FILE=./CLAUDE_PROMPT.md
PROJECT_DIR=.
SESSION_TIMEOUT=3600
AUDIT_LOG=./audit_log.json
#>
