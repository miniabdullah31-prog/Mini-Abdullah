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
} from "react-native";

type Props = {
  goToLogin: () => void;
  goToHome: () => void;
  goToSuccess: () => void;
};

const Signup: React.FC<Props> = ({
  goToLogin,
  goToHome,
  goToSuccess,

}) => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] = useState("");

  const [modalVisible,
    setModalVisible] = useState(false);

  const [modalTitle,
    setModalTitle] = useState("");

  const [modalMessage,
    setModalMessage] = useState("");

  const [isSuccess,
    setIsSuccess] = useState(false);

  const showCustomAlert = (
    title: string,
    message: string,
    success = false
  ) => {

    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleSignup = async () => {

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      showCustomAlert(
        "Error",
        "Please fill all fields ❌"
      );

      return;
    }

    if (password !== confirmPassword) {

      showCustomAlert(
        "Error",
        "Passwords do not match ❌"
      );

      return;
    }

    try {

      const res = await fetch(
        "http://10.0.2.2:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        showCustomAlert(
          "Success 🎉",
          "Account created successfully",
          true
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
            : "Signup failed ❌"
        );
      }

    } catch (error) {

      showCustomAlert(
        "Server Error",
        "Could not connect to backend"
      );
    }
  };

  return (

    <ImageBackground
      source={require("../assets/successScreen.png")}
      style={styles.container}
      resizeMode="cover"
    >

      <View style={styles.card}>

        <Image
          source={require("../assets/miniAbdullah.png")}
          style={styles.image}
        />

        <Text style={styles.title}>
          Create Account
        </Text>

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
          onChangeText={
            setConfirmPassword
          }
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
        >

          <Text style={styles.buttonText}>
            Create Account
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToLogin}
        >

          <Text style={styles.loginLink}>
            Already have an account?
          </Text>

        </TouchableOpacity>

      </View>

      {/* CUSTOM MODAL */}

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text
              style={[
                styles.modalTitle,
                {
                  color: isSuccess
                    ? "#4BB543"
                    : "#ff3b30",
                },
              ]}
            >

              {modalTitle}

            </Text>

            <Text style={styles.modalMessage}>

              {modalMessage}

            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    isSuccess
                      ? "#6c4df7"
                      : "#ff3b30",
                },
              ]}

              onPress={() =>
                setModalVisible(false)
              }
            >

              <Text
                style={
                  styles.modalButtonText
                }
              >
                OK
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </ImageBackground>
  );
};

export default Signup;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
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