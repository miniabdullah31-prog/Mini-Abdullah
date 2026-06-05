import React from "react";
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

const ActivitiesScreen: React.FC<Props> = ({
  goBack,
}) => {

  const activities = [

    {
      id: 1,
      title: "Islamic Coloring",
      subtitle: "Color Kaaba & Mosques",
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 2,
      title: "Match The Picture",
      subtitle: "Learn by matching cards",
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 3,
      title: "Good Deeds",
      subtitle: "Earn stars every day",
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 4,
      title: "Salah Puzzle",
      subtitle: "Arrange Salah steps",
      bg: require("../homeAssets/greencardBg.jpg"),
    },

    {
      id: 5,
      title: "Memory Game",
      subtitle: "Find matching pairs",
       bg: require("../homeAssets/yellowCard.jpg"),
    },

    {
      id: 6,
      title: "Ramadan Fun",
      subtitle: "Track fasting goals",
      bg: require("../homeAssets/cyanCard.jpg"),
    },

    {
      id: 7,
      title: "Arabic Letters",
      subtitle: "Learn Arabic sounds",
      bg: require("../homeAssets/indigoCard.jpg"),
    },

    {
      id: 8,
      title: "Reward Box",
      subtitle: "Unlock achievements",
      bg: require("../homeAssets/yellowCard.jpg"),
    },

  ];

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#5B33C4"
      />

      <ScrollView>

        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
        >

          <BackButton onPress={goBack} />

          <Text style={styles.title}>
            Activities 🎨
          </Text>

          <Text style={styles.subtitle}>
            Learn Islam through fun games
          </Text>

        </ImageBackground>

        <View style={styles.cardsContainer}>

          {activities.map((item) => (

            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
            >

              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 24,
                }}
              >

                <Text style={styles.cardTitle}>
                  {item.title}
                </Text>

                <Text style={styles.cardSubtitle}>
                  {item.subtitle}
                </Text>

                <View style={styles.playButton}>
                  <Ionicons
                    name="play"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.playText}>
                    Start
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

export default ActivitiesScreen;

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
    fontSize: 16,
  },

  cardsContainer: {
    padding: 20,
  },

  cardWrapper: {
    marginBottom: 18,
  },

  card: {
    padding: 25,
    borderRadius: 24,
    overflow: "hidden",
  },

  cardTitle: {
    fontSize: 24,
    color: "rgb(255, 255, 255)",
    fontWeight: "bold",
  },

  cardSubtitle: {
    fontSize: 15,
    color: "#fff",
    marginTop: 8,
  },

  playButton: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  playText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },

});