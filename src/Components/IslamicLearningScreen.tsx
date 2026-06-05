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
import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const IslamicLearningScreen: React.FC<Props> = ({
  goBack,
}) => {

  const lessons = [

    {
      id: 1,
      title: "Enter Home With Dua",
      subtitle:
        "Learn why entering home with dua brings blessings.",
      image: require("../homeAssets/mosque4.png"),
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 2,
      title: "Smile Is Sunnah",
      subtitle:
        "A smile spreads happiness and love.",
      image: require("../homeAssets/star.png"),
      bg: require("../homeAssets/yellowCard.jpg"),
    },

    {
      id: 3,
      title: "Respect Your Parents",
      subtitle:
        "Allah loves children who respect parents.",
      image: require("../homeAssets/kids_praying.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 4,
      title: "Say Salam First",
      subtitle:
        "Spread peace by saying Assalamu Alaikum.",
      image: require("../homeAssets/moon.png"),
      bg: require("../homeAssets/greencardBg.jpg"),
    },

    {
      id: 5,
      title: "Speak Good Words",
      subtitle:
        "Kind words make hearts happy.",
      image: require("../homeAssets/quran.png"),
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 6,
      title: "Sharing Makes You Better",
      subtitle:
        "Sharing is caring in Islam.",
      image: require("../homeAssets/goldcup.png"),
      bg: require("../homeAssets/pinkCard.jpg"),
    },

    {
      id: 7,
      title: "Keep Your Room Clean",
      subtitle:
        "Cleanliness is part of faith.",
      image: require("../homeAssets/painting.png"),
      bg: require("../homeAssets/indigoCard.jpg"),
    },

    {
      id: 8,
      title: "Pray On Time",
      subtitle:
        "Salah brings peace to the heart.",
      image: require("../homeAssets/kaaba2.png"),
      bg: require("../homeAssets/pinkCard.jpg"),
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
            Islamic Learning 🌙
          </Text>

          <Text style={styles.headerSubtitle}>
            Learn Islam with fun lessons 💜
          </Text>

        </ImageBackground>

        {/* LESSON CARDS */}

        <View style={styles.cardsContainer}>

          {lessons.map((item) => (

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

                <View style={styles.watchButton}>

                  <Ionicons
                    name="play"
                    size={20}
                    color="#fff"
                  />

                  <Text style={styles.watchText}>
                    Watch Lesson
                  </Text>

                </View>

              </ImageBackground>

            </TouchableOpacity>

          ))}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default IslamicLearningScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  header: {
    paddingTop: 35,
    paddingBottom: 40,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },

  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },

  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
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
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#726f6f",
    textAlign: "center",
  },

  cardSubtitle: {
    fontSize: 15,
    color: "#9a9898",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    width: "85%",
    fontWeight: "600",
  },

  watchButton: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  watchText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 15,
  },

}); 