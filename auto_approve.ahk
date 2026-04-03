; ═══════════════════════════════════════════════════════════
; auto_approve.ahk — Claude Code 全自動承認（完全版）
; AutoHotkey v2 対応
; ═══════════════════════════════════════════════════════════

#Requires AutoHotkey v2.0
#SingleInstance Force
SetTitleMatchMode 2

; ── 定期チェック（500ms間隔） ────────────────────────────
SetTimer(CheckAndApprove, 500)

CheckAndApprove() {
    ; PowerShell / ターミナルウィンドウ対象
    targetTitles := [
        "フルオート",
        "PowerShell",
        "Windows PowerShell",
        "Claude",
        "cmd"
    ]

    ; 承認パターン（画面に表示されたら自動でEnterまたはy）
    approvePatterns := [
        "Do you want to continue",
        "続行しますか",
        "Press Enter",
        "エンターを押",
        "Allow this action",
        "許可しますか",
        "Are you sure",
        "よろしいですか",
        "Proceed?",
        "Continue?",
        "(y/n)",
        "(Y/N)",
        "[y/n]",
        "[Y/N]",
        "yes/no",
        "Overwrite",
        "上書き",
        "Confirm",
        "確認",
    ]

    for title in targetTitles {
        hwnd := WinExist("ahk_title " . title)
        if hwnd {
            ; ウィンドウのテキストを取得して確認プロンプトをチェック
            try {
                winText := WinGetText("ahk_id " . hwnd)
                for pattern in approvePatterns {
                    if InStr(winText, pattern) {
                        ; フォーカスを当てて Enter 送信
                        WinActivate("ahk_id " . hwnd)
                        Sleep(100)
                        Send("{Enter}")
                        Sleep(200)
                        break
                    }
                }
            } catch {
                ; エラーは無視して継続
            }
        }
    }
}

; ── トレイアイコン設定 ───────────────────────────────────
TraySetIcon("shell32.dll", 18)
A_TrayMenu.Delete()
A_TrayMenu.Add("フルオート自動承認 実行中", (*) => {})
A_TrayMenu.Add("終了", (*) => ExitApp())
A_TrayMenu.Default := "フルオート自動承認 実行中"

; ツールチップ表示（起動確認用）
ToolTip("✅ 自動承認スクリプト起動完了")
Sleep(2000)
ToolTip()
