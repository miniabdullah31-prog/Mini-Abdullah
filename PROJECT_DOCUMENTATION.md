# Mini Abdullah — Complete Project Documentation

**Document type:** Full module & system specification (FYP / viva ready)  
**Project name:** Mini Abdullah  
**Platform:** Android (React Native) + Node.js backend + Firebase notifications  
**Audience:** Examiners, supervisors, and anyone understanding the full product  
**Related module catalogue:** `MODULES.md`  
**Date:** August 2026  
**Documentation status:** Complete application specification  

---

## 1. Project overview

### 1.1 What is Mini Abdullah?
Mini Abdullah is a **kids-focused Islamic learning mobile application**. It teaches Quran basics, Salah, daily Sunnah, Duas, Names of Allah, short Islamic clips, and interactive quizzes, and includes an AI chatbot for simple Islamic questions — in a colorful, simple UI suitable for children.

### 1.2 Problem it solves
- Children need Islamic learning that feels friendly, not adult-heavy.
- Parents want one place for Quran reading, Salah steps, duas, and light games.
- Offline-friendly Quran paras and clear EN | UR bilingual labels help Pakistani / Urdu-speaking kids.

### 1.3 Main goals
1. Teach core Islamic knowledge in small, friendly modules.  
2. Support **English + Urdu** (and Arabic text where needed).  
3. Mix **learning + play** (Quiz games, Shorts).  
4. Provide **AI help** (Chatbot) and **utility** (Prayer times, daily quote).  
5. Allow **multi-profile** use on one device (siblings / family).  
6. Keep engagement simple: time-based greeting, in-app rating, support message, and gentle notifications.

### 1.4 Target users
- Primary: children learning Islam (with parent guidance).  
- Secondary: parents / teachers using the app as a learning aid.

---

## 2. Technology stack

### 2.1 Frontend (Mobile)
| Technology | Role |
|------------|------|
| React Native | Cross-platform UI (project focused on Android) |
| TypeScript / TSX | Screens & typed data |
| AsyncStorage | Sessions, multi-account, chat history, quiz plays, onboarding flag, rating, notification preference |
| react-native-linear-gradient | Gradient feature cards |
| @react-native-vector-icons/ionicons | Icons |
| react-native-tts | Arabic / speech for Qaida, Names, Salah, chatbot listen |
| react-native-sound-player + react-native-fs | Sudais Quran audio; Dua MP3 playback |
| react-native-video | Islamic Shorts + guide videos |
| @react-native-voice/voice | Chatbot voice input |
| @react-native-community/geolocation | Prayer times by location |
| Firebase (FCM) | Push / local notification channel |
| axios | HTTP to backend |

### 2.2 Backend
| Technology | Role |
|------------|------|
| Node.js + Express | REST API server (port **5000** by default) |
| MongoDB + Mongoose | Users · OTP recovery fields |
| bcryptjs | Password hashing |
| jsonwebtoken (JWT) | Auth tokens after signup/login |
| Email / SMTP | Forgot-password OTP delivery |
| @google/generative-ai (Gemini) | Chatbot replies |
| Aladhan API (via backend) | Prayer times by city or coordinates |
| dotenv | Environment config |

### 2.3 How to run (demo)
```text
# Terminal 1 — backend (from project root)
npm run backend

# Terminal 2 — Metro / app
npm start
npx react-native run-android
```
Backend `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, mail/OTP settings as required.

Client API host: `src/config/api.ts` (emulator often `10.0.2.2:5000`, physical device = PC LAN IP).

---

## 3. System architecture

### 3.1 High-level diagram
```text
┌──────────────────────────────────────────────────────────────┐
│                 Mini Abdullah (Android App)                    │
│  Splash (1s) → Onboarding (first launch) → Auth → Home         │
│  Local: AsyncStorage · TTS · Video · Sound · Geolocation · FCM │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP (JSON)
                             ▼
