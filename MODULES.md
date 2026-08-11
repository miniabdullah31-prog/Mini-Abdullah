# Mini Abdullah — App Modules Documentation

**Project:** Mini Abdullah (FYP)  
**Stack:** React Native (Android) + Express backend + Firebase (notifications)  
**Navigation:** Screen-number based (`App.tsx` screens `1`–`19`)  
**Last updated:** August 2026  
**Documentation status:** Final FYP module catalogue

> Master reference for Mini Abdullah modules, features, and viva.  
> Focus is on **what the app delivers** — real learning and account features.

---

## Priority modules (core product)

| Priority | Module | Why it matters |
|----------|--------|----------------|
| P1 | Auth (Signup · Login · Forgot → OTP → Reset) | Account entry & recovery |
| P1 | Home | Hub for all learning + prayer + daily quote |
| P1 | Quran hub (5 sub-modules) | Main Islamic learning track |
| P1 | Salah | Step-by-step prayer learning |
| P1 | Chatbot | AI Q&A for kids |
| P1 | Islamic Quiz | Practice through 3 games |
| P2 | Daily Sunnah | Everyday Prophetic habits |
| P2 | Duas | Daily duas with audio |
| P2 | Names of Allah | 99 names with TTS |
| P2 | Islamic Shorts | Short vertical Islamic clips |
| P2 | Profile · multi-account | Switch profiles, support, rating, notifications |
| P3 | Rating popup + Profile Rate App | Engagement / feedback |
| P3 | Firebase notifications | Reminders (toggle in Profile) |
| P3 | APK release | Demo / evaluation build |

---

## Feature overview

| # | Feature | Status |
|---|---------|--------|
| 1 | Splash (1 second) | **DONE** |
| 2 | First-time Onboarding (3 steps, once only) | **DONE** |
| 3 | Welcome · Signup · Login · Success | **DONE** |
| 4 | Forgot Password → OTP → Reset Password | **DONE** |
| 5 | Home dashboard (greeting, quote, prayer, cards) | **DONE** |
| 6 | Time-based greeting (Good Morning / Afternoon / Night) | **DONE** |
| 7 | Active-account name on Home | **DONE** |
| 8 | Daily Inspiration Quote (changes every 24 hours) | **DONE** |
| 9 | Prayer Times (location + city) | **DONE** |
| 10 | Quran hub (5 sub-modules, offline + audio) | **DONE** |
| 11 | Salah (10 steps + complete guide video) | **DONE** |
| 12 | Daily Sunnah (7 habits) | **DONE** |
| 13 | Islamic Shorts (10 vertical reels + covers) | **DONE** |
| 14 | Duas (10 duas · recorded audio · video lesson) | **DONE** |
| 15 | Names of Allah (99 names · TTS) | **DONE** |
| 16 | AI Chatbot (Gemini · history · voice · TTS) | **DONE** |
| 17 | Islamic Quiz (3 games · 2 levels · stars) | **DONE** |
| 18 | Profile · multi-account (max 4) | **DONE** |
| 19 | In-app Rate App (5 stars · Profile sync · editable) | **DONE** |
| 20 | Feature-use rating popup (after first feature use) | **DONE** |
| 21 | Contact Support (message field → email send) | **DONE** |
| 22 | Firebase push / local notifications | **DONE** |
| 23 | Notifications toggle (Profile · persisted) | **DONE** |
| 24 | Home learning cards — gradient + decorative objects | **DONE** |
| 25 | Android APK release build | **DONE** |
| 26 | Backend APIs (auth · prayer · chat · inspiration · password reset) | **DONE** |

---

## 1. Auth / Entry flow

| Screen # | Module | File | Status | Feature summary |
|----------|--------|------|--------|-----------------|
| 1 | Splash | `src/Components/SplashScreen.tsx` | **DONE** | Brand splash for **1 second**, then continues |
| 2 | Onboarding (3 steps) | `src/Components/onBoardingScreens.tsx` | **DONE** | Shown **only on first app launch**; Skip / Next → Welcome |
| 3 | Welcome | `src/Components/WelcomeScreen.tsx` | **DONE** | Brand hero · new user / existing account |
| 4 | Signup | `src/Components/Signup.tsx` | **DONE** | `POST /api/auth/signup` · JWT · multi-account save (max 4) |
| 5 | Login | `src/Components/Login.tsx` | **DONE** | `POST /api/auth/login` · JWT · multi-account save |
| 6 | Forgot Password | `src/Components/ForgetPassword.tsx` | **DONE** | Email → backend OTP → OTP screen |
| 7 | OTP Verification | `src/Components/OtpVerification.tsx` | **DONE** | 4-digit verify · resend · Reset Password |
| 8 | Reset Password | `src/Components/ResetPassword.tsx` | **DONE** | New password · backend reset · Login |
| 9 | Success | `src/Components/SuccessScreen.tsx` | **DONE** | After signup → Home |

