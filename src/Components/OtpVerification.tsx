import React, { useRef, useState } from "react";
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

type Props = {
  email: string;
  goToNewPassword: (otp: string) => void;
  goToLogin?: () => void;
};

const OTP_LENGTH = 6;

const OtpVerification: React.FC<Props> = ({ email, goToNewPassword }) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

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

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the full 6-digit OTP");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email missing. Please start from Forgot Password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (data.success) {
        goToNewPassword(code);
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

    setResending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        Alert.alert(
          "OTP resent",
          data.devOtp
            ? `DEV OTP: ${data.devOtp}`
            : data.message || "If an account exists, a new OTP has been sent",
        );
      } else {
        Alert.alert("Error", data.message || "Could not resend OTP");
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Server Error",
        `Could not connect to backend\n${API_BASE_URL}\n${detail}`,
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
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

            <Text style={styles.title}>Verify Account</Text>

            <Text style={styles.description}>
              Enter the 6-digit code sent to your email
            </Text>

            <View style={styles.otpContainer}>
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
                style={[styles.resend, resending && styles.resendDisabled]}
                onPress={handleResend}
              >
                {resending ? "Sending…" : "Resend"}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a1654",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.85)",
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
