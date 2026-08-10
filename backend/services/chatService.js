const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_INSTRUCTION = `You are "Mini Abdullah", a warm, caring Islamic companion for children and families in a mobile app — like a kind friend who listens well.

LANGUAGE:
- Reply in the same language the user used (Urdu/Roman Urdu or English). Keep words simple, soft, and natural.

STYLE (VERY IMPORTANT):
- Do NOT start with Assalamu Alaikum, Salam, Hello, Hi, or any greeting.
- Do NOT introduce yourself (no "I am Mini Abdullah", no "main Mini Abdullah hoon").
- The app already showed a welcome message. Jump straight into a helpful reply.
- Do NOT use Markdown. No **, *, __, #, or code fences.
- Use plain text only. For lists use: 1) 2) 3)
- COMPLETENESS FIRST: Always finish the full answer. Never stop mid-sentence, mid-word, or mid-list. Incomplete answers are not allowed.
- ADAPTIVE LENGTH:
  - Casual / emotional chat → shorter, friendly (comfort + 1 question + 2 tips + warm close).
  - Teaching questions that need detail (pillars, salah steps, stories, explanations) → give enough detail to be clear and complete.
  - Do NOT make every reply a long essay, but also do NOT cut needed detail just to stay short.
- Avoid repeating the same idea in many paragraphs.
- NEVER end with cold disclaimers like "Main AI hoon, doctor/mufti nahi", "I am only an AI", or similar. That feels rude. Stay warm and supportive instead.

EMOTIONAL / SAD / STRESSED MESSAGES:
- Comfort briefly and kindly.
- Ask ONE soft follow-up (dil kyun udas / kya hua / batao).
- Give at most 2 small tips (wudu/water, short dhikr, talk to someone).
- One light Islamic touch is enough when natural.
- Close warmly: main yahan hoon, bata sakte ho.

RESPONSE CATEGORIES:

1) ISLAMIC QUESTIONS (faith, Quran, Hadith, Salah, duas, Seerah, akhlaq):
- Clear, age-appropriate, COMPLETE, reliable answer.
- If listing items (e.g. 5 pillars), include ALL items with a short meaning for each — never stop at item 4 or cut a word like "Makk".
- Add authentic references when sure (Surah + ayah; Hadith collection if reliable).
- If unsure about exact citation, say so honestly — never invent Hadith numbers.
- No cold AI/mufti disclaimer at the end.

2) DAILY LIFE QUESTIONS (school, manners, friendship, habits, time):
- Warm, practical help.
- Light Islamic manners only when it feels natural.

3) DEEP / SENSITIVE / SECTARIAN / COMPLEX FIQH / MEDICAL-HALAL EDGE / POLITICAL-RELIGIOUS DISPUTES:
- Do NOT give a detailed ruling or take a side.
- Politely say this needs a trusted scholar/person, and keep the tone kind — not cold.
- Do NOT invent phone numbers, WhatsApp, emails, or links.

SAFETY:
- If self-harm or severe crisis appears: be gentle, urge talking to parents/trusted adult immediately, and stay supportive.
- Refuse harmful, violent, adult, or hateful content kindly.
- Never claim to be a human scholar or doctor.`;

const MODEL_CANDIDATES = [
  "gemini-flash-latest",
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-pro-latest",
  "gemini-2.5-flash",
].filter(Boolean);

function uniqueModels(list) {
  const seen = new Set();
  const out = [];
  for (const m of list) {
    const key = String(m).trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHistory(history = []) {
  if (!Array.isArray(history)) return [];

  const cleaned = history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.text === "string" &&
        item.text.trim() &&
        !/Could not get a reply|Gemini limit|Gemini model|Could not reach/i.test(
          item.text,
        ),
    )
    .slice(-12)
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.text.trim().slice(0, 2000) }],
    }));

  // Gemini requires alternating user/model, starting with user
  const alternating = [];
  for (const item of cleaned) {
    const last = alternating[alternating.length - 1];
    if (last && last.role === item.role) {
      last.parts[0].text += `\n${item.parts[0].text}`;
    } else {
      alternating.push(item);
    }
  }
  while (alternating.length && alternating[0].role !== "user") {
    alternating.shift();
  }
  if (alternating.length && alternating[alternating.length - 1].role === "user") {
    alternating.pop();
  }
  return alternating;
}

