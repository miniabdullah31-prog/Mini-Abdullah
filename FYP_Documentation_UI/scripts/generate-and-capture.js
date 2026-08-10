/**
 * Generates Mini Abdullah FYP HTML screen replicas and captures PNGs via Puppeteer.
 * Independent of the React Native app — do not import app source.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML_DIR = path.join(ROOT, "html");
const SHOT_DIR = path.join(ROOT, "screenshots");
const ASSETS = "../assets";

function wrap(body, extraHead = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=360, height=780, initial-scale=1" />
<title>Mini Abdullah</title>
<link rel="stylesheet" href="phone.css" />
${extraHead}
</head>
<body>
<div class="phone" id="capture-root">
${body}
</div>
</body>
</html>`;
}

const screens = {};

/* ---------- 01 Splash ---------- */
screens["01_Splash"] = wrap(`
<div style="height:100%;background:#0d6efd;display:flex;align-items:center;justify-content:center;position:relative;">
  <div style="position:absolute;top:50px;color:#fff;font-size:20px;font-weight:700;letter-spacing:1px;">Welcome🕌</div>
  <div style="text-align:center;color:#fff;">
    <div style="font-size:45px;font-weight:800;line-height:1.2;">Mini<br/>Abdullah</div>
    <div style="margin-top:10px;font-size:16px;opacity:.9;">Learn Islam the Right Way</div>
    <div style="display:flex;justify-content:center;gap:12px;margin-top:25px;">
      <span style="width:10px;height:10px;border-radius:5px;background:#fff;"></span>
      <span style="width:10px;height:10px;border-radius:5px;background:#fff;"></span>
      <span style="width:10px;height:10px;border-radius:5px;background:#fff;"></span>
    </div>
  </div>
</div>`);

/* ---------- 02 Onboarding ---------- */
screens["02_Onboarding"] = wrap(`
<div style="height:100%;background:#eef0f5;padding:24px 22px;display:flex;flex-direction:column;">
  <div style="text-align:right;color:#6C4DF7;font-weight:700;font-size:16px;">Skip</div>
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div style="width:260px;height:260px;border-radius:32px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.08);overflow:hidden;">
      <img src="${ASSETS}/learning.png" style="width:220px;height:220px;object-fit:contain;" />
    </div>
    <h1 style="margin-top:28px;font-size:26px;color:#3c1f87;font-weight:800;text-align:center;">The Learning Journey</h1>
    <p style="margin-top:10px;color:#666;font-size:15px;text-align:center;line-height:1.45;">Discover the beauty of Quran</p>
    <div style="width:180px;height:8px;background:#ddd;border-radius:8px;margin-top:28px;overflow:hidden;">
      <div style="width:33%;height:100%;background:#6C4DF7;"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <span style="width:10px;height:10px;border-radius:5px;background:#6C4DF7;"></span>
      <span style="width:10px;height:10px;border-radius:5px;background:#ccc;"></span>
      <span style="width:10px;height:10px;border-radius:5px;background:#ccc;"></span>
    </div>
  </div>
  <div class="btn-primary" style="margin-top:auto;">Next</div>
</div>`);

/* ---------- 03 Welcome ---------- */
screens["03_Welcome"] = wrap(`
<div style="height:100%;background:#eef0f5;padding:40px 30px 30px;display:flex;flex-direction:column;align-items:center;">
  <div style="position:relative;margin-top:20px;">
    <div style="position:absolute;left:-70px;top:30px;background:#fff;padding:15px 20px;border-radius:60px;box-shadow:0 6px 18px rgba(0,0,0,.1);z-index:2;">
      <div style="font-size:18px;font-weight:800;color:#4c2aa8;text-align:center;line-height:1.25;">Assalamu<br/>alaykum</div>
    </div>
    <div style="width:220px;height:220px;border-radius:110px;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;">
      <img src="${ASSETS}/miniAbdullah.png" style="width:170px;height:170px;border-radius:85px;object-fit:cover;" />
    </div>
  </div>
  <div style="margin-top:28px;text-align:center;">
    <div style="font-size:42px;font-weight:300;letter-spacing:-0.5px;">
      <span style="color:#3fd18a">M</span><span style="color:#47a8ff">i</span><span style="color:#5d6cff">n</span><span style="color:#8b3dff">i</span><span style="color:#d52f8c">A</span><span style="color:#f28c28">bdullah</span>
    </div>
    <div style="margin-top:10px;color:#4c2aa8;font-size:20px;">Islam essentials for kids</div>
  </div>
  <div style="width:100%;margin-top:auto;display:flex;flex-direction:column;gap:16px;">
    <div class="btn-primary" style="border-radius:40px;padding:18px;font-size:18px;">I'm new to Mini Abdullah</div>
    <div class="btn-secondary" style="border-radius:40px;padding:16px;">I already have an account</div>
  </div>
</div>`);

