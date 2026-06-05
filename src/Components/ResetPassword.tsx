import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";

type Props = {
  goToLogin: () => void;
};

const ResetPassword: React.FC<Props> = ({
  goToLogin,
}) => {

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const handleUpdatePassword = () => {

    if (!password || !confirmPassword) {

      Alert.alert(
        "Error",
        "Please fill all fields"
      );

      return;
    }

    if (password !== confirmPassword) {

      Alert.alert(
        "Error",
        "Passwords do not match"
      );

      return;
    }

    Alert.alert(
      "Success",
      "Password updated successfully"
    );

    goToLogin();
  };

  return (

    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.container}
      resizeMode="cover"
    >

      <View style={styles.card}>

        <Image
          source={require("../assets/miniAbdullah.png")}
          style={styles.image}
        />

        <Text style={styles.title}>
          Create New Password
        </Text>

        <Text style={styles.description}>
          Your new password must be different
          from the previous one
        </Text>

        <TextInput
          placeholder="New Password"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdatePassword}
        >

          <Text style={styles.buttonText}>
            Update Password
          </Text>

        </TouchableOpacity>

      </View>

    </ImageBackground>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({

  container: {
    flex: 1,
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
    paddingHorizontal: 24,
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#3c1f87",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  input: {
    width: "100%",
    backgroundColor: "#f3f5ff",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

});