**Auth highlights:** secure signup/login (JWT + hashed passwords), up to 4 profiles on one device, full **Forgot → OTP → Reset** recovery, custom success/error dialogs.

---

## 2. Home

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Home screen | `src/Components/Home.tsx` | **DONE** | Hero · daily quote · learning cards · prayer · navbar |
| Time-based greeting | Home | **DONE** | **Good Morning** / **Good Afternoon** / **Good Night** by device time |
| Active user name | Home | **DONE** | Shows active account name |
| Daily Inspiration Quote | `inspirationService` + `/api/inspiration` | **DONE** | New quote every **24 hours**; Arabic + translation + source |
| Prayer Times | `prayerService` + `/api/prayer` | **DONE** | Location or manual city · Fajr–Isha |
| Bottom navbar | Home | **DONE** | Home · Profile |
| Learning cards UI | Home | **DONE** | Gradient surfaces, soft touch feedback, decorative icons/objects |

### Home feature cards

| # | Card | Opens | Status |
|---|------|-------|--------|
| 1 | Quran | 11 | **DONE** |
| 2 | Salah | 12 | **DONE** |
| 3 | Daily Sunnah | 13 | **DONE** |
| 4 | Islamic Shorts | 14 | **DONE** |
| 5 | Duas | 15 | **DONE** |
| 6 | Names of Allah | 16 | **DONE** |
| 7 | Chatbot | 17 | **DONE** |
| 8 | Quiz | 18 | **DONE** |

---

## 3. Quran hub + sub-modules

**Hub:** `src/Components/QuranScreen.tsx` (screen 11) — **DONE**

| Sub-module | Screen / file | Data | Status | Details |
|------------|---------------|------|--------|---------|
| Noorani Qaida | `NooraniQaidaScreen.tsx` | `nooraniQaida.ts` (32) | **DONE** | Letters + harakat · meaning · TTS |
| Tajweed | `TajweedScreen.tsx` | `tajweed.ts` (10 rules) | **DONE** | Expandable rules · example TTS · EN/UR |
| Read Quran | `ReadQuranScreen.tsx` → `ParaAyahsScreen.tsx` | `juzMeta` + `juz-1…30.json` | **DONE** | 30 paras · AR/UR/EN · Sudais audio |
| Common Quran Words | `QuranWordsScreen.tsx` | `quranWords.ts` (35) | **DONE** | Singular / Dual / Plural · TTS |
| Daily Surahs | `DailySurahsScreen.tsx` | `dailySurahs.ts` (10) | **DONE** | Short surahs · per-ayah Sudais play |

**Services:** `quranTts.ts` · `quranAudio.ts` · `quranService.ts` — **DONE**

---

## 4. Salah

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Salah module | `SalahScreen.tsx` (screen 12) | **DONE** | 10 guided steps |
| Step detail | AR / UR / EN · TTS · how-to · tafseer | **DONE** | Kid-friendly explanations |
| Complete Salah Guide video | same screen | **DONE** | Complete prayer guide video |

**Steps:** Takbeer · Qiyam & Recitation · Ruku · Qaumah · First Sajdah · Jalsa · Second Sajdah · Tashahhud · Durood Ibrahim & Dua · Salam

---

## 5. Daily Sunnah

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Daily Sunnah | `DailySunnahScreen.tsx` (13) | **DONE** | List + detail |
| Data | `dailySunnahs.ts` | **DONE** | **7** sunnahs |

**Sunnahs:** Say Salam · Smile Softly · Bismillah Before Eating · Help Parents · Sleep the Sunnah Way · Say Alhamdulillah · Keep Clean (Taharah)

Each card: Meaning · How · Prophet ﷺ example · Benefit · Tip · UR/EN · Arabic + TTS where present.

---

## 6. Islamic Shorts

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Shorts player | `StoriesScreen.tsx` (14) | **DONE** | Vertical reels · caption · progress |
| Content | `islamicShorts.ts` | **DONE** | **10** shorts |
| Videos & covers | `src/assets/shorts/` | **DONE** | Vertical 9:16 clips + thumbnails |

Topics: Prophets, Seerah, short Islamic lessons for kids.

---

## 7. Duas

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Duas list + detail | `DuasScreen.tsx` (15) | **DONE** | Search · AR/UR/EN · tafseer |
| Data | `duas.ts` | **DONE** | **10** duas |
| Audio player | `duaAudio.ts` | **DONE** | Recorded MP3 per dua |
| Audio files | `src/assets/duas/` | **DONE** | All 10 attached |
| Video lesson | Duas detail | **DONE** | Dua learning guide video |

