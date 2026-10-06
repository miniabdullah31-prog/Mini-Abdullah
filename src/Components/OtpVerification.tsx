import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { upsertSavedAccount } from "../services/accountStore";
import { resetChatMemoryCache } from "../services/chatHistoryStore";
import { useFormScroll } from "../hooks/useFormScroll";

export type OtpMode = "reset" | "signup";

type Props = {
  email: string;
  /** Default `reset` preserves Forgot Password → OTP → Reset Password. */
  mode?: OtpMode;
  /** Password-reset: after verify-otp success. */
  goToNewPassword?: (otp: string) => void;
  /** Signup: after verify-email + session save → gender/avatar setup. */
  onSignupVerified?: () => void;
  goToLogin?: () => void;
  /** Signup: return to Create Account to edit email after SMTP send failure. */
  goBackToSignup?: () => void;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const SMTP_SEND_FAILED_MESSAGE =
  "We couldn't send the verification code to this email. Please check your email address and try again.";

const OtpVerification: React.FC<Props> = ({
  email,
  mode = "reset",
  goToNewPassword,
  onSignupVerified,
  goBackToSignup,
}) => {
  const isSignup = mode === "signup";
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldownLeft, setResendCooldownLeft] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const { scrollRef, onCardLayout, registerField, scrollToField } =
    useFormScroll();

  const clearCooldownTimer = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  };

  const startResendCooldown = () => {
    if (!isSignup) {
      return;
    }
    clearCooldownTimer();
    setResendCooldownLeft(RESEND_COOLDOWN_SECONDS);
    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldownLeft((prev) => {
        if (prev <= 1) {
          clearCooldownTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearCooldownTimer();
    };
  }, []);

  const persistSignupSession = async (data: {
    token?: string;
    refreshToken?: string;
    user?: { id?: string; name?: string; email?: string };
  }) => {
    if (!data.token || !data.user?.email) {
      Alert.alert("Error", "Verification response incomplete ❌");
      return false;
    }

    const saved = await upsertSavedAccount({
      id: String(data.user.id || data.user.email),
      name: data.user.name || "User",
      email: data.user.email,
      token: data.token,
      refreshToken: data.refreshToken,
    });

    if (!saved.ok) {
      Alert.alert(
        "Limit reached",
        "Max 2 IDs at a time. Delete one from Profile to add another.",
      );
      return false;
    }

    resetChatMemoryCache();
    return true;
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const friendlySignupVerifyError = (message?: string) => {
    const msg = String(message || "");
    if (/expired/i.test(msg)) {
      return {
        title: "Code expired",
        body: "This verification code has expired. Please tap Resend Code for a new one.",
      };
    }
    return {
      title: "Invalid code",
      body: "That verification code is incorrect. Please check and try again.",
    };
  };

  const handleVerify = async () => {
    if (loading || resending) {
      return;
    }

    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      Alert.alert(
        isSignup ? "Incomplete code" : "Error",
        isSignup
          ? "Please enter all 6 digits of the verification code."
          : "Please enter the full 6-digit OTP",
      );
      return;
    }

    if (!email) {
      Alert.alert(
        "Error",
        isSignup
          ? "Email missing. Please start from Signup."
          : "Email missing. Please start from Forgot Password.",
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup
        ? `${API_BASE_URL}/api/auth/verify-email`
        : `${API_BASE_URL}/api/auth/verify-otp`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (data.success) {
        if (isSignup) {
          try {
            const ok = await persistSignupSession(data);
            if (!ok) {
              return;
            }
          } catch {
            Alert.alert("Error", "Could not save login session ❌");
            return;
          }
          Alert.alert(
            "Email verified",
            "Your email was verified successfully. Continue to set up your profile.",
            [{ text: "Continue", onPress: () => onSignupVerified?.() }],
          );
        } else {
          // Password-reset: never store a login token here.
          goToNewPassword?.(code);
        }
      } else if (isSignup) {
        const friendly = friendlySignupVerifyError(data.message);
        Alert.alert(friendly.title, friendly.body);
      } else {
        Alert.alert("Error", data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Server Error",
        `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending || loading) {
      return;
    }
    if (isSignup && resendCooldownLeft > 0) {
      return;
    }

    setResending(true);

    try {
      const endpoint = isSignup
        ? `${API_BASE_URL}/api/auth/resend-verification`
        : `${API_BASE_URL}/api/auth/forgot-password`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();

        if (isSignup && data.alreadyVerified) {
          Alert.alert(
            "Already verified",
            "Your email is already verified. Tap Verify to continue setup.",
          );
          return;
        }

        if (isSignup) {
          startResendCooldown();
          Alert.alert(
            "Code sent",
            data.devOtp
              ? `A new verification code was sent.\n\nDEV OTP: ${data.devOtp}`
              : "A new verification code was sent to your email.",
          );
        } else {
          Alert.alert(
            "OTP resent",
            data.devOtp
              ? `DEV OTP: ${data.devOtp}`
              : data.message ||
                  "If an account exists, a new OTP has been sent",
          );
        }
      } else if (isSignup) {
        const failMessage =
          data?.code === "SMTP_SEND_FAILED"
            ? SMTP_SEND_FAILED_MESSAGE
            : data.message || SMTP_SEND_FAILED_MESSAGE;
        Alert.alert("Could not send code", failMessage, [
          ...(goBackToSignup
            ? [
                {
                  text: "Edit email",
                  onPress: () => goBackToSignup(),
                },
              ]
            : []),
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Error", data.message || "Could not resend OTP");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      if (isSignup) {
        Alert.alert(
          "Could not resend",
          `We could not reach the server. Please check your connection and try again.\n\n${detail}`,
        );
      } else {
        Alert.alert(
          "Server Error",
          `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
        );
      }
    } finally {
      setResending(false);
    }
  };

  const signupResendDisabled =
    isSignup && (resending || loading || resendCooldownLeft > 0);
  const resetResendDisabled = !isSignup && (resending || loading);
  const resendDisabled = isSignup ? signupResendDisabled : resetResendDisabled;

  const resendLabel = (() => {
    if (resending) {
      return "Sending…";
    }
    if (isSignup && resendCooldownLeft > 0) {
      return `Resend Code (${resendCooldownLeft}s)`;
    }
    return isSignup ? "Resend Code" : "Resend";
  })();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../assets/bg.png")}
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

              <Text style={styles.title}>
                {isSignup ? "Verify Your Email" : "Verify Account"}
              </Text>

              <Text style={styles.description}>
                {isSignup
                  ? `Enter the 6-digit code sent to${email ? `\n${email}` : " your email"}`
                  : "Enter the 6-digit code sent to your email"}
              </Text>

              <View
                style={styles.otpContainer}
                onLayout={(e) => registerField("otp", e.nativeEvent.layout.y)}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => scrollToField("otp")}
                    editable={!loading && !resending}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading || resending}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.resendText}>
                Didn’t receive code?{" "}
                <Text
                  style={[styles.resend, resendDisabled && styles.resendDisabled]}
                  onPress={resendDisabled ? undefined : handleResend}
                >
                  {resendLabel}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
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
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 8,
  },

  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3c1f87",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
  },

  otpInput: {
    width: 44,
    height: 56,
    backgroundColor: "#f3f5ff",
    borderRadius: 14,
    textAlign: "center",
    fontSize: 22,
    color: "#000",
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    minHeight: 54,
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  resendText: {
    marginTop: 18,
    fontSize: 15,
    color: "#666",
  },

  resend: {
    color: "#4d6cf7",
    fontWeight: "bold",
  },

  resendDisabled: {
    opacity: 0.6,
  },
});