┌──────────────────────────────────────────────────────────────┐
│              Express Backend (:5000)                           │
│  /api/auth (+ OTP/reset) · /api/prayer · /api/chat             │
│  /api/inspiration · MongoDB · Gemini · Aladhan · Email OTP     │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Navigation model
Main flow is **screen-number based** in `App.tsx`:

| Screen # | Screen name |
|----------|-------------|
| 1 | Splash |
| 2 | Onboarding (first launch only) |
| 3 | Welcome |
| 4 | Signup |
| 5 | Login |
| 6 | Forgot Password |
| 7 | OTP Verification |
| 8 | Reset Password |
| 9 | Signup Success |
| 10 | Home |
| 11 | Quran hub |
| 12 | Salah |
| 13 | Daily Sunnah |
| 14 | Islamic Shorts |
| 15 | Duas |
| 16 | Names of Allah |
| 17 | Chatbot |
| 18 | Islamic Quiz |
| 19 | Profile |

**Back rules:** Feature screens 11–19 → Home (10). Home → Welcome (3) when designed that way.

Nested Quran screens use local state inside `QuranScreen` (hub / qaida / tajweed / read / para / words / surahs).

---

## 4. User journeys (end-to-end)

### 4.1 First launch
Splash (**1 second**) → Onboarding (3 steps, Skip available, **once only**) → Welcome → Signup or Login → Home.

### 4.2 Returning user
Splash → Welcome or Home (onboarding skipped via persisted flag).

### 4.3 Password recovery
Login → Forgot Password → enter email → OTP screen → verify → Reset Password → Login.

### 4.4 Daily learning
Home (time-based greeting + active name) → open any card → learn → back to Home → Profile if needed.

### 4.5 Multi-account
Profile → `+` → Welcome → Login/Signup another ID → switch by tap **without re-entering password**. Max **4** accounts.

### 4.6 Prayer times
Home clock icon → Current location **or** manual city → Fajr, Dhuhr, Asr, Maghrib, Isha.

### 4.7 Quiz play
Home → Quiz → choose game → Level 1 → clear (stars) → Level 2 → Quiz hub.

### 4.8 Rating
After first use of a learning feature → 5-star popup → rating saved → same golden stars under Profile → Rate App (change anytime).

### 4.9 Support
Profile → Contact Support → write help message → send to support email.

---

## 5. Module catalog (complete detail)

---

### MODULE A — Authentication & entry

#### A1. Splash
- **File:** `src/Components/SplashScreen.tsx`  
- **Purpose:** Brand intro (“Mini Abdullah”).  
- **Behavior:** Auto-advances after **1 second**.  
- **Status:** Complete.

#### A2. Onboarding
- **File:** `src/Components/onBoardingScreens.tsx`  
- **Purpose:** 3 intro slides for **first-time users only**.  
- **Actions:** Next / Skip → Welcome; flag persisted so later launches skip onboarding.  
- **Status:** Complete.

#### A3. Welcome
- **File:** `src/Components/WelcomeScreen.tsx`  
- **Purpose:** Entry to Signup or Login.  
- **Also used when:** Adding another profile from Profile.  
- **Status:** Complete.

#### A4. Signup
- **File:** `src/Components/Signup.tsx`  
- **API:** `POST /api/auth/signup` `{ name, email, password }`  
- **On success:** Saves token + user in multi-account store → Success screen.  
- **Status:** Complete.

#### A5. Login
- **File:** `src/Components/Login.tsx`  
- **API:** `POST /api/auth/login`  
- **On success:** Upserts account (max 4) → Home.  
- **Status:** Complete.

#### A6. Forgot Password
- **File:** `src/Components/ForgetPassword.tsx`  
- **Flow:** Email submit → backend sends OTP → navigates to OTP screen.  
- **Status:** Complete.

#### A7. OTP Verification
- **File:** `src/Components/OtpVerification.tsx`  
- **Flow:** 4-digit code · verify · resend · then Reset Password.  
- **Status:** Complete.

