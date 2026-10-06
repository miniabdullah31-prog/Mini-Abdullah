import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import {
  getPrayerTimesByCity,
} from "../services/prayerService";
import { filterCities } from "../data/pakistanCities";
import {
  getDailyInspiration,
  QUOTE_ROTATION_MS,
} from "../services/inspirationService";
import {
  ensureAccountsHydrated,
  getActiveAccountEmail,
} from "../services/accountStore";
import {
  getRatingStars,
  setRatingStars,
  isRatingPromptPending,
  dismissRatingPrompt,
  setCachedPrayerTimes,
} from "../services/appPrefsStore";
import { refreshPrayerNotificationsIfEnabled } from "../services/notificationService";
import {
  fetchTodayDailyContent,
  FALLBACK_DAILY,
  DailyLearningContent,
} from "../services/dailyContentService";
import RateAppModal from "./RateAppModal";
import SmoothPressable from "./SmoothPressable";
import CoinsBalanceChip from "./CoinsBalanceChip";
import DailyLearningDetail, {
  DailyLearningKind,
} from "./DailyLearningDetail";
import {
  claimReward,
  fetchRewardBalance,
  getCachedRewardBalance,
  todayKeyKarachi,
} from "../services/rewardsService";
import { playUiSound } from "../services/soundService";

const FALLBACK_QUOTE = {
  arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  quote: "Indeed, with hardship comes ease.",
  source: "Surah Ash-Sharh (94:6)",
};

type FlatPrayerTimes = {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
};

/** Normalize nested or flat prayer API shapes into a flat times object. */
function normalizePrayerTimes(result: any): FlatPrayerTimes | null {
  const raw = result?.prayerTimes ?? result;
  if (!raw || typeof raw !== "object") return null;
  const nested = raw.prayerTimes && typeof raw.prayerTimes === "object"
    ? raw.prayerTimes
    : raw;
  const fajr = nested.fajr || nested.Fajr;
  const dhuhr = nested.dhuhr || nested.Dhuhr;
  const asr = nested.asr || nested.Asr;
  const maghrib = nested.maghrib || nested.Maghrib;
  const isha = nested.isha || nested.Isha;
  if (!fajr && !dhuhr && !asr && !maghrib && !isha) return null;
  return { fajr, dhuhr, asr, maghrib, isha };
}

