# Low-RAM friendly Android run for Mini Abdullah (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$env:GRADLE_USER_HOME = Join-Path $Root ".gradle"
$env:NODE_BINARY = "C:\Program Files\nodejs\node.exe"

Write-Host "==> Stopping old Gradle daemons..."
Push-Location (Join-Path $Root "android")
& .\gradlew.bat --stop 2>$null
Pop-Location

Write-Host "==> Building & installing (arm64-v8a only, low memory mode)..."

$packagerRunning = $false
try {
  $conn = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
  if ($conn) { $packagerRunning = $true }
} catch {
  $packagerRunning = $false
}

if ($packagerRunning) {
  Write-Host "==> Metro already on :8081 - skipping packager start"
  npx react-native run-android --active-arch-only --no-packager @args
} else {
  npx react-native run-android --active-arch-only @args
}

Write-Host "==> USB reverse Metro 8081 + backend 5000"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