#### A8. Reset Password
- **File:** `src/Components/ResetPassword.tsx`  
- **Flow:** New password + confirm → backend reset → Login.  
- **Status:** Complete.

#### A9. Success
- **File:** `src/Components/SuccessScreen.tsx`  
- **Purpose:** After signup celebration → Home.  
- **Status:** Complete.

**Auth data stored locally:** `token`, `userEmail`, `userId`, `userName`, plus saved accounts list (`accountStore`).

---

### MODULE B — Home hub

- **File:** `src/Components/Home.tsx` · Screen **10**  
- **Layout:** Hero greeting · Daily quote card · 8 feature cards (2-column) · Floating bottom navbar (Home | Profile).

#### B1. Greeting
- **Assalamu Alaikum** plus **time-based line**: Good Morning / Good Afternoon / Good Night.  
- **Name:** Active account name from multi-account store.

#### B2. Daily Islamic Quote (Inspiration)
- **Client:** `src/services/inspirationService.ts`  
- **API:** `GET /api/inspiration/daily`  
- **Rotation:** Every **24 hours**, then cycles through quote pool.  
- **Offline:** Fallback quote if API unavailable.  
- **UI:** Arabic + English translation + source.

#### B3. Prayer Times
- **Client:** `src/services/prayerService.ts`  
- **API:** `GET /api/prayer?city=` or `?lat=&lng=`  
- **Options:** Current location · Select city manually.  
- **Output:** Fajr, Dhuhr, Asr, Maghrib, Isha + city + date.

#### B4. Feature cards (fixed order)
| # | Card | Destination |
|---|------|-------------|
| 1 | Quran | Screen 11 |
| 2 | Salah | Screen 12 |
| 3 | Daily Sunnah | Screen 13 |
| 4 | Islamic Shorts | Screen 14 |
| 5 | Duas | Screen 15 |
| 6 | Names of Allah | Screen 16 |
| 7 | Chatbot | Screen 17 |
| 8 | Quiz | Screen 18 |

**Card UI:** Gradient surfaces with decorative icons/objects and soft touch feedback (clean kids UX).

#### B5. Navbar
- Home (active on Home) · Profile → screen 19.  
- Same visual style on Profile for consistency.

---

### MODULE C — Quran Learning (hub + 5 sub-modules)

- **Hub file:** `src/Components/QuranScreen.tsx` · Screen **11**  
- **Hub UI:** Header · search · gradient cards for each sub-module.

#### C1. Noorani Qaida
- **Screen:** `NooraniQaidaScreen.tsx`  
- **Data:** `src/data/nooraniQaida.ts` — **32 lessons**  
- **Content:** Arabic letters Alif–Yaa + Fatha, Kasra, Damma, Sukoon style lessons.  
- **Per item:** Arabic, EN/UR titles, transliteration, meaning, tip.  
- **Audio:** Device TTS (`quranTts.speakArabic`).  
- **Status:** Complete.

#### C2. Tajweed
- **Screen:** `TajweedScreen.tsx`  
- **Data:** `src/data/tajweed.ts` — **10 rules** (expand/collapse cards).  
- **Topics:** Start of recitation, letter sounds, Noon/Meem rules, Ghunnah, Qalqalah, Madd, heavy/light, stopping, Lam in Allah, and related basics.  
- **Audio:** TTS on examples.  
- **Status:** Complete.

#### C3. Read Quran (30 Paras)
- **List:** `ReadQuranScreen.tsx` — searchable 30 juz (`juzMeta.ts`).  
- **Detail:** `ParaAyahsScreen.tsx` — ayahs from offline JSON `src/data/quran/juz-1.json` … `juz-30.json`.  
- **Languages:** Chips Arabic / Urdu / English.  
- **Audio:** Female Arabic TTS per ayah (`quranTts.ts`) on play.
- **Service:** `quranService.ts` loads bundled JSON offline.  
- **Status:** Complete.

