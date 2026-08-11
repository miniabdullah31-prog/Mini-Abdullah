import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { upsertSavedAccount } from "../services/accountStore";
import { resetChatMemoryCache } from "../services/chatHistoryStore";

type Props = {
  goToLogin: () => void;
  goToSuccess: () => void;
};

const Signup: React.FC<Props> = ({ goToLogin, goToSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const showCustomAlert = (
    title: string,
    message: string,
    success = false,
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleSignup = async () => {
    if (loading) {
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      showCustomAlert("Error", "Please fill all fields ❌");
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert("Error", "Passwords do not match ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          if (data.token && data.user?.email) {
            const saved = await upsertSavedAccount({
              id: data.user.id,
              name: data.user.name || name,
              email: data.user.email,
              token: data.token,
            });

            if (!saved.ok) {
              showCustomAlert(
                "Limit reached",
                "Max 4 IDs at a time. Delete one from Profile to add another.",
              );
              return;
            }
            resetChatMemoryCache();
          }
        } catch {
          // ignore
        }

        showCustomAlert(
          "Success 🎉",
          "Account created successfully",
          true,
        );

        setTimeout(() => {
          setModalVisible(false);
          goToSuccess();
        }, 500);
      } else {
        showCustomAlert(
          "Error",
          typeof data.message === "string"
            ? data.message
            : "Signup failed ❌",
        );
      }
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : String(error);

      showCustomAlert(
        "Server Error",
        `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../assets/successScreen.png")}
        style={styles.container}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.card}>
              <Image
                source={require("../assets/miniAbdullah.png")}
                style={styles.image}
              />

              <Text style={styles.title}>Create Account</Text>

              <Text style={styles.subtitle}>
                Join Mini Abdullah and start learning today
              </Text>

              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#888"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="#888"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.buttonLoadingRow}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Creating...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.loginLink}>Already have an account?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isSuccess ? "#4BB543" : "#ff3b30",
                  },
                ]}
              >
                {modalTitle}
              </Text>

              <Text style={styles.modalMessage}>{modalMessage}</Text>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isSuccess ? "#6c4df7" : "#ff3b30",
                  },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#2a1654",
  },

  bgImage: {
    backgroundColor: "#2a1654",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 32,
    alignItems: "center",
    elevation: 8,
  },

  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 16,
  },

  title: {
    color: "#4c2aa8",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#777",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  input: {
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 8,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  buttonLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  loginLink: {
    marginTop: 20,
    color: "#4c2aa8",
    fontSize: 15,
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    elevation: 10,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },

  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
