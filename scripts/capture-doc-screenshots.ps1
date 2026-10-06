<#
.SYNOPSIS
  Capture FYP documentation screenshots from a running Mini Abdullah Android app via adb.

.DESCRIPTION
  Interactive workflow: for each of 35 screens you navigate (or use the DEV DOC overlay),
  then press Enter to save PNG into documentation/screenshots/.

  Prerequisites:
    - USB debugging phone OR emulator with Mini Abdullah installed and running
    - adb on PATH (Android SDK platform-tools)
    - Same Wi‑Fi/backend as needed for Home/Chat/Tutor live data (optional for most UI)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/capture-doc-screenshots.ps1
#>

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutDir = Join-Path $Root "documentation\screenshots"
$ReportPath = Join-Path $Root "documentation\screenshots\CAPTURE_REPORT.txt"
$Adb = $null

function Find-Adb {
  $cmd = Get-Command adb -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidate = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
  if (Test-Path $candidate) { return $candidate }
  return $null
}

function Assert-Device {
  $lines = & $Adb devices | Where-Object { $_ -match "`tdevice$" }
  if (-not $lines) {
    throw "No adb device in 'device' state. Connect a phone/emulator and allow USB debugging."
  }
  Write-Host "Device(s):" -ForegroundColor Green
  $lines | ForEach-Object { Write-Host "  $_" }
}

function Capture-Png([string]$FileName) {
  $dest = Join-Path $OutDir $FileName
  # exec-out avoids CRLF corruption on Windows
  & $Adb exec-out screencap -p > $dest
  # PowerShell redirect can corrupt PNG on some hosts — prefer cmd.exe binary redirect
  if ((Get-Item $dest).Length -lt 5000) {
    Remove-Item $dest -Force -ErrorAction SilentlyContinue
    cmd /c "`"$Adb`" exec-out screencap -p > `"$dest`""
  }
  $len = (Get-Item $dest).Length
  if ($len -lt 5000) {
    throw "Capture looks empty/corrupt ($len bytes): $dest"
  }
  return $dest
}