#### C4. Common Quran Words
- **Screen:** `QuranWordsScreen.tsx`  
- **Data:** `src/data/quranWords.ts` — **35 words**  
- **Detail:** Meaning · Singular · Dual · Plural · notes · TTS.  
- **Status:** Complete.

#### C5. Daily Surahs
- **Screen:** `DailySurahsScreen.tsx`  
- **Data:** `src/data/dailySurahs.ts` — **10 short surahs**  
- **Surahs include:** Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kawthar, Al-Asr, An-Nasr, Al-Kafirun, Al-Fil, Quraysh.  
- **Audio:** Sudais per ayah.  
- **Status:** Complete.

---

### MODULE D — Salah

- **File:** `src/Components/SalahScreen.tsx` · Screen **12**  
- **Steps (10):**  
  1. Takbeer  
  2. Qiyam & Recitation  
  3. Ruku  
  4. Qaumah  
  5. First Sajdah  
  6. Jalsa  
  7. Second Sajdah  
  8. Tashahhud  
  9. Durood Ibrahim & Dua  
  10. Salam  

- **Detail UX:** EN | UR titles · AR/UR/EN chips · Arabic recitation + TTS · translation · how to perform · tafseer.  
- **Complete Salah Guide:** Full prayer guide video on the module.  
- **Status:** Complete.

---

### MODULE E — Daily Sunnah

- **File:** `src/Components/DailySunnahScreen.tsx` · Screen **13**  
- **Data:** `src/data/dailySunnahs.ts` — **7** habits  

| # | Title (EN) | Title (UR) |
|---|------------|------------|
| 1 | Say Salam | سلام کہنا |
| 2 | Smile Softly | مسکراہٹ |
| 3 | Bismillah Before Eating | کھانے سے پہلے بسم اللہ |
| 4 | Help Parents | والدین کی مدد |
| 5 | Sleep the Sunnah Way | سونے کی سنت |
| 6 | Say Alhamdulillah | الحمدللہ کہنا |
| 7 | Keep Clean (Taharah) | صفائی رکھنا |

- **Detail sections:** Meaning · How to practice · From Our Prophet ﷺ · Benefit · Tip.  
- **Languages:** Urdu | English chips; Arabic phrase + TTS when present.  
- **Status:** Complete.

---

### MODULE F — Islamic Shorts

- **File:** `src/Components/StoriesScreen.tsx` · Screen **14**  
- **Data:** `src/data/islamicShorts.ts` — **10** reels  
- **Player:** Vertical reels (`react-native-video`): pause, progress, caption, swipe.  
- **Grid:** Cover + caption cards.  
- **Media:** Vertical **9:16** videos + covers under `src/assets/shorts/`.  
- **Topics:** Prophets, Seerah, short Islamic lessons for kids.  
- **Status:** Complete.

---

### MODULE G — Duas

- **File:** `src/Components/DuasScreen.tsx` · Screen **15**  
- **Data:** `src/data/duas.ts` — **10** duas  

**List:** Morning · Sleeping · Eating · Travel · Parents · Before Study · Leaving Home · Entering Home · Forgiveness · Protection  

- **Detail:** Search · AR/UR/EN chips · Arabic dua · Urdu/EN translation + tafseer.  
- **Audio:** Recorded MP3 via `duaAudio.ts` (`src/assets/duas/`).  
- **Video lesson:** Dua learning guide video on detail.  
- **Status:** Complete.

---

### MODULE H — Names of Allah

- **File:** `src/Components/NamesOfAllahScreen.tsx` · Screen **16**  
- **Content:** **99 Beautiful Names**.  
- **Features:** Search · list gradients · detail with Arabic, English name, Urdu meaning, short tafseer · TTS pronunciation.  
- **Status:** Complete.

---

### MODULE I — AI Chatbot

