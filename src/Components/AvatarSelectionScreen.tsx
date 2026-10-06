import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import {
  AvatarId,
  getAvatarsForGender,
  ProfileGender,
} from "../data/avatars";

type Props = {
  gender: ProfileGender;
  onContinue: (avatarId: AvatarId) => void;
  onBack?: () => void;
};

const AvatarSelectionScreen: React.FC<Props> = ({
  gender,
  onContinue,
  onBack,
}) => {
  const options = useMemo(() => getAvatarsForGender(gender), [gender]);
  const [selected, setSelected] = useState<AvatarId | null>(null);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
      <View style={styles.content}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <Text style={styles.title}>Pick your avatar</Text>
        <Text style={styles.subtitle}>
          Choose one picture for this profile. You can change it later in
          Profile.
        </Text>

        <View style={styles.row}>
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.9}
                style={[styles.avatarWrap, isSelected && styles.avatarSelected]}
                onPress={() => setSelected(opt.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Avatar ${opt.id}`}
              >
                <Image source={opt.source} style={styles.avatarImage} />
              </TouchableOpacity>
            );
          })}
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

export default AvatarSelectionScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    color: "#6C4DF7",
    fontWeight: "700",
    fontSize: 15,
  },
  backSpacer: {
    height: 36,
  },
  title: {
    marginTop: 12,
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
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 48,
  },
  avatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: "#E0D7F7",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  avatarSelected: {
    borderColor: "#6C4DF7",
    shadowColor: "#6C4DF7",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
