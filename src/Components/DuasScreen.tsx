import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const DuasScreen: React.FC<Props> = ({
  goBack,
}) => {

  const [selectedDua,
    setSelectedDua] = useState<any>(null);

  const Duas = [

    {
      id: 1,
      title: "Morning Dua",
      arabic:
        "أَصْـبَحْنا وَأَصْـبَحَ المـلْكُ لله",
      translation:
        "We have entered a new morning and with it all dominion belongs to Allah.",
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 2,
      title: "Sleeping Dua",
      arabic:
        "اللّهُـمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
      translation:
        "O Allah, in Your name I die and I live.",
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 3,
      title: "Eating Dua",
      arabic:
        "بِسْمِ اللهِ وَعَلَى بَرَكَةِ الله",
      translation:
        "In the name of Allah and with Allah’s blessings.",
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 4,
      title: "Travel Dua",
      arabic:
        "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا",
      translation:
        "Glory is to the One who made this journey easy for us.",
      bg: require("../homeAssets/pinkCard.jpg"),
    },

    {
      id: 5,
      title: "Parents Dua",
      arabic:
        "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      translation:
        "My Lord, have mercy upon my parents as they raised me when I was young.",
      bg: require("../homeAssets/greencardBg.jpg"),
    },

    {
      id: 6,
      title: "Before Study",
      arabic:
        "رَّبِّ زِدْنِي عِلْمًا",
      translation:
        "My Lord, increase me in knowledge.",
      bg: require("../homeAssets/cyanCard.jpg"),
    },

    {
      id: 7,
      title: "Leaving Home",
      arabic:
        "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى الله",
      translation:
        "In the name of Allah, I trust in Allah.",
      bg: require("../homeAssets/indigoCard.jpg"),
    },

    {
      id: 8,
      title: "Entering Home",
      arabic:
        "اللّهُـمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ",
      translation:
        "O Allah, I ask You for the best entrance.",
      bg: require("../homeAssets/yellowCard.jpg"),
    },

  ];

  /* ---------------- DUA DETAIL SCREEN ---------------- */

  if (selectedDua) {

    return (

      <SafeAreaView style={styles.container}>

        <StatusBar
          barStyle="light-content"
          backgroundColor="#5B33C4"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}

          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.detailHeader}
            imageStyle={{
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >

            <BackButton
              onPress={() =>
                setSelectedDua(null)
              }
            />

            <Text style={styles.detailTitle}>
              {selectedDua.title}
            </Text>

          </ImageBackground>

          {/* DUA CARD */}

          <View style={styles.detailCard}>

            <Text style={styles.sectionHeading}>
              Dua 🤲
            </Text>

            <Text style={styles.arabicText}>
              {selectedDua.arabic}
            </Text>

            <Text style={styles.sectionHeading}>
              Translation 🌍
            </Text>

            <Text style={styles.translation}>
              {selectedDua.translation}
            </Text>

            {/* AUDIO BUTTON */}

            <TouchableOpacity
              style={styles.audioButton}
            >

              <Ionicons
                name="volume-high"
                size={24}
                color="#fff"
              />

              <Text style={styles.audioText}>
                Play Audio Recitation
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

        {/* NAVBAR */}

        <View style={styles.navbar}>

          <TouchableOpacity
            style={styles.navItem}
            onPress={goBack}
          >

            <Ionicons
              name="home"
              size={28}
              color="#7A3DFF"
            />

            <Text style={[
              styles.navText,
              { color: "#7A3DFF" }
            ]}>
              Home
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
          >

            <Ionicons
              name="book"
              size={28}
              color="#2FB65D"
            />

            <Text style={[
              styles.navText,
              { color: "#2FB65D" }
            ]}>
              Learn
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  /* ---------------- MAIN DUA LIST SCREEN ---------------- */

  return (

    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#5B33C4"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >

          <BackButton onPress={goBack} />

          <Text style={styles.headerTitle}>
            Daily Duas 🤲
          </Text>

          <Text style={styles.headerSubtitle}>
            Select a dua to learn
          </Text>

        </ImageBackground>

        {/* DUA TITLE CARDS */}

        <View style={styles.cardsContainer}>

          {Duas.map((item) => (

            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() =>
                setSelectedDua(item)
              }
            >

              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 22,
                }}
              >

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={28}
                  color="#fff"
                />

              </ImageBackground>

            </TouchableOpacity>

          ))}

        </View>

      </ScrollView>

      {/* NAVBAR */}

      <View style={styles.navbar}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={goBack}
        >

          <Ionicons
            name="home"
            size={28}
            color="#7A3DFF"
          />

          <Text style={[
            styles.navText,
            { color: "#7A3DFF" }
          ]}>
            Home
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >

          <Ionicons
            name="book"
            size={28}
            color="#2FB65D"
          />

          <Text style={[
            styles.navText,
            { color: "#2FB65D" }
          ]}>
            Learn
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default DuasScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  header: {
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: "center",
  },

  detailHeader: {
    paddingTop: 35,
    paddingBottom: 50,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },

  detailTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 25,
  },

  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },

  cardsContainer: {
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 120,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  card: {
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },

  cardTitle: {
    color: "#6d6262",
    fontSize: 22,
    fontWeight: "bold",
  },

  detailCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 28,
    padding: 24,
    elevation: 6,
  },

  sectionHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B2AA8",
    marginBottom: 15,
    marginTop: 10,
  },

  arabicText: {
    fontSize: 30,
    color: "#222",
    textAlign: "right",
    lineHeight: 55,
    marginBottom: 25,
    fontWeight: "700",
  },

  translation: {
    fontSize: 18,
    color: "#555",
    lineHeight: 32,
    marginBottom: 30,
  },

  audioButton: {
    backgroundColor: "#6C4DF7",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  navbar: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    elevation: 12,
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