- **File:** `src/Components/ChatbotScreen.tsx` · Screen **17**  
- **Backend:** `POST /api/chat` → `backend/services/chatService.js` (Google Gemini).  
- **Features:**  
  - Text chat  
  - Voice input (mic)  
  - Listen (TTS) on demand  
  - Sidebar history · New Chat · Delete session  
  - History persisted per user (`chatHistoryStore.ts`)  
- **Persona:** Warm, kid-friendly Islamic assistant.  
- **Status:** Complete.

---

### MODULE J — Islamic Quiz (3 games)

- **Hub:** `src/Components/IslamicQuizScreen.tsx` · Screen **18**  
- **Data:** `src/data/quizGames.ts`  
- **Play counts:** `src/services/quizPlayStore.ts`

#### Shared game rules
| Rule | Value |
|------|--------|
| Levels per game | **2** (L1 easier, L2 slightly harder, kid-friendly) |
| Items per round | **5** |
| Word bank | **40** total (20 L1 + 20 L2) AR/UR/EN |
| Word rotation | After **4** plays of a level, sets rotate |
| Wrong attempts | Max **5** → Try Again / Back |
| Success | Stars **1–5** · Next Level / Cancel |
| Both levels cleared | Return to Quiz hub |

#### J1. Word Search
- **File:** `quiz/WordSearchGame.tsx`  
- Drag select across letters; language chips for words in grid.  
- **Status:** Complete.

#### J2. Match Meaning
- **File:** `quiz/MatchGame.tsx`  
- Arabic on left · Urdu or English on right · tap pairs.  
- **Status:** Complete.

#### J3. Pick Meaning
- **File:** `quiz/MeaningGame.tsx`  
- Arabic word · 4 meaning choices.  
- **Status:** Complete.

---

### MODULE K — Profile & accounts

- **File:** `src/Components/ProfileScreen.tsx` · Screen **19**  
- **Service:** `src/services/accountStore.ts`  

#### Account features
| Feature | Detail |
|---------|--------|
| Account list | Saved logins (name + email); Active badge |
| Switch account | Tap → load saved token (no password again) |
| Delete | Trash → remove from device |
| Add profile | `+` → popup → Welcome |
| Max accounts | **4** |
| Logout | Clears current; switches to another or Welcome |
| Navbar | Same floating style as Home |

#### Profile actions
| Row | Detail |
|-----|--------|
| Notifications | Persisted toggle · Firebase / local alerts |
| Contact Support | Email + **text field** for help message → send to support |
| Feedback | Send product feedback |
| Rate App | In-app **5 golden stars** · editable anytime · synced with popup |
| About App | Short product description |

Profile keeps focus on **accounts, notifications, support, and rating**.

---

### MODULE L — In-app rating

| Feature | Detail |
|---------|--------|
| Trigger | After user uses a learning feature **once** |
| UI | Friendly 5-star Rate Mini Abdullah popup |
| Sync | Same rating under Profile → Rate App |
| Visual | Selected stars **golden** |
| Edit | Change anytime; updates immediately |
| Storage | Persisted on device (per active account where applicable) |

---

### MODULE M — Notifications (Firebase)

| Feature | Detail |
|---------|--------|
| Setup | Android app + `google-services` |
| Push / FCM | Device token for reminders |
| Local alerts | Learning / prayer nudges |
| Profile toggle | On/off preference persisted |
| Permission | Android notification permission handled |

---

## 6. Backend API reference

Base URL example: `http://<HOST>:5000`

| Method | Endpoint | Purpose | Body / query |
|--------|----------|---------|--------------|
| GET | `/ping` | Health check | — |
| POST | `/api/auth/signup` | Register | `{ name, email, password }` |
| POST | `/api/auth/login` | Login | `{ email, password }` |
| POST | `/api/auth/forgot-password` | Send OTP | `{ email }` |
| POST | `/api/auth/verify-otp` | Verify OTP | `{ email, otp }` |
| POST | `/api/auth/reset-password` | Set new password | `{ email, otp, password }` |
| GET | `/api/prayer` | Prayer times | `city` **or** `lat` & `lng` |
| POST | `/api/chat` | Chatbot message | chat payload (rate-limited) |
| GET | `/api/inspiration/daily` | Daily quote (24h rotation) | — |

