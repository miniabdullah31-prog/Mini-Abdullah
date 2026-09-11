# Mini Abdullah — FYP Presentation Summary

*Presentation-ready guide for team members · September 2026*

---

## 1. Project Title & One-Liner

**Title:** Mini Abdullah — Islamic Learning App for Kids  
**One-liner:** A colorful, bilingual mobile app that teaches Quran, Salah, duas, and everyday Islamic habits to children through stories, games, and a friendly AI companion — with prayer times, daily learning, and family-friendly multi-account support.

---

## 2. Problem Statement / Purpose

Children need Islamic education that feels warm and age-appropriate, not like adult religious apps. Parents often struggle to find one trusted place that combines Quran basics, prayer guidance, daily habits, and light interactive learning.

**Mini Abdullah solves this by offering:**
- Structured Islamic learning in small, kid-friendly modules
- English + Urdu bilingual support (Arabic where needed)
- Offline Quran reading so learning continues without internet
- Play-based reinforcement through quizzes and short videos
- AI assistance for simple Islamic questions
- Gentle daily engagement through quotes, prayer times, and reminders

---

## 3. Target Audience

| Audience | Role |
|----------|------|
| **Primary** | Children (approx. ages 5–12) learning Islam with parent guidance |
| **Secondary** | Parents and teachers using the app as a home or classroom learning aid |
| **Regional focus** | Urdu/English-speaking families, especially in Pakistan and similar markets |

---

## 4. Key Features (Grouped)

### Entry & Accounts
- Splash screen, first-launch onboarding (3 steps, shown once)
- Email signup and login with JWT sessions
- Google Sign-In (UI and backend ready; Firebase setup pending)
- Forgot password → OTP email → reset password
- Up to **4 accounts** on one device (siblings/family profiles)

### Home Hub
- Time-based greeting with active user name (*Assalamu Alaikum, [Name]*)
- Daily Islamic quote (Arabic + English, rotates every 24 hours)
- Prayer times by GPS or manual city (Fajr through Isha)
- **Today's Learning** section: Word of the Day, Dua of the Day, Daily Quest
- 8 gradient feature cards + floating **Talk to Abdullah** mic button

### Quran Learning (5 sub-modules)
| Module | Content |
|--------|---------|
| Noorani Qaida | 32 letter/harakat lessons with TTS |
| Tajweed | 10 expandable rules with examples |
| Read Quran | 30 paras offline (AR/UR/EN) + ayah audio |
| Common Quran Words | 35 words with singular/dual/plural |
| Daily Surahs | 10 short surahs with Sudais audio |

### Worship & Daily Life
- **Salah** — 10 guided steps + complete prayer guide video
- **Daily Sunnah** — 7 everyday Prophetic habits with tips
- **Duas** — 10 daily duas with recorded MP3 + video lesson
- **Names of Allah** — all 99 names with search, meaning, and TTS

### Media & Engagement
- **Islamic Shorts** — 10 vertical reel-style videos (Prophets, Seerah, lessons)
- **Islamic Quiz (Games)** — 3 games, 2 levels each, star ratings:
  - Word Search
  - Match Meaning
  - Pick Meaning

### AI Companions
- **Chatbot** — text chat with Google Gemini; voice input; TTS listen; chat history
- **Talking Abdullah** — voice-first animated character; speak and listen in conversation

### Profile & Support
- Switch/delete accounts, logout
- Notifications toggle (local reminders + FCM when configured)
- Contact Support and Feedback (authenticated API → email)
- In-app 5-star rating (popup after first feature use; editable in Profile)
- About App

---

## 5. Tech Stack

### Frontend (Mobile)
| Technology | Purpose |
|------------|---------|
| React Native 0.85 + React 19 | Cross-platform UI (Android primary) |
| TypeScript | Typed screens and services |
| AsyncStorage | Sessions, multi-account, prefs, chat/quiz history |
| react-native-tts | Arabic and conversational speech |
| react-native-sound-player + FS | Quran Sudais audio, dua MP3s |
| react-native-video | Shorts and guide videos |
| @react-native-voice/voice | Voice input (chatbot, Talking Abdullah) |
| Geolocation | Prayer times by location |
| react-native-notify-kit | Local scheduled notifications |
| @react-native-firebase/messaging | FCM push (when Firebase configured) |
| @react-native-google-signin | Google Sign-In (when configured) |
| axios | Backend HTTP calls |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | REST API (port 5000) |
| MongoDB + Mongoose | Users, OTP, support messages, daily content |
| JWT + bcryptjs | Authentication and password security |
| Nodemailer | OTP and support emails |
| Google Generative AI (Gemini) | Chatbot and Talking Abdullah replies |
| Firebase Admin | FCM token storage and scheduled push |
| node-cron | Daily push scheduler (Word / Dua / Quest) |
| Helmet + express-rate-limit | Security headers and abuse protection |

### External Services
- **Aladhan API** — prayer times
- **Gemini API** — AI responses (key kept on server)
- **SMTP** — password recovery OTP (DEV mode available for testing)
- **Firebase** — FCM push and Google Sign-In (project: `mini-abdullah`)

### Database
- **MongoDB** — user accounts, OTP fields, support messages, FCM tokens, daily content documents

### Platform
- **Android** — primary demo and release target
- **iOS** — not fully polished for FYP demo

---

## 6. Architecture Overview

