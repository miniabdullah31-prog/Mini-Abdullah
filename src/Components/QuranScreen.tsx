import React from "react";
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
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

/* IMPORT BACK BUTTON */

import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const QuranScreen: React.FC<Props> = ({
  goBack,
}) => {

const quranCards = [

  {
    id: 1,
    title: "Noorani Qaida",
    subtitle:
      "Learn Arabic letters & pronunciation",
    image: require("../homeAssets/quran.png"),
    bg: require("../homeAssets/greencardBg.jpg"),
  },

  {
    id: 2,
    title: "Tajweed",
    subtitle:
      "Learn Quran reading rules beautifully",
    image: require("../homeAssets/moon.png"),
    bg: require("../homeAssets/blueCard.jpg"),
  },

  {
    id: 3,
    title: "Read Quran",
    subtitle:
      "Read & listen to beautiful Quran recitation",
    image: require("../homeAssets/quran.png"),
    bg: require("../homeAssets/indigoCard.jpg"),
  },

  {
    id: 4,
    title: "Quran Words",
    subtitle:
      "Common Quran root words & meanings",
    image: require("../homeAssets/star.png"),
    bg: require("../homeAssets/purpleCard.jpg"),
  },

  {
    id: 5,
    title: "Daily Surahs",
    subtitle:
      "Memorize short surahs easily",
    image: require("../homeAssets/mosque4.png"),
    bg: require("../homeAssets/orangeCard.jpg"),
  },

];

  return (

    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#5B33C4"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

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

          <Text style={styles.headerTitle}>
            Quran Learning
          </Text>

          <Text style={styles.headerSubtitle}>
            Learn Quran in a fun & easy way 🌙
          </Text>

        </ImageBackground>

        {/* PROGRESS CARD */}

        <View style={styles.progressCard}>

          <View>

            <Text style={styles.progressTitle}>
              Your Progress ✨
            </Text>

            <Text style={styles.progressText}>
              3 lessons completed
            </Text>

          </View>

          <View style={styles.starCircle}>

            <Ionicons
              name="star"
              size={34}
              color="#FFD43B"
            />

          </View>

        </View>

        {/* SECTION TITLE */}

        <Text style={styles.sectionTitle}>
          Start Learning 📚
        </Text>

        {/* CARDS */}

        <View style={styles.cardsContainer}>

          {quranCards.map((item) => (

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

                <Image
                  source={item.image}
                  style={styles.cardImage}
                />

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.cardSubtitle}>
                  {item.subtitle}
                </Text>

              </ImageBackground>

            </TouchableOpacity>

          ))}

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

  progressCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 30,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  progressTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#44209A",
  },

  progressText: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },

  starCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF6CC",
    justifyContent: "center",
    alignItems: "center",
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

});