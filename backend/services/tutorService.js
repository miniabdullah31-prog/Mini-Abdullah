const Tutor = require("../models/Tutor");
const Appointment = require("../models/Appointment");
const { todayKey, TZ } = require("./dailyContentService");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateKey(value) {
  if (!DATE_RE.test(String(value || ""))) return false;
  const [y, m, d] = String(value).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function isValidTime(value) {
  return TIME_RE.test(String(value || ""));
}

function dayOfWeekFromDateKey(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function minutesFromHhmm(hhmm) {
  const [h, min] = hhmm.split(":").map(Number);
  return h * 60 + min;
}

function nowMinutesInKarachi() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

function isDateTimePast(dateKey, hhmm) {
  const today = todayKey();
  if (dateKey < today) return true;
  if (dateKey > today) return false;
  return minutesFromHhmm(hhmm) <= nowMinutesInKarachi();
}

function toPublicTutor(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    role: doc.role,
    gender: doc.gender,
    specializations: doc.specializations || [],
    bio: doc.bio || "",
    subject: doc.subject,
    isActive: !!doc.isActive,
  };
}

function zoomLinkFromTutor(tutor) {
  const fromDoc = String(tutor?.defaultZoomLink || "").trim();
  if (fromDoc && !/^YOUR[_-]/i.test(fromDoc) && !/^<.*>$/.test(fromDoc)) {
    return fromDoc;
  }
  const slug = tutor?.slug;
  let fromEnv = "";
  if (slug === "quran-tutor") {
    fromEnv = String(process.env.TUTOR_QURAN_ZOOM_LINK || "").trim();
  } else if (
    slug === "islamic-studies-teacher" ||
    slug === "quran-translation-tafseer-tutor" ||
    slug === "islamic-life-guidance-tutor"
  ) {
    fromEnv = String(process.env.TUTOR_ISLAMIC_ZOOM_LINK || "").trim();
  }
  if (!fromEnv || /^YOUR[_-]/i.test(fromEnv) || /^<.*>$/.test(fromEnv)) {
    return "";
  }
  return fromEnv;
}

const SEED_TUTORS = [
  {
    slug: "quran-tutor",
    name: "Quran Reading Tutor",
    role: "Quran Reading / Nazra",
    gender: "male",
    specializations: [
      "Quran Reading",
      "Nazra",
      "Quran Recitation",
      "Basic Quran Learning",
    ],
    bio: "Learn to read the Quran correctly with a child-friendly Nazra tutor. Improve recitation and build strong Quran reading habits online.",
    subject: "Quran Reading",
    isActive: true,
    weeklyAvailability: [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
      dayOfWeek,
      slots: [
        { startTime: "16:00", endTime: "16:30" },
        { startTime: "16:30", endTime: "17:00" },
        { startTime: "17:00", endTime: "17:30" },
        { startTime: "17:30", endTime: "18:00" },
      ],
    })),
    unavailableDates: [],
    defaultZoomLink: "",
  },
  {
    slug: "quran-translation-tafseer-tutor",
    name: "Quran Translation & Tafseer Tutor",
    role: "Translation & Tafseer",
    gender: "female",
    specializations: [
      "Quran Translation",
      "Tafseer",
      "Quran Meanings",
      "Child-friendly Tafseer",
    ],
    bio: "Understand Quran meanings with simple translation and child-friendly Tafseer. Learn what Allah is teaching us in a clear, gentle way.",
    subject: "Quran Translation & Tafseer",
    isActive: true,
    weeklyAvailability: [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
      dayOfWeek,
      slots: [
        { startTime: "15:00", endTime: "15:30" },
        { startTime: "15:30", endTime: "16:00" },
        { startTime: "16:00", endTime: "16:30" },
        { startTime: "16:30", endTime: "17:00" },
      ],
    })),
    unavailableDates: [],
    defaultZoomLink: "",
  },
  {
    slug: "islamic-life-guidance-tutor",
    name: "Islamic Life & Guidance Tutor",
    role: "Islamic Life Guidance",
    gender: "female",
    specializations: [
      "Islamic Habits",
      "Good Character",
      "Life Skills",
      "Deen & Dunia Guidance",
    ],
    bio: "Learn how to live a successful life according to Islam — good habits, character, responsibilities, and practical guidance for religious and everyday matters.",
    subject: "Islamic Life & Guidance",
    isActive: true,
    weeklyAvailability: [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
      dayOfWeek,
      slots: [
        { startTime: "14:00", endTime: "14:30" },
        { startTime: "14:30", endTime: "15:00" },
        { startTime: "17:00", endTime: "17:30" },
        { startTime: "17:30", endTime: "18:00" },
      ],
    })),
    unavailableDates: [],
    defaultZoomLink: "",
  },
];

