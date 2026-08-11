# Mini Abdullah — Project Status (Viva / Panel)

**Repo:** `D:\FYP\MINIABDULLAH`  
**Inspected:** August 2026 (against live code: `App.tsx`, `backend/*`, `src/*`)  
**Purpose:** Concise status lists for FYP viva — verified against the codebase, not marketing docs alone.

> **Note:** `MODULES.md` still mentions Firebase/FCM in places. **Actual code uses local notifications via `react-native-notify-kit` (Notifee-compatible API). There is no `google-services.json` / FCM in this project.**

---

## 1. App modules / screens

Navigation is screen-number based in `App.tsx` (screens **1–19**). Status: **Working** = usable in demo; **Partial** = works with caveats; **Stub** = placeholder / not wired.

### Entry & auth (screens 1–9)

| # | Module | File | Status |
|---|--------|------|--------|
| 1 | Splash | `SplashScreen.tsx` | Working |
| 2 | Onboarding (3 steps, first launch) | `onBoardingScreens.tsx` | Working |
| 3 | Welcome | `WelcomeScreen.tsx` | Working |
| 4 | Signup | `Signup.tsx` | Working |
| 5 | Login | `Login.tsx` | Working |
| 6 | Forgot Password | `ForgetPassword.tsx` | Working |
| 7 | OTP Verification (6-digit) | `OtpVerification.tsx` | Working |
| 8 | Reset Password | `ResetPassword.tsx` | Working |
| 9 | Success (post-signup) | `SuccessScreen.tsx` | Working |

### Main app (screens 10–19)

| # | Module | File | Status |
|---|--------|------|--------|
| 10 | Home (greeting, quote, prayer, cards) | `Home.tsx` | Working |
| 11 | Quran hub | `QuranScreen.tsx` | Working |
| — | Noorani Qaida | `NooraniQaidaScreen.tsx` | Working |
| — | Tajweed | `TajweedScreen.tsx` | Working |
| — | Read Quran (30 paras) | `ReadQuranScreen.tsx` → `ParaAyahsScreen.tsx` | Working |
| — | Common Quran Words | `QuranWordsScreen.tsx` | Working |
| — | Daily Surahs | `DailySurahsScreen.tsx` | Working |
| 12 | Salah (guided steps + video) | `SalahScreen.tsx` | Working |
| 13 | Daily Sunnah | `DailySunnahScreen.tsx` | Working |
| 14 | Islamic Shorts | `StoriesScreen.tsx` | Working |
| 15 | Duas (list + audio + video) | `DuasScreen.tsx` | Working |
| 16 | Names of Allah (99) | `NamesOfAllahScreen.tsx` | Working |
| 17 | AI Chatbot | `ChatbotScreen.tsx` | Working |
| 18 | Islamic Quiz (3 games) | `IslamicQuizScreen.tsx` + `quiz/*` | Working |
| 19 | Profile (multi-account, support, rate, notifications) | `ProfileScreen.tsx` | Working |

### Orphan / not in `App.tsx` navigation

| Module | File | Status |
|--------|------|--------|
| Masail | `MasailScreen.tsx` | Stub (“Content coming soon”) |
| Ibaadat | `IbaadatScreen.tsx` | Stub |
| Seerah | `SeerahScreen.tsx` | Stub |
| Pillars | `PillarsScreen.tsx` | Stub |

**Count (wired screens):** 19 top-level + 5 Quran sub-screens ≈ **24 working UI surfaces**. **4 stub files** exist but are not demo routes.

---

## 2. Backend APIs