**User model (typical):** name, email, hashed password; JWT on success; OTP fields for recovery.

---

## 7. Client services map

| Service | Path | Responsibility |
|---------|------|----------------|
| API config | `src/config/api.ts` | Base URL for device/emulator |
| Account store | `src/services/accountStore.ts` | Multi-login max 4 |
| Prayer | `src/services/prayerService.ts` | Location + API |
| Inspiration | `src/services/inspirationService.ts` | Daily quote (24h) |
| Chat API | `src/services/chatService.ts` | POST chat |
| Chat history | `src/services/chatHistoryStore.ts` | Per-user sessions |
| Quran TTS | `src/services/quranTts.ts` | Speak Arabic |
| Ayah TTS | `src/services/quranTts.ts` | Female voice Arabic pronunciation on play |
| Dua audio | `src/services/duaAudio.ts` | Play dua recordings |
| Quran offline | `src/services/quranService.ts` | Load juz JSON |
| Quiz plays | `src/services/quizPlayStore.ts` | Round rotation counters |
| App rating | rating store service | Popup + Profile stars |
| Notifications | Firebase client + preference | Push / local + toggle |
| First-launch flag | AsyncStorage | Onboarding once |

---

## 8. Data inventory (counts)

| Dataset | Location | Count |
|---------|----------|------:|
| Noorani Qaida lessons | `nooraniQaida.ts` | 32 |
| Tajweed rules | `tajweed.ts` | 10 |
| Quran paras (offline) | `quran/juz-1…30.json` | 30 files |
| Quran words | `quranWords.ts` | 35 |
| Daily surahs | `dailySurahs.ts` | 10 |
| Salah steps | SalahScreen | 10 |
| Daily sunnahs | `dailySunnahs.ts` | 7 |
| Islamic shorts | `islamicShorts.ts` + assets | 10 |
| Duas | `duas.ts` + audio assets | 10 |
| Names of Allah | NamesOfAllahScreen | 99 |
| Quiz vocabulary | `quizGames.ts` | 40 (20+20) |
| Inspiration quotes | backend inspiration route | 5+ |

---

## 9. Design / UX conventions

- **Brand colors:** Purple family (`#5B33C4`, `#6C4DF7`, `#4B2AA8`) · canvas `#F6F7FB`.  
- **Home cards:** Gradients + decorative objects · soft press feedback.  
- **Headers:** Islamic pattern headers with rounded bottoms where used.  
- **Bilingual:** Many screens show **English | Urdu** titles.  
- **Language chips:** Arabic / Urdu / English where translations exist.  
- **Kids tone:** Simple wording, soft cards, quiz stars, tip banners.  
- **Splash:** 1 second.  
- **Onboarding:** First launch only.  
- **Greeting:** Good Morning / Afternoon / Night + active name.  
- **Shared back:** `BackButton` component.  
- **Navbar:** Active darker/larger · inactive soft purple.

---

## 10. Completion summary

| Area | Status |
|------|--------|
| Auth (Signup · Login · Forgot → OTP → Reset · Success) | **Complete** |
| Onboarding once · Splash 1s | **Complete** |
| Home (greeting, quote 24h, prayer, gradient cards) | **Complete** |
| Quran hub (5 sub-modules) | **Complete** |
| Salah + guide video | **Complete** |
| Daily Sunnah | **Complete** |
| Islamic Shorts (10 reels) | **Complete** |
| Duas (audio + video lesson) | **Complete** |
| Names of Allah (99) | **Complete** |
| Chatbot (Gemini · voice · history) | **Complete** |
| Quiz (3 games · levels · stars) | **Complete** |
| Profile · multi-account · support · rating · notifications | **Complete** |
| Firebase notifications | **Complete** |
| Android APK release | **Complete** |

