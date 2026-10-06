# Mini Abdullah — FYP documentation screenshots

## Capture method (chosen)

**Real Android UI via `adb exec-out screencap -p`**, driven by an interactive PowerShell checklist.

Why this method:
- Captures the **actual running APK UI** (not HTML mockups).
- Does **not** change production feature behavior (optional DEV-only DOC jump overlay, off by default).
- Works for all 35 inventory states, including nested Quran/Games/Tutor views.

## Prerequisites

1. Android phone with USB debugging **or** emulator.
2. Mini Abdullah app installed and running.
3. `adb` available (`Android\Sdk\platform-tools`).
4. Logged-in session recommended before Home+ feature shots (12–35).

## Exact commands

From the project root `D:\FYP\MINIABDULLAH`:

```powershell
# 1) Confirm device
adb devices

# 2) (Optional) Enable DEV jump overlay — edit this file to true, then rebuild:
#    src/dev/docCaptureConfig.ts  →  DOC_CAPTURE_ENABLED = true
npx react-native run-android

# 3) Run interactive capture (saves into documentation/screenshots/)
powershell -ExecutionPolicy Bypass -File scripts/capture-doc-screenshots.ps1
```

For each of the 35 prompts:
1. Navigate to the state shown (or use red **DOC** button for top-level screens).
2. Press **Enter** to capture.
3. Press **S** to skip, **Q** to quit.

Disable overlay after capture: set `DOC_CAPTURE_ENABLED = false` and rebuild if you enabled it.

## Output

- PNGs: `documentation/screenshots/01_splash.png` … `35_profile.png`
- Report: `documentation/screenshots/CAPTURE_REPORT.txt`
