import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const GoodDeedsScreen: React.FC<Props> = ({
  goBack,
}) => {

  const [selectedDeed, setSelectedDeed] =
    useState<any>(null);

  const deeds = [
    {
      id: 1,
      title: "Pray Salah",
      icon: "🕌",
      detail: "Offer your Salah on time.",
                   bg: require("../homeAssets/purpleCard.jpg")

    },
    {
      id: 2,
      title: "Read Quran",
      icon: "📖",
      detail: "Read at least one page daily.",
     bg: require("../homeAssets/orangeCard.jpg")
    },
    {
      id: 3,
      title: "Help Parents",
      icon: "❤️",
      detail: "Help your parents with daily tasks.",
      bg: require("../homeAssets/pinkCard.jpg")
    },
    {
      id: 4,
      title: "Say Salam",
      icon: "🤝",
      detail: "Greet others with Salam.",
      bg: require("../homeAssets/greencardBg.jpg")
    },
    {
      id: 5,
      title: "Give Charity",
      icon: "💰",
      detail: "Share with those in need.",
      bg: require("../homeAssets/cyanCard.jpg")
    },
    {
      id: 6,
      title: "Speak Kindly",
      icon: "😊",
      detail: "Use good and respectful words.",
      bg: require("../homeAssets/indigoCard.jpg")
    },
  ];

  if (selectedDeed) {

    return (
      <SafeAreaView style={styles.container}>

        <ScrollView>

          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
          >

            <BackButton
              onPress={() =>
                setSelectedDeed(null)
              }
            />

            <Text style={styles.bigTitle}>
              {selectedDeed.title}
            </Text>

          </ImageBackground>

          <View style={styles.detailCard}>

            <Text style={styles.bigIcon}>
              {selectedDeed.icon}
            </Text>

            <Text style={styles.detail}>
              {selectedDeed.detail}
            </Text>

          </View>

        </ScrollView>

      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView>

        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
        >

          <BackButton onPress={goBack} />

          <Text style={styles.title}>
            Good Deeds ⭐
          </Text>

          <Text style={styles.subtitle}>
            Earn Rewards Through Good Actions
          </Text>

        </ImageBackground>

        <View style={styles.cardsContainer}>

          {deeds.map((item) => (

            <TouchableOpacity
  key={item.id}
  activeOpacity={0.9}
  style={styles.cardWrapper}
  onPress={() =>
    setSelectedDeed(item)
  }
>

  <ImageBackground
    source={item.bg}
    style={styles.card}
    imageStyle={{
      borderRadius: 22,
    }}
  >

    <Text style={styles.cardIcon}>
      {item.icon}
    </Text>

    <Text style={styles.cardTitle}>
      {item.title}
    </Text>

  </ImageBackground>

</TouchableOpacity>
          ))}

        </View>

      </ScrollView>

    </SafeAreaView>

  );
};

export default GoodDeedsScreen;

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

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    color: "#fff",
    marginTop: 10,
  },

  cardsContainer: {
    padding: 20,
  },

 card: {
  borderRadius: 22,
  padding: 25,
  alignItems: "center",
  overflow: "hidden",
  elevation: 5,
},
  cardIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  bigTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },

  detailCard: {
  margin: 20,
  backgroundColor: "#fff",
  borderRadius: 28,
  padding: 25,
  elevation: 6,
},

  bigIcon: {
  fontSize: 80,
  textAlign: "center",
  marginBottom: 15,
},
  detail: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 15,
    color: "#444",
    lineHeight: 30,
  },
  cardWrapper: {
  marginBottom: 16,
},

});