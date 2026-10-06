# Resume capture for missing screens only (no app code changes).
$ErrorActionPreference = "Continue"
$Root = "D:\FYP\MINIABDULLAH"
$OutDir = Join-Path $Root "documentation\screenshots"
$Adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$script:Miss = [System.Collections.Generic.List[string]]::new()
$script:Ok = [System.Collections.Generic.List[string]]::new()

function Wait-Device([int]$seconds = 30) {
  for ($i = 0; $i -lt $seconds; $i++) {
    $devs = & $Adb devices 2>$null | Where-Object { $_ -match "`tdevice$" }
    if (($devs | Measure-Object).Count -eq 1) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Ensure-Adb {
  if (-not (Wait-Device 3)) {
    & $Adb kill-server 2>$null | Out-Null
    Start-Sleep -Seconds 1
    & $Adb start-server 2>$null | Out-Null
    if (-not (Wait-Device 20)) { throw "No ADB device" }
  }
  & $Adb shell input keyevent 224 2>$null | Out-Null
  & $Adb shell svc power stayon true 2>$null | Out-Null
}

function Dump-Ui {
  Ensure-Adb
  & $Adb shell uiautomator dump /sdcard/uidump.xml 2>$null | Out-Null
  & $Adb pull /sdcard/uidump.xml "$OutDir\_uidump.xml" 2>$null | Out-Null
  if (Test-Path "$OutDir\_uidump.xml") { return (Get-Content "$OutDir\_uidump.xml" -Raw) }
  return ""
}

function Get-CenterFromBounds([string]$bounds) {
  if ($bounds -match '\[(\d+),(\d+)\]\[(\d+),(\d+)\]') {
    return @{ X = [int](([int]$Matches[1] + [int]$Matches[3]) / 2); Y = [int](([int]$Matches[2] + [int]$Matches[4]) / 2) }
  }
  return $null
}

function Find-Node([string]$xml, [string]$textExact) {
  $pat = 'text="' + [regex]::Escape($textExact) + '"[^>]*bounds="(\[[^\"]+\])"'
  $m = [regex]::Match($xml, $pat)
  if ($m.Success) { return Get-CenterFromBounds $m.Groups[1].Value }
  $pat2 = 'content-desc="' + [regex]::Escape($textExact) + '"[^>]*bounds="(\[[^\"]+\])"'
  $m2 = [regex]::Match($xml, $pat2)
  if ($m2.Success) { return Get-CenterFromBounds $m2.Groups[1].Value }
  $pat3 = 'text="([^"]*' + [regex]::Escape($textExact) + '[^"]*)"[^>]*bounds="(\[[^\"]+\])"'
  $m3 = [regex]::Match($xml, $pat3)
  if ($m3.Success) { return Get-CenterFromBounds $m3.Groups[2].Value }
  return $null
}

function Tap-Text([string]$text, [int]$waitMs = 1500) {
  $xml = Dump-Ui
  $pt = Find-Node $xml $text
  if (-not $pt) { Write-Host "  TAP MISS: $text" -ForegroundColor Yellow; return $false }
  & $Adb shell input tap $pt.X $pt.Y
  Start-Sleep -Milliseconds $waitMs
  return $true
}

function Tap-Text-Scroll([string]$text, [int]$maxScrolls = 6, [int]$waitMs = 1600) {
  for ($i = 0; $i -le $maxScrolls; $i++) {
    Ensure-Adb
    $xml = Dump-Ui
    $pt = Find-Node $xml $text
    if ($pt) {
      & $Adb shell input tap $pt.X $pt.Y
      Start-Sleep -Milliseconds $waitMs
      return $true
    }
    if ($i -lt $maxScrolls) {
      & $Adb shell input swipe 540 1700 540 850 320
      Start-Sleep -Milliseconds 450
    }
  }
  Write-Host "  TAP MISS (scroll): $text" -ForegroundColor Yellow
  return $false
}

function Capture([string]$file, [string]$name) {
  Ensure-Adb
  Start-Sleep -Milliseconds 500
  $dest = Join-Path $OutDir $file
  cmd /c "`"$Adb`" exec-out screencap -p > `"$dest`""
  $len = 0
  if (Test-Path $dest) { $len = (Get-Item $dest).Length }
  if ($len -lt 20000) {
    Write-Host "FAIL $file ($len)" -ForegroundColor Red
    return $false
  }
  $script:Ok.Add("$file|$name")
  Write-Host "OK   $file ($len) - $name" -ForegroundColor Green
  return $true
}

function Ui-Has([string]$needle) {
  $xml = Dump-Ui
  return ($xml -and $xml.Contains($needle))
}

function Go-Back([int]$times = 1) {
  for ($i = 0; $i -lt $times; $i++) {
    Ensure-Adb
    & $Adb shell input keyevent 4
    Start-Sleep -Milliseconds 550
  }
}

function Ensure-Home {
  for ($i = 0; $i -lt 10; $i++) {
    Ensure-Adb
    if ((Ui-Has "Assalamu Alaikum") -or ((Ui-Has "Daily Islamic Quote") -and (Ui-Has "Home"))) { return $true }
    if ((Ui-Has "Quran") -and (Ui-Has "Salah") -and (Ui-Has "Home")) { return $true }
    if (Ui-Has "I'm new to Mini Abdullah") { return $false }
    if (Ui-Has "Forgot Password") { return $false }
    Go-Back 1
  }
  Tap-Text "Home" 1200 | Out-Null
  return ((Ui-Has "Assalamu Alaikum") -or (Ui-Has "Daily Islamic Quote") -or (Ui-Has "Quran"))
}

function Open-From-Home([string]$label) {
  if (-not (Ensure-Home)) { return $false }
  & $Adb shell input swipe 540 900 540 1700 250
  Start-Sleep -Milliseconds 350
  return (Tap-Text-Scroll $label 7 1800)
}

function Has-Good([string]$file) {
  $p = Join-Path $OutDir $file
  return ((Test-Path $p) -and ((Get-Item $p).Length -gt 20000))
}

# cleanup empty fails
Get-ChildItem $OutDir -Filter "*.png" | Where-Object { $_.Length -lt 20000 -and $_.Name -match '^\d{2}_' } | Remove-Item -Force

Ensure-Adb
$devs = & $Adb devices | Where-Object { $_ -match "`tdevice$" }
Write-Host "Device: $devs"
& $Adb shell am start -n com.miniabdullah/.MainActivity | Out-Null
Start-Sleep -Seconds 2

$loggedIn = Ensure-Home
Write-Host "LoggedIn=$loggedIn"

if ($loggedIn) {
  if (-not (Has-Good "27_names_of_allah.png")) {
    if (Open-From-Home "Names of Allah") {
      Start-Sleep -Seconds 1; Capture "27_names_of_allah.png" "Names of Allah" | Out-Null; Go-Back 1
    } else { $script:Miss.Add("27_names_of_allah.png - not found") }
  }

  if (-not (Has-Good "28_games_hub.png")) {
    if (Open-From-Home "Games") {
      Start-Sleep -Seconds 1; Capture "28_games_hub.png" "Games Hub" | Out-Null
      if (-not (Has-Good "29_game_play.png")) {
        & $Adb shell input tap 540 1100
        Start-Sleep -Seconds 2
        Capture "29_game_play.png" "Game play / level select" | Out-Null
        Go-Back 1
      }
      Go-Back 1
    } else { $script:Miss.Add("28/29 games - not found") }
  }

  if (-not (Has-Good "30_chatbot.png")) {
    if (Open-From-Home "Chatbot") {
      Start-Sleep -Seconds 1; Capture "30_chatbot.png" "Chatbot" | Out-Null; Go-Back 1
    } else { $script:Miss.Add("30_chatbot.png - not found") }
  }

  if (-not (Has-Good "31_talking_abdullah.png")) {
    if (Ensure-Home) {
      $talkOk = (Tap-Text "Talk" 2000)
      if (-not $talkOk) { $talkOk = (Open-From-Home "Talking Abdullah") }
      if ($talkOk) {
        Start-Sleep -Seconds 1; Capture "31_talking_abdullah.png" "Talking Abdullah" | Out-Null; Go-Back 1
      } else { $script:Miss.Add("31_talking_abdullah.png - not found") }
    }
  }

  if (-not (Has-Good "32_tutor_hub.png")) {
    if (Ensure-Home -and (Tap-Text "Tutor" 2000)) {
      Start-Sleep -Seconds 2; Capture "32_tutor_hub.png" "Tutor hub" | Out-Null
      if (-not (Has-Good "33_tutor_booking.png")) {
        if (Tap-Text-Scroll "Book Session" 5 2000) {
          Start-Sleep -Seconds 1; Capture "33_tutor_booking.png" "Tutor booking" | Out-Null; Go-Back 1
        } else { $script:Miss.Add("33_tutor_booking.png - Book Session not found") }
      }
      if (-not (Has-Good "34_tutor_appointments.png")) {
        if (Tap-Text "My Appointments" 1800) {
          Start-Sleep -Seconds 1; Capture "34_tutor_appointments.png" "Tutor appointments" | Out-Null; Go-Back 1
        } else { $script:Miss.Add("34_tutor_appointments.png - My Appointments not found") }
      }
    } else { $script:Miss.Add("32_tutor_hub.png - Tutor tab not found") }
  }

  if (-not (Has-Good "35_profile.png")) {
    if (Tap-Text "Profile" 1800) {
      Start-Sleep -Seconds 1; Capture "35_profile.png" "Profile" | Out-Null
    } else { $script:Miss.Add("35_profile.png - Profile not found") }
  }
} else {
  Write-Host "Not on Home - will try auth path first" -ForegroundColor Yellow
}

# Auth screens
Write-Host "`n=== Auth ===" -ForegroundColor Cyan
Ensure-Adb

# If still logged in, logout
if (Ensure-Home -or (Ui-Has "Profile") -or (Ui-Has "Logout")) {
  if (-not (Ui-Has "Logout")) {
    Tap-Text "Profile" 1500 | Out-Null
    Start-Sleep -Milliseconds 700
  }
  if (Tap-Text-Scroll "Logout" 6 1200) {
    Start-Sleep -Milliseconds 500
    Tap-Text "Logout" 2000 | Out-Null
    Start-Sleep -Seconds 2
  }
}

if (-not (Has-Good "03_welcome.png")) {
  if ((Ui-Has "I'm new to Mini Abdullah") -or (Ui-Has "Islam essentials for kids")) {
    Capture "03_welcome.png" "Welcome" | Out-Null
  } else { $script:Miss.Add("03_welcome.png - not shown") }
}

if (-not (Has-Good "02_onboarding.png")) {
  if ((Ui-Has "Skip") -and ((Ui-Has "Learning") -or (Ui-Has "Fun") -or (Ui-Has "Friend"))) {
    Capture "02_onboarding.png" "Onboarding" | Out-Null
  } else { $script:Miss.Add("02_onboarding.png - already completed on device") }
}

if (-not (Has-Good "04_signup.png")) {
  if (-not (Ui-Has "I'm new to Mini Abdullah") -and (Ui-Has "Forgot Password")) {
    Go-Back 1
  }
  if (Tap-Text "I'm new to Mini Abdullah" 2000) {
    Start-Sleep -Seconds 1
    & $Adb shell input keyevent 4 | Out-Null # hide kb if any
    Start-Sleep -Milliseconds 400
    Capture "04_signup.png" "Signup" | Out-Null
    Go-Back 1
  } elseif (Tap-Text "New here? Create account" 2000) {
    Start-Sleep -Seconds 1
    Capture "04_signup.png" "Signup" | Out-Null
    Go-Back 1
  } else { $script:Miss.Add("04_signup.png - not reached") }
}

# Gender/Avatar/Success intentionally not forced
if (-not (Has-Good "05_gender.png")) { $script:Miss.Add("05_gender.png - requires completed signup (not entered)") }
if (-not (Has-Good "06_avatar.png")) { $script:Miss.Add("06_avatar.png - requires completed signup (not entered)") }
if (-not (Has-Good "07_success.png")) { $script:Miss.Add("07_success.png - requires completed signup (not entered)") }

if (-not (Has-Good "08_login.png")) {
  if (-not (Ui-Has "Forgot Password")) {
    if (Ui-Has "I already have an account") { Tap-Text "I already have an account" 2000 | Out-Null }
  }
  Start-Sleep -Seconds 1
  & $Adb shell input keyevent 4 | Out-Null
  Start-Sleep -Milliseconds 400
  if ((Ui-Has "Forgot Password") -or (Ui-Has "Login")) {
    Capture "08_login.png" "Login" | Out-Null
  } else { $script:Miss.Add("08_login.png - not reached") }
}

if (-not (Has-Good "09_forgot_password.png")) {
  & $Adb shell input keyevent 4 | Out-Null
  Start-Sleep -Milliseconds 300
  if (Tap-Text "Forgot Password?" 1800) {
    Start-Sleep -Seconds 1
    Capture "09_forgot_password.png" "Forgot Password" | Out-Null
  } else { $script:Miss.Add("09_forgot_password.png - link not found") }
}

if ((Has-Good "09_forgot_password.png") -and (-not (Has-Good "10_otp.png"))) {
  $xml = Dump-Ui
  if ($xml -match 'class="android.widget.EditText"[^>]*bounds="(\[[^\"]+\])"') {
    $pt = Get-CenterFromBounds $Matches[1]
    if ($pt) {
      & $Adb shell input tap $pt.X $pt.Y
      Start-Sleep -Milliseconds 250
      for ($i=0; $i -lt 40; $i++) { & $Adb shell input keyevent 67 | Out-Null }
      # use a likely account email - try from common test
      & $Adb shell input text "azhan@gmail.com"
      Start-Sleep -Milliseconds 400
      & $Adb shell input keyevent 4 | Out-Null
      if (Tap-Text "Send OTP" 2500) {
        Start-Sleep -Seconds 2
        if ((Ui-Has "OTP") -or (Ui-Has "digit") -or (Ui-Has "Verify") -or (Ui-Has "Resend")) {
          Capture "10_otp.png" "OTP Verification" | Out-Null
        } else { $script:Miss.Add("10_otp.png - OTP not shown after Send OTP") }
      }
    }
  }
  if (-not (Has-Good "10_otp.png")) {
    if (-not ($script:Miss | Where-Object { $_ -like "10_otp*" })) {
      $script:Miss.Add("10_otp.png - OTP screen not reached")
    }
  }
}

if (-not (Has-Good "11_reset_password.png")) {
  $script:Miss.Add("11_reset_password.png - requires verified OTP (not completed)")
}

# Rebuild full report
$expected = @(
  @{f="01_splash.png"; n="Splash"},
  @{f="02_onboarding.png"; n="Onboarding"},
  @{f="03_welcome.png"; n="Welcome"},
  @{f="04_signup.png"; n="Signup"},
  @{f="05_gender.png"; n="Gender selection"},
  @{f="06_avatar.png"; n="Avatar selection"},
  @{f="07_success.png"; n="Signup success"},
  @{f="08_login.png"; n="Login"},
  @{f="09_forgot_password.png"; n="Forgot Password"},
  @{f="10_otp.png"; n="OTP Verification"},
  @{f="11_reset_password.png"; n="Reset Password"},
  @{f="12_home.png"; n="Home"},
  @{f="13_quran_hub.png"; n="Quran Hub"},
  @{f="14_noorani_qaida.png"; n="Noorani Qaida"},
  @{f="15_tajweed.png"; n="Tajweed"},
  @{f="16_read_quran_para.png"; n="Read Quran (Para)"},
  @{f="17_read_quran_surah.png"; n="Read Quran (Surahs)"},
  @{f="18_ayah_recitation.png"; n="Ayah / Para recitation"},
  @{f="19_quran_words.png"; n="Common Quran Words"},
  @{f="20_daily_surahs.png"; n="Daily Surahs"},
  @{f="21_salah_list.png"; n="Salah list"},
  @{f="22_salah_detail.png"; n="Salah detail"},
  @{f="23_daily_sunnah.png"; n="Daily Sunnah"},
  @{f="24_islamic_shorts.png"; n="Islamic Shorts"},
  @{f="25_duas_grid.png"; n="Duas grid"},
  @{f="26_dua_detail.png"; n="Dua detail"},
  @{f="27_names_of_allah.png"; n="Names of Allah"},
  @{f="28_games_hub.png"; n="Games Hub"},
  @{f="29_game_play.png"; n="Game play / level select"},
  @{f="30_chatbot.png"; n="Chatbot"},
  @{f="31_talking_abdullah.png"; n="Talking Abdullah"},
  @{f="32_tutor_hub.png"; n="Tutor hub"},
  @{f="33_tutor_booking.png"; n="Tutor booking"},
  @{f="34_tutor_appointments.png"; n="Tutor appointments"},
  @{f="35_profile.png"; n="Profile"}
)

$present = @()
$nameByFile = @{}
foreach ($e in $expected) { $nameByFile[$e.f] = $e.n }
foreach ($e in $expected) {
  if (Has-Good $e.f) { $present += $e.f }
}

$report = @()
$report += "Mini Abdullah screenshot capture report"
$report += "Time: $(Get-Date -Format o)"
$report += "Device: $devs"
$report += "OutDir: $OutDir"
$report += ""
$report += "SUCCESS ($($present.Count)/35):"
foreach ($f in $present) { $report += "  OK  $f - $($nameByFile[$f])" }
$report += ""
$report += "NOT CAPTURED:"
foreach ($e in $expected) {
  if ($present -notcontains $e.f) { $report += "  MISSING $($e.f) - $($e.n)" }
}
$report += ""
$report += "Notes:"
$script:Miss | ForEach-Object { $report += "  - $_" }

$reportPath = Join-Path $OutDir "CAPTURE_REPORT.txt"
$report | Set-Content $reportPath -Encoding UTF8
Write-Host "`n=== DONE present=$($present.Count)/35 ===" -ForegroundColor Cyan
$report | Write-Host
