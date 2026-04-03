# start_all.ps1 - Full Auto System Launcher
# Usage:
#   .\start_all.ps1 -Requirement "Build a web app"
#   .\start_all.ps1 -Instances 3
#   .\start_all.ps1 -SkipAutoHotkey -SkipCrewAI

param(
    [string]$Requirement = "",
    [int]$Instances = 1,
    [switch]$SkipAutoHotkey,
    [switch]$SkipVoice,
    [switch]$SkipCrewAI
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

function Write-Step { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }

Clear-Host
Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  Full Auto System - Launcher                  " -ForegroundColor Magenta
Write-Host "  Claude Code + CrewAI + Gemini + Voice AI     " -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta

# ── 1. Load .env ──────────────────────────────────────────
Write-Step "Loading .env"
$envFile = Join-Path $ScriptDir ".env"
if (Test-Path $envFile) {
    Get-Content $envFile -Encoding UTF8 | ForEach-Object {
        if ($_ -match "^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
        }
    }
    Write-OK ".env loaded"
} else {
    Write-Fail ".env not found ($envFile)"
    exit 1
}

# ── 2. Check API keys ────────────────────────────────────
Write-Step "Checking API keys"
$anthropicKey = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY_MAIN", "Process")
$geminiKey    = [System.Environment]::GetEnvironmentVariable("GOOGLE_AI_STUDIO_API_KEY", "Process")
$elevenKey    = [System.Environment]::GetEnvironmentVariable("ELEVENLABS_API_KEY", "Process")

if ($anthropicKey) { Write-OK "ANTHROPIC_API_KEY_MAIN: set" } else { Write-Warn "ANTHROPIC_API_KEY_MAIN: not set" }
if ($geminiKey)    { Write-OK "GOOGLE_AI_STUDIO_API_KEY: set" } else { Write-Warn "GOOGLE_AI_STUDIO_API_KEY: not set" }
if ($elevenKey)    { Write-OK "ELEVENLABS_API_KEY: set" } else { Write-Warn "ELEVENLABS_API_KEY: not set (voice disabled)" }

# ── 3. Check Python ──────────────────────────────────────
Write-Step "Checking Python"
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonCmd = $cmd
            Write-OK "Python: $ver ($cmd)"
            break
        }
    } catch {}
}
if (-not $pythonCmd) {
    Write-Fail "Python not found. Please install Python."
    exit 1
}

