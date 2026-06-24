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
  goToHome: () => void;
  goToAqaid: () => void;
  goToAkhlaq: () => void;
  goToIbaadat: () => void;
  goToSeerah: () => void;
  goToPillars: () => void;
  goToMasail: () => void;
  goToQuran: () => void;
  goToProfile: () => void;
};

const LearnScreen: React.FC<Props> = ({
  goToHome,
  goToProfile,
}) => {
  
  // Cards data modified to match the style & structure of StoriesScreen
  const cards = [
    {
      id: 1,
      title: "Aqaid",
      subtitle: "Beliefs",
      icon: "book",
      image: require("../assets/story1.png"), // Aap apni marzi ki image path change kar sakte hain
      bg: require("../homeAssets/yellowCard.jpg"),
    },
    {
      id: 2,
      title: "Akhlaq",
      subtitle: "Manners",
      icon: "heart",
      image: require("../assets/story10.png"),
      bg: require("../homeAssets/pinkCard.jpg"),
    },
    {
      id: 3,
      title: "Ibaadat",
      subtitle: "Worship",
      icon: "moon",
      image: require("../assets/story5.png"),
      bg: require("../homeAssets/greencardBg.jpg"),
    },
    {
      id: 4,
      title: "Seerah",
      subtitle: "Life of Prophet ﷺ",
      icon: "book-outline",
      image: require("../assets/story8.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 5,
      title: "Pillars of Islam",
      subtitle: "5 Pillars",
      icon: "flag",
      image: require("../assets/story2.png"),
      bg: require("../homeAssets/blueCard.jpg"),
    },
    {
      id: 6,
      title: "Masail",
      subtitle: "Islamic Knowledge",
      icon: "school",
      image: require("../assets/story3.png"),
      bg: require("../homeAssets/orangeCard.jpg"),
    },
  ];

  const handleCardPress = (id: number) => {
    switch (id) {
      // Future navigation handle karne ke liye space reserved hai
      default:
        Alert.alert("Coming Soon 🚀");
    }
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

        {/* HERO */}
        <ImageBackground
          source={require("../homeAssets/learn_bg.png")}
          style={styles.heroBg}
          imageStyle={styles.heroBgImage}
        >
          <View style={styles.welcomeContainer}>
            <View>
              <Text style={styles.welcomeText}>Start Learning 📚</Text>
              <Text style={styles.nameText}>Explore Islam</Text>

              <Text style={styles.subText}>
                Choose a topic and start your learning journey 💜
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* CARDS GRID (Sized & Spaced exactly like Stories Screen) */}
        <View style={styles.grid}>
          {cards.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardWrapper}
              onPress={() => handleCardPress(item.id)}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{ borderRadius: 24 }}
              >
                {/* Image matching StoriesScreen look */}
                <Image source={item.image} style={styles.cardImage} />

                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                {/* Bottom Icon circle matching the playButton container style */}
                <View style={styles.actionButton}>
                  <Ionicons name={item.icon as any} size={20} color="#fff" />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarInner}>
          {/* HOME */}
          <TouchableOpacity style={styles.navItem} onPress={goToHome}>
            <Ionicons name="home" size={28} color="#7A3DFF" />
            <Text style={[styles.navText, { color: "#7A3DFF" }]}>Home</Text>
          </TouchableOpacity>

          {/* LEARN (ACTIVE) */}
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="book" size={28} color="#2FB65D" />
            <Text style={[styles.navText, { color: "#2FB65D" }]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="star" size={28} color="#F4B400" />
            <Text style={[styles.navText, { color: "#F4B400" }]}>Rewards</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goToProfile}>
            <Ionicons name="person" size={28} color="#2196F3" />
            <Text style={[styles.navText, { color: "#2196F3" }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LearnScreen;

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
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

  heroBg: {
    width: "100%",
    minHeight: 280,
    paddingTop: 110,
  },

  heroBgImage: {
    resizeMode: "cover",
    flex: 1,
  },

  welcomeContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  welcomeText: {
    fontSize: 22,
    color: "#4B2AA8",
    fontWeight: "700",
  },

  nameText: {
    fontSize: 40,
    color: "#32158A",
    fontWeight: "bold",
    marginTop: 6,
  },

  subText: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
    width: "80%",
    lineHeight: 24,
  },

  /* Exactly same spacing layout as StoriesScreen */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 120,
    marginTop: 20,
  },

  cardWrapper: {
    width: "48%",
    marginBottom: 18,
  },

  card: {
    borderRadius: 24,
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
    minHeight: 230,
  },

  cardImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    fontWeight: "600",
  },

  /* Play Button ki jga action icon container same style me */
  actionButton: {
    marginTop: 12,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
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

  navItem: {
    alignItems: "center",
  },

  navText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
});