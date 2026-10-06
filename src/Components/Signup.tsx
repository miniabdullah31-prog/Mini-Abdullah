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
import { useFormScroll } from "../hooks/useFormScroll";
import {
  isValidEmailFormat,
  VALID_EMAIL_MESSAGE,
} from "../utils/emailValidation";
import { upsertSavedAccount } from "../services/accountStore";
import { resetChatMemoryCache } from "../services/chatHistoryStore";

const SMTP_SEND_FAILED_MESSAGE =
  "We couldn't send the verification code to this email. Please check your email address and try again.";

type Props = {
  goToLogin: () => void;
  /** When ENABLE_EMAIL_VERIFICATION=true — open email OTP after signup. */
  goToEmailVerification: (email: string) => void;
  /** When verification is off — gender → avatar after signup + JWT. */
  goToProfileSetup: () => void;
};

const Signup: React.FC<Props> = ({
  goToLogin,
  goToEmailVerification,
  goToProfileSetup,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async () => {
    if (loading) {
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      showCustomAlert("Error", "Please fill all fields ❌");
      return;
    }

    if (!isValidEmailFormat(email)) {
      showCustomAlert("Error", VALID_EMAIL_MESSAGE);
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
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const normalizedEmail = String(data.user?.email || email)
          .trim()
          .toLowerCase();

        if (!normalizedEmail) {
          showCustomAlert("Error", "Signup response incomplete ❌");
          return;
        }

        // Temporary bypass path: JWT returned, no OTP (ENABLE_EMAIL_VERIFICATION=false).
        if (data.token && !data.verificationRequired) {
          try {
            const saved = await upsertSavedAccount({
              id: String(data.user?.id || normalizedEmail),
              name: data.user?.name || name || "User",
              email: normalizedEmail,
              token: data.token,
              refreshToken: data.refreshToken,
            });
            if (!saved.ok) {
              showCustomAlert(
                "Limit reached",
                "Max 2 IDs at a time. Delete one from Profile to add another.",
              );
              return;
            }
            resetChatMemoryCache();
          } catch {
            showCustomAlert("Error", "Could not save login session ❌");
            return;
          }

          showCustomAlert("Success 🎉", "Account created successfully", true);
          setTimeout(() => {
            setModalVisible(false);
            goToProfileSetup();
          }, 600);
          return;
        }

        // Full verification path (ENABLE_EMAIL_VERIFICATION=true) — keep intact.
        const msg = data.devOtp
          ? `Check your email for a verification code.\n\nDEV OTP: ${data.devOtp}`
          : data.message ||
            "Account created. Please verify your email with the OTP sent.";

        showCustomAlert("Verify your email", msg, true);

        setTimeout(() => {
          setModalVisible(false);
          goToEmailVerification(normalizedEmail);
        }, 600);
      } else {
        const failMessage =
          data?.code === "SMTP_SEND_FAILED"
            ? SMTP_SEND_FAILED_MESSAGE
            : typeof data.message === "string"
              ? data.message
              : "Signup failed ❌";
        showCustomAlert("Error", failMessage);
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

              <Text style={styles.title}>Create Account</Text>

              <Text style={styles.subtitle}>
                Join Mini Abdullah and start learning today
              </Text>

              <View
                style={styles.fieldWrap}
                onLayout={(e) => registerField("name", e.nativeEvent.layout.y)}
              >
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => scrollToField("name")}
                />
              </View>

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

              <View
                style={styles.fieldWrap}
                onLayout={(e) =>
                  registerField("confirm", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => scrollToField("confirm")}
                />
              </View>

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
    paddingBottom: 240,
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
