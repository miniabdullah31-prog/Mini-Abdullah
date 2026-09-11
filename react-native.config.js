module.exports = {
  dependencies: {
    "@react-native-voice/voice": {
      platforms: {
        android: {
          packageImportPath: "import com.wenkesj.voice.VoicePackage;",
          packageInstance: "new VoicePackage()",
        },
      },
    },
  },
};
