import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ProfileGender } from "../data/avatars";

type Props = {
  onContinue: (gender: ProfileGender) => void;
};

const GenderSelectionScreen: React.FC<Props> = ({ onContinue }) => {
  const [selected, setSelected] = useState<ProfileGender | null>(null);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
      <View style={styles.content}>
        <Text style={styles.title}>Who is learning?</Text>
        <Text style={styles.subtitle}>
          Choose girl or boy so we can set up a profile picture.
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, selected === "girl" && styles.cardSelected]}
            onPress={() => setSelected("girl")}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === "girl" }}
            accessibilityLabel="Girl"
          >
            <LinearGradient
              colors={
                selected === "girl"
                  ? ["#F48FB1", "#EC407A"]
                  : ["#FCE4EC", "#F8BBD0"]
              }
              style={styles.cardInner}
            >
              <Text style={styles.emoji}>👧</Text>
              <Text
                style={[
                  styles.cardLabel,
                  selected === "girl" && styles.cardLabelSelected,
                ]}
              >
                Girl
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, selected === "boy" && styles.cardSelected]}
            onPress={() => setSelected("boy")}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === "boy" }}
            accessibilityLabel="Boy"
          >
            <LinearGradient
              colors={
                selected === "boy"
                  ? ["#6C4DF7", "#8B6CFF"]
                  : ["#EDE7FF", "#D1C4E9"]
              }
              style={styles.cardInner}
            >
              <Text style={styles.emoji}>👦</Text>
              <Text
                style={[
                  styles.cardLabel,
                  selected === "boy" && styles.cardLabelSelected,
                ]}
              >
                Boy
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueDisabled]}
          disabled={!selected}
          onPress={() => {
            if (selected) onContinue(selected);
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GenderSelectionScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4B2AA8",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6580",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    gap: 14,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#4B2AA8",
  },
  cardInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 12,
    minHeight: 160,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B2AA8",
  },
  cardLabelSelected: {
    color: "#FFFFFF",
  },
  continueBtn: {
    marginTop: "auto",
    backgroundColor: "#6C4DF7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueDisabled: {
    opacity: 0.45,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