```mermaid
flowchart TB
  subgraph Mobile["Mini Abdullah App (Android)"]
    UI[Screens 1–20]
    Local[AsyncStorage · TTS · Video · Audio]
    LocalNotif[Local Notifications]
    FCMClient[FCM Client]
  end

  subgraph Backend["Express Backend :5000"]
    Auth[/api/auth]
    Prayer[/api/prayer]
    Chat[/api/chat]
    Insp[/api/inspiration]
    Daily[/api/daily-content]
    Notif[/api/notifications]
    Support[/api/support]
    DB[(MongoDB)]
    Scheduler[Daily FCM Scheduler]
  end

  subgraph External["External Services"]
    Aladhan[Aladhan API]
    Gemini[Gemini AI]
    SMTP[Email SMTP]
    Firebase[Firebase Admin / FCM]
  end

  UI --> Auth & Prayer & Chat & Insp & Daily & Support & Notif
  UI --> Local
  UI --> LocalNotif
  UI --> FCMClient
  Auth --> DB
  Chat --> Gemini
  Prayer --> Aladhan
  Auth --> SMTP
  Support --> SMTP
  Notif --> DB
  Notif --> Firebase
  Scheduler --> Firebase
  FCMClient --> Firebase
  Firebase --> FCMClient
```

**Design principle:** Secrets (JWT, Gemini, SMTP, Firebase Admin) stay on the backend; the app only holds user JWTs and local content.

---

## 7. Authentication

### Email & Password — **Fully Working**
1. User signs up → password hashed with bcrypt → JWT issued (7-day expiry)
2. Login returns JWT stored in multi-account store (max 4 profiles)
3. Protected APIs require `Authorization: Bearer <token>`
4. Password recovery: email → 6-digit OTP (10 min) → verify → reset (rate-limited)

### Google Sign-In — **Implemented, Setup Pending**
- Login screen shows Google button
- Backend: `POST /api/auth/google`
- **Not yet live for demo** until Firebase Console + Web Client ID configured

**Presenter note:** Demo with **email login** unless Google is fully configured.

---

## 8. Notifications

### A. Local Notifications — **Working**
- Daily quote, Sunnah nudge, evening learning, prayer alerts (Profile toggle)

### B. FCM Push — **Code Ready, Firebase Setup Required**
- Scheduler: 08:00 Word · 16:00 Dua · 19:30 Quest (Asia/Karachi)
- Requires `google-services.json` + Firebase Admin on backend

---

## 9. Main Screens (20 Total)

| # | Screen | Summary |
|---|--------|---------|
| 1 | Splash | Brand intro |
| 2 | Onboarding | 3 slides (first launch) |
| 3 | Welcome | Signup or Login |
| 4–9 | Auth flow | Signup, Login, Forgot, OTP, Reset, Success |
| 10 | Home | Hub: quote, learning, 8 cards, Talk FAB |
| 11 | Quran Hub | 5 sub-modules |
| 12 | Salah | 10 steps + video |
| 13 | Daily Sunnah | 7 habits |
| 14 | Islamic Shorts | 10 reels |
| 15 | Duas | 10 duas + audio |
| 16 | Names of Allah | 99 names |
| 17 | Chatbot | Gemini AI chat |
| 18 | Games | 3 quiz games |
| 19 | Profile | Accounts, settings |
| 20 | Talking Abdullah | Voice AI character |

---

## 10. Backend APIs (High Level)

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/*` | Signup, login, Google, OTP reset |
| `/api/prayer` | Prayer times |
| `/api/inspiration/daily` | Daily quote |
| `/api/daily-content/today` | Word, Dua, Quest |
| `/api/chat` | Gemini chatbot (JWT) |
| `/api/support` | Support/feedback (JWT) |
| `/api/notifications/*` | FCM token + test push (JWT) |

---

## 11. Status — Working vs Pending

### ✅ Demo-Ready
- Full email auth, all 20 screens, offline Quran, AI chat, quiz, multi-account, local notifications

### ⚠️ Config-Dependent
- Google Sign-In (Firebase Web Client ID)
- FCM daily push (Firebase Admin)

### 🔜 Future
- Profile APIs, iOS polish, automated tests, production security hardening

---

## 12. Demo Flow (~15 min)

1. Login → **Home** (greeting, Today's Learning)
2. **Quran** → Read Quran → offline para + audio
3. **Salah** → one step + TTS
4. **Duas** → play audio
5. **Games** → Word Search → stars
6. **Islamic Shorts** → one reel
7. **Chatbot** → ask *"What is Wudu?"*
8. **Talking Abdullah** → voice question
9. Prayer times → location/city
10. **Profile** → notifications ON, multi-account

**Closing:** *"Mini Abdullah combines structured Islamic content, offline Quran, gamified learning, and a kid-safe AI companion — all in one bilingual app for families."*

---

## 13. Future Scope

- Firebase production setup (Google + FCM)
- Parent dashboard, more games/badges
- iOS release, cloud profile sync, refresh tokens

---

## 14. Q&A Prep

| Question | Short Answer |
|----------|--------------|
| Why React Native? | One codebase, faster FYP delivery, native modules where needed |
| Data security? | bcrypt, JWT, rate limits, secrets on server only |
| Offline Quran? | Yes — 30 paras bundled in app |
| Kid-safe AI? | Gemini with Islamic persona, login + rate limits, key on server |
| Notifications? | Hybrid: local reminders + FCM daily push when configured |

---

## Quick Reference

| Item | Value |
|------|-------|
| App | Mini Abdullah |
| Platform | Android (React Native 0.85) |
| Backend | Express :5000 · MongoDB |
| Firebase | `mini-abdullah` · `com.miniabdullah` |
| Screens | 20 · Max accounts: 4 · Quran paras: 30 · Games: 3 |

---

## Run Commands

```bash
# Terminal 1
npm run backend

# Terminal 2
npm start
npm run android
```

Ensure `backend/.env` has `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`. Set `DEV_MACHINE_IP` in `src/config/api.ts` for physical device testing.

---

*Share this file with team members for FYP defense or demo without the project owner present.*
