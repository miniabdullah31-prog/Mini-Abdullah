import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

type Props = { goBack?: () => void };

/** Placeholder module — original screen content was empty in git history. */
const SeerahScreen: React.FC<Props> = ({ goBack }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
    <View style={styles.card}>
      <Text style={styles.title}>Seerah</Text>
      <Text style={styles.sub}>Content coming soon.</Text>
      {goBack ? (
        <TouchableOpacity style={styles.btn} onPress={goBack}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </SafeAreaView>
);

export default SeerahScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    elevation: 3,
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#35158B" },
  sub: { marginTop: 10, color: "#666", fontWeight: "600" },
  btn: {
    marginTop: 18,
    backgroundColor: "#5B33C4",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