**Duas:** Morning · Sleeping · Eating · Travel · Parents · Before Study · Leaving Home · Entering Home · Forgiveness · Protection

---

## 8. Names of Allah

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Names of Allah | `NamesOfAllahScreen.tsx` (16) | **DONE** | **99** names |
| Search · detail | EN/UR meaning · tafseer · TTS | **DONE** | Kid-readable |

---

## 9. Chatbot (AI assistant)

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Chatbot UI | `ChatbotScreen.tsx` (17) | **DONE** | Chat · history sidebar · new chat |
| Backend Gemini | `backend/services/chatService.js` | **DONE** | Server-side AI · rate limited |
| History | `chatHistoryStore.ts` | **DONE** | Per-user sessions |
| Voice input | `@react-native-voice/voice` | **DONE** | Speech-to-text |
| Listen (TTS) | on-demand | **DONE** | Speak bot answers |

---

## 10. Islamic Quiz

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Quiz hub | `IslamicQuizScreen.tsx` (18) | **DONE** | 3 game cards |
| Word Search | `quiz/WordSearchGame.tsx` | **DONE** | Drag select · highlight |
| Match Meaning | `quiz/MatchGame.tsx` | **DONE** | Arabic ↔️ Urdu/English |
| Pick Meaning | `quiz/MeaningGame.tsx` | **DONE** | Arabic + 4 choices |
| Data | `quizGames.ts` | **DONE** | 40 words (20 L1 + 20 L2) |
| Play rotation | `quizPlayStore.ts` | **DONE** | Rotating rounds |

**Rules:** 2 levels · max 5 wrong attempts · stars 1–5 on clear · 5 items per round · both levels → back to hub.

---

## 11. Profile & account

| Item | File | Status | Feature summary |
|------|------|--------|-----------------|
| Profile screen | `ProfileScreen.tsx` (19) | **DONE** | Accounts · settings · navbar |
| Multi-account (max 4) | `accountStore.ts` | **DONE** | Switch without re-password |
| Add profile | popup | **DONE** | → Welcome / Signup-Login |
| Remove account from device | trash | **DONE** | Local session remove |
| Logout | current account | **DONE** | Safe session clear |
| Notifications toggle | Profile + Firebase | **DONE** | Preference persisted |
| Contact Support | Profile | **DONE** | Help message text field → send to support email |
| Feedback | Profile | **DONE** | Send product feedback |
| Rate App | Profile | **DONE** | In-app 5-star rating (see §12) |
| About App | Profile | **DONE** | Short product description |

Profile focuses on **accounts, support, rating, and notifications** — simple for parents and kids.

---

## 12. In-app rating

| Item | Status | Feature summary |
|------|--------|-----------------|
| First-feature-use popup | **DONE** | After using a learning feature once → Rate Mini Abdullah (5 stars) |
| Star selection | **DONE** | Tap 1–5 stars |
| Sync to Profile → Rate App | **DONE** | Same rating shown in Profile |
| Golden filled stars | **DONE** | Selected stars golden |
| Change anytime | **DONE** | Re-open Rate App · update instantly |
| Persistence | **DONE** | Saved on device (per active account where applicable) |

---

## 13. Notifications (Firebase)

| Item | Status | Feature summary |
|------|--------|-----------------|
| Firebase Android setup | **DONE** | App registered · `google-services` |
| FCM / push | **DONE** | Device token for reminders |
| Local notifications | **DONE** | Learning / prayer nudges |
| Profile toggle | **DONE** | On/off · preference saved |
| Permission flow | **DONE** | Android notification permission |

Uses: gentle learning reminders, inspiration nudges, optional prayer alerts.

---

## 14. UI / UX

| Principle | Status | In the app |
|-----------|--------|------------|
| Brand purple | **DONE** | `#6C4DF7` · `#4B2AA8` · `#5B33C4` · `#F6F7FB` |
| Kids-friendly layout | **DONE** | Large titles, clear CTAs |
| Home cards | **DONE** | Gradients + decorative objects · touch feedback |
| Auth screens | **DONE** | Rounded cards on branded backgrounds |
| Navbar | **DONE** | Active darker/larger · inactive soft purple |
| Splash | **DONE** | **1 second** |
| Onboarding | **DONE** | First launch only |
| Greeting | **DONE** | Morning / Afternoon / Night |
| Rating + Support UX | **DONE** | Stars sync · typed support message |

---

## 15. Backend

| API | Status | Summary |
|-----|--------|---------|
| `GET /ping` | **DONE** | Health |
| `/api/auth` signup, login | **DONE** | JWT · bcrypt · Mongo |
| Forgot / OTP / Reset | **DONE** | Email OTP · verify · reset password |
| `/api/prayer` | **DONE** | City or lat/lng · Aladhan |
| `/api/chat` | **DONE** | Gemini · rate limit |
| `/api/inspiration/daily` | **DONE** | Quote pool · **24h** rotation |