/* ---------- 04 Login ---------- */
screens["04_Login"] = wrap(`
<div class="auth-bg" style="background-image:url('${ASSETS}/successScreen.png');">
  <div class="auth-card">
    <img class="logo" src="${ASSETS}/miniAbdullah.png" />
    <div class="auth-title">Welcome Back</div>
    <div class="auth-sub">Continue your Islamic learning journey</div>
    <input class="input" value="abdullah@example.com" readonly />
    <input class="input" type="password" value="password123" readonly />
    <span class="link-purple">Forgot Password?</span>
    <div class="btn-primary">Login</div>
    <span class="link-deep">New here? Create account</span>
  </div>
</div>`);

/* ---------- 05 Register ---------- */
screens["05_Register"] = wrap(`
<div class="auth-bg" style="background-image:url('${ASSETS}/successScreen.png');">
  <div class="auth-card" style="padding:22px 20px;">
    <img class="logo" src="${ASSETS}/miniAbdullah.png" style="width:90px;height:90px;" />
    <div class="auth-title" style="font-size:26px;">Create Account</div>
    <div class="auth-sub">Start your child's Islamic learning journey</div>
    <input class="input" value="Abdullah Ahmed" readonly />
    <input class="input" value="abdullah@example.com" readonly />
    <input class="input" type="password" value="password123" readonly />
    <input class="input" type="password" value="password123" readonly />
    <div class="btn-primary">Create Account</div>
    <span class="link-deep">Already have an account?</span>
  </div>
</div>`);

/* ---------- 06 Forgot Password ---------- */
screens["06_Forgot_Password"] = wrap(`
<div style="height:100%;background:#f3f1ff;display:flex;align-items:center;justify-content:center;padding:24px;">
  <div class="auth-card">
    <img src="${ASSETS}/forgot-password.png" style="width:140px;height:140px;object-fit:contain;margin:0 auto 16px;" />
    <div class="auth-title" style="font-size:26px;">Forgot Password?</div>
    <div class="auth-sub">Enter your email address and we'll send you a password reset link</div>
    <input class="input" value="abdullah@example.com" readonly />
    <div class="btn-primary">Send Reset Link</div>
    <span class="link-deep">Back to Login</span>
  </div>
</div>`);

/* ---------- 07 OTP ---------- */
screens["07_OTP_Verification"] = wrap(`
<div class="auth-bg" style="background-image:url('${ASSETS}/bg.png');">
  <div class="auth-card glass">
    <img class="logo" src="${ASSETS}/miniAbdullah.png" />
    <div class="auth-title" style="color:#3c1f87;">Verify Account</div>
    <div class="auth-sub">Enter the 4-digit code sent to your email</div>
    <div style="display:flex;justify-content:center;gap:12px;margin-bottom:24px;">
      ${[4, 8, 2, 1].map((d) => `<div style="width:52px;height:58px;border:1.5px solid #6C4DF7;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#3c1f87;background:#fff;">${d}</div>`).join("")}
    </div>
    <div class="btn-primary">Verify</div>
    <div style="margin-top:18px;color:#555;font-size:14px;">Didn't receive code? <span style="color:#6C4DF7;font-weight:700;">Resend</span></div>
  </div>
</div>`);

/* ---------- 08 Reset Password ---------- */
screens["08_Reset_Password"] = wrap(`
<div class="auth-bg" style="background-image:url('${ASSETS}/bg.png');">
  <div class="auth-card glass">
    <img class="logo" src="${ASSETS}/miniAbdullah.png" />
    <div class="auth-title" style="color:#3c1f87;font-size:24px;">Create New Password</div>
    <div class="auth-sub">Your new password must be different from the previous one</div>
    <input class="input" type="password" value="newpass123" readonly />
    <input class="input" type="password" value="newpass123" readonly />
    <div class="btn-primary">Update Password</div>
  </div>
</div>`);

