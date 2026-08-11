# Mini Abdullah — FYP Documentation UI Pack

Independent HTML + high-resolution PNG screenshots for **Mini Abdullah** (BSCS Final Year Project).  
This folder does **not** modify the React Native app. You can copy `screenshots/` into your report.

## Contents

```
FYP_Documentation_UI/
├── html/           # Pixel-faithful HTML/CSS replicas (360×780 logical)
├── screenshots/    # Print-ready PNGs (1440×3120 @ 4× scale)
├── assets/         # Copied branding images from the app
├── scripts/        # Puppeteer generate + capture pipeline
├── package.json
└── README.md
```

## Branding matched from the app

| Token | Value |
|-------|--------|
| Primary CTA | `#6C4DF7` |
| Active nav / titles | `#4B2AA8` |
| Hub status / accents | `#5B33C4` |
| Background | `#F6F7FB` |
| Splash | `#0d6efd` |

Layouts follow the real screens in `src/Components/` and navigation in `App.tsx` (screens 1–19).

## Generated screenshots

| File | Screen | Status in app |
|------|--------|----------------|
| `01_Splash.png` | Splash | Available |
| `02_Onboarding.png` | Onboarding (step 1) | Available |
| `03_Welcome.png` | Welcome | Available |
| `04_Login.png` | Login | Available |
| `05_Register.png` | Signup / Register | Available |
| `06_Forgot_Password.png` | Forgot Password | Available (UI only; reset email is local alert) |
| `07_OTP_Verification.png` | OTP Verification | UI exists; **not wired** in `App.tsx` navigation from Forgot Password |
| `08_Reset_Password.png` | Reset Password | UI exists; **not wired** from OTP in live flow |
| `09_Success.png` | Account Success | Available |
| `10_Home_Dashboard.png` | Home | Available |
| `11_Quran_Hub.png` | Quran Learning hub | Available |
| `12_Salah.png` | Learn Salah | Available |
| `13_Daily_Sunnah.png` | Daily Sunnah | Available |
| `14_Islamic_Shorts.png` | Islamic Shorts | Available (reel UI; many clips await local video files) |
| `15_Duas.png` | Daily Duas | Available (recorded dua audio mostly `null` until files attached) |
| `16_Names_of_Allah.png` | Names of Allah | Available |
| `17_Chatbot.png` | AI Chatbot | Available |
| `18_Quiz_Hub.png` | Islamic Quiz hub | Available |
| `19_Profile_Settings.png` | Profile / Settings | Available |
| `20_Word_Search_Game.png` | Word Search game | Available (inside Quiz) |

## TutorLink-style screens — Not Available in Current Project

This project is **Mini Abdullah**, not TutorLink. The following roles/features from a generic tutoring marketplace template do **not** exist here:

- Student / Tutor / Parent / Admin role dashboards (multi-role marketplace)
- Search Tutors / Tutor Profile
- Booking / Payment
- Live Video Session
- AI Session Summary (as tutoring session notes)
- In-app Notifications inbox (only a Profile notifications toggle)
- Rating & Review (marketplace ratings)

Mini Abdullah’s AI assistant is the **Chatbot** screen (`17_Chatbot.png`), not a tutoring “session summary” product.

## How to regenerate PNGs

```bash
cd FYP_Documentation_UI
npm install
npm run capture
```

Requirements: Node.js 18+, Chromium (downloaded by Puppeteer).

## Notes for the report

- Status bar and Android navigation chrome are hidden (clean phone canvas).
- Dummy account data: `Abdullah Ahmed` / `abdullah@example.com`.
- Home quote uses the app’s offline fallback ayah (Surah Ash-Sharh 94:6).
- HTML files can be opened in a browser for review; PNG files are for Word/PDF figures.
