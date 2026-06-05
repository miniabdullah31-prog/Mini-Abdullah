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

const StoriesScreen: React.FC<Props> = ({
  goBack,
}) => {

  const storyVideos = [

    {
      id: 1,
      title: "Prophet Adam (AS)",
      subtitle: "Story of the first human",
      image: require("../assets/story1.png"),
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 2,
      title: "Prophet Nuh (AS)",
      subtitle: "The great ark story",
      image: require("../assets/story2.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 3,
      title: "Prophet Ibrahim (AS)",
      subtitle: "Friend of Allah",
      image: require("../assets/story3.png"),
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 4,
      title: "Prophet Musa (AS)",
      subtitle: "Parting of the sea",
      image: require("../assets/story4.png"),
      bg: require("../homeAssets/pinkCard.jpg"),
    },

    {
      id: 5,
      title: "Prophet Yunus (AS)",
      subtitle: "Inside the whale",
      image: require("../assets/story5.png"),
      bg: require("../homeAssets/greencardBg.jpg"),
    },

    {
      id: 6,
      title: "Prophet Isa (AS)",
      subtitle: "Miracles of Isa",
      image: require("../assets/story6.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 7,
      title: "Prophet Yusuf (AS)",
      subtitle: "Beautiful patience",
      image: require("../assets/story7.png"),
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 8,
      title: "Prophet Muhammad ﷺ",
      subtitle: "The last messenger",
      image: require("../assets/story8.png"),
      bg: require("../homeAssets/yellowCard.jpg"),
    },

    {
      id: 9,
      title: "Battle of Badr",
      subtitle: "Victory of Muslims",
      image: require("../assets/story9.png"),
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 10,
      title: "Islamic Manners",
      subtitle: "Learn good habits",
      image: require("../assets/story10.png"),
      bg: require("../homeAssets/purpleCard.jpg"),
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

          {/* REUSABLE BACK BUTTON */}

          <BackButton onPress={goBack} />

          <Image
            source={require("../homeAssets/bookread.png")}
            style={styles.headerImage}
          />

          <Text style={styles.headerTitle}>
            Islamic Stories
          </Text>

          <Text style={styles.headerSubtitle}>
            Watch & learn amazing Islamic stories 🌙
          </Text>

        </ImageBackground>

        {/* SECTION TITLE */}

        <Text style={styles.sectionTitle}>
          Story Videos 🎬
        </Text>

        {/* VIDEO CARDS */}

        <View style={styles.cardsContainer}>

          {storyVideos.map((item) => (

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

                <View style={styles.playButton}>

                  <Ionicons
                    name="play"
                    size={22}
                    color="#fff"
                  />

                </View>

              </ImageBackground>

            </TouchableOpacity>

          ))}

        </View>

      </ScrollView>

      {/* BOTTOM NAVBAR */}

      <View style={styles.navbar}>

        <TouchableOpacity style={styles.navItem}>

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

        <TouchableOpacity style={styles.navItem}>

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

        <TouchableOpacity style={styles.navItem}>

          <Ionicons
            name="star"
            size={28}
            color="#F4B400"
          />

          <Text style={[
            styles.navText,
            { color: "#F4B400" }
          ]}>
            Rewards
          </Text>

        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>

          <Ionicons
            name="person"
            size={28}
            color="#2196F3"
          />

          <Text style={[
            styles.navText,
            { color: "#2196F3" }
          ]}>
            Profile
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default StoriesScreen;

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
    width: 140,
    height: 140,
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
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 25,
    marginLeft: 20,
  },

  cardsContainer: {
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

  playButton: {
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