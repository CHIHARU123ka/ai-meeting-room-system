; ═══════════════════════════════════════════════════════════
; autohotkey_enter.ahk — Claude Code 自動応答スクリプト
; 使用: AutoHotkeyをインストール後、このファイルをダブルクリック
; ダウンロード: https://www.autohotkey.com/
; ═══════════════════════════════════════════════════════════

#Requires AutoHotkey v2.0
#SingleInstance Force

; ── 設定 ────────────────────────────────────────────────
CHECK_INTERVAL := 1000  ; チェック間隔（ミリ秒）
TARGET_PROCESS := "claude.exe"
LOG_FILE := A_ScriptDir . "\ahk_log.txt"

; ── 自動応答パターン ─────────────────────────────────────
; Claude Codeが表示するプロンプトに自動応答する
PATTERNS := [
    "Press Enter to continue",
    "Do you want to continue",
    "Allow this action",
    "Yes/No",
    "y/n",
    "Proceed?",
    "Are you sure",
    "Overwrite?",
    "Continue?",
]

; ── ログ関数 ─────────────────────────────────────────────
WriteLog(msg) {
    timestamp := FormatTime(, "yyyy-MM-dd HH:mm:ss")
    FileAppend("[" . timestamp . "] " . msg . "`n", LOG_FILE)
}

; ── トレイアイコン設定 ───────────────────────────────────
TraySetIcon("shell32.dll", 25)
A_TrayMenu.Delete()
A_TrayMenu.Add("🤖 Claude自動応答 稼働中", (*) => {})
A_TrayMenu.Add("ログを開く", (*) => Run(LOG_FILE))
A_TrayMenu.Add("終了", (*) => ExitApp())
A_TrayMenu.Default := "🤖 Claude自動応答 稼働中"

WriteLog("AutoHotkey 自動応答スクリプト起動")

; ── メインループ ─────────────────────────────────────────
SetTimer(CheckClaudeWindow, CHECK_INTERVAL)

CheckClaudeWindow() {
    global PATTERNS, TARGET_PROCESS

    ; Claudeのウィンドウを探す
    if !WinExist("ahk_exe " . TARGET_PROCESS) {
        return
    }

    ; ウィンドウのテキストを取得
    windowText := WinGetText("ahk_exe " . TARGET_PROCESS)

    ; パターンマッチング
    for pattern in PATTERNS {
        if InStr(windowText, pattern, false) {
            WriteLog("パターン検出: " . pattern . " → Enter送信")
            WinActivate("ahk_exe " . TARGET_PROCESS)
            Sleep(200)
            Send("{Enter}")
            Sleep(500)
            return
        }
    }
}

; ── ホットキー ───────────────────────────────────────────
; Ctrl+Shift+P: 一時停止/再開
^+p:: {
    static paused := false
    if paused {
        SetTimer(CheckClaudeWindow, CHECK_INTERVAL)
        paused := false
        TrayTip("Claude自動応答", "再開しました", 1)
        WriteLog("自動応答 再開")
    } else {
        SetTimer(CheckClaudeWindow, 0)
        paused := true
        TrayTip("Claude自動応答", "一時停止しました", 1)
        WriteLog("自動応答 一時停止")
    }
}

; Ctrl+Shift+Q: 終了
^+q:: {
    WriteLog("AutoHotkey スクリプト終了")
    ExitApp()
}
