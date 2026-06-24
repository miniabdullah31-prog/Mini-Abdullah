import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
  TextInput,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

/* IMPORT BACK BUTTON */
import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const QuranScreen: React.FC<Props> = ({ goBack }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const quranCards = [
    {
      id: 1,
      title: "Noorani Qaida",
      subtitle: "Learn Arabic letters & pronunciation",
      image: require("../homeAssets/quran.png"),
      bg: require("../homeAssets/greencardBg.jpg"),
    },
    {
      id: 2,
      title: "Tajweed",
      subtitle: "Learn Quran reading rules beautifully",
      image: require("../homeAssets/moon.png"),
      bg: require("../homeAssets/blueCard.jpg"),
    },
    {
      id: 3,
      title: "Read Quran",
      subtitle: "Read & listen to beautiful Quran recitation",
      image: require("../homeAssets/quran.png"),
      bg: require("../homeAssets/cyanCard.jpg"), // 🌟 Background Picture Changed here
    },
    {
      id: 4,
      title: "Quran Words",
      subtitle: "Common Quran root words & meanings",
      image: require("../homeAssets/star.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 5,
      title: "Daily Surahs",
      subtitle: "Memorize short surahs easily",
      image: require("../homeAssets/mosque4.png"),
      bg: require("../homeAssets/orangeCard.jpg"),
    },
  ];

  // Filter cards based on search query
  const filteredCards = quranCards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TOP HEADER */}
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* REUSABLE BACK BUTTON */}
          <BackButton onPress={goBack} />

          <Image
            source={require("../homeAssets/quran.png")}
            style={styles.headerImage}
          />

          <Text style={styles.headerTitle}>Quran Learning</Text>

          <Text style={styles.headerSubtitle}>
            Learn Quran in an easy way 🌙
          </Text>
        </ImageBackground>

        {/* 🔍 SEARCH BAR SECTION (Replaced Progress Card) */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, surahs..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>Start Learning 📚</Text>

        {/* CARDS */}
        <View style={styles.cardsContainer}>
          {filteredCards.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
            >
              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 28,
                }}
              >
                <Image source={item.image} style={styles.cardImage} />

                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </ImageBackground>
            </TouchableOpacity>
          ))}

          {filteredCards.length === 0 && (
            <Text style={styles.noResultText}>No results found 🔍</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuranScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginTop: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 17,
    marginTop: 10,
    fontWeight: "600",
  },
  /* Custom Beautiful Floating Search Bar Styles */
  searchContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 30,
    marginLeft: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    fontWeight: "600",
    width: "85%",
  },
  noResultText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 20,
  },
});