$Shots = @(
  @{ File = "01_splash.png"; Title = "Splash"; Path = "Cold start app (or DOC jump screen 1). Capture within ~1s before auto-advance." }
  @{ File = "02_onboarding.png"; Title = "Onboarding"; Path = "First launch / DOC jump screen 2. Prefer step 1 (Learning Journey)." }
  @{ File = "03_welcome.png"; Title = "Welcome"; Path = "Skip onboarding or DOC jump screen 3." }
  @{ File = "04_signup.png"; Title = "Signup"; Path = "Welcome → Signup (screen 4)." }
  @{ File = "05_gender.png"; Title = "Gender"; Path = "Complete signup → Gender (screen 22), or DOC jump 05." }
  @{ File = "06_avatar.png"; Title = "Avatar"; Path = "Gender → Continue (screen 23). Pick boy/girl avatars visible." }
  @{ File = "07_success.png"; Title = "Success"; Path = "Finish avatar → Success (screen 9)." }
  @{ File = "08_login.png"; Title = "Login"; Path = "Welcome → Login (screen 5)." }
  @{ File = "09_forgot_password.png"; Title = "Forgot Password"; Path = "Login → Forgot password (screen 6)." }
  @{ File = "10_otp.png"; Title = "OTP"; Path = "Submit email on Forgot → OTP (screen 7). DEV OTP may show in UI/console." }
  @{ File = "11_reset_password.png"; Title = "Reset Password"; Path = "Verify OTP → Reset password (screen 8)." }
  @{ File = "12_home.png"; Title = "Home"; Path = "Login successfully → Home (screen 10). Backend optional for cards." }
  @{ File = "13_quran_hub.png"; Title = "Quran Hub"; Path = "Home → Quran card (screen 11)." }
  @{ File = "14_noorani_qaida.png"; Title = "Noorani Qaida"; Path = "Quran Hub → Noorani Qaida." }
  @{ File = "15_tajweed.png"; Title = "Tajweed"; Path = "Back to Hub → Tajweed." }
  @{ File = "16_read_quran_para.png"; Title = "Read Quran Para"; Path = "Hub → Read Quran → ensure Para tab selected." }
  @{ File = "17_read_quran_surah.png"; Title = "Read Quran Surahs"; Path = "Same screen → tap Surahs tab." }
  @{ File = "18_ayah_recitation.png"; Title = "Ayah list"; Path = "Open any Para or Surah → ayah list visible." }
  @{ File = "19_quran_words.png"; Title = "Quran Words"; Path = "Back to Quran Hub → Quran Words." }
  @{ File = "20_daily_surahs.png"; Title = "Daily Surahs"; Path = "Quran Hub → Daily Surahs." }
  @{ File = "21_salah_list.png"; Title = "Salah list"; Path = "Home → Salah (screen 12)." }
  @{ File = "22_salah_detail.png"; Title = "Salah detail"; Path = "Tap any Salah step." }
  @{ File = "23_daily_sunnah.png"; Title = "Daily Sunnah"; Path = "Home → Daily Sunnah (screen 13)." }
  @{ File = "24_islamic_shorts.png"; Title = "Islamic Shorts"; Path = "Home → Stories/Shorts (screen 14)." }
  @{ File = "25_duas_grid.png"; Title = "Duas grid"; Path = "Home → Duas (screen 15)." }
  @{ File = "26_dua_detail.png"; Title = "Dua detail"; Path = "Open any dua card." }
  @{ File = "27_names_of_allah.png"; Title = "Names of Allah"; Path = "Home → Names of Allah (screen 16)." }
  @{ File = "28_games_hub.png"; Title = "Games Hub"; Path = "Home → Games (screen 18)." }
  @{ File = "29_game_play.png"; Title = "Game play"; Path = "Games Hub → Word Search (or any game) in play state." }
  @{ File = "30_chatbot.png"; Title = "Chatbot"; Path = "Home → Chatbot (screen 17). Gemini optional." }
  @{ File = "31_talking_abdullah.png"; Title = "Talking Abdullah"; Path = "Home → Talking Abdullah (screen 20)." }
  @{ File = "32_tutor_hub.png"; Title = "Tutor hub"; Path = "Home → Tutor (screen 21)." }
  @{ File = "33_tutor_booking.png"; Title = "Tutor booking"; Path = "Tutor hub → select a tutor (booking view)." }
  @{ File = "34_tutor_appointments.png"; Title = "Tutor appointments"; Path = "Tutor hub → My appointments." }
  @{ File = "35_profile.png"; Title = "Profile"; Path = "Home → Profile (screen 19)." }
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$Adb = Find-Adb
if (-not $Adb) { throw "adb not found. Install Android platform-tools or add to PATH." }

Write-Host ""
Write-Host "Mini Abdullah — FYP screenshot capture" -ForegroundColor Cyan
Write-Host "Output: $OutDir"
Write-Host "adb:    $Adb"
Write-Host ""
Assert-Device
Write-Host ""
Write-Host "Optional: set src/dev/docCaptureConfig.ts DOC_CAPTURE_ENABLED = true, rebuild,"
Write-Host "then use the red DOC button to jump top-level screens."
Write-Host ""

$ok = @()
$fail = @()
$skip = @()

$start = Read-Host "Start from shot number 1-35 (default 1)"
$idx = 0
if ($start -match '^\d+$') {
  $n = [int]$start
  if ($n -ge 1 -and $n -le 35) { $idx = $n - 1 }
}

for ($i = $idx; $i -lt $Shots.Count; $i++) {
  $s = $Shots[$i]
  $num = $i + 1
  Write-Host ""
  Write-Host ("=" * 60) -ForegroundColor DarkCyan
  Write-Host ("[{0}/35] {1}" -f $num, $s.Title) -ForegroundColor Yellow
  Write-Host ("File: {0}" -f $s.File)
  Write-Host ("Nav:  {0}" -f $s.Path)
  Write-Host ""
  Write-Host "Actions: [Enter]=capture  S=skip  Q=quit" -ForegroundColor Gray
  $key = Read-Host "Ready"
  if ($key -match '^[Qq]') { break }
  if ($key -match '^[Ss]') {
    $skip += $s.File
    Write-Host "Skipped $($s.File)" -ForegroundColor DarkYellow
    continue
  }
  try {
    $path = Capture-Png $s.File
    $ok += $s.File
    Write-Host "Saved $path ($((Get-Item $path).Length) bytes)" -ForegroundColor Green
  } catch {
    $fail += "$($s.File): $($_.Exception.Message)"
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  }
}

$report = @()
$report += "Mini Abdullah screenshot capture report"
$report += "Time: $(Get-Date -Format o)"
$report += "OutDir: $OutDir"
$report += ""
$report += "SUCCESS ($($ok.Count)):"
$ok | ForEach-Object { $report += "  OK  $_" }
$report += ""
$report += "SKIPPED ($($skip.Count)):"
$skip | ForEach-Object { $report += "  SKIP $_" }
$report += ""
$report += "FAILED ($($fail.Count)):"
$fail | ForEach-Object { $report += "  FAIL $_" }
$report += ""
$report += "Missing expected files:"
foreach ($s in $Shots) {
  $p = Join-Path $OutDir $s.File
  if (-not (Test-Path $p)) { $report += "  MISSING $($s.File)" }
}

$report | Set-Content -Path $ReportPath -Encoding UTF8
Write-Host ""
Write-Host "Report: $ReportPath" -ForegroundColor Cyan
Write-Host "Done. Success=$($ok.Count) Skip=$($skip.Count) Fail=$($fail.Count)"