/* ---------- 09 Success ---------- */
screens["09_Success"] = wrap(`
<div class="auth-bg" style="background-image:url('${ASSETS}/successScreen.png');">
  <div style="width:100%;text-align:center;padding:20px;">
    <img src="${ASSETS}/miniAbdullah.png" style="width:140px;height:140px;object-fit:contain;margin:0 auto 20px;" />
    <div style="font-size:30px;color:#3b178d;font-weight:800;line-height:1.25;margin-bottom:14px;">Account created successfully</div>
    <div style="font-size:18px;color:#3b178d;line-height:1.45;margin-bottom:40px;">Your child is ready to learn all the<br/>Islam essentials</div>
    <div class="btn-primary">Continue</div>
  </div>
</div>`);

/* ---------- 10 Home ---------- */
const homeCards = [
  ["Quran", "Learn & understand the Quran", "quran.png", "#4C8DFF", "#2E6BFF"],
  ["Salah", "Learn Salah step by step", "mosque4.png", "#7B5CFF", "#5B33C4"],
  ["Daily Sunnah", "Everyday Prophet ﷺ habits", "star.png", "#2EC4B6", "#0F9B8E"],
  ["Islamic Shorts", "Prophets · Seerah · short clips", "bookread.png", "#F5B041", "#E08A4F"],
  ["Duas", "Daily duas for every moment", "kids_praying.png", "#3CB89A", "#1F8A70"],
  ["Names of Allah", "Learn beautiful names of Allah", "tasbeeh2.png", "#5AA0FF", "#2E6BFF"],
  ["Chatbot", "Ask Islamic questions anytime", "ai.png", "#9B6DFF", "#6C4DF7"],
  ["Quiz", "Test your Islamic knowledge", "goldcup.png", "#F472B6", "#DB2777"],
];
screens["10_Home_Dashboard"] = wrap(`
<div class="scroll" style="background:#F6F7FB;">
  <div style="position:absolute;top:44px;left:20px;z-index:10;width:54px;height:54px;border-radius:27px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.12);font-size:22px;color:#4B2AA8;">⏱</div>
  <div style="background:url('${ASSETS}/Home.png') top/cover;padding:78px 0 20px;">
    <div style="padding:0 20px;margin-top:72px;max-width:58%;">
      <div style="font-size:20px;color:#4B2AA8;font-weight:700;">Assalamu Alaikum,</div>
      <div style="font-size:15px;color:#6C4DF7;font-weight:700;margin-top:4px;">Good Morning</div>
      <div style="font-size:38px;color:#32158A;font-weight:800;margin-top:4px;">Alisha!</div>
      <div style="font-size:34px;margin-top:-2px;">👋</div>
      <div style="font-size:15px;color:#444;margin-top:6px;line-height:1.4;">Let's learn, grow and become better Muslims 💜</div>
    </div>
    <div style="margin:52px 20px 0;min-height:250px;border-radius:32px;overflow:hidden;background:url('${ASSETS}/Quotebg.jpg') center/cover;padding:20px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <img src="${ASSETS}/moon.png" style="width:42px;height:42px;object-fit:contain;" />
        <span style="background:#5730CC;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;">✨ Daily Islamic Quote ✨</span>
      </div>
      <div style="text-align:center;font-size:28px;font-weight:800;margin-top:22px;">إِنَّ مَعَ الْعُسْرِ يُسْرًا</div>
      <div style="text-align:center;font-size:15px;font-weight:700;margin:12px auto 0;max-width:75%;line-height:1.4;">“Indeed, with hardship comes ease.”</div>
      <div style="text-align:center;margin-top:16px;"><span style="background:#4B28B8;padding:8px 14px;border-radius:18px;font-size:13px;font-weight:700;">Surah Ash-Sharh (94:6)</span></div>
    </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;padding:20px 20px 100px;gap:0;">
    ${homeCards.map(([t, s, img, c1, c2]) => `
      <div style="width:48%;margin-bottom:14px;border-radius:24px;overflow:hidden;min-height:170px;background:linear-gradient(145deg,${c1},${c2});padding:12px;text-align:center;color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.12);position:relative;">
        <span style="position:absolute;width:70px;height:70px;border-radius:35px;background:rgba(255,255,255,.14);top:-18px;right:-14px;"></span>
        <span style="position:absolute;width:46px;height:46px;border-radius:23px;background:rgba(255,255,255,.12);bottom:18px;left:-12px;"></span>
        <img src="${ASSETS}/${img}" style="width:72px;height:72px;object-fit:contain;margin:14px auto 6px;position:relative;z-index:1;" />
        <div style="font-size:14px;font-weight:800;position:relative;z-index:1;">${t}</div>
        <div style="font-size:11px;font-weight:600;margin-top:4px;line-height:1.3;opacity:.95;position:relative;z-index:1;">${s}</div>
      </div>`).join("")}
  </div>
</div>
<div class="nav-bar">
  <div class="nav-item"><div class="ico">🏠</div><div class="lbl nav-active">Home</div></div>
  <div class="nav-item"><div class="ico" style="opacity:.7;">👤</div><div class="lbl nav-idle">Profile</div></div>
</div>`);

