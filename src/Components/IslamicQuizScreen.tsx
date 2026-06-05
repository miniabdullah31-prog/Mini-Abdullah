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

const IslamicQuizScreen: React.FC<Props> = ({
  goBack,
}) => {

  const [selectedSection, setSelectedSection] =
    useState<any>(null);

  const sections = [
    {
      id: 1,
      title: "Question Answers",
      icon: "❓",
      description:
        "Answer Islamic questions.",
      bg: require("../homeAssets/purpleCard.jpg")
    },

    {
      id: 2,
      title: "Fill In The Blanks",
      icon: "✍️",
      description:
        "Complete the missing words.",
     bg: require("../homeAssets/orangeCard.jpg")
    },

    {
      id: 3,
      title: "Tick & Cross",
      icon: "✅❌",
      description:
        "Choose correct or wrong.",
      bg: require("../homeAssets/pinkCard.jpg")
    },
  ];

  if (selectedSection) {

    return (

      <SafeAreaView style={styles.container}>

        <ScrollView>

          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
          >

            <BackButton
              onPress={() =>
                setSelectedSection(null)
              }
            />

            <Text style={styles.bigTitle}>
              {selectedSection.title}
            </Text>

          </ImageBackground>

          <View style={styles.detailCard}>

            <Text style={styles.icon}>
              {selectedSection.icon}
            </Text>

            <Text style={styles.detail}>
              {selectedSection.description}
            </Text>

            <Text style={styles.comingSoon}>
              Quiz Questions Coming Soon 🚀
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

          <BackButton
            onPress={goBack}
          />

          <Text style={styles.title}>
            Islamic Quiz 🏆
          </Text>

          <Text style={styles.subtitle}>
            Test Your Knowledge
          </Text>

        </ImageBackground>

        <View style={styles.cardsContainer}>

          {sections.map((item) => (

           <TouchableOpacity
  key={item.id}
  activeOpacity={0.9}
  style={styles.cardWrapper}
  onPress={() =>
    setSelectedSection(item)
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

export default IslamicQuizScreen;

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

  card: {
  borderRadius: 22,
  padding: 25,
  alignItems: "center",
  overflow: "hidden",
  elevation: 6,
},
  cardIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
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

  icon: {
  fontSize: 75,
  textAlign: "center",
  marginBottom: 15,
},
  detail: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 15,
    color: "#444",
    lineHeight: 28,
  },

  comingSoon: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2AA8",
  },
  cardWrapper: {
  marginBottom: 16,
},

});