**Env:** `PORT` · `MONGO_URI` · `JWT_SECRET` · `GEMINI_API_KEY` · `GEMINI_MODEL` · mail/OTP · Firebase admin (if server push used)

---

## 16. Client services

| Service | Path | Status |
|---------|------|--------|
| API base URL | `src/config/api.ts` | **DONE** |
| Account store | `src/services/accountStore.ts` | **DONE** |
| Prayer | `src/services/prayerService.ts` | **DONE** |
| Inspiration (24h) | `src/services/inspirationService.ts` | **DONE** |
| Chat API | `src/services/chatService.ts` | **DONE** |
| Chat history | `src/services/chatHistoryStore.ts` | **DONE** |
| Quran TTS / Sudais / offline | `quranTts` · `quranAudio` · `quranService` | **DONE** |
| Dua audio | `src/services/duaAudio.ts` | **DONE** |
| App rating store | Profile + popup persistence | **DONE** |
| Notifications client | FCM + preference | **DONE** |
| First-launch flag | AsyncStorage | **DONE** |

---

## 17. Release / APK

| Item | Status | Summary |
|------|--------|---------|
| Android release APK | **DONE** | Installable demo / FYP build |
| Home card polish | **DONE** | Gradient cards in release UI |
| Demo readiness | **DONE** | Backend + Firebase + TTS for showcase |

---

## 18. Architecture map

```
Splash (1s) → Onboarding (first launch only) → Welcome
                    ├─ Signup → Success → Home
                    └─ Login ──────────→ Home

Forgot → OTP → Reset → Login

Home (Good Morning/Afternoon/Night + active name)
  ├─ Daily Quote (24h) · Prayer Times
  ├─ Gradient learning cards
  ├─ Quran → Qaida · Tajweed · Read Quran · Words · Daily Surahs
  ├─ Salah (+ guide video)
  ├─ Daily Sunnah
  ├─ Islamic Shorts
  ├─ Duas (audio + video)
  ├─ Names of Allah (99)
  ├─ Chatbot (Gemini)
  ├─ Quiz (Word Search · Match · Pick Meaning)
  └─ Profile (accounts · notifications · support · rate app)

Backend: /api/auth (+ OTP/reset) · /api/prayer · /api/chat · /api/inspiration
```

---

## 19. Feature checklist

### Learning (P1–P2)
- [x] Quran hub — 5 sub-modules, offline, Sudais + TTS  
- [x] Salah — 10 steps + guide video  
- [x] Daily Sunnah — 7 habits  
- [x] Islamic Shorts — 10 reels + covers  
- [x] Duas — 10 with audio + video lesson  
- [x] Names of Allah — 99  
- [x] Quiz — 3 games, levels, stars  

### Account
- [x] Signup / Login / Success  
- [x] Multi-account (max 4)  
- [x] Forgot → OTP → Reset  

### Home & engagement
- [x] Time-based greeting + active name  
- [x] Daily quote (24h) · Prayer Times  
- [x] Gradient learning cards  

### AI & notifications
- [x] Chatbot (Gemini · history · voice · TTS)  
- [x] Firebase notifications + Profile toggle  

### Rating & support
- [x] First-feature rating popup  
- [x] Profile Rate App (golden stars · editable)  
- [x] Contact Support (message → email)  

### Entry & release
- [x] Splash 1s · onboarding once  
- [x] Android APK  

---

## 20. Key paths (docs / viva)

| Area | Path |
|------|------|
| Navigation | `App.tsx` |
| Home | `src/Components/Home.tsx` |
| Screens | `src/Components/*Screen.tsx` |
| Quiz | `src/Components/quiz/` |
| Data | `src/data/` |
| Offline Quran | `src/data/quran/` |
| Shorts / Duas assets | `src/assets/shorts/` · `src/assets/duas/` |
| Services | `src/services/` |
| Backend | `backend/` |
| Screenshots | `FYP_Documentation_UI/screenshots/` |

---

## 21. Brand tokens

| Token | Value | Use |
|-------|-------|-----|
| Primary CTA | `#6C4DF7` | Buttons |
| Active nav / titles | `#4B2AA8` | Navbar, headings |
| Hub accents | `#5B33C4` | Module headers |
| Name ink | `#32158A` | Home name |
| Inactive nav | `#B8A4F0` | Idle tab |
| Canvas | `#F6F7FB` | Background |

---

*Single source of truth for Mini Abdullah modules — prioritised around real learning, account, and engagement features for FYP documentation and viva.*
