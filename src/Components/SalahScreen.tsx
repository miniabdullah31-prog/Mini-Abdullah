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

import BackButton from "./BackButton";

type Props = {
    goBack: () => void;
};

const SalahScreen: React.FC<Props> = ({
    goBack,
}) => {

    const [selectedStep,
        setSelectedStep] = useState<any>(null);

    const salahSteps = [

        {
            id: 1,
            title: "Takbeer",
            arabic: "الله أكبر",
            detail: "Raise both hands and say Allahu Akbar to start Salah.",
            bg: require("../homeAssets/purpleCard.jpg")
        },

        {
            id: 2,
            title: "Qiyam",
            arabic: "سورة الفاتحة",
            detail: "Stand and recite Surah Al-Fatihah.",
            bg: require("../homeAssets/orangeCard.jpg")
        },

        {
            id: 3,
            title: "Ruku",
            arabic: "سبحان ربي العظيم",
            detail: "Bow and recite Subhana Rabbiyal Azeem three times.",
           bg: require("../homeAssets/pinkCard.jpg")
        },

        {
            id: 4,
            title: "Qaumah",
            arabic: "سمع الله لمن حمده",
            detail: "Stand straight after Ruku.",
           bg: require("../homeAssets/greencardBg.jpg")
        },

        {
            id: 5,
            title: "First Sajdah",
            arabic: "سبحان ربي الأعلى",
            detail: "Perform Sajdah and recite Subhana Rabbiyal A'la.",
            bg: require("../homeAssets/cyanCard.jpg")
        },

        {
            id: 6,
            title: "Jalsa",
            arabic: "رب اغفر لي",
            detail: "Sit between two Sajdahs.",
            bg: require("../homeAssets/indigoCard.jpg")

        },

        {
            id: 7,
            title: "Second Sajdah",
            arabic: "سبحان ربي الأعلى",
            detail: "Perform second Sajdah.",
           bg: require("../homeAssets/yellowCard.jpg")
        },

        {
            id: 8,
            title: "Tashahhud",
            arabic: "التحيات لله",
            detail: "Sit and recite At-Tahiyyat.",
           bg: require("../homeAssets/pinkCard.jpg")
        },

        {
            id: 9,
            title: "Durood",
            arabic: "اللهم صل على محمد",
            detail: "Recite Durood Ibrahim.",
            bg: require("../homeAssets/purpleCard.jpg")
        },

        {
            id: 10,
            title: "Salam",
            arabic: "السلام عليكم ورحمة الله",
            detail: "Turn head right and left to finish Salah.",
           bg: require("../homeAssets/orangeCard.jpg")
        },

    ];
    if (selectedStep) {

        return (

            <SafeAreaView
                style={styles.container}
            >

                <ScrollView>

                    <ImageBackground
                        source={require("../homeAssets/Quotebg.jpg")}
                        style={styles.header}
                    >

                        <BackButton
                            onPress={() =>
                                setSelectedStep(null)
                            }
                        />

                        <Text style={styles.bigTitle}>
                            {selectedStep.title}
                        </Text>

                    </ImageBackground>

                    <View style={styles.detailCard}>

                        <Text style={styles.arabic}>
                            {selectedStep.arabic}
                        </Text>

                        <Text style={styles.detail}>
                            {selectedStep.detail}
                        </Text>

                    </View>

                </ScrollView>

            </SafeAreaView>
        );
    }

    return (

        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                backgroundColor="#5B33C4"
            />

            <ScrollView>

                <ImageBackground
                    source={require("../homeAssets/Quotebg.jpg")}
                    style={styles.header}
                >

                    <BackButton
                        onPress={goBack}
                    />

                    <Text style={styles.title}>
                        Learn Salah 🕌
                    </Text>

                    <Text style={styles.subtitle}>
                        Step by Step Salah
                    </Text>

                </ImageBackground>

                <View style={styles.cardsContainer}>

                    {salahSteps.map(
                        (item) => (

                            <TouchableOpacity
  key={item.id}
  activeOpacity={0.9}
  style={styles.cardWrapper}
  onPress={() =>
    setSelectedStep(item)
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
      {item.id}. {item.title}
    </Text>

  </ImageBackground>

</TouchableOpacity>

                        ))}

                </View>

            </ScrollView>

        </SafeAreaView>
    );
};

export default SalahScreen;

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
  padding: 22,
  overflow: "hidden",
  elevation: 5,
},

   cardTitle: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
},

    bigTitle: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
        marginTop: 20,
    },

    detailCard: {
        margin: 20,
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 25,
    },

    arabic: {
        fontSize: 38,
        textAlign: "center",
        marginBottom: 25,
        color: "#4B2AA8",
    },

    detail: {
        fontSize: 18,
        lineHeight: 32,
        color: "#444",
        textAlign: "center",
    },
    cardWrapper: {
  marginBottom: 16,
},

});  