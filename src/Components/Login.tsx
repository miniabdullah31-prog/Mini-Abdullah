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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { upsertSavedAccount } from "../services/accountStore";
import { resetChatMemoryCache } from "../services/chatHistoryStore";
import { useFormScroll } from "../hooks/useFormScroll";

type Props = {
  goToSignup: () => void;
  goToForgot: () => void;
  goToHome: () => void;
};

const Login: React.FC<Props> = ({
  goToSignup,
  goToForgot,
  goToHome,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { scrollRef, onCardLayout, registerField, scrollToField } =
    useFormScroll();

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

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Error", "Please fill all fields ❌");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          if (!data.token || !data.user?.email) {
            showCustomAlert("Error", "Login response incomplete ❌");
            return;
          }

          const saved = await upsertSavedAccount({
            id: data.user.id,
            name: data.user.name || "User",
            email: data.user.email,
            token: data.token,
          });

          if (!saved.ok) {
            showCustomAlert(
              "Limit reached",
              "Max 4 IDs at a time. Delete one from Profile to login another.",
            );
            return;
          }
          resetChatMemoryCache();
        } catch {
          showCustomAlert("Error", "Could not save login session ❌");
          return;
        }

        showCustomAlert("Success 🎉", "Login successful", true);

        setTimeout(() => {
          setModalVisible(false);
          goToHome();
        }, 600);
      } else {
        showCustomAlert("Error", data.message || "Login failed ❌");
      }
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : String(error);

      showCustomAlert(
        "Server Error",
        `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
      );
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View
              style={styles.card}
              onLayout={(e) => onCardLayout(e.nativeEvent.layout.y)}
            >
              <Image
                source={require("../assets/miniAbdullah.png")}
                style={styles.image}
              />

              <Text style={styles.title}>Welcome Back</Text>

              <Text style={styles.subtitle}>
                Continue your Islamic learning journey
              </Text>

              <View
                style={styles.fieldWrap}
                onLayout={(e) =>
                  registerField("email", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => scrollToField("email")}
                />
              </View>

              <View
                style={styles.fieldWrap}
                onLayout={(e) =>
                  registerField("password", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#888"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => scrollToField("password")}
                />
              </View>

              <TouchableOpacity onPress={goToForgot}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={goToSignup}>
                <Text style={styles.signupLink}>New here? Create account</Text>
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

export default Login;

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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 220,
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

  fieldWrap: {
    width: "100%",
  },

  image: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginBottom: 16,
  },

  title: {
    fontSize: 32,
    color: "#4c2aa8",
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    color: "#8b3dff",
    fontSize: 14,
    marginBottom: 20,
    width: "100%",
    textAlign: "right",
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  signupLink: {
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