Base: Express on `backend/server.js` (default port **5000**). MongoDB via Mongoose when `MONGO_URI` is set.

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/ping` | Public | Working | Health check |
| POST | `/api/auth/signup` | Public | Working | bcrypt + JWT |
| POST | `/api/auth/login` | Public | Working | bcrypt + JWT |
| POST | `/api/auth/forgot-password` | Public | Working | OTP email / DEV OTP; rate-limited |
| POST | `/api/auth/verify-otp` | Public | Working | Marks OTP verified; rate-limited |
| POST | `/api/auth/reset-password` | Public | Working | After OTP verify; rate-limited |
| GET | `/api/prayer` | Public | Working | City or lat/lng → Aladhan (+ optional DB cache model) |
| GET | `/api/inspiration/daily` | Public | Working | 5 quotes, 1h rotation |
| POST | `/api/chat` | **JWT required** | Working | Gemini via `@google/generative-ai`; rate-limited |
| POST | `/api/support` | **JWT required** | Working | Saves `SupportMessage`; optional email to `SUPPORT_TO_EMAIL` |

**Not active in current server (orphaned):** `backend/routes/backup` references old `/profile` + missing `profileController` / old middleware path — **not mounted**.

---

## 3. Auth & security features

### Implemented

- **JWT** issued on signup/login (`jsonwebtoken`, 7d expiry); stored in app via `accountStore` (AsyncStorage, max 4 accounts).
- **`authMiddleware.js`** — verifies `Authorization: Bearer <token>`, sets `req.user`, returns **401** if missing/invalid.
- **Protected routes:** `POST /api/chat`, `POST /api/support`.
- **Public routes:** all `/api/auth/*` public endpoints, `GET /api/prayer`, `GET /api/inspiration/daily`, `GET /ping`.
- **Password hashing:** `bcryptjs` (cost 10) on signup and password reset.
- **Helmet** — secure HTTP response headers.
- **express-rate-limit:**
  - All `/api/auth` — 40 req / 15 min
  - OTP-related (`forgot-password`, `verify-otp`, `reset-password`) — 10 req / 15 min
  - `/api/chat` — 30 req / 1 min
- **CORS** — allows `Content-Type` + `Authorization`; optional `CORS_ORIGIN` in `.env`.
- **Body size limit** — `express.json({ limit: "100kb" })`.
- **No password logging** — signup no longer logs full `req.body`.
- **OTP flow** — 6-digit code, 10 min expiry, generic responses to avoid email enumeration (when SMTP configured).
- **Frontend** — chat + support send `Authorization: Bearer ${token}` from active account.

### Already present (unchanged foundations)

- MongoDB `User` model with hashed password + OTP fields.
- Nodemailer SMTP for OTP / support emails (`DEV_OTP_MODE` for local testing).

---

## 4. Major features for FYP demo

Suggested live demo order:

1. **Splash → Onboarding (once) → Welcome → Signup/Login** (JWT session restore on cold start).
2. **Home** — time-based greeting, daily inspiration quote, prayer times (GPS or city).
3. **Quran hub** — Qaida / Tajweed / Read Quran (offline JSON) / Words / Daily Surahs + TTS/audio.
4. **Salah** — step-by-step learning + guide video.
5. **Daily Sunnah, Shorts, Duas, Names of Allah** — content + TTS/audio where applicable.
6. **Chatbot** — Gemini reply (needs backend + `GEMINI_API_KEY`); voice input / TTS listen.
7. **Islamic Quiz** — Word Search, Match Meaning, Pick Meaning (2 levels, stars).
8. **Profile** — switch up to 4 accounts, Contact Support / Feedback (auth), Rate App, notifications toggle.
9. **Forgot → OTP → Reset** — password recovery (SMTP or DEV OTP).
10. **Local notifications** — enable in Profile; schedules learning / prayer reminders on-device.

---

## 5. Tech stack

### Frontend

- **React Native** `0.85` + **React** `19`
- **TypeScript**
- AsyncStorage, Geolocation, Vector Icons, Linear Gradient, Video, TTS, Voice, Sound Player, FS
- **Local notifications:** `react-native-notify-kit` (Notifee-compatible) — **not Firebase**

### Backend

- **Node.js** + **Express 5**
- **Mongoose** / **MongoDB**
- **JWT** (`jsonwebtoken`) + **bcryptjs**
- **Helmet**, **express-rate-limit**, **cors**, **dotenv**
- **Nodemailer** (SMTP OTP / support)
- **Google Generative AI** (Gemini chatbot)

### External services / APIs

- **Aladhan** — prayer times (`api.aladhan.com`)
- **Gemini API** — chatbot replies
- **SMTP** (e.g. Gmail) — OTP and support email delivery (optional for local DEV OTP)

### Data / offline

- Bundled Quran juz JSON, Qaida/Tajweed/words/surahs/duas/shorts data under `src/data` / assets
- Per-account local prefs: chat history, quiz play, ratings, notification flag

---

## 6. Typical panel questions + short model answers

1. **Why React Native?**  
   One JS/TS codebase for Android (primary demo) with native modules for TTS, voice, video, and notifications — faster FYP delivery than separate native apps.

2. **Why MongoDB / Mongoose?**  
   Flexible document model for users (OTP fields), support messages, and optional prayer cache; quick to iterate for an FYP without a rigid SQL schema.

3. **How does login security work?**  
   Passwords are hashed with bcrypt; server returns a JWT signed with `JWT_SECRET`. Protected APIs require `Authorization: Bearer <token>`; middleware verifies signature and expiry.

4. **Explain the OTP / forgot-password flow.**  
   User submits email → server stores a 6-digit OTP (10 min) → email via SMTP (or DEV console/response) → verify-otp sets a flag → reset-password hashes the new password and clears OTP fields. OTP endpoints are rate-limited.

5. **How does the Quran work offline?**  
   Paras/ayahs and learning lists are shipped as local JSON/assets; TTS and Sudais audio play on-device so reading works without calling our API for text.

6. **Notifications: local vs FCM?**  
   We use **local scheduled notifications** (`react-native-notify-kit`). No Firebase Cloud Messaging in this project — reminders are scheduled on the device when the Profile toggle is ON.

7. **How does the chatbot work?**  
   App posts message + short history to `POST /api/chat` (JWT + rate limit). Backend calls **Google Gemini**; API key stays on the server, not in the APK.

8. **How are prayer times fetched?**  
   Frontend sends city or lat/lng to `GET /api/prayer`; backend proxies **Aladhan** timings API and returns Fajr–Isha for Home (and caches locally for notification scheduling).

9. **Multi-account on one device?**  
   Up to **4** accounts stored in AsyncStorage with JWTs; Profile can switch active account without re-entering password (token already saved).

10. **What security did you add beyond JWT?**  
    Helmet headers, auth + OTP + chat rate limits, CORS with Authorization allowed, 100kb JSON limit, bcrypt passwords, no logging of passwords/tokens, support/chat require login.

11. **What is still incomplete?**  
    Orphan stub screens (Masail/Ibaadat/Seerah/Pillars) not in navigation; no server-side profile CRUD mounted; no FCM push; chat depends on valid Gemini key and network.

12. **Why Express as a separate backend?**  
    Keeps secrets (JWT secret, Gemini, SMTP) off the client, centralizes auth and AI, and lets the phone call a LAN IP during development.

---

## 7. Known gaps / future work

- Wire or remove stub screens: Masail, Ibaadat, Seerah, Pillars.
- Mount real **profile GET/PUT** APIs if server-side profile editing is required (orphan `routes/backup` only).
- **FCM / remote push** (optional) if panel wants cloud reminders — currently local-only.
- Stronger production CORS (`CORS_ORIGIN`), refresh-token rotation, account lockout after failed logins.
- Align outdated docs (`MODULES.md` Firebase claims) with code.
- iOS polish / full cross-platform QA (primary target is Android).
- Automated tests beyond basic Jest scaffolding.
- Optional: move JWT to secure storage (Keystore) instead of AsyncStorage for production hardening.

---

## Restart note (backend security changes)

After pulling these changes:

```bash
cd backend
npm install
npm start
```

Restart the Express server so `helmet`, rate limits, and `authMiddleware` load. Metro restart is only needed if you changed frontend chat/support Authorization headers and already had Metro running.
