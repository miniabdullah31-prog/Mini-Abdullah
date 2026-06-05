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
  TextInput,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const NamesOfAllahScreen: React.FC<Props> = ({
  goBack,
}) => {

  const [search, setSearch] =
    useState("");

  const [selectedName,
    setSelectedName] = useState<any>(null);

  const allahNames = [

    {
      id: 1,
      english: "Ar-Rahman",
      arabic: "ٱلرَّحْمَـانُ",
      meaning: "The Most Merciful",
      tafseerEng:
        "Allah showers His mercy upon all creation.",
      tafseerUrdu:
        "اللہ اپنی رحمت تمام مخلوق پر نازل فرماتا ہے۔",
      bg: require("../homeAssets/blueCard.jpg"),
    },

    {
      id: 2,
      english: "Ar-Raheem",
      arabic: "ٱلرَّحِيمُ",
      meaning: "The Especially Merciful",
      tafseerEng:
        "Allah gives special mercy to believers.",
      tafseerUrdu:
        "اللہ مومنوں پر خاص رحمت فرماتا ہے۔",
      bg: require("../homeAssets/purpleCard.jpg"),
    },

    {
      id: 3,
      english: "Al-Malik",
      arabic: "ٱلْمَلِكُ",
      meaning: "The King",
      tafseerEng:
        "Allah is the true King of everything.",
      tafseerUrdu:
        "اللہ پوری کائنات کا حقیقی بادشاہ ہے۔",
      bg: require("../homeAssets/orangeCard.jpg"),
    },

    {
      id: 4,
      english: "Al-Quddus",
      arabic: "ٱلْقُدُّوسُ",
      meaning: "The Most Pure",
      tafseerEng:
        "Allah is free from all faults.",
      tafseerUrdu:
        "اللہ ہر عیب سے پاک ہے۔",
      bg: require("../homeAssets/greencardBg.jpg"),
    },

    {
      id: 5,
      english: "As-Salam",
      arabic: "ٱلسَّلَامُ",
      meaning: "The Source of Peace",
      tafseerEng:
        "Allah gives peace and protection.",
      tafseerUrdu:
        "اللہ سلامتی اور امن عطا فرماتا ہے۔",
      bg: require("../homeAssets/pinkCard.jpg"),
    },

    {
      id: 6,
      english: "Al-Mu’min",
      arabic: "ٱلْمُؤْمِنُ",
      meaning: "The Giver of Safety",
      tafseerEng:
        "Allah protects His servants.",
      tafseerUrdu:
        "اللہ اپنے بندوں کو حفاظت دیتا ہے۔",
      bg: require("../homeAssets/cyanCard.jpg"),
    },

  ];

  const filteredNames =
    allahNames.filter((item) =>
      item.english
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  /* ---------------- DETAIL SCREEN ---------------- */

  if (selectedName) {

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
                setSelectedName(null)
              }
            />

            <Text style={styles.bigArabic}>
              {selectedName.arabic}
            </Text>

            <Text style={styles.bigEnglish}>
              {selectedName.english}
            </Text>

          </ImageBackground>

          {/* DETAIL CARD */}

          <View style={styles.detailCard}>

            <Text style={styles.heading}>
              Meaning 🌙
            </Text>

            <View style={styles.translationRow}>

              <Text style={styles.engMeaning}>
                {selectedName.meaning}
              </Text>

              <Text style={styles.urduMeaning}>
                {selectedName.tafseerUrdu}
              </Text>

            </View>

            <Text style={styles.heading}>
              Pronunciation 🔊
            </Text>

            <Text style={styles.pronounceText}>
              {selectedName.english}
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
                Listen Pronunciation
              </Text>

            </TouchableOpacity>

            <Text style={styles.heading}>
              Tafseer 📖
            </Text>

            <Text style={styles.tafseerEng}>
              {selectedName.tafseerEng}
            </Text>

            <Text style={styles.tafseerUrdu}>
              {selectedName.tafseerUrdu}
            </Text>

          </View>

        </ScrollView>

      </SafeAreaView>
    );
  }

  /* ---------------- MAIN SCREEN ---------------- */

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
            99 Names of Allah 🌙
          </Text>

          <Text style={styles.headerSubtitle}>
            Learn the beautiful names
          </Text>

          {/* SEARCH */}

          <View style={styles.searchBar}>

            <Ionicons
              name="search"
              size={22}
              color="#777"
            />

            <TextInput
              placeholder="Search name..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />

          </View>

        </ImageBackground>

        {/* CARDS */}

        <View style={styles.cardsContainer}>

          {filteredNames.map((item) => (

            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() =>
                setSelectedName(item)
              }
            >

              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 22,
                }}
              >

                <View style={styles.nameRow}>

                  {/* ENGLISH */}

                  <View style={{ flex: 1 }}>

                    <Text style={styles.englishName}>
                      {item.english}
                    </Text>

                    <Text style={styles.meaning}>
                      {item.meaning}
                    </Text>

                  </View>

                  {/* ARABIC */}

                  <View style={{ flex: 1 }}>

                    <Text style={styles.arabicName}>
                      {item.arabic}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={28}
                    color="#fff"
                  />

                </View>

              </ImageBackground>

            </TouchableOpacity>

          ))}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default NamesOfAllahScreen;

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

  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },

  searchBar: {
    backgroundColor: "#fff",
    width: "88%",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 22,
    height: 58,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },

  cardsContainer: {
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 50,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  card: {
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 24,
    overflow: "hidden",
    minHeight: 110,
    justifyContent: "center",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  englishName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  meaning: {
    color: "#F3EFFF",
    fontSize: 12,
    marginTop: 5,
    fontWeight: "600",
  },

  arabicName: {
    color: "#fff",
    fontSize: 28,
    textAlign: "right",
    fontWeight: "bold",
    lineHeight: 42,
    marginRight: 10,
  },

  detailCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 28,
    padding: 24,
    elevation: 6,
  },

  bigArabic: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "bold",
    marginTop: 20,
  },

  bigEnglish: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B2AA8",
    marginTop: 18,
    marginBottom: 12,
  },

  translationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  engMeaning: {
    fontSize: 18,
    color: "#333",
    width: "45%",
    fontWeight: "700",
  },

  urduMeaning: {
    fontSize: 18,
    color: "#333",
    width: "45%",
    textAlign: "right",
    fontWeight: "700",
  },

  pronounceText: {
    fontSize: 20,
    color: "#444",
    marginBottom: 10,
    fontWeight: "700",
  },

  audioButton: {
    backgroundColor: "#6C4DF7",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  tafseerEng: {
    fontSize: 17,
    color: "#444",
    lineHeight: 30,
    marginBottom: 14,
  },

  tafseerUrdu: {
    fontSize: 18,
    color: "#444",
    lineHeight: 34,
    textAlign: "right",
  },

  normalText: {
    fontSize: 17,
    color: "#555",
    lineHeight: 30,
  },

});