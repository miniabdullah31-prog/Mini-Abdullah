import React from "react";
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
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  goToQuran: () => void;
  goToStories: () => void;
  goToDuas: () => void;
  goToChatbot: () => void;
  goToNamesOfAllah: () => void;
  goToSalah: () => void;
  goToQuiz: () => void;
  goToGoodDeeds: () => void;
  goToLearn: () => void; // Added type
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
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={28} color="#4B2AA8" />
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

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarInner}>
          <TouchableOpacity style={styles.navItem} accessibilityRole="button" accessibilityLabel="Home">
            <Ionicons name="home" size={28} color="#7A3DFF" />
            <Text style={[styles.navText, { color: "#7A3DFF" }]}>Home</Text>
          </TouchableOpacity>

          {/* UPDATED TO LEARN SCREEN BUTTON */}
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

// (Styles maintain original state)
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
});