async function seedTutorsIfNeeded() {
  for (const seed of SEED_TUTORS) {
    const existing = await Tutor.findOne({ slug: seed.slug });
    if (existing) {
      existing.name = seed.name;
      existing.role = seed.role;
      existing.gender = seed.gender;
      existing.specializations = seed.specializations;
      existing.bio = seed.bio;
      existing.subject = seed.subject;
      existing.isActive = true;
      if (
        !existing.weeklyAvailability ||
        existing.weeklyAvailability.length === 0
      ) {
        existing.weeklyAvailability = seed.weeklyAvailability;
      }
      await existing.save();
      continue;
    }
    await Tutor.create({
      ...seed,
      defaultZoomLink: zoomLinkFromTutor(seed),
    });
    console.log(`[tutors] seeded ${seed.slug}`);
  }

  // Keep the older Islamic Studies category inactive so hub shows exactly 3 options.
  await Tutor.updateMany(
    { slug: "islamic-studies-teacher" },
    { $set: { isActive: false } },
  );
}

async function listActiveTutors() {
  const docs = await Tutor.find({ isActive: true })
    .select("-defaultZoomLink")
    .sort({ name: 1 })
    .lean();
  return docs.map(toPublicTutor);
}

async function getPublicTutorById(id) {
  if (!id || !String(id).match(/^[a-fA-F0-9]{24}$/)) {
    return null;
  }
  const doc = await Tutor.findOne({ _id: id, isActive: true })
    .select("-defaultZoomLink")
    .lean();
  return toPublicTutor(doc);
}

async function getTutorForBooking(id) {
  if (!id || !String(id).match(/^[a-fA-F0-9]{24}$/)) {
    return null;
  }
  return Tutor.findById(id);
}

async function getAvailabilityForDate(tutor, dateKey) {
  const today = todayKey();
  if (!isValidDateKey(dateKey) || dateKey < today) {
    return { date: dateKey, slots: [] };
  }
  if (!tutor.isActive) {
    return { date: dateKey, slots: [] };
  }
  if ((tutor.unavailableDates || []).includes(dateKey)) {
    return { date: dateKey, slots: [] };
  }

  const dow = dayOfWeekFromDateKey(dateKey);
  const day = (tutor.weeklyAvailability || []).find(
    (entry) => Number(entry.dayOfWeek) === dow,
  );
  const template = day?.slots || [];
  if (!template.length) {
    return { date: dateKey, slots: [] };
  }

  const booked = await Appointment.find({
    tutorId: tutor._id,
    date: dateKey,
    status: { $in: ["pending", "confirmed"] },
  })
    .select("startTime")
    .lean();
  const bookedStarts = new Set(booked.map((row) => row.startTime));

  const slots = template.map((slot) => {
    const pastToday = isDateTimePast(dateKey, slot.startTime);
    const taken = bookedStarts.has(slot.startTime);
    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !taken && !pastToday,
    };
  });

  return { date: dateKey, slots };
}

async function assertSlotBookable(tutor, dateKey, startTime, endTime) {
  if (!tutor || !tutor.isActive) {
    const err = new Error("This tutor is not available.");
    err.status = 400;
    throw err;
  }
  if (!isValidDateKey(dateKey)) {
    const err = new Error("Please choose a valid date.");
    err.status = 400;
    throw err;
  }
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    const err = new Error("Please choose a valid time.");
    err.status = 400;
    throw err;
  }
  if (minutesFromHhmm(endTime) <= minutesFromHhmm(startTime)) {
    const err = new Error("Please choose a valid time.");
    err.status = 400;
    throw err;
  }

  const today = todayKey();
  if (dateKey < today) {
    const err = new Error("Past dates cannot be booked.");
    err.status = 400;
    throw err;
  }
  if (
    dateKey === today &&
    minutesFromHhmm(startTime) <= nowMinutesInKarachi()
  ) {
    const err = new Error("That time has already passed.");
    err.status = 400;
    throw err;
  }

  const availability = await getAvailabilityForDate(tutor, dateKey);
  const match = availability.slots.find(
    (slot) =>
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      slot.available,
  );
  if (!match) {
    const err = new Error("That time is no longer available.");
    err.status = 409;
    throw err;
  }
}

module.exports = {
  TZ,
  isValidDateKey,
  isValidTime,
  toPublicTutor,
  zoomLinkFromTutor,
  seedTutorsIfNeeded,
  listActiveTutors,
  getPublicTutorById,
  getTutorForBooking,
  getAvailabilityForDate,
  assertSlotBookable,
  isDateTimePast,
};
