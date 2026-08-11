import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { useFormScroll } from "../hooks/useFormScroll";

type Props = {
  goToLogin: () => void;
  goToOtp: (email: string) => void;
};

const ForgotPassword: React.FC<Props> = ({ goToLogin, goToOtp }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { scrollRef, onCardLayout, registerField, scrollToField } =
    useFormScroll();

  const handleReset = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const raw = await res.text();
      let data: {
        success?: boolean;
        message?: string;
        devOtp?: string;
      } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        Alert.alert(
          "Server Error",
          res.status === 404
            ? "Forgot-password route not found. Restart the backend server."
            : `Unexpected response (${res.status}). Restart backend and try again.`,
        );
        return;
      }

      if (data.success) {
        const msg = data.devOtp
          ? `DEV OTP (SMTP not set): ${data.devOtp}\n\nUse this code on the next screen.`
          : data.message || "If an account exists, an OTP has been sent";

        Alert.alert("Check your email", msg, [
          { text: "OK", onPress: () => goToOtp(cleanEmail) },
        ]);
      } else {
        Alert.alert(
          "Error",
          data.message ||
            "Could not send OTP. Check SMTP settings in backend/.env",
        );
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="always"
        >
          <View
            style={styles.card}
            onLayout={(e) => onCardLayout(e.nativeEvent.layout.y)}
          >
            <Image
              source={require("../assets/forgot-password.png")}
              style={styles.image}
            />

            <Text style={styles.title}>Forgot Password?</Text>

            <Text style={styles.description}>
              Enter your email address and we’ll send you a 6-digit OTP to
              reset your password
            </Text>

            <View
              style={styles.fieldWrap}
              onLayout={(e) => registerField("email", e.nativeEvent.layout.y)}
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
                editable={!loading}
                onFocus={() => scrollToField("email")}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goToLogin} disabled={loading}>
              <Text style={styles.backLogin}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f1ff",
  },

  flex: {
    flex: 1,
    backgroundColor: "#f3f1ff",
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
    maxWidth: 420,
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 32,
    alignItems: "center",
    elevation: 8,
  },

  fieldWrap: {
    width: "100%",
  },

  image: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    color: "#4c2aa8",
    fontWeight: "bold",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 28,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 22,
    backgroundColor: "white",
    color: "#000",
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    elevation: 5,
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

  backLogin: {
    marginTop: 22,
    color: "#4c2aa8",
    fontSize: 15,
    fontWeight: "500",
  },
});