# ── 4. Start AutoHotkey ──────────────────────────────────
if (-not $SkipAutoHotkey) {
    Write-Step "Starting AutoHotkey"
    $ahkPaths = @(
        "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
        "C:\Program Files\AutoHotkey\v2\AutoHotkey32.exe",
        "C:\Program Files\AutoHotkey\AutoHotkey.exe",
        "C:\Program Files (x86)\AutoHotkey\AutoHotkey.exe"
    )
    $ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    $ahkScript = Join-Path $ScriptDir "auto_approve.ahk"
    if ($ahkExe -and (Test-Path $ahkScript)) {
        Get-Process | Where-Object { $_.Name -like "*AutoHotkey*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Start-Process $ahkExe -ArgumentList $ahkScript -WindowStyle Hidden
        Write-OK "AutoHotkey started"
    } else {
        Write-Warn "AutoHotkey not installed or auto_approve.ahk not found"
    }
} else {
    Write-Step "AutoHotkey skipped (-SkipAutoHotkey)"
}

# ── 5. Requirement input ─────────────────────────────────
if ($Requirement -eq "") {
    Write-Host ""
    $Requirement = Read-Host "Enter development requirement"
}
if ($Requirement -eq "") {
    Write-Fail "No requirement provided. Exiting."
    exit 1
}
Write-Host ""
Write-Host "  Requirement: $Requirement" -ForegroundColor White
Write-Host "  Instances: $Instances" -ForegroundColor White

# ── 6. Start CrewAI ──────────────────────────────────────
if (-not $SkipCrewAI) {
    Write-Step "Starting CrewAI"
    $crewScript = Join-Path $ScriptDir "crew_config.py"
    if (Test-Path $crewScript) {
        $safeReq = $Requirement -replace '"', '\"'
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir'; $pythonCmd '$crewScript' `"$safeReq`"" -WindowStyle Normal
        Write-OK "CrewAI started (new window)"
        Start-Sleep -Seconds 3
    } else {
        Write-Warn "crew_config.py not found - skipping CrewAI"
    }
} else {
    Write-Step "CrewAI skipped (-SkipCrewAI)"
}

# ── 7. Generate CLAUDE_PROMPT.md ─────────────────────────
Write-Step "Generating CLAUDE_PROMPT.md"
$promptPath = Join-Path $ScriptDir "CLAUDE_PROMPT.md"
$nl = "`n"
$promptContent = "# Full Auto Development Instructions" + $nl
$promptContent += "" + $nl
$promptContent += "## Requirement" + $nl
$promptContent += $Requirement + $nl
$promptContent += "" + $nl
$promptContent += "## Execution Steps (no pausing, no confirmation, fully automated)" + $nl
$promptContent += "" + $nl
$promptContent += "1. Read docs/specification.md if it exists (skip if not)" + $nl
$promptContent += "2. Read docs/architecture.md if it exists (skip if not)" + $nl
$promptContent += "3. Implement fully based on the requirement (include tests)" + $nl
$promptContent += "4. git add -A to stage all changes" + $nl
$promptContent += "5. git commit" + $nl
$promptContent += "6. git push origin HEAD" + $nl
$promptContent += "7. gh pr create to open a pull request" + $nl
$promptContent += "" + $nl
$promptContent += "## Strict Rules" + $nl
$promptContent += "- Never stop midway" + $nl
$promptContent += "- Never ask for confirmation" + $nl
$promptContent += "- Complete all steps from start to finish" + $nl
$promptContent += "- Self-repair on errors and continue" + $nl
$promptContent += "- Must reach PR creation" + $nl
[System.IO.File]::WriteAllText($promptPath, $promptContent, (New-Object System.Text.UTF8Encoding $false))
Write-OK "CLAUDE_PROMPT.md generated"

# ── 8. Voice notification (optional) ─────────────────────
if ((-not $SkipVoice) -and $elevenKey) {
    $voiceScript = Join-Path $ScriptDir "voice_agent.py"
    if (Test-Path $voiceScript) {
        Write-Step "Sending voice notification"
        & $pythonCmd $voiceScript notify start --details "Full auto system started." 2>&1 | Out-Null
        Write-OK "Voice notification sent"
    }
}

# ── 9. Launch fullauto_loop.py instances ──────────────────
$loopScript = Join-Path $ScriptDir "fullauto_loop.py"
if (-not (Test-Path $loopScript)) {
    Write-Fail "fullauto_loop.py not found: $loopScript"
    exit 1
}

$logDir = Join-Path $ScriptDir "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Write-Step "Launching $Instances fullauto instance(s)"
for ($i = 1; $i -le $Instances; $i++) {
    $cmd = "`$host.UI.RawUI.WindowTitle = 'FullAuto #$i'; "
    $cmd += "`$env:SCRIPT_DIR = '$ScriptDir'; "
    $cmd += "`$env:INSTANCE_ID = '$i'; "
    $cmd += "Set-Location '$ScriptDir'; "
    $cmd += "$pythonCmd fullauto_loop.py"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
    Write-OK "Instance #$i launched"
    if ($i -lt $Instances) { Start-Sleep -Seconds 2 }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  All systems launched!                        " -ForegroundColor Green
Write-Host "  Instances: $Instances                        " -ForegroundColor Green
Write-Host "  Logs: logs/ folder                           " -ForegroundColor Green
Write-Host "  Stop: close windows or Ctrl+C                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
