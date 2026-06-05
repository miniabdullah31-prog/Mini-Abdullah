import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

type Props = {
  goToLogin: () => void;
};

const ForgotPassword: React.FC<Props> = ({
  goToLogin,
}) => {

  const [email, setEmail] = useState("");

  const handleReset = () => {

    if (!email) {
      Alert.alert(
        "Error",
        "Please enter your email"
      );
      return;
    }

    Alert.alert(
      "Success",
      "Password reset link sent ✉️"
    );
  };

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <Image
          source={require("../assets/forgot-password.png")}
          style={styles.image}
        />

        <Text style={styles.title}>
          Forgot Password?
        </Text>

        <Text style={styles.description}>
          Enter your email address and we’ll
          send you a password reset link
        </Text>

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>
            Send Reset Link
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.backLogin}>
            Back to Login
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f3f1ff",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    padding: 32,
    borderRadius: 32,
    alignItems: "center",
    elevation: 8,
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