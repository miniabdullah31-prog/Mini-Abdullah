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
  const [password, setPassword] =
    useState("");

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

  const handleLogin = async () => {

    if (!email || !password) {

      showCustomAlert(
        "Error",
        "Please fill all fields ❌"
      );

      return;
    }

    try {

      const res = await fetch(
        "http://10.0.2.2:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        showCustomAlert(
          "Success 🎉",
          "Login successful",
          true
        );

        setTimeout(() => {

          setModalVisible(false);
          goToHome();

        }, 600);

      } else {

        showCustomAlert(
          "Error",
          data.message ||
            "Login failed ❌"
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
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Continue your Islamic learning journey
        </Text>

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

        <TouchableOpacity
          onPress={goToForgot}
        >

          <Text style={styles.forgotPassword}>
            Forgot Password?
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >

          <Text style={styles.buttonText}>
            Login
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToSignup}
        >

          <Text style={styles.signupLink}>
            New here? Create account
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

export default Login;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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