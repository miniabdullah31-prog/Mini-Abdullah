import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

type Props = {
  goToNewPassword: () => void;
};

const OtpVerification: React.FC<Props> = ({
  goToNewPassword,
}) => {

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
  ]);

  const handleChange = (
    text: string,
    index: number
  ) => {

    const newOtp = [...otp];

    newOtp[index] = text;

    setOtp(newOtp);
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
          Verify Account
        </Text>

        <Text style={styles.description}>
          Enter the 4-digit code sent to your email
        </Text>

        <View style={styles.otpContainer}>

          {otp.map((digit, index) => (

            <TextInput
              key={index}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(text) =>
                handleChange(text, index)
              }
            />

          ))}

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={goToNewPassword}
        >
          <Text style={styles.buttonText}>
            Verify
          </Text>
        </TouchableOpacity>

        <Text style={styles.resendText}>
          Didn’t receive code?{" "}
          <Text style={styles.resend}>
            Resend
          </Text>
        </Text>

      </View>

    </ImageBackground>
  );
};

export default OtpVerification;

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
    gap: 12,
    marginBottom: 28,
  },

  otpInput: {
    width: 52,
    height: 60,
    backgroundColor: "#f3f5ff",
    borderRadius: 16,
    textAlign: "center",
    fontSize: 24,
    color: "#000",
  },

  button: {
    width: "100%",
    backgroundColor: "#6c4df7",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
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

});