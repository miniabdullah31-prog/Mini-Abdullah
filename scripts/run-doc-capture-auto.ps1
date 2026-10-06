# Non-interactive FYP screenshot capture via adb (no app code changes).
$ErrorActionPreference = "Continue"
$Root = "D:\FYP\MINIABDULLAH"
$OutDir = Join-Path $Root "documentation\screenshots"
$Adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$script:Ok = [System.Collections.Generic.List[string]]::new()
$script:Fail = [System.Collections.Generic.List[string]]::new()
$script:Miss = [System.Collections.Generic.List[string]]::new()
$script:Notes = [System.Collections.Generic.List[string]]::new()

function Ensure-Awake {
  & $Adb shell input keyevent 224 | Out-Null
  & $Adb shell wm dismiss-keyguard 2>$null | Out-Null
}

function Dump-Ui {
  Ensure-Awake
  & $Adb shell uiautomator dump /sdcard/uidump.xml 2>$null | Out-Null
  & $Adb pull /sdcard/uidump.xml "$OutDir\_uidump.xml" 2>$null | Out-Null
  if (Test-Path "$OutDir\_uidump.xml") {
    return (Get-Content "$OutDir\_uidump.xml" -Raw)
  }
  return ""
}

function Get-CenterFromBounds([string]$bounds) {
  if ($bounds -match '\[(\d+),(\d+)\]\[(\d+),(\d+)\]') {
    $x1 = [int]$Matches[1]; $y1 = [int]$Matches[2]; $x2 = [int]$Matches[3]; $y2 = [int]$Matches[4]
    return @{ X = [int](($x1 + $x2) / 2); Y = [int](($y1 + $y2) / 2) }
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
  if (-not $pt) {
    Write-Host "  TAP MISS: $text" -ForegroundColor Yellow
    return $false
  }
  & $Adb shell input tap $pt.X $pt.Y
  Start-Sleep -Milliseconds $waitMs
  return $true
}

function Tap-Text-Scroll([string]$text, [int]$maxScrolls = 5, [int]$waitMs = 1600) {
  for ($i = 0; $i -le $maxScrolls; $i++) {
    $xml = Dump-Ui
    $pt = Find-Node $xml $text
    if ($pt) {
      & $Adb shell input tap $pt.X $pt.Y
      Start-Sleep -Milliseconds $waitMs
      return $true
    }
    if ($i -lt $maxScrolls) {
      & $Adb shell input swipe 540 1700 540 900 350
      Start-Sleep -Milliseconds 500
    }
  }
  Write-Host "  TAP MISS (scrolled): $text" -ForegroundColor Yellow
  return $false
}

function Hide-Keyboard {
  & $Adb shell input keyevent 111 2>$null | Out-Null
  & $Adb shell input keyevent 4 | Out-Null
  Start-Sleep -Milliseconds 350
}

function Capture([string]$file, [string]$name) {
  Ensure-Awake
  Start-Sleep -Milliseconds 400
  $dest = Join-Path $OutDir $file
  cmd /c "`"$Adb`" exec-out screencap -p > `"$dest`""
  $len = 0
  if (Test-Path $dest) { $len = (Get-Item $dest).Length }
  if ($len -lt 20000) {
    $script:Fail.Add("$file ($name) corrupt/empty ($len bytes)")
    Write-Host "FAIL $file ($len bytes)" -ForegroundColor Red
    return $false
  }
  $script:Ok.Add("$file|$name")
  Write-Host "OK   $file ($len bytes) - $name" -ForegroundColor Green
  return $true
}

function Ui-Has([string]$needle) {
  $xml = Dump-Ui
  return ($xml -and $xml.Contains($needle))
}

function Wait-Ui([string]$needle, [int]$tries = 8, [int]$delayMs = 700) {
  for ($i = 0; $i -lt $tries; $i++) {
    if (Ui-Has $needle) { return $true }
    Start-Sleep -Milliseconds $delayMs
  }
  return $false
}

function Go-Back([int]$times = 1) {
  for ($i = 0; $i -lt $times; $i++) {
    & $Adb shell input keyevent 4
    Start-Sleep -Milliseconds 600
  }
}

function Ensure-Home {
  for ($i = 0; $i -lt 8; $i++) {
    if ((Ui-Has "Assalamu Alaikum") -or ((Ui-Has "Daily Islamic Quote") -and (Ui-Has "Home"))) {
      return $true
    }
    if ((Ui-Has "Quran") -and (Ui-Has "Salah") -and (Ui-Has "Home")) { return $true }
    Go-Back 1
  }
  # bottom nav Home
  if (Tap-Text "Home" 1200) {
    Start-Sleep -Milliseconds 800
    return ((Ui-Has "Assalamu Alaikum") -or (Ui-Has "Daily Islamic Quote") -or (Ui-Has "Quran"))
  }
  return $false
}

function Open-From-Home([string]$label) {
  if (-not (Ensure-Home)) { return $false }
  # scroll to top first
  & $Adb shell input swipe 540 900 540 1700 250
  Start-Sleep -Milliseconds 400
  return (Tap-Text-Scroll $label 6 1800)
}

Write-Host "=== Device check ===" -ForegroundColor Cyan
$devs = & $Adb devices | Where-Object { $_ -match "`tdevice$" }
if (($devs | Measure-Object).Count -ne 1) {
  throw "Expected exactly 1 device; got: $($devs -join ', ')"
}
Write-Host $devs
& $Adb reverse tcp:5000 tcp:5000 | Out-Null
& $Adb reverse tcp:8081 tcp:8081 | Out-Null

# Remove prior numbered shots so report reflects this run only
Get-ChildItem $OutDir -Filter "*.png" | Where-Object { $_.Name -match '^\d{2}_' } | Remove-Item -Force

Ensure-Awake
& $Adb shell am start -n com.miniabdullah/.MainActivity | Out-Null
Start-Sleep -Seconds 2

# ---------- Splash (brief cold start) ----------
Write-Host "`n=== 01 Splash ===" -ForegroundColor Cyan
& $Adb shell am force-stop com.miniabdullah | Out-Null
Start-Sleep -Milliseconds 400
& $Adb shell am start -n com.miniabdullah/.MainActivity | Out-Null
Start-Sleep -Milliseconds 280
Capture "01_splash.png" "Splash" | Out-Null
Start-Sleep -Seconds 3
Ensure-Awake

$loggedIn = (Ui-Has "Assalamu Alaikum") -or ((Ui-Has "Daily Islamic Quote") -and (Ui-Has "Home"))
Write-Host "LoggedIn=$loggedIn"

# ---------- Feature screens while session active ----------
if ($loggedIn) {
  Write-Host "`n=== Home + features ===" -ForegroundColor Cyan
  Ensure-Home | Out-Null
  # dismiss yellow RN warning banner if present
  if (Ui-Has "Open debugger") {
    Tap-Text "Open debugger to view warnings." 800 | Out-Null
    Go-Back 1
  }
  Ensure-Home | Out-Null
  Capture "12_home.png" "Home" | Out-Null

  if (Open-From-Home "Quran") {
    Start-Sleep -Seconds 1
    Capture "13_quran_hub.png" "Quran Hub" | Out-Null

    if (Tap-Text-Scroll "Noorani Qaida" 3 1600) {
      Start-Sleep -Seconds 1
      Capture "14_noorani_qaida.png" "Noorani Qaida" | Out-Null
      Go-Back 1
    } else { $script:Miss.Add("14_noorani_qaida.png - card not found on Quran hub") }

    if (Tap-Text-Scroll "Tajweed" 3 1600) {
      Start-Sleep -Seconds 1
      Capture "15_tajweed.png" "Tajweed" | Out-Null
      Go-Back 1
    } else { $script:Miss.Add("15_tajweed.png - card not found") }

    if (Tap-Text-Scroll "Read Quran" 3 1800) {
      Start-Sleep -Seconds 1
      if (-not (Ui-Has "Para")) { Start-Sleep -Seconds 1 }
      Capture "16_read_quran_para.png" "Read Quran (Para)" | Out-Null
      if (Tap-Text "Surahs" 1200) {
        Start-Sleep -Milliseconds 800
        Capture "17_read_quran_surah.png" "Read Quran (Surahs)" | Out-Null
      } else { $script:Miss.Add("17_read_quran_surah.png - Surahs tab not found") }
      # Open first para/surah item
      $openedAyah = $false
      foreach ($t in @("Para 1","Al-Fatihah","Al-Faatiha","Juz 1")) {
        if (Tap-Text $t 2000) { $openedAyah = $true; break }
      }
      if (-not $openedAyah) {
        & $Adb shell input tap 540 1100
        Start-Sleep -Seconds 2
        $openedAyah = (Ui-Has "Ayah") -or (Ui-Has "Translation") -or (Ui-Has "Play") -or (Ui-Has "Para 1")
      } else {
        Start-Sleep -Seconds 2
      }
      if ($openedAyah -or (Ui-Has "off") -or (Ui-Has "UR") -or (Ui-Has "EN")) {
        Capture "18_ayah_recitation.png" "Ayah / Para recitation" | Out-Null
        Go-Back 1
      } else {
        $script:Miss.Add("18_ayah_recitation.png - could not open para/surah detail")
      }
      Go-Back 1
    } else { $script:Miss.Add("16/17/18 Read Quran - not found") }

    $wordsOk = (Tap-Text-Scroll "Common Quran Words" 3 1600)
    if (-not $wordsOk) { $wordsOk = (Tap-Text-Scroll "Quran Words" 2 1600) }
    if ($wordsOk) {
      Start-Sleep -Seconds 1
      Capture "19_quran_words.png" "Common Quran Words" | Out-Null
      Go-Back 1
    } else { $script:Miss.Add("19_quran_words.png - not found") }

    if (Tap-Text-Scroll "Daily Surahs" 3 1600) {
      Start-Sleep -Seconds 1
      Capture "20_daily_surahs.png" "Daily Surahs" | Out-Null
      Go-Back 1
    } else { $script:Miss.Add("20_daily_surahs.png - not found") }

    Go-Back 1
  } else {
    $script:Miss.Add("13_quran_hub.png - Quran card not reachable from Home")
  }

  if (Open-From-Home "Salah") {
    Start-Sleep -Seconds 1
    Capture "21_salah_list.png" "Salah list" | Out-Null
    $salahDetail = (Tap-Text-Scroll "Takbeer" 3 1500)
    if (-not $salahDetail) { $salahDetail = (Tap-Text-Scroll "Step 1" 2 1500) }
    if (-not $salahDetail) {
      & $Adb shell input tap 540 1200
      Start-Sleep -Seconds 1
    } else {
      Start-Sleep -Seconds 1
    }
    Capture "22_salah_detail.png" "Salah detail" | Out-Null
    Go-Back 1
    Go-Back 1
  } else { $script:Miss.Add("21_salah_list.png - Salah not found") }

  if (Open-From-Home "Daily Sunnah") {
    Start-Sleep -Seconds 1
    Capture "23_daily_sunnah.png" "Daily Sunnah" | Out-Null
    Go-Back 1
  } else { $script:Miss.Add("23_daily_sunnah.png - not found") }

  if (Open-From-Home "Islamic Shorts") {
    Start-Sleep -Seconds 2
    Capture "24_islamic_shorts.png" "Islamic Shorts" | Out-Null
    Go-Back 1
  } else { $script:Miss.Add("24_islamic_shorts.png - not found") }

  if (Open-From-Home "Duas") {
    Start-Sleep -Seconds 1
    Capture "25_duas_grid.png" "Duas grid" | Out-Null
    & $Adb shell input tap 280 1100
    Start-Sleep -Seconds 1
    if ((Ui-Has "Dua") -or (Ui-Has "Arabic") -or (Ui-Has "Translation") -or (Ui-Has "Play")) {
      Capture "26_dua_detail.png" "Dua detail" | Out-Null
      Go-Back 1
    } else {
      $script:Miss.Add("26_dua_detail.png - detail not opened")
    }
    Go-Back 1
  } else { $script:Miss.Add("25_duas_grid.png - not found") }

  if (Open-From-Home "Names of Allah") {
    Start-Sleep -Seconds 1
    Capture "27_names_of_allah.png" "Names of Allah" | Out-Null
    Go-Back 1
  } else { $script:Miss.Add("27_names_of_allah.png - not found") }

  if (Open-From-Home "Games") {
    Start-Sleep -Seconds 1
    Capture "28_games_hub.png" "Games Hub" | Out-Null
    & $Adb shell input tap 540 1100
    Start-Sleep -Seconds 2
    Capture "29_game_play.png" "Game play / level select" | Out-Null
    Go-Back 1
    Go-Back 1
  } else { $script:Miss.Add("28_games_hub.png - not found") }

  if (Open-From-Home "Chatbot") {
    Start-Sleep -Seconds 1
    Capture "30_chatbot.png" "Chatbot" | Out-Null
    Go-Back 1
  } else { $script:Miss.Add("30_chatbot.png - not found") }

  # Talking Abdullah - FAB "Talk" or card
  if (Ensure-Home) {
    $talkOk = (Tap-Text "Talk" 2000)
    if (-not $talkOk) { $talkOk = (Open-From-Home "Talking Abdullah") }
    if ($talkOk) {
      Start-Sleep -Seconds 1
      Capture "31_talking_abdullah.png" "Talking Abdullah" | Out-Null
      Go-Back 1
    } else { $script:Miss.Add("31_talking_abdullah.png - Talk entry not found") }
  }

  # Tutor
  if (Ensure-Home) {
    if (Tap-Text "Tutor" 2000) {
      Start-Sleep -Seconds 2
      Capture "32_tutor_hub.png" "Tutor hub" | Out-Null
      if (Tap-Text-Scroll "Book Session" 4 2000) {
        Start-Sleep -Seconds 1
        Capture "33_tutor_booking.png" "Tutor booking" | Out-Null
        Go-Back 1
      } else { $script:Miss.Add("33_tutor_booking.png - Book Session not found") }
      if (Tap-Text "My Appointments" 1800) {
        Start-Sleep -Seconds 1
        Capture "34_tutor_appointments.png" "Tutor appointments" | Out-Null
        Go-Back 1
      } else { $script:Miss.Add("34_tutor_appointments.png - My Appointments not found") }
    } else { $script:Miss.Add("32_tutor_hub.png - Tutor tab not found") }
  }

  # Profile
  if (Tap-Text "Profile" 1800) {
    Start-Sleep -Seconds 1
    Capture "35_profile.png" "Profile" | Out-Null
  } else { $script:Miss.Add("35_profile.png - Profile tab not found") }
} else {
  $script:Miss.Add("12_home.png - not logged in; Home and feature screens unreachable")
  foreach ($f in @(
    "13_quran_hub.png","14_noorani_qaida.png","15_tajweed.png","16_read_quran_para.png",
    "17_read_quran_surah.png","18_ayah_recitation.png","19_quran_words.png","20_daily_surahs.png",
    "21_salah_list.png","22_salah_detail.png","23_daily_sunnah.png","24_islamic_shorts.png",
    "25_duas_grid.png","26_dua_detail.png","27_names_of_allah.png","28_games_hub.png",
    "29_game_play.png","30_chatbot.png","31_talking_abdullah.png","32_tutor_hub.png",
    "33_tutor_booking.png","34_tutor_appointments.png","35_profile.png"
  )) { $script:Miss.Add("$f - requires Home") }
}

# ---------- Auth path via Logout (does not clear app data) ----------
Write-Host "`n=== Auth screens via Logout ===" -ForegroundColor Cyan
Ensure-Awake
if (-not (Ui-Has "Logout")) {
  Tap-Text "Profile" 1500 | Out-Null
  Start-Sleep -Milliseconds 800
  & $Adb shell input swipe 540 1700 540 800 350
  Start-Sleep -Milliseconds 500
}
if (Tap-Text-Scroll "Logout" 5 1200) {
  Start-Sleep -Milliseconds 600
  # confirm modal - tap Logout again
  Tap-Text "Logout" 2000 | Out-Null
  Start-Sleep -Seconds 2
}

if (Wait-Ui "I'm new to Mini Abdullah" 10) {
  Capture "03_welcome.png" "Welcome" | Out-Null
} elseif (Wait-Ui "Islam essentials for kids" 3) {
  Capture "03_welcome.png" "Welcome" | Out-Null
} else {
  $script:Miss.Add("03_welcome.png - Welcome not shown after logout")
}

# Onboarding - only if present
if ((Ui-Has "Skip") -and ((Ui-Has "Learning") -or (Ui-Has "Fun") -or (Ui-Has "Friend"))) {
  Capture "02_onboarding.png" "Onboarding" | Out-Null
} else {
  $script:Miss.Add("02_onboarding.png - Onboarding already completed on device (not shown)")
}

# Signup
if (Tap-Text "I'm new to Mini Abdullah" 2000) {
  Start-Sleep -Seconds 1
  Hide-Keyboard
  Capture "04_signup.png" "Signup" | Out-Null
  Go-Back 1
} else {
  $script:Miss.Add("04_signup.png - Signup entry not reached")
}

# Gender / Avatar / Success need completed signup - do not invent
$script:Miss.Add("05_gender.png - requires completed signup flow (not entered)")
$script:Miss.Add("06_avatar.png - requires completed signup flow (not entered)")
$script:Miss.Add("07_success.png - requires completed signup/avatar flow (not entered)")

# Login
if (-not (Ui-Has "Forgot Password")) {
  if (Ui-Has "I already have an account") {
    Tap-Text "I already have an account" 2000 | Out-Null
  }
}
Start-Sleep -Seconds 1
Hide-Keyboard
if ((Ui-Has "Forgot Password") -or (Ui-Has "Login")) {
  Capture "08_login.png" "Login" | Out-Null
} else {
  $script:Miss.Add("08_login.png - Login screen not reached")
}

# Forgot Password
Hide-Keyboard
if (Tap-Text "Forgot Password?" 1800) {
  Start-Sleep -Seconds 1
  Hide-Keyboard
  Capture "09_forgot_password.png" "Forgot Password" | Out-Null

  # Try OTP with known email if EditText present - tap email field and type
  $xml = Dump-Ui
  if ($xml -match 'class="android.widget.EditText"[^>]*bounds="(\[[^\"]+\])"') {
    $pt = Get-CenterFromBounds $Matches[1]
    if ($pt) {
      & $Adb shell input tap $pt.X $pt.Y
      Start-Sleep -Milliseconds 300
      & $Adb shell input keyevent 123 | Out-Null # move end
      # clear roughly
      for ($i=0; $i -lt 40; $i++) { & $Adb shell input keyevent 67 | Out-Null }
      & $Adb shell input text "azhan@test.com"
      Start-Sleep -Milliseconds 400
      Hide-Keyboard
      if (Tap-Text "Send OTP" 2500) {
        Start-Sleep -Seconds 2
        if ((Ui-Has "OTP") -or (Ui-Has "digit") -or (Ui-Has "Verify") -or (Ui-Has "Resend")) {
          Capture "10_otp.png" "OTP Verification" | Out-Null
        } else {
          $script:Miss.Add("10_otp.png - OTP screen not shown (backend/account may reject email)")
        }
      }
    }
  } else {
    $script:Miss.Add("10_otp.png - could not locate email field for OTP request")
  }
  if (-not (Test-Path (Join-Path $OutDir "10_otp.png"))) {
    if (-not ($script:Miss | Where-Object { $_ -like "10_otp*" })) {
      $script:Miss.Add("10_otp.png - OTP screen not reached")
    }
  }
  if (-not (Test-Path (Join-Path $OutDir "11_reset_password.png"))) {
    $script:Miss.Add("11_reset_password.png - requires verified OTP (not completed)")
  }
} else {
  $script:Miss.Add("09_forgot_password.png - Forgot Password link not found")
  $script:Miss.Add("10_otp.png - requires Forgot Password")
  $script:Miss.Add("11_reset_password.png - requires verified OTP")
}

# Report
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
  $p = Join-Path $OutDir $e.f
  if ((Test-Path $p) -and ((Get-Item $p).Length -gt 20000)) { $present += $e.f }
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
$script:Fail | ForEach-Object { $report += "  - FAIL $_" }

$reportPath = Join-Path $OutDir "CAPTURE_REPORT.txt"
$report | Set-Content $reportPath -Encoding UTF8
Write-Host "`n=== DONE present=$($present.Count)/35 ===" -ForegroundColor Cyan
Write-Host "Report: $reportPath"
$report | Write-Host