/* ---------- 11 Quran Hub ---------- */
const quranCards = [
  ["Noorani Qaida", "All letters · meaning & audio", "#1F8A70", "#3CB89A", "📖"],
  ["Tajweed", "Simple rules · EN & UR", "#2E6BFF", "#5AA0FF", "🎵"],
  ["Read Quran", "30 paras · offline · Sudais", "#0F9B8E", "#34D1BF", "📗"],
  ["Common Quran Words", "هو · لهم · تثنیہ · جمع", "#7B2FF7", "#5B33C4", "🔤"],
  ["Daily Surahs", "Short surahs · play ayah audio", "#C45C2A", "#E08A4F", "🌙"],
];
screens["11_Quran_Hub"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Quran Learning</div>
    <div class="hub-sub">Offline · clear · light to use</div>
  </div>
  <div class="search-box"><span>🔍</span><span>Search topics, surahs...</span></div>
  <div class="section-label">Start Learning</div>
  ${quranCards.map(([t, s, c1, c2, ico]) => `
    <div class="grad-card" style="background:linear-gradient(135deg,${c1},${c2});">
      <span class="deco-a"></span><span class="deco-b"></span><span class="deco-c"></span>
      <div class="icon-circle">${ico}</div>
      <div style="position:relative;z-index:1;"><div class="t">${t}</div><div class="s">${s}</div></div>
      <div class="chev">›</div>
    </div>`).join("")}
</div>`);

/* ---------- 12 Salah ---------- */
const salahSteps = [
  ["Takbeer", "Raise hands and begin prayer"],
  ["Qiyam & Recitation", "Stand and recite Quran"],
  ["Ruku", "Bow with humility"],
  ["Qaumah", "Stand after ruku"],
  ["First Sajdah", "Prostrate to Allah"],
  ["Jalsa", "Sit between sajdahs"],
];
screens["12_Salah"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Learn Salah</div>
    <div class="hub-sub">Step-by-step · kids friendly</div>
  </div>
  <div class="section-label">Start here</div>
  <div class="grad-card" style="background:linear-gradient(135deg,#0F9B8E,#34D1BF);">
    <span class="deco-a"></span><span class="deco-b"></span><span class="deco-c"></span>
    <div class="icon-circle">💧</div>
    <div style="flex:1;position:relative;z-index:1;">
      <div class="t">How to Perform Wudu</div>
      <div class="s">وضو کا طریقہ · Ablution video</div>
    </div>
    <div class="chev">▶</div>
  </div>
  <div class="section-label">Prayer Steps</div>
  ${salahSteps.map((s, i) => {
    const colors = [["#1F8A70","#3CB89A"],["#2E6BFF","#5AA0FF"],["#7B2FF7","#5B33C4"],["#C45C2A","#E08A4F"],["#0F9B8E","#34D1BF"],["#B06AB3","#7B3FA0"]];
    const [a,b] = colors[i % colors.length];
    return `<div class="grad-card" style="background:linear-gradient(135deg,${a},${b});">
      <span class="deco-a"></span><span class="deco-b"></span>
      <div class="icon-circle">${i + 1}</div>
      <div style="flex:1;position:relative;z-index:1;"><div class="t">${s[0]}</div><div class="s">${s[1]}</div></div>
      <div class="chev">›</div>
    </div>`;
  }).join("")}
  <div class="grad-card" style="background:linear-gradient(135deg,#2E6BFF,#5AA0FF);">
    <span class="deco-a"></span><span class="deco-b"></span>
    <div class="icon-circle">▶</div>
    <div style="flex:1;position:relative;z-index:1;">
      <div class="t">Complete Salah Guide</div>
      <div class="s">مکمل نماز گائیڈ · Full video</div>
    </div>
    <div class="chev">›</div>
  </div>
</div>`);

