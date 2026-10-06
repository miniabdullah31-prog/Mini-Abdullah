import React, { useMemo, useState } from "react";
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
  ActivityIndicator,
  TurboModuleRegistry,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import {
  EMAIL_REGEX,
  VALID_EMAIL_MESSAGE,
} from "../utils/emailValidation";
import {
  getGoogleSignInSetupMessage,
  isGoogleSignInConfigured,
} from "../config/googleAuth";
import { upsertSavedAccount } from "../services/accountStore";
import { resetChatMemoryCache } from "../services/chatHistoryStore";
import { useFormScroll } from "../hooks/useFormScroll";

function isGoogleSignInNativeLinked(): boolean {
  return TurboModuleRegistry.get("RNGoogleSignin") != null;
}

type Props = {
  goToSignup: () => void;
  goToForgot: () => void;
  goToHome: () => void;
};

const MIN_PASSWORD_LENGTH = 6;

const Login: React.FC<Props> = ({
  goToSignup,
  goToForgot,
  goToHome,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { scrollRef, onCardLayout, registerField, scrollToField } =
    useFormScroll();

  const googleSignInNativeReady = useMemo(() => isGoogleSignInNativeLinked(), []);

  const GoogleSigninButtonComponent = useMemo(() => {
    if (!googleSignInNativeReady) {
      return null;
    }
    try {
      const mod = require("@react-native-google-signin/google-signin") as typeof import("@react-native-google-signin/google-signin");
      return mod.GoogleSigninButton ?? null;
    } catch {
      return null;
    }
  }, [googleSignInNativeReady]);

  const showCustomAlert = (
    title: string,
    message: string,
    success = false,
    needsVerification = false,
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setVerificationRequired(needsVerification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setVerificationRequired(false);
  };

  const handleResendVerification = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || resendLoading) {
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (data.success) {
        showCustomAlert(
          "Check your email",
          data.devOtp
            ? `DEV OTP: ${data.devOtp}`
            : data.message ||
                "If an account exists and needs verification, an OTP has been sent",
          true,
          false,
        );
      } else {
        showCustomAlert(
          "Error",
          data.message || "Could not resend verification code",
          false,
          true,
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      showCustomAlert(
        "Server Error",
        `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
        false,
        true,
      );
    } finally {
      setResendLoading(false);
    }
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setEmailError(VALID_EMAIL_MESSAGE);
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) validatePassword(value);
  };

  const persistLoginSession = async (data: {
    token: string;
    refreshToken?: string;
    user: { id: string; name?: string; email: string };
  }) => {
    if (!data.token || !data.user?.email) {
      showCustomAlert("Error", "Login response incomplete ❌");
      return false;
    }

    const saved = await upsertSavedAccount({
      id: data.user.id,
      name: data.user.name || "User",
      email: data.user.email,
      token: data.token,
      refreshToken: data.refreshToken,
    });

    if (!saved.ok) {
      showCustomAlert(
        "Limit reached",
        "Max 2 IDs at a time. Delete one from Profile to login another.",
      );
      return false;
    }

    resetChatMemoryCache();
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          const ok = await persistLoginSession(data);
          if (!ok) {
            return;
          }
        } catch {
          showCustomAlert("Error", "Could not save login session ❌");
          return;
        }

        showCustomAlert("Success 🎉", "Login successful", true);

        setTimeout(() => {
          closeModal();
          goToHome();
        }, 600);
      } else if (data.verificationRequired) {
        // No JWT — do not persist session.
        showCustomAlert(
          "Verify email",
          data.message || "Please verify your email before logging in.",
          false,
          true,
        );
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

  const handleGoogleLogin = async () => {
    if (!googleSignInNativeReady) {
      showCustomAlert(
        "Rebuild required",
        "Google Sign-In native module is missing from this app build.\n\nRun: cd android && gradlew clean && cd .. && npx react-native run-android",
      );
      return;
    }

    if (!isGoogleSignInConfigured()) {
      showCustomAlert("Not configured", getGoogleSignInSetupMessage());
      return;
    }

    if (googleLoading) {
      return;
    }

    setGoogleLoading(true);
    try {
      const { signInWithGoogle } = await import("../services/googleAuthService");
      const data = await signInWithGoogle();

      if (data.success && data.token && data.user) {
        const ok = await persistLoginSession({
          token: data.token,
          user: data.user,
        });
        if (!ok) {
          return;
        }

        showCustomAlert("Success 🎉", "Signed in with Google", true);
        setTimeout(() => {
          closeModal();
          goToHome();
        }, 600);
        return;
      }

      if (data.message !== "Google Sign-In cancelled") {
        showCustomAlert("Error", data.message || "Google Sign-In failed ❌");
      }
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : String(error);
      showCustomAlert("Google Sign-In Error", detail);
    } finally {
      setGoogleLoading(false);
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
                  style={[
                    styles.input,
                    emailError ? styles.inputError : null,
                  ]}
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => scrollToField("email")}
                />
                {!!emailError && (
                  <Text style={styles.errorText}>{emailError}</Text>
                )}
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
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  secureTextEntry
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  onFocus={() => scrollToField("password")}
                />
                {!!passwordError && (
                  <Text style={styles.errorText}>{passwordError}</Text>
                )}
              </View>

              <TouchableOpacity onPress={goToForgot}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.orDividerRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              {googleLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#6c4df7"
                  style={styles.googleLoading}
                />
              ) : googleSignInNativeReady && GoogleSigninButtonComponent ? (
                <GoogleSigninButtonComponent
                  style={styles.googleButton}
                  size={GoogleSigninButtonComponent.Size.Wide}
                  color={GoogleSigninButtonComponent.Color.Light}
                  onPress={handleGoogleLogin}
                />
              ) : (
                <TouchableOpacity
                  style={styles.googleFallbackButton}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.85}
                >
                  <View style={styles.googleFallbackInner}>
                    <Text style={styles.googleFallbackG}>G</Text>
                    <Text style={styles.googleFallbackText}>
                      Continue with Google
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

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

              {verificationRequired ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.resendVerifyButton,
                      resendLoading && styles.modalButtonDisabled,
                    ]}
                    onPress={handleResendVerification}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonText}>
                        Resend verification code
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    onPress={closeModal}
                    disabled={resendLoading}
                  >
                    <Text style={styles.modalSecondaryButtonText}>OK</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: isSuccess ? "#6c4df7" : "#ff3b30",
                    },
                  ]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              )}
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
    marginBottom: 4,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
  },

  inputError: {
    borderColor: "#ff3b30",
  },

  errorText: {
    color: "#ff3b30",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
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

  orDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 16,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },

  orText: {
    marginHorizontal: 12,
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },

  googleButton: {
    width: "100%",
    height: 48,
  },

  googleLoading: {
    marginVertical: 12,
  },

  googleFallbackButton: {
    width: "100%",
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dadce0",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  googleFallbackInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleFallbackG: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
    fontWeight: "700",
    color: "#4285F4",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dadce0",
    marginRight: 12,
  },

  googleFallbackText: {
    fontSize: 16,
    color: "#3c4043",
    fontWeight: "500",
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

  modalButtonDisabled: {
    opacity: 0.7,
  },

  resendVerifyButton: {
    backgroundColor: "#6c4df7",
    minWidth: "80%",
    alignItems: "center",
    marginBottom: 12,
  },

  modalSecondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
  },

  modalSecondaryButtonText: {
    color: "#6c4df7",
    fontSize: 15,
    fontWeight: "600",
  },

  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