function statusFromError(error) {
  const raw = String(error?.message || error || "");
  const m = raw.match(/\[(\d{3})\s/);
  return m ? Number(m[1]) : 0;
}

function friendlyGeminiError(errors) {
  const list = Array.isArray(errors) ? errors : [errors];
  const msgs = list.map((e) => String(e?.message || e || ""));

  if (msgs.some((m) => /429|Too Many Requests|quota/i.test(m))) {
    return "Gemini free limit / busy hai. 20–30 seconds wait karke dobara try karo.";
  }
  if (msgs.some((m) => /503|Service Unavailable|overloaded/i.test(m))) {
    return "Gemini server busy hai (503). Thora wait karke dobara try karo.";
  }
  if (msgs.some((m) => /API[_ ]?KEY|invalid.*key|403|PERMISSION/i.test(m))) {
    return "Gemini API key invalid hai. backend/.env mein GEMINI_API_KEY check karo.";
  }
  if (msgs.some((m) => /ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(m))) {
    return "Gemini tak internet nahi pohonch raha. PC internet check karo.";
  }
  if (msgs.some((m) => /404|not found|no longer available/i.test(m))) {
    return "Gemini model available nahi. GEMINI_MODEL=gemini-2.0-flash try karo aur server restart karo.";
  }

  const last = msgs.filter(Boolean).pop();
  return last?.slice(0, 200) || "Could not get a reply right now. Please try again.";
}

function cleanReplyText(text) {
  return String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function tryModel(genAI, modelName, cleanMessage, history) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 1200,
    },
  });

  const chat = model.startChat({
    history: buildHistory(history),
  });

  const result = await chat.sendMessage(cleanMessage);
  const reply = cleanReplyText(result?.response?.text());

  if (!reply) {
    throw new Error("Empty response from AI");
  }

  return { reply, model: modelName };
}

async function generateChatReply(userMessage, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const error = new Error(
      "GEMINI_API_KEY is missing. Add it to backend/.env from Google AI Studio.",
    );
    error.code = "MISSING_API_KEY";
    throw error;
  }

  const cleanMessage = String(userMessage || "").trim().slice(0, 2000);
  if (!cleanMessage) {
    const error = new Error("Message is required");
    error.code = "VALIDATION";
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const models = uniqueModels(MODEL_CANDIDATES);
  const failures = [];

  for (const modelName of models) {
    // Up to 3 attempts per model for transient 429/503
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        console.log(`[chat] trying model: ${modelName} (attempt ${attempt})`);
        return await tryModel(genAI, modelName, cleanMessage, history);
      } catch (error) {
        failures.push(error);
        const msg = String(error?.message || "");
        const code = statusFromError(error);
        console.log(
          `[chat] model failed: ${modelName} => ${msg.slice(0, 180)}`,
        );

        if (/API[_ ]?KEY|PERMISSION_DENIED|403|invalid.*key/i.test(msg)) {
          const err = new Error(friendlyGeminiError(failures));
          err.code = "GEMINI_FAILED";
          throw err;
        }

        const retryable = code === 429 || code === 503 || /overloaded|Unavailable/i.test(msg);
        if (retryable && attempt < 3) {
          await sleep(1200 * attempt);
          continue;
        }
        break;
      }
    }
  }

  const error = new Error(friendlyGeminiError(failures));
  error.code = "GEMINI_FAILED";
  throw error;
}

module.exports = {
  generateChatReply,
};
