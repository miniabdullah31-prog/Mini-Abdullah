import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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
  getPrayerTimesFromCurrentLocation,
  getPrayerTimesByCity,
} from "../services/prayerService";
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
import RateAppModal from "./RateAppModal";

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
}) => {
  const [prayerModal, setPrayerModal] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [manualCityModal, setManualCityModal] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [dailyQuote, setDailyQuote] = useState(FALLBACK_QUOTE);
  const [displayName, setDisplayName] = useState("Friend");
  const [ratingVisible, setRatingVisible] = useState(false);
  const [savedStars, setSavedStars] = useState(0);

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

    const pollMs = Math.max(60 * 60 * 1000, Math.floor(QUOTE_ROTATION_MS / 4));
    const intervalId = setInterval(loadDailyQuote, pollMs);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      setPrayerModal(false);

      const result: any = await getPrayerTimesFromCurrentLocation();

      setCurrentCity(result.city);

      const times = normalizePrayerTimes(result);
      if (times) {
        setPrayerTimes(times);
        setShowPrayerTimes(true);
        await cacheAndRefreshPrayerNotifs(result.city || "Current Location", times);
      } else {
        throw new Error("No prayer times data found");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to get prayer times",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchManualCity = async () => {
    const city = manualCity.trim();
    if (!city) {
      Alert.alert("Error", "Please enter a city name.");
      return;
    }

    setManualCityModal(false);
    setLoading(true);

    try {
      const result: any = await getPrayerTimesByCity(city);
      setCurrentCity(result.city);

      const times = normalizePrayerTimes(result);
      if (times) {
        setPrayerTimes(times);
        setShowPrayerTimes(true);
        await cacheAndRefreshPrayerNotifs(result.city || city, times);
      } else {
        throw new Error("City timings data is empty");
      }
    } catch {
      Alert.alert("Error", "City not found or failed to fetch prayer times");
    } finally {
      setLoading(false);
    }
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
      title: "Quiz",
      subtitle: "Test your Islamic knowledge",
      image: require("../homeAssets/goldcup.png"),
      colors: ["#F472B6", "#DB2777"] as [string, string],
      deco: "trophy",
    },
  ];

  const handleCardPress = (itemId: number) => {
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setPrayerModal(true)}
            >
              <Ionicons name="time-outline" size={28} color="#4B2AA8" />
            </TouchableOpacity>
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

          <View style={styles.grid}>
            {cards.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardWrapper}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item.id)}
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
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Modal transparent visible={prayerModal} animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Prayer Time Settings</Text>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={handleUseCurrentLocation}
              >
                <Ionicons name="location-outline" size={22} color="#6C4DF7" />
                <Text style={styles.optionText}>Use Current Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setPrayerModal(false);
                  setManualCityModal(true);
                }}
              >
                <Ionicons name="business-outline" size={22} color="#6C4DF7" />
                <Text style={styles.optionText}>Select City Manually</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPrayerModal(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
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

        <Modal transparent visible={manualCityModal} animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Enter City</Text>
              <Text style={styles.optionText}>
                Type city name like Karachi or Lahore
              </Text>
              <TextInput
                style={styles.cityInput}
                value={manualCity}
                onChangeText={setManualCity}
                placeholder="Enter city"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.actionModalBtn, { backgroundColor: "#6C4DF7" }]}
                  onPress={handleSearchManualCity}
                >
                  <Text style={styles.actionBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionModalBtn,
                    { backgroundColor: "#F1F2F6", marginLeft: 10 },
                  ]}
                  onPress={() => setManualCityModal(false)}
                >
                  <Text style={[styles.actionBtnText, { color: "#555" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={showPrayerTimes} animationType="slide">
          <SafeAreaView style={[styles.container, { backgroundColor: "#F6F7FB" }]}>
            <View style={styles.prayerHeader}>
              <TouchableOpacity onPress={() => setShowPrayerTimes(false)}>
                <Ionicons name="close" size={28} color="#6C4DF7" />
              </TouchableOpacity>
              <Text style={styles.prayerHeaderTitle}>Prayer Times</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.prayerContainer}>
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
                    <Text style={styles.prayerTime}>{prayerTimes.maghrib}</Text>
                  </View>
                  <View style={styles.prayerCard}>
                    <Text style={styles.prayerLabel}>Isha</Text>
                    <Text style={styles.prayerTime}>{prayerTimes.isha}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <View style={styles.navbar}>
          <View style={styles.navbarInner}>
            <TouchableOpacity
              style={styles.navItem}
              accessibilityRole="button"
              accessibilityLabel="Home"
            >
              <Ionicons name="home" size={30} color="#4B2AA8" />
              <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={goToProfile}
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
    justifyContent: "flex-start",
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
    marginTop: 96,
    width: "86%",
    maxWidth: 340,
  },
  welcomeText: {
    fontSize: 22,
    color: "#4B2AA8",
    fontWeight: "800",
    lineHeight: 32,
    textAlign: "center",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 28,
    paddingBottom: 120,
  },
  cardWrapper: { width: "48%", marginBottom: 18 },
  card: {
    borderRadius: 24,
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
    elevation: 5,
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
  prayerContainer: { paddingHorizontal: 20, paddingVertical: 20 },
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