/** Convert "04:35", "4:35", "16:09 (+05)" → "4:35 AM" / "4:09 PM". */
function formatPrayerTime12h(raw?: string): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw.trim();
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return raw.trim();
  if (hour > 23 || minute > 59) return raw.trim();
  const mer = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${mer}`;
}

function toDisplayPrayerTimes(times: FlatPrayerTimes): FlatPrayerTimes {
  return {
    fajr: formatPrayerTime12h(times.fajr),
    dhuhr: formatPrayerTime12h(times.dhuhr),
    asr: formatPrayerTime12h(times.asr),
    maghrib: formatPrayerTime12h(times.maghrib),
    isha: formatPrayerTime12h(times.isha),
  };
}

async function cacheAndRefreshPrayerNotifs(
  city: string,
  times: FlatPrayerTimes,
) {
  try {
    await setCachedPrayerTimes({ city, ...times });
    await refreshPrayerNotificationsIfEnabled();
  } catch {
    // never block prayer UI on notification errors
  }
}

type Props = {
  goToQuran: () => void;
  goToStories: () => void;
  goToDuas: () => void;
  goToChatbot: () => void;
  goToNamesOfAllah: () => void;
  goToSalah: () => void;
  goToQuiz: () => void;
  goToDailySunnah: () => void;
  goToProfile: () => void;
  goToTalkingAbdullah: () => void;
  goToTutor: () => void;
};

const Home: React.FC<Props> = ({
  goToQuran,
  goToStories,
  goToDuas,
  goToChatbot,
  goToNamesOfAllah,
  goToSalah,
  goToQuiz,
  goToDailySunnah,
  goToProfile,
  goToTalkingAbdullah,
  goToTutor,
}) => {
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [cityModal, setCityModal] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityListOpen, setCityListOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(FALLBACK_QUOTE);
  const [displayName, setDisplayName] = useState("Friend");
  const [ratingVisible, setRatingVisible] = useState(false);
  const [savedStars, setSavedStars] = useState(0);
  const [dailyLearning, setDailyLearning] =
    useState<DailyLearningContent>(FALLBACK_DAILY);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState(false);
  const [coins, setCoins] = useState<number | null>(
    () => getCachedRewardBalance()?.coins ?? null,
  );
  const [questClaimed, setQuestClaimed] = useState(
    () => getCachedRewardBalance()?.todayQuestClaimed ?? false,
  );
  const [questClaiming, setQuestClaiming] = useState(false);
  const [dailyDetail, setDailyDetail] = useState<DailyLearningKind | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    const loadDailyQuote = async () => {
      try {
        const inspiration = await getDailyInspiration();
        if (active && inspiration?.quote) {
          setDailyQuote({
            arabic: inspiration.arabic || FALLBACK_QUOTE.arabic,
            quote: inspiration.quote,
            source: inspiration.source || FALLBACK_QUOTE.source,
          });
        }
      } catch {
        // Keep offline fallback quote
      }
    };

    const loadUserAndRating = async () => {
      try {
        const accounts = await ensureAccountsHydrated();
        const activeEmail = await getActiveAccountEmail();
        const account = activeEmail
          ? accounts.find((a) => a.email === activeEmail)
          : accounts[0];
        const rawName = account?.name?.trim() || accounts[0]?.name?.trim() || "";
        const first = rawName.split(/\s+/)[0];
        if (active) {
          setDisplayName(first || "Friend");
        }

        const stars = await getRatingStars();
        const pending = await isRatingPromptPending();
        if (active) {
          setSavedStars(stars);
          if (pending) setRatingVisible(true);
        }
      } catch {
        // keep defaults
      }
    };

    loadDailyQuote();
    loadUserAndRating();

    const loadCoins = async () => {
      try {
        const balance = await fetchRewardBalance();
        if (active) {
          setCoins(balance.coins);
          setQuestClaimed(balance.todayQuestClaimed);
        }
      } catch {
        const fallback = getCachedRewardBalance();
        if (active && fallback) {
          setCoins(fallback.coins);
          setQuestClaimed(fallback.todayQuestClaimed);
        }
      }
    };
    loadCoins();

    const loadDailyLearning = async () => {
      try {
        setDailyLoading(true);
        setDailyError(false);
        const content = await fetchTodayDailyContent();
        if (active) {
          setDailyLearning(content);
          setDailyError(!content.date);
        }
      } catch {
        if (active) {
          setDailyError(true);
          setDailyLearning(FALLBACK_DAILY);
        }
      } finally {
        if (active) setDailyLoading(false);
      }
    };

    loadDailyLearning();

    const pollMs = Math.max(60 * 60 * 1000, Math.floor(QUOTE_ROTATION_MS / 4));
    const intervalId = setInterval(loadDailyQuote, pollMs);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredCities = useMemo(
    () => filterCities(cityQuery),
    [cityQuery],
  );

  const openCityPicker = () => {
    setCityQuery(currentCity || "");
    setCityListOpen(false);
    setCityModal(true);
  };

  const fetchPrayerForCity = async (cityRaw: string) => {
    const city = cityRaw.trim();
    if (!city) {
      Alert.alert("Error", "Please select or enter a city name.");
      return;
    }

    setCityModal(false);
    setCityListOpen(false);
    setLoading(true);

    try {
      const result: any = await getPrayerTimesByCity(city);
      setCurrentCity(result.city);

      const times = normalizePrayerTimes(result);
      if (times) {
        const displayTimes = toDisplayPrayerTimes(times);
        setPrayerTimes(displayTimes);
        setShowPrayerTimes(true);
        await cacheAndRefreshPrayerNotifs(result.city || city, displayTimes);
      } else {
        throw new Error("City timings data is empty");
      }
    } catch {
      Alert.alert("Error", "City not found or failed to fetch prayer times");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCityFromList = (city: string) => {
    setCityQuery(city);
    setCityListOpen(false);
    fetchPrayerForCity(city).catch(() => undefined);
  };

  const cards = [
    {
      id: 1,
      title: "Quran",
      subtitle: "Learn & understand the Quran",
      image: require("../homeAssets/quran.png"),
      colors: ["#4C8DFF", "#2E6BFF"] as [string, string],
      deco: "book",
    },
    {
      id: 2,
      title: "Salah",
      subtitle: "Learn Salah step by step",
      image: require("../homeAssets/mosque4.png"),
      colors: ["#7B5CFF", "#5B33C4"] as [string, string],
      deco: "moon",
    },
    {
      id: 3,
      title: "Daily Sunnah",
      subtitle: "Everyday Prophet ∩╖║ habits",
      image: require("../homeAssets/star.png"),
      colors: ["#2EC4B6", "#0F9B8E"] as [string, string],
      deco: "sparkles",
    },
    {
      id: 4,
      title: "Islamic Shorts",
      subtitle: "Prophets ┬╖ Seerah ┬╖ short clips",
      image: require("../homeAssets/bookread.png"),
      colors: ["#F5B041", "#E08A4F"] as [string, string],
      deco: "play",
    },
    {
      id: 5,
      title: "Duas",
      subtitle: "Daily duas for every moment",
      image: require("../homeAssets/kids_praying.png"),
      colors: ["#3CB89A", "#1F8A70"] as [string, string],
      deco: "heart",
    },
    {
      id: 6,
      title: "Names of Allah",
      subtitle: "Learn beautiful names of Allah",
      image: require("../homeAssets/tasbeeh2.png"),
      colors: ["#5AA0FF", "#2E6BFF"] as [string, string],
      deco: "star",
    },
    {
      id: 7,
      title: "Chatbot",
      subtitle: "Ask Islamic questions anytime",
      image: require("../assets/ai.png"),
      colors: ["#9B6DFF", "#6C4DF7"] as [string, string],
      deco: "chatbubble",
    },
    {
      id: 8,
      title: "Games",
      subtitle: "Play & learn with fun games",
      image: require("../homeAssets/goldcup.png"),
      colors: ["#F472B6", "#DB2777"] as [string, string],
      deco: "game-controller",
    },
  ];

  const handleCardPress = (itemId: number) => {
    playUiSound("tap");
    if (itemId === 1) goToQuran();
    else if (itemId === 2) goToSalah();
    else if (itemId === 3) goToDailySunnah();
    else if (itemId === 4) goToStories();
    else if (itemId === 5) goToDuas();
    else if (itemId === 6) goToNamesOfAllah();
    else if (itemId === 7) goToChatbot();
    else if (itemId === 8) goToQuiz();
  };

  const saveHomeRating = async (stars: number) => {
    const saved = await setRatingStars(stars);
    setSavedStars(saved);
    setRatingVisible(false);
  };

  const skipHomeRating = async () => {
    await dismissRatingPrompt();
    setRatingVisible(false);
  };

  const collectQuestCoins = async () => {
    if (questClaimed || questClaiming) {
      return;
    }
    const dateKey = todayKeyKarachi();
    setQuestClaiming(true);
    try {
      const result = await claimReward("quest", dateKey);
      setCoins(result.coins);
      setQuestClaimed(true);
    } catch {
      // keep existing daily error handling style — silent, UI stays usable
    } finally {
      setQuestClaiming(false);
    }
  };

  if (dailyDetail) {
    return (
      <DailyLearningDetail
        kind={dailyDetail}
        content={dailyLearning}
        onBack={() => setDailyDetail(null)}
        questClaimed={questClaimed}
        questClaiming={questClaiming}
        onCollectQuest={collectQuestCoins}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openCityPicker}
            >
              <Ionicons name="time-outline" size={28} color="#4B2AA8" />
            </TouchableOpacity>
            <CoinsBalanceChip coins={coins} />
          </View>

          <ImageBackground
            source={require("../homeAssets/Home.png")}
            style={styles.heroBg}
            imageStyle={styles.heroBgImage}
          >
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Assalamu Alaikum, {displayName}
              </Text>
              <Text style={styles.brandRow}>
                <Text style={styles.brandEn}>Mini</Text>
                <Text style={styles.brandDot}>·</Text>
                <Text style={styles.brandUr}>عبداللہ</Text>
              </Text>
              <Text style={styles.subText}>
                Let's learn, grow and become better Muslims
              </Text>
            </View>

            <ImageBackground
              source={require("../homeAssets/Quotebg.jpg")}
              style={styles.quoteCard}
              imageStyle={{ borderRadius: 32 }}
            >
              <View style={styles.quoteTop}>
                <Image
                  source={require("../homeAssets/moon.png")}
                  style={styles.smallIcon}
                />
                <Text style={styles.quoteBadge}>Daily Islamic Quote</Text>
              </View>
              {!!dailyQuote.arabic && (
                <Text style={styles.arabicText}>{dailyQuote.arabic}</Text>
              )}
              <Text style={styles.translation}>"{dailyQuote.quote}"</Text>
              {!!dailyQuote.source && (
                <Text style={styles.surah}>{dailyQuote.source}</Text>
              )}
            </ImageBackground>
          </ImageBackground>

          <View style={styles.dailySection}>
            <View style={styles.dailySectionHeader}>
              <Text style={styles.dailySectionTitle}>🌟 Today's Learning</Text>
              {dailyLoading && (
                <ActivityIndicator size="small" color="#6C4DF7" />
              )}
            </View>
            {dailyError && (
              <Text style={styles.dailyOfflineHint}>
                Offline mode — showing sample learning content
              </Text>
            )}

            <SmoothPressable
              radius={22}
              onPress={() => {
                playUiSound("cardOpen");
                setDailyDetail("word");
              }}
              style={[styles.dailyCard, styles.pressClip]}
            >
              <View style={styles.dailyCardTop}>
                <View style={[styles.dailyIconWrap, styles.dailyIconWord]}>
                  <Ionicons name="sparkles" size={16} color="#6C4DF7" />
                </View>
                <Text style={styles.dailyCardLabel}>Word of the Day</Text>
                <Text style={styles.viewHint}>View</Text>
                <Ionicons name="chevron-forward" size={18} color="#6C4DF7" />
              </View>
              <Text style={styles.dailyWord}>{dailyLearning.word}</Text>
              <Text style={styles.dailyMeaning} numberOfLines={2}>
                {dailyLearning.wordMeaning}
              </Text>
            </SmoothPressable>

            <SmoothPressable
              radius={22}
              onPress={() => {
                playUiSound("cardOpen");
                setDailyDetail("dua");
              }}
              style={[styles.dailyCard, styles.pressClip]}
            >
              <View style={styles.dailyCardTop}>
                <View style={[styles.dailyIconWrap, styles.dailyIconDua]}>
                  <Ionicons name="heart" size={16} color="#0F9B8E" />
                </View>
                <Text style={styles.dailyCardLabel}>Dua of the Day</Text>
                <Text style={styles.viewHint}>View</Text>
                <Ionicons name="chevron-forward" size={18} color="#6C4DF7" />
              </View>
              <Text style={styles.dailyDuaArabic} numberOfLines={2}>
                {dailyLearning.dua}
              </Text>
              <Text style={styles.dailyMeaning} numberOfLines={2}>
                {dailyLearning.duaMeaning}
              </Text>
            </SmoothPressable>

            <SmoothPressable
              radius={22}
              onPress={() => {
                playUiSound("cardOpen");
                setDailyDetail("quest");
              }}
              style={[
                styles.dailyCard,
                styles.dailyQuestCard,
                styles.pressClip,
              ]}
            >
              <View style={styles.dailyCardTop}>
                <View style={[styles.dailyIconWrap, styles.dailyIconQuest]}>
                  <Ionicons name="star" size={16} color="#DB2777" />
                </View>
                <Text style={[styles.dailyCardLabel, styles.dailyQuestLabel]}>
                  Kindness Quest
                </Text>
                <Text style={styles.viewHint}>View</Text>
                <Ionicons name="chevron-forward" size={18} color="#DB2777" />
              </View>
              <Text style={styles.dailyQuestTitle} numberOfLines={1}>
                {dailyLearning.questTitle}
              </Text>
              <Text style={styles.dailyMeaning} numberOfLines={2}>
                {dailyLearning.questDescription}
              </Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardBadge}>+{dailyLearning.rewardXP} XP</Text>
                <Text style={styles.rewardBadgeCoins}>
                  +{dailyLearning.rewardCoins} coins
                </Text>
                {questClaimed ? (
                  <Text style={styles.collectedHint}>Collected ✓</Text>
                ) : null}
              </View>
            </SmoothPressable>
          </View>

          <View style={styles.grid}>
            {cards.map((item) => (
              <SmoothPressable
                key={item.id}
                radius={24}
                onPress={() => handleCardPress(item.id)}
                style={styles.cardWrapper}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.decoCircleTop} />
                  <View style={styles.decoCircleBottom} />
                  <View style={styles.decoIconWrap}>
                    <Ionicons
                      name={item.deco as any}
                      size={16}
                      color="rgba(255,255,255,0.85)"
                    />
                  </View>
                  <Image source={item.image} style={styles.cardImage} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </LinearGradient>
              </SmoothPressable>
            ))}
          </View>
        </ScrollView>

        <Pressable
          android_ripple={{ color: "transparent" }}
          onPress={() => {
            playUiSound("tap");
            goToTalkingAbdullah();
          }}
          accessibilityRole="button"
          accessibilityLabel="Talk to Abdullah"
          style={styles.talkFab}
        >
          <LinearGradient
            colors={["#9B6DFF", "#6C4DF7"]}
            style={styles.talkFabInner}
          >
            <Ionicons name="mic" size={26} color="#fff" />
          </LinearGradient>
          <Text style={styles.talkFabText}>Talk</Text>
        </Pressable>

        <Modal transparent visible={cityModal} animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.modalBox, styles.cityModalBox]}>
              <Text style={styles.modalTitle}>Select City</Text>
              <Text style={[styles.optionText, { marginLeft: 0 }]}>
                Search or open the list to choose a city for prayer times.
              </Text>

              <View style={styles.citySearchRow}>
                <TextInput
                  style={styles.citySearchInput}
                  value={cityQuery}
                  onChangeText={(text) => {
                    setCityQuery(text);
                    setCityListOpen(true);
                  }}
                  placeholder="Search city (e.g. Karachi)"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  onFocus={() => setCityListOpen(true)}
                  onPressIn={() => setCityListOpen(true)}
                />
                <TouchableOpacity
                  style={styles.cityDropdownBtn}
                  onPress={() => setCityListOpen((open) => !open)}
                  accessibilityLabel={
                    cityListOpen ? "Hide city list" : "Show city list"
                  }
                >
                  <Ionicons
                    name={cityListOpen ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="#6C4DF7"
                  />
                </TouchableOpacity>
              </View>

              {cityListOpen ? (
                <View style={styles.cityListContainer}>
                  <ScrollView
                    style={styles.cityListScroll}
                    contentContainerStyle={styles.cityListContent}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    bounces={false}
                  >
                    {filteredCities.length === 0 ? (
                      <Text style={styles.cityEmptyText}>
                        No matching cities. You can still tap Get Times with
                        your typed name.
                      </Text>
                    ) : (
                      filteredCities.map((city) => (
                        <TouchableOpacity
                          key={city}
                          style={styles.cityListItem}
                          onPress={() => handleSelectCityFromList(city)}
                        >
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="#6C4DF7"
                          />
                          <Text style={styles.cityListItemText}>{city}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.actionModalBtn, { backgroundColor: "#6C4DF7" }]}
                  onPress={() => fetchPrayerForCity(cityQuery)}
                >
                  <Text style={styles.actionBtnText}>Get Times</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionModalBtn,
                    { backgroundColor: "#F1F2F6", marginLeft: 10 },
                  ]}
                  onPress={() => {
                    setCityModal(false);
                    setCityListOpen(false);
                  }}
                >
                  <Text style={[styles.actionBtnText, { color: "#555" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={loading} animationType="fade">
          <View style={[styles.modalBg, { justifyContent: "center" }]}>
            <ActivityIndicator size="large" color="#6C4DF7" />
            <Text style={{ color: "#6C4DF7", marginTop: 10, fontSize: 16 }}>
              Fetching prayer times...
            </Text>
          </View>
        </Modal>

        <Modal transparent visible={showPrayerTimes} animationType="slide">
          <View style={styles.prayerModalRoot}>
            <SafeAreaView style={styles.prayerModalSafe}>
              <View style={styles.prayerHeader}>
                <TouchableOpacity onPress={() => setShowPrayerTimes(false)}>
                  <Ionicons name="close" size={28} color="#6C4DF7" />
                </TouchableOpacity>
                <Text style={styles.prayerHeaderTitle}>Prayer Times</Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView
                style={styles.prayerScroll}
                contentContainerStyle={styles.prayerContainer}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
                bounces
              >
                <Text style={styles.cityName}>{currentCity}</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString()}
                </Text>

                {prayerTimes && (
                  <View style={styles.prayerGrid}>
                    <View style={styles.prayerCard}>
                      <Text style={styles.prayerLabel}>Fajr</Text>
                      <Text style={styles.prayerTime}>{prayerTimes.fajr}</Text>
                    </View>
                    <View style={styles.prayerCard}>
                      <Text style={styles.prayerLabel}>Dhuhr</Text>
                      <Text style={styles.prayerTime}>{prayerTimes.dhuhr}</Text>
                    </View>
                    <View style={styles.prayerCard}>
                      <Text style={styles.prayerLabel}>Asr</Text>
                      <Text style={styles.prayerTime}>{prayerTimes.asr}</Text>
                    </View>
                    <View style={styles.prayerCard}>
                      <Text style={styles.prayerLabel}>Maghrib</Text>
                      <Text style={styles.prayerTime}>
                        {prayerTimes.maghrib}
                      </Text>
                    </View>
                    <View style={styles.prayerCard}>
                      <Text style={styles.prayerLabel}>Isha</Text>
                      <Text style={styles.prayerTime}>{prayerTimes.isha}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        <View style={styles.navbar}>
          <View style={styles.navbarInner}>
            <TouchableOpacity
              style={styles.navItem}
              accessibilityRole="button"
              accessibilityLabel="Home"
            >
              <Ionicons name="home" size={26} color="#4B2AA8" />
              <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                playUiSound("tap");
                goToTutor();
              }}
              accessibilityRole="button"
              accessibilityLabel="Tutor"
            >
              <Ionicons name="school" size={26} color="#B8A4F0" />
              <Text style={[styles.navText, styles.navTextInactive]}>
                Tutor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                playUiSound("tap");
                goToProfile();
              }}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <Ionicons name="person" size={26} color="#B8A4F0" />
              <Text style={[styles.navText, styles.navTextInactive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <RateAppModal
        visible={ratingVisible}
        initialStars={savedStars}
        onSave={saveHomeRating}
        onClose={skipHomeRating}
        allowSkip
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 44,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  heroBg: { width: "100%", paddingTop: 78, paddingBottom: 20 },
  heroBgImage: { resizeMode: "cover" },
  welcomeContainer: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 28,
   //96
    marginTop: 170,
    width: "86%",
    maxWidth: 340,
  },
  welcomeText: {
    fontSize: 22,
    color: "#4B2AA8",
    fontWeight: "800",
    //extra 903
    marginTop:10,
    lineHeight: 32,
    textAlign: "center",
  },
  brandRow: {
    marginTop: 8,
    textAlign: "center",
  },
  brandEn: {
    fontSize: 20,
    fontWeight: "800",
    color: "#e32081",
  },
  brandDot: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C4B5FD",
  },
  brandUr: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B2AA8",
    writingDirection: "rtl",
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "NotoNastaliqUrdu",
      default: undefined,
    }),
  },
  subText: {
    fontSize: 14,
    color: "#5A5470",
    marginTop: 8,
    lineHeight: 20,
    textAlign: "center",
    width: "100%",
  },
  quoteCard: {
    minHeight: 300,
    marginHorizontal: 20,
    marginTop: 52,
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
  },
  quoteTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteBadge: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#5730CC",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  smallIcon: { width: 50, height: 50, resizeMode: "contain" },
  arabicText: {
    color: "#fff",
    fontSize: 34,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
  },
  translation: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 14,
    fontWeight: "700",
    width: "70%",
    alignSelf: "center",
    lineHeight: 28,
  },
  surah: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 22,
    fontWeight: "700",
    backgroundColor: "#4B28B8",
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  dailySection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dailySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dailySectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#4B2AA8",
  },
  dailyOfflineHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
    fontWeight: "600",
  },
  dailyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  dailyQuestCard: {
    borderColor: "#FBCFE8",
    backgroundColor: "#FFF7FB",
  },
  dailyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dailyIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyIconWord: { backgroundColor: "#EDE9FE" },
  dailyIconDua: { backgroundColor: "#CCFBF1" },
  dailyIconQuest: { backgroundColor: "#FCE7F3" },
  dailyEmoji: { fontSize: 20 },
  dailyCardLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#6C4DF7",
  },
  dailyQuestLabel: {
    color: "#DB2777",
  },
  viewHint: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
  },
  dailyWord: {
    fontSize: 26,
    fontWeight: "900",
    color: "#4B2AA8",
  },
  dailyDuaArabic: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4B2AA8",
    textAlign: "right",
    marginBottom: 6,
  },
  dailyMeaning: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    fontWeight: "600",
  },
  dailyExample: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
  },
  dailyQuestTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#DB2777",
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  rewardBadge: {
    backgroundColor: "#EDE9FE",
    color: "#6C4DF7",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  rewardBadgeCoins: {
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  collectedHint: {
    color: "#0F9B8E",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 28,
    paddingBottom: 120,
  },
  /** Scale-only press — never fade opacity (that flashes a white square). */
  softPress: {
    transform: [{ scale: 0.985 }],
  },
  pressClip: {
    overflow: "hidden",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 18,
    borderRadius: 24,
    overflow: "hidden",
  },
  card: {
    borderRadius: 24,
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
    minHeight: 200,
    position: "relative",
  },
  decoCircleTop: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.14)",
    top: -18,
    right: -14,
  },
  decoCircleBottom: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.12)",
    bottom: 18,
    left: -12,
  },
  decoIconWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 85,
    height: 85,
    resizeMode: "contain",
    marginBottom: 6,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
    lineHeight: 16,
  },
  navbar: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    backgroundColor: "transparent",
    paddingVertical: 0,
    zIndex: 9999,
  },
  talkFab: {
    position: "absolute",
    right: 22,
    bottom: 92,
    alignItems: "center",
    zIndex: 9998,
  },
  talkFabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  talkFabText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    color: "#4B2AA8",
  },
  navbarInner: {
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    elevation: 12,
    zIndex: 9999,
  },
  navItem: { alignItems: "center" },
  navText: { marginTop: 4, fontWeight: "700" },
  navTextActive: { color: "#4B2AA8", fontSize: 16 },
  navTextInactive: { color: "#B8A4F0", fontSize: 13 },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E1A6B",
    marginBottom: 18,
    textAlign: "center",
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F5F2FF",
    marginBottom: 10,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#6C4DF7",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  cityInput: {
    backgroundColor: "#F6F7FB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 14,
    color: "#333",
  },
  cityModalBox: {
    maxHeight: "80%",
  },
  citySearchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    backgroundColor: "#F6F7FB",
    overflow: "hidden",
  },
  citySearchInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  cityDropdownBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E0E0E0",
  },
  /** Fixed-height dropdown shell so 1–2 matches stay bounded and many cities scroll inside. */
  cityListContainer: {
    height: 180,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#EDE7FF",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  cityListScroll: {
    flex: 1,
  },
  cityListContent: {
    flexGrow: 0,
    paddingVertical: 4,
  },
  cityListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE8FF",
  },
  cityListItemText: {
    fontSize: 15,
    color: "#2E1A6B",
    fontWeight: "600",
  },
  cityEmptyText: {
    padding: 14,
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  actionModalBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  prayerModalRoot: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  prayerModalSafe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  prayerScroll: {
    flex: 1,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  prayerHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#6C4DF7" },
  prayerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },
  cityName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E1A6B",
    marginBottom: 8,
  },
  dateText: { fontSize: 14, color: "#999", marginBottom: 20 },
  prayerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  prayerCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    alignItems: "center",
  },
  prayerLabel: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
    marginBottom: 8,
  },
  prayerTime: { fontSize: 22, fontWeight: "700", color: "#6C4DF7" },
});
