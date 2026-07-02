import React, { useState } from "react";
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
import { getPrayerTimesFromCurrentLocation, getPrayerTimesByCity } from "../services/prayerService";

type Props = {
  goToQuran: () => void;
  goToStories: () => void;
  goToDuas: () => void;
  goToChatbot: () => void;
  goToNamesOfAllah: () => void;
  goToSalah: () => void;
  goToQuiz: () => void;
  goToGoodDeeds: () => void;
  goToLearn: () => void;
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
  goToGoodDeeds,
  goToLearn,
  goToProfile,
}) => {
  const [prayerModal, setPrayerModal] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [manualCityModal, setManualCityModal] = useState(false);
  const [manualCity, setManualCity] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      setPrayerModal(false);
      console.log("Starting geolocation...");
      
      // 🌟 Yahan ': any' lagane se TypeScript ki red line khatam ho jayegi
      const result: any = await getPrayerTimesFromCurrentLocation();
      console.log("Prayer times received:", result);
      
      setCurrentCity(result.city);
      
      const times = result.prayerTimes;
      if (times) {
        setPrayerTimes({
          fajr: times.fajr,
          dhuhr: times.dhuhr,
          asr: times.asr,
          maghrib: times.maghrib,
          isha: times.isha,
        });
        setShowPrayerTimes(true);
      } else {
        throw new Error("No prayer times data found");
      }
    } catch (error) {
      console.log("Error in handleUseCurrentLocation:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to get prayer times");
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
      // 🌟 Yahan bhi ': any' add kar diya
      const result: any = await getPrayerTimesByCity(city);
      setCurrentCity(result.city);
      
      const times = result.prayerTimes;
      if (times) {
        setPrayerTimes({
          fajr: times.fajr,
          dhuhr: times.dhuhr,
          asr: times.asr,
          maghrib: times.maghrib,
          isha: times.isha,
        });
        setShowPrayerTimes(true);
      } else {
        throw new Error("City timings data is empty");
      }
    } catch (error) {
      Alert.alert("Error", "City not found or failed to fetch prayer times");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { id: 1, title: "Duas", subtitle: "Daily duas for every moment", image: require("../homeAssets/kids_praying.png"), bg: require("../homeAssets/greencardBg.jpg") },
    { id: 2, title: "Quran", subtitle: "Learn & understand the Quran", image: require("../homeAssets/quran.png"), bg: require("../homeAssets/blueCard.jpg") },
    { id: 3, title: "Stories", subtitle: "Stories of the Prophets", image: require("../homeAssets/bookread.png"), bg: require("../homeAssets/yellowCard.jpg") },
    { id: 4, title: "Chatbot", subtitle: "Ask Islamic questions anytime", image: require("../assets/ai.png"), bg: require("../homeAssets/purpleCard.jpg") },
    { id: 5, title: "Quiz", subtitle: "Test your Islamic knowledge", image: require("../homeAssets/goldcup.png"), bg: require("../homeAssets/pinkCard.jpg") },
    { id: 6, title: "99 Names", subtitle: "Learn beautiful names of Allah", image: require("../homeAssets/tasbeeh2.png"), bg: require("../homeAssets/cyanCard.jpg") },
    { id: 8, title: "Salah", subtitle: "Learn Salah step by step", image: require("../homeAssets/mosque4.png"), bg: require("../homeAssets/indigoCard.jpg") },
    { id: 9, title: "Good Deeds", subtitle: "Earn stars with good deeds", image: require("../homeAssets/star.png"), bg: require("../homeAssets/cyanCard.jpg") },
  ];

  const handleCardPress = (itemId: number) => {
    if (itemId === 1) goToDuas();
    else if (itemId === 2) goToQuran();
    else if (itemId === 3) goToStories();
    else if (itemId === 4) goToChatbot();
    else if (itemId === 6) goToNamesOfAllah();
    else if (itemId === 8) goToSalah();
    else if (itemId === 5) goToQuiz();
    else if (itemId === 9) goToGoodDeeds();
    else Alert.alert("Coming Soon 🚀", "This feature will be added soon.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* TOP ICONS */}
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setPrayerModal(true)}>
            <Ionicons name="time-outline" size={28} color="#4B2AA8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={28} color="#4B2AA8" />
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <ImageBackground source={require("../homeAssets/Home.png")} style={styles.heroBg} imageStyle={styles.heroBgImage}>
          <View style={styles.welcomeContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>Assalamu Alaikum,</Text>
              <Text style={styles.nameText}>Abdullah!</Text>
              <Text style={styles.wave}>👋</Text>
              <Text style={styles.subText}>Let’s learn, grow and become better Muslims 💜</Text>
            </View>
          </View>

          {/* QUOTE CARD */}
          <ImageBackground source={require("../homeAssets/Quotebg.jpg")} style={styles.quoteCard} imageStyle={{ borderRadius: 32 }}>
            <View style={styles.quoteTop}>
              <Image source={require("../homeAssets/moon.png")} style={styles.smallIcon} />
              <Text style={styles.quoteBadge}>✨ Daily Islamic Quote ✨</Text>
            </View>
            <Text style={styles.arabicText}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
            <Text style={styles.translation}>“Indeed, with hardship comes ease.”</Text>
            <Text style={styles.surah}>Surah Ash-Sharh (94:6)</Text>
          </ImageBackground>
        </ImageBackground>

        {/* CARDS GRID */}
        <View style={styles.grid}>
          {cards.map((item) => (
            <TouchableOpacity key={item.id} style={styles.cardWrapper} activeOpacity={0.9} onPress={() => handleCardPress(item.id)}>
              <ImageBackground source={item.bg} style={styles.card} imageStyle={{ borderRadius: 24 }}>
                <Image source={item.image} style={styles.cardImage} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal transparent visible={prayerModal} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Prayer Time Settings</Text>

            <TouchableOpacity style={styles.optionBtn} onPress={handleUseCurrentLocation}>
              <Ionicons name="location-outline" size={22} color="#6C4DF7" />
              <Text style={styles.optionText}>Use Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={handleSearchManualCity}>
              <Ionicons name="business-outline" size={22} color="#6C4DF7" />
              <Text style={styles.optionText}>Select City Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPrayerModal(false)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LOADING MODAL */}
      <Modal transparent visible={loading} animationType="fade">
        <View style={[styles.modalBg, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#6C4DF7" />
          <Text style={{ color: "#6C4DF7", marginTop: 10, fontSize: 16 }}>
            Fetching prayer times...
          </Text>
        </View>
      </Modal>

      {/* MANUAL CITY INPUT MODAL */}
      <Modal transparent visible={manualCityModal} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter City</Text>
            <Text style={styles.optionText}>Type city name like Karachi or Lahore</Text>
            <TextInput
              style={styles.cityInput}
              value={manualCity}
              onChangeText={setManualCity}
              placeholder="Enter city"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.actionModalBtn, { backgroundColor: "#6C4DF7" }]} onPress={handleSearchManualCity}>
                <Text style={styles.actionBtnText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionModalBtn, { backgroundColor: "#F1F2F6", marginLeft: 10 }]} onPress={() => setManualCityModal(false)}>
                <Text style={[styles.actionBtnText, { color: "#555" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PRAYER TIMES DISPLAY MODAL */}
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
            <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>

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

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarInner}>
          <TouchableOpacity style={styles.navItem} accessibilityRole="button" accessibilityLabel="Home">
            <Ionicons name="home" size={28} color="#7A3DFF" />
            <Text style={[styles.navText, { color: "#7A3DFF" }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goToLearn} accessibilityRole="button" accessibilityLabel="Learn">
            <Ionicons name="book" size={28} color="#2FB65D" />
            <Text style={[styles.navText, { color: "#2FB65D" }]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} accessibilityRole="button" accessibilityLabel="Rewards">
            <Ionicons name="star" size={28} color="#F4B400" />
            <Text style={[styles.navText, { color: "#F4B400" }]}>Rewards</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goToProfile} accessibilityRole="button" accessibilityLabel="Profile">
            <Ionicons name="person" size={28} color="#2196F3" />
            <Text style={[styles.navText, { color: "#2196F3" }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  topSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 15, position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  iconButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 5 },
  heroBg: { width: "100%", paddingTop: 90, paddingBottom: 25 },
  heroBgImage: { resizeMode: "cover" },
  welcomeContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginTop: 20 },
  welcomeText: { fontSize: 22, color: "#4B2AA8", fontWeight: "700" },
  nameText: { fontSize: 48, color: "#32158A", fontWeight: "bold", marginTop: 6 },
  wave: { fontSize: 42, marginTop: -5 },
  subText: { fontSize: 18, color: "#444", marginTop: 8, lineHeight: 28, width: "60%" },
  quoteCard: { minHeight: 320, marginHorizontal: 20, marginTop: 80, borderRadius: 32, padding: 24, overflow: "hidden" },
  quoteTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quoteBadge: { color: "#fff", fontSize: 16, fontWeight: "700", backgroundColor: "#5730CC", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  smallIcon: { width: 50, height: 50, resizeMode: "contain" },
  arabicText: { color: "#fff", fontSize: 34, textAlign: "center", marginTop: 30, fontWeight: "bold" },
  translation: { color: "#fff", fontSize: 18, textAlign: "center", marginTop: 14, fontWeight: "700", width: "70%", alignSelf: "center", lineHeight: 28 },
  surah: { color: "#fff", fontSize: 18, textAlign: "center", marginTop: 22, fontWeight: "700", backgroundColor: "#4B28B8", alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 28, paddingBottom: 120 },
  cardWrapper: { width: "48%", marginBottom: 18 },
  card: { borderRadius: 24, padding: 14, alignItems: "center", overflow: "hidden", elevation: 5, minHeight: 200 },
  cardImage: { width: 85, height: 85, resizeMode: "contain", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", textAlign: "center" },
  cardSubtitle: { fontSize: 12, color: "#fff", textAlign: "center", marginTop: 5, fontWeight: "600", lineHeight: 16 },
  navbar: { position: "absolute", bottom: 12, left: 15, right: 15, backgroundColor: "transparent", paddingVertical: 0, zIndex: 9999 },
  navbarInner: { backgroundColor: "#fff", borderRadius: 35, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 14, elevation: 12, zIndex: 9999 },
  navItem: { alignItems: "center" },
  navText: { marginTop: 4, fontSize: 14, fontWeight: "700" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 22 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#2E1A6B", marginBottom: 18, textAlign: "center" },
  optionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#F5F2FF", marginBottom: 10 },
  optionText: { marginLeft: 10, fontSize: 16, color: "#333", fontWeight: "600" },
  cancelBtn: { marginTop: 10, backgroundColor: "#6C4DF7", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  cityInput: { backgroundColor: "#F6F7FB", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: "#E0E0E0", marginTop: 14, color: "#333" },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  actionModalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  actionBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  prayerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  prayerHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#6C4DF7" },
  prayerContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  cityName: { fontSize: 28, fontWeight: "700", color: "#2E1A6B", marginBottom: 8 },
  dateText: { fontSize: 14, color: "#999", marginBottom: 20 },
  prayerGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  prayerCard: { width: "48%", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, alignItems: "center" },
  prayerLabel: { fontSize: 14, color: "#999", fontWeight: "600", marginBottom: 8 },
  prayerTime: { fontSize: 22, fontWeight: "700", color: "#6C4DF7" },
});