/* ---------- 13 Daily Sunnah ---------- */
const sunnahs = [
  ["Say Salam", "السلام علیکم", "Greet others with peace"],
  ["Smile Softly", "مسکراہٹ", "A smile is charity"],
  ["Bismillah Before Eating", "کھانے کا ادب", "Begin meals with Bismillah"],
  ["Help Parents", "والدین کی مدد", "Be kind every day"],
  ["Sleep the Sunnah Way", "سونے کی سنت", "Rest the Prophetic way"],
  ["Say Alhamdulillah", "الحمدللہ کہنا", "Thank Allah often"],
];
screens["13_Daily_Sunnah"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Daily Sunnah</div>
    <div class="hub-sub">Everyday Prophet ﷺ habits</div>
  </div>
  <div class="section-label">Today's Habits</div>
  ${sunnahs.map((s, i) => {
    const colors = [["#1F8A70","#3CB89A"],["#2E6BFF","#5AA0FF"],["#7B2FF7","#5B33C4"],["#C45C2A","#E08A4F"],["#0F9B8E","#34D1BF"],["#B06AB3","#7B3FA0"]];
    const [a,b] = colors[i % colors.length];
    return `<div class="grad-card" style="background:linear-gradient(135deg,${a},${b});">
      <span class="deco-a"></span><span class="deco-b"></span><span class="deco-c"></span>
      <div class="icon-circle">✦</div>
      <div style="flex:1;position:relative;z-index:1;"><div class="t">${s[0]}</div><div class="s">${s[2]}</div></div>
      <div style="font-size:14px;opacity:.95;position:relative;z-index:1;">${s[1]}</div>
    </div>`;
  }).join("")}
</div>`);

/* ---------- 14 Islamic Shorts ---------- */
const shortClips = [
  ["Miracle of Prophet Musa (AS) — when the sea split by Allah’s command.", "#1F8A70", "#3CB89A"],
  ["Prophet Yunus (AS) inside the whale — never lose hope in Allah’s mercy.", "#2E6BFF", "#5AA0FF"],
  ["Seerah reminder — kindness of the Prophet ﷺ with children.", "#7B2FF7", "#5B33C4"],
  ["Short clip — say Salam and spread peace every day.", "#C45C2A", "#E08A4F"],
];
screens["14_Islamic_Shorts"] = wrap(`
<div class="scroll" style="background:#F6F7FB;">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Islamic Shorts</div>
    <div class="hub-sub">Prophets · Seerah · short clips</div>
  </div>
  <div class="section-label">Watch</div>
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;padding:0 20px 40px;">
    ${shortClips.map(([cap, c1, c2]) => `
      <div style="width:48%;margin-bottom:16px;">
        <div style="border-radius:20px;overflow:hidden;aspect-ratio:9/14;background:linear-gradient(160deg,${c1},${c2});position:relative;box-shadow:0 6px 14px rgba(0,0,0,.12);">
          <span class="deco-a"></span><span class="deco-b"></span>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
            <div style="width:48px;height:48px;border-radius:24px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15);">
              <span style="color:#5B33C4;font-size:18px;margin-left:3px;">▶</span>
            </div>
          </div>
        </div>
        <div style="margin-top:8px;font-size:12px;font-weight:700;color:#2E1A6B;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${cap}</div>
      </div>`).join("")}
  </div>
</div>`);

/* ---------- 15 Duas ---------- */
const duas = [
  ["Morning Dua", "أَصْـبَحْنا وَأَصْـبَحَ المـلْكُ لله", "Start your day with Allah", "#1F8A70", "#3CB89A"],
  ["Sleeping Dua", "اللّهُـمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", "Before sleep", "#2E6BFF", "#5AA0FF"],
  ["Before Eating", "بِسْمِ اللهِ", "Begin meals with Bismillah", "#7B2FF7", "#5B33C4"],
  ["Travel Dua", "سُبْحَانَ الَّذِي سَخَّرَ لَنَا", "Safe journeys", "#C45C2A", "#E08A4F"],
];
screens["15_Duas"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Daily Duas</div>
    <div class="hub-sub">Remember Allah in every moment</div>
  </div>
  <div class="section-label">Choose a Dua</div>
  ${duas.map(([t, ar, cap, c1, c2]) => `
    <div class="grad-card" style="background:linear-gradient(135deg,${c1},${c2});align-items:flex-start;">
      <span class="deco-a"></span><span class="deco-b"></span><span class="deco-c"></span>
      <div class="icon-circle">🤲</div>
      <div style="flex:1;position:relative;z-index:1;">
        <div class="t">${t}</div>
        <div class="s">${cap}</div>
        <div style="margin-top:8px;font-size:16px;font-weight:700;text-align:right;direction:rtl;">${ar}</div>
      </div>
    </div>`).join("")}
</div>`);