**Overall product documentation status:** Complete Mini Abdullah application modules for FYP reporting and viva.

---

## 11. Feature catalogue (FYP checklist)

### Learning
- [x] Quran hub — 5 sub-modules, offline paras, Sudais + TTS  
- [x] Salah — 10 steps + complete guide video  
- [x] Daily Sunnah — 7 habits  
- [x] Islamic Shorts — 10 vertical videos + covers  
- [x] Duas — 10 with recorded audio + video lesson  
- [x] Names of Allah — 99  
- [x] Islamic Quiz — 3 games, levels, stars  

### Account & recovery
- [x] Signup / Login / Success  
- [x] Multi-account (max 4)  
- [x] Forgot Password → OTP → Reset Password  

### Home & engagement
- [x] Time-based greeting + active account name  
- [x] Daily Inspiration Quote (24h)  
- [x] Prayer Times  
- [x] Gradient learning cards  

### AI & notifications
- [x] Chatbot (Gemini · history · voice · TTS)  
- [x] Firebase notifications + Profile toggle  

### Rating & support
- [x] First-feature rating popup  
- [x] Profile Rate App (golden stars · editable)  
- [x] Contact Support (message → email)  

### Entry & release
- [x] Splash 1 second · onboarding first launch only  
- [x] Android APK for demonstration  

---

## 12. Folder guide

```text
MINIABDULLAH/
├── App.tsx                      # Screen-number navigation
├── MODULES.md                   # Module catalogue
├── PROJECT_DOCUMENTATION.md     # This full specification
├── FYP_Documentation_UI/        # HTML + PNG screenshots pack
├── package.json
├── src/
│   ├── Components/              # Screens (+ quiz/)
│   ├── data/                    # Offline content + quiz words
│   │   └── quran/               # juz-1.json … juz-30.json
│   ├── services/                # API, audio, accounts, rating, notifications
│   ├── config/api.ts
│   ├── assets/                  # Images, duas/, shorts/
│   └── homeAssets/
└── backend/
    ├── server.js
    ├── routes/
    ├── services/
    ├── models/
    └── .env                     # Secrets (do not commit)
```

---

## 13. Suggested FYP report chapter mapping

| Report chapter | Use sections from this file |
|----------------|-----------------------------|
| Introduction | §1 |
| Literature / existing apps | Your research + contrast with §1.2 |
| Methodology / tools | §2 |
| System design | §3, §12 |
| Implementation / modules | §5 (A–M), §6, §7, §8 |
| Results / screenshots | `FYP_Documentation_UI/screenshots/` + live app |
| Testing | Auth recovery, Quran offline, Quiz stars, Chat, rating, notifications |
| Conclusion | Goals §1.3 + completion §10–§11 |

---

## 14. One-page elevator pitch (viva)

> Mini Abdullah is a React Native Islamic learning app for kids with a Node/Express backend and Firebase notifications. It covers Quran (Qaida, Tajweed, 30 offline paras with Sudais audio, words, daily surahs), Salah with a complete guide video, daily Sunnah, Duas with recorded audio, 99 Names of Allah, Islamic Shorts, a Gemini chatbot, prayer times, a daily rotating quote, multi-account profiles, password recovery via OTP, in-app rating, contact support, and three quiz games with levels and stars — in a simple bilingual EN/UR kids-friendly interface.

---

## 15. Brand tokens (quick reference)

| Token | Value | Use |
|-------|-------|-----|
| Primary CTA | `#6C4DF7` | Buttons |
| Active nav / titles | `#4B2AA8` | Navbar, headings |
| Hub accents | `#5B33C4` | Module headers |
| Name ink | `#32158A` | Home name |
| Inactive nav | `#B8A4F0` | Idle tab |
| Canvas | `#F6F7FB` | Background |

---

*End of complete project documentation. Keep this file aligned with `MODULES.md` as the single FYP specification for Mini Abdullah.*