/* ---------- 16 Names of Allah ---------- */
const names = [
  ["Ar-Rahman", "ٱلرَّحْمَـٰنُ", "The Most Merciful", "#1F8A70", "#3CB89A"],
  ["Ar-Raheem", "ٱلرَّحِيمُ", "The Especially Merciful", "#2E6BFF", "#5AA0FF"],
  ["Al-Malik", "ٱلْمَلِكُ", "The Absolute Ruler", "#7B2FF7", "#5B33C4"],
  ["Al-Quddus", "ٱلْقُدُّوسُ", "The Pure / Holy", "#C45C2A", "#E08A4F"],
  ["As-Salam", "ٱلسَّلَامُ", "The Source of Peace", "#0F9B8E", "#34D1BF"],
  ["Al-Mu'min", "ٱلْمُؤْمِنُ", "The Guardian of Faith", "#B06AB3", "#7B3FA0"],
];
screens["16_Names_of_Allah"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Names of Allah</div>
    <div class="hub-sub">99 beautiful names · meaning & audio</div>
  </div>
  <div class="search-box"><span>🔍</span><span>Search names...</span></div>
  ${names.map(([en, ar, m, c1, c2]) => `
    <div class="grad-card" style="background:linear-gradient(135deg,${c1},${c2});">
      <span class="deco-a"></span><span class="deco-b"></span><span class="deco-c"></span>
      <div style="flex:1;position:relative;z-index:1;">
        <div class="t">${en}</div>
        <div class="s">${m}</div>
      </div>
      <div style="font-size:22px;font-weight:800;position:relative;z-index:1;">${ar}</div>
    </div>`).join("")}
</div>`);

/* ---------- 17 Chatbot ---------- */
screens["17_Chatbot"] = wrap(`
<div style="height:100%;background:#F6F7FB;display:flex;flex-direction:column;">
  <div style="background:url('${ASSETS}/Quotebg.jpg') center/cover;padding:16px 14px 18px;border-radius:0 0 28px 28px;color:#fff;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;gap:8px;">
        <div class="back-btn" style="margin:0;">‹</div>
        <div class="back-btn" style="margin:0;font-size:16px;">☰</div>
      </div>
      <div style="font-weight:800;font-size:17px;">AI Chatbot</div>
      <div class="back-btn" style="margin:0;font-size:16px;">＋</div>
    </div>
  </div>
  <div style="flex:1;padding:16px 14px;overflow:hidden;">
    <div style="max-width:88%;background:#fff;border-radius:18px 18px 18px 6px;padding:12px 14px;box-shadow:0 3px 10px rgba(0,0,0,.06);font-size:14px;line-height:1.45;color:#333;">
      Assalamu Alaikum! Main Mini Abdullah AI assistant hoon. Islam, daily life, ya koi sawal poochho — main madad karunga. ✨
    </div>
    <div style="max-width:78%;margin:12px 0 0 auto;background:#6C4DF7;color:#fff;border-radius:18px 18px 6px 18px;padding:12px 14px;font-size:14px;line-height:1.45;">
      What is the meaning of Bismillah?
    </div>
    <div style="max-width:88%;margin-top:12px;background:#fff;border-radius:18px 18px 18px 6px;padding:12px 14px;box-shadow:0 3px 10px rgba(0,0,0,.06);font-size:14px;line-height:1.45;color:#333;">
      Bismillah means “In the name of Allah.” Muslims say it before starting good actions to seek Allah’s blessing and help.
    </div>
  </div>
  <div style="padding:12px 14px 18px;display:flex;gap:10px;align-items:center;">
    <div style="flex:1;background:#fff;border-radius:24px;padding:12px 16px;box-shadow:0 2px 10px rgba(0,0,0,.06);color:#999;font-size:14px;">Type your question...</div>
    <div style="width:44px;height:44px;border-radius:22px;background:#6C4DF7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;">🎤</div>
    <div style="width:44px;height:44px;border-radius:22px;background:#5B33C4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;">➤</div>
  </div>
</div>`);

/* ---------- 18 Quiz Hub ---------- */
const games = [
  ["Word Search", "Find hidden words in the grid", "Slide · find · win stars!", "#8B5CF6", "#4C1D95", "2 Levels"],
  ["Match Meaning", "Join Arabic with Urdu or English", "Tap pairs · learn fast!", "#14B8A6", "#0F766E", "2 Levels"],
  ["Pick Meaning", "Choose the right meaning", "4 choices · be smart!", "#3B82F6", "#1D4ED8", "2 Levels"],
];
screens["18_Quiz_Hub"] = wrap(`
<div class="scroll">
  <div class="hub-header">
    <div class="back-btn">‹</div>
    <div class="hub-title">Islamic Quiz</div>
    <div class="hub-sub">Play · learn · earn stars</div>
  </div>
  <div class="search-box"><span>🔍</span><span>Search games...</span></div>
  <div class="section-label">Choose a Game</div>
  ${games.map(([t, s, f, c1, c2, badge]) => `
    <div style="margin:0 20px 14px;border-radius:22px;padding:18px;color:#fff;background:linear-gradient(145deg,${c1},${c2});box-shadow:0 8px 20px rgba(0,0,0,.15);position:relative;overflow:hidden;">
      <div style="position:absolute;right:10px;top:8px;opacity:.2;font-size:40px;">★</div>
      <div style="display:inline-block;background:rgba(255,255,255,.2);padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;margin-bottom:10px;">${badge}</div>
      <div style="font-size:22px;font-weight:800;">${t}</div>
      <div style="font-size:13px;opacity:.95;margin-top:6px;">${s}</div>
      <div style="font-size:12px;margin-top:10px;font-weight:700;opacity:.9;">${f}</div>
    </div>`).join("")}
</div>`);

/* ---------- 19 Profile / Settings ---------- */
screens["19_Profile_Settings"] = wrap(`
<div class="scroll" style="background:#F6F7FB;">
  <div style="background:url('${ASSETS}/learn_bg.png') center/cover;border-radius:0 0 35px 35px;padding:28px 20px 36px;color:#fff;">
    <div style="font-size:28px;font-weight:800;">Profile</div>
    <div style="margin-top:6px;opacity:.95;font-size:14px;">Manage accounts & settings · 1/4</div>
  </div>
  <div style="margin:-28px 20px 16px;background:#fff;border-radius:22px;padding:16px;box-shadow:0 8px 20px rgba(0,0,0,.08);display:flex;align-items:center;gap:12px;">
    <img src="${ASSETS}/miniAbdullah.png" style="width:56px;height:56px;border-radius:28px;object-fit:cover;" />
    <div style="flex:1;">
      <div style="font-weight:800;color:#2E1A6B;font-size:16px;">Abdullah Ahmed · Active</div>
      <div style="color:#777;font-size:13px;margin-top:2px;">abdullah@example.com</div>
    </div>
    <div style="width:36px;height:36px;border-radius:18px;background:#6C4DF7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">+</div>
  </div>
  <div class="list-card" style="display:flex;justify-content:space-between;align-items:center;">
    <div style="font-weight:700;color:#2E1A6B;">Notifications</div>
    <div style="width:48px;height:28px;border-radius:14px;background:#6C4DF7;position:relative;"><div style="position:absolute;right:3px;top:3px;width:22px;height:22px;border-radius:11px;background:#fff;"></div></div>
  </div>
  ${[["📧","Contact Support"],["💬","Feedback"],["⭐","Rate App · ★★★★☆"],["ℹ️","About App"]].map(([ico, label]) => `
    <div class="list-card" style="display:flex;align-items:center;gap:12px;">
      <span style="color:#6C4DF7;font-size:18px;">${ico}</span>
      <span style="flex:1;font-weight:700;color:#2E1A6B;">${label}</span>
      <span style="color:#777;">›</span>
    </div>`).join("")}
  <div style="margin:18px 20px 100px;background:#E53935;border-radius:18px;padding:14px;text-align:center;color:#fff;font-weight:800;">Logout</div>
</div>
<div class="nav-bar">
  <div class="nav-item"><div class="ico" style="opacity:.7;">🏠</div><div class="lbl nav-idle">Home</div></div>
  <div class="nav-item"><div class="ico">👤</div><div class="lbl nav-active">Profile</div></div>
</div>`);

/* ---------- 20 Word Search (bonus in-app game) ---------- */
screens["20_Word_Search_Game"] = wrap(`
<div style="height:100%;background:linear-gradient(180deg,#8B5CF6,#4C1D95);padding:16px;color:#fff;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
    <div style="width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;">‹</div>
    <div style="font-weight:800;font-size:18px;">Word Search</div>
    <div style="background:rgba(255,255,255,.2);padding:6px 10px;border-radius:12px;font-size:12px;font-weight:700;">⭐ 2</div>
  </div>
  <div style="background:rgba(255,255,255,.12);border-radius:18px;padding:12px;margin-bottom:14px;font-size:13px;line-height:1.4;">
    Find: <b>Allah</b> · <b>Salah</b> · <b>Quran</b> · <b>Dua</b>
  </div>
  <div style="background:#fff;border-radius:20px;padding:12px;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;">
    ${"AQURANDUASALAHXYZALLAHMNOP".split("").slice(0,36).map((ch,i)=>{
      const hi = [1,2,3,4,5].includes(i) || [18,19,20,21,22].includes(i) || [24,25,26,27,28].includes(i);
      return `<div style="aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;background:${hi?"#EDE7FF":"#F6F7FB"};color:${hi?"#5B33C4":"#333"};">${ch}</div>`;
    }).join("")}
  </div>
  <div style="margin-top:16px;display:flex;justify-content:space-between;font-size:13px;font-weight:700;">
    <span>Tries left: 3</span>
    <span>Level 1 / 2</span>
  </div>
</div>`);

function writeHtml() {
  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  for (const [name, html] of Object.entries(screens)) {
    fs.writeFileSync(path.join(HTML_DIR, `${name}.html`), html, "utf8");
  }
  console.log(`Wrote ${Object.keys(screens).length} HTML files`);
}

async function capture() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("Puppeteer not installed. Run: npm install in FYP_Documentation_UI");
    process.exit(1);
  }

  const chromeCandidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  const executablePath = chromeCandidates.find((p) => fs.existsSync(p));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    timeout: 120000,
    protocolTimeout: 120000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });
  console.log("Using browser:", executablePath || "bundled Chromium");

  const page = await browser.newPage();
  await page.setViewport({
    width: 360,
    height: 780,
    deviceScaleFactor: 4, // 1440 × 3120
  });

  for (const name of Object.keys(screens)) {
    const fileUrl = "file:///" + path.join(HTML_DIR, `${name}.html`).replace(/\\/g, "/");
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = img.onerror = res;
              })
        )
      );
    });
    const out = path.join(SHOT_DIR, `${name}.png`);
    await page.screenshot({
      path: out,
      type: "png",
      omitBackground: false,
      clip: { x: 0, y: 0, width: 360, height: 780 },
    });
    console.log("Captured", name);
  }

  await browser.close();
  console.log("Done. Screenshots in", SHOT_DIR);
}

async function main() {
  writeHtml();
  if (process.argv.includes("--html-only")) return;
  await capture();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
