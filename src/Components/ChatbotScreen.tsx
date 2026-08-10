import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Tts from "react-native-tts";
import Voice from "@react-native-voice/voice";
import BackButton from "./BackButton";
import { sendChatMessage, ChatHistoryItem } from "../services/chatService";
import {
  bootstrapChatStore,
  openHistoryChat,
  resolveUserKey,
  saveActiveMessages,
  startNewChat,
  deleteChatSession,
  ChatMessage,
  ChatSession,
  WELCOME_MESSAGE,
} from "../services/chatHistoryStore";

type Props = {
  goBack: () => void;
};

function toApiHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  return messages
    .filter((m) => m.id !== "welcome")
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      text: m.text,
    }));
}

async function requestMicPermission() {
  if (Platform.OS !== "android") {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone permission",
      message: "Voice chat ke liye microphone chahiye.",
      buttonPositive: "OK",
      buttonNegative: "Cancel",
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const ChatbotScreen: React.FC<Props> = ({ goBack }) => {
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [historyList, setHistoryList] = useState<ChatSession[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const sendingRef = useRef(false);

  const speakText = useCallback(async (id: string, text: string) => {
    try {
      await Tts.stop();
      setSpeakingId(id);
      const hasUrdu = /[\u0600-\u06FF]/.test(text);
      try {
        await Tts.setDefaultLanguage(hasUrdu ? "ur-PK" : "en-US");
      } catch {
        await Tts.setDefaultLanguage("en-US").catch(() => undefined);
      }
      await Tts.speak(text);
    } catch {
      setSpeakingId(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const userKey = await resolveUserKey();
      const { history, active } = await bootstrapChatStore(userKey);
      if (!mounted) return;
      setHistoryList(history);
      setChatMessages(active.messages);
      setActiveHistoryId(active.id);
      setBooting(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    Tts.setDefaultLanguage("en-US").catch(() => undefined);
    Tts.setDefaultRate(0.48).catch(() => undefined);

    const onFinish = () => setSpeakingId(null);
    const onCancel = () => setSpeakingId(null);
    const finishSub = Tts.addEventListener("tts-finish", onFinish);
    const cancelSub = Tts.addEventListener("tts-cancel", onCancel);

    Voice.onSpeechResults = (event) => {
      const spoken = event.value?.[0];
      if (spoken) {
        setMessage(spoken);
      }
    };

    Voice.onSpeechError = () => {
      setListening(false);
    };

    Voice.onSpeechEnd = () => {
      setListening(false);
    };

    return () => {
      Tts.stop().catch(() => undefined);
      finishSub?.remove?.();
      cancelSub?.remove?.();
      Voice.destroy().then(Voice.removeAllListeners).catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages, loading]);

  const persist = async (messages: ChatMessage[]) => {
    const { history, active } = await saveActiveMessages(messages);
    setHistoryList(history);
    setActiveHistoryId(active.id);
  };

  const askBot = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || sendingRef.current || booting) {
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setMessage("");

    try {
      await Tts.stop();
    } catch {
      // ignore
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const withUser = [...chatMessages, userMessage];
    setChatMessages(withUser);
    await persist(withUser);

    try {
      const history = toApiHistory(chatMessages);
      const reply = await sendChatMessage(trimmed, history);

      const botMessage: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: reply,
      };

      const withBot = [...withUser, botMessage];
      setChatMessages(withBot);
      await persist(withBot);
    } catch (error: any) {
      const errText =
        error?.response?.data?.message ||
        error?.message ||
        "Server se jawab nahi mila.";

      const botMessage: ChatMessage = {
        id: `b-err-${Date.now()}`,
        sender: "bot",
        text: errText,
      };

      const withBot = [...withUser, botMessage];
      setChatMessages(withBot);
      await persist(withBot);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const handleSendMessage = () => {
    askBot(message);
  };

  const loadSavedChat = async (savedChat: ChatSession) => {
    const { history, active } = await openHistoryChat(savedChat.id);
    setHistoryList(history);
    setChatMessages(active.messages);
    setActiveHistoryId(active.id);
    setIsSidebarOpen(false);
    Tts.stop().catch(() => undefined);
    setSpeakingId(null);
  };

  const handleNewChatTrigger = async () => {
    const { history, active } = await startNewChat();
    setHistoryList(history);
    setChatMessages(active.messages);
    setActiveHistoryId(active.id);
    setMessage("");
    setIsSidebarOpen(false);
    Tts.stop().catch(() => undefined);
    setSpeakingId(null);
  };

  const handleDeleteChat = (sessionId: string) => {
    setDeleteId(sessionId);
  };

  const confirmDeleteChat = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    const { history, active } = await deleteChatSession(id);
    setHistoryList(history);
    setChatMessages(active.messages);
    setActiveHistoryId(active.id);
    Tts.stop().catch(() => undefined);
    setSpeakingId(null);
  };

  const toggleListening = async () => {
    try {
      if (listening) {
        await Voice.stop();
        setListening(false);
        return;
      }

      const allowed = await requestMicPermission();
      if (!allowed) {
        Alert.alert("Permission", "Microphone permission required for voice chat.");
        return;
      }

      await Tts.stop();
      setSpeakingId(null);
      await Voice.start("en-US");
      setListening(true);
    } catch {
      setListening(false);
      Alert.alert(
        "Voice",
        "Voice input start nahi ho saka. Text se sawal likh sakte ho.",
      );
    }
  };

  const toggleSpeak = (msg: ChatMessage) => {
    if (msg.sender !== "bot") {
      return;
    }

    if (speakingId === msg.id) {
      Tts.stop().catch(() => undefined);
      setSpeakingId(null);
      return;
    }

    speakText(msg.id, msg.text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4B2AA8" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.row}>
          {isSidebarOpen && (
            <View style={styles.sidebar}>
              <Text style={styles.sidebarTitle}>Chats</Text>

              <View style={styles.newChatRow}>
                <TouchableOpacity
                  style={styles.newChatBtn}
                  onPress={handleNewChatTrigger}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.newChatTxt}>New Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeSidebarBtn}
                  onPress={() => setIsSidebarOpen(false)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Close sidebar"
                >
                  <Ionicons name="close" size={20} color="#4B2AA8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.historyHeading}>History</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.flex}>
                {historyList.length === 0 ? (
                  <Text style={styles.emptyHistoryTxt}>No recent chats</Text>
                ) : (
                  historyList.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.historyItem,
                        activeHistoryId === item.id && styles.historyItemActive,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.historyMain}
                        onPress={() => loadSavedChat(item)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={15}
                          color="#4B2AA8"
                        />
                        <Text style={styles.historyTxt} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteChat(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Delete chat"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color="#C0392B"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          <View style={styles.mainContent}>
            {/* Same BackButton as other screens — full tap area, proper top offset */}
            {!isSidebarOpen && (
              <>
                <BackButton onPress={goBack} />
                <TouchableOpacity
                  style={styles.openSidebarBtn}
                  onPress={() => setIsSidebarOpen(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Open chats sidebar"
                >
                  <Text style={styles.sidebarChevron}>{">"}</Text>
                </TouchableOpacity>
              </>
            )}

            <ImageBackground
              source={require("../homeAssets/Quotebg.jpg")}
              style={styles.headerImageBanner}
              resizeMode="cover"
            >
              <View style={styles.overlayShade} pointerEvents="none" />
              <Text style={styles.bannerTitleText}>AI Chatbot</Text>
            </ImageBackground>

            {booting ? (
              <View style={styles.bootBox}>
                <ActivityIndicator color="#4B2AA8" size="large" />
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              >
                {chatMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      msg.sender === "user" ? styles.userRow : styles.botRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        msg.sender === "user"
                          ? styles.userBubble
                          : styles.botBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.msgText,
                          msg.sender === "user"
                            ? styles.userText
                            : styles.botText,
                        ]}
                      >
                        {msg.text}
                      </Text>

                      {msg.sender === "bot" && (
                        <TouchableOpacity
                          style={styles.speakBtn}
                          onPress={() => toggleSpeak(msg)}
                        >
                          <Ionicons
                            name={
                              speakingId === msg.id
                                ? "stop-circle-outline"
                                : "volume-high-outline"
                            }
                            size={18}
                            color="#4B2AA8"
                          />
                          <Text style={styles.speakTxt}>
                            {speakingId === msg.id ? "Stop" : "Listen"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {loading && (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#4B2AA8" />
                    <Text style={styles.loadingTxt}>Thinking...</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.bottomBar}>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[
                    styles.voiceBtn,
                    listening && styles.voiceBtnActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={toggleListening}
                >
                  <Ionicons
                    name={listening ? "mic" : "mic-outline"}
                    size={22}
                    color={listening ? "#fff" : "#6C4DF7"}
                  />
                </TouchableOpacity>

                <TextInput
                  placeholder={
                    listening
                      ? "Listening..."
                      : "Ask anything about Islam..."
                  }
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  style={styles.textInput}
                  multiline
                  editable={!loading && !booting}
                />

                <TouchableOpacity
                  style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
                  onPress={handleSendMessage}
                  activeOpacity={0.7}
                  disabled={loading || booting}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={!!deleteId}
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.deleteModalBg}>
          <View style={styles.deleteModalBox}>
            <Text style={styles.deleteModalTitle}>Delete chat</Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeleteId(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelModalTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalBtn}
                onPress={confirmDeleteChat}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteModalTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  flex: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 168,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#EEE",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    zIndex: 30,
    elevation: 8,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  newChatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  newChatBtn: {
    flex: 1,
    backgroundColor: "#4B2AA8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  newChatTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },
  closeSidebarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2EFFE",
    alignItems: "center",
    justifyContent: "center",
  },
  historyHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F3",
  },
  historyItemActive: {
    backgroundColor: "#F5F2FF",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  historyMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },
  historyTxt: {
    fontSize: 12,
    color: "#444",
    marginLeft: 6,
    flex: 1,
    fontWeight: "500",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },
  emptyHistoryTxt: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 16,
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    position: "relative",
  },
  headerImageBanner: {
    width: "100%",
    height: 148,
    justifyContent: "flex-end",
    paddingBottom: 16,
    overflow: "hidden",
  },
  overlayShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(75, 42, 168, 0.45)",
  },
  openSidebarBtn: {
    position: "absolute",
    top: 50,
    left: 78,
    zIndex: 9999,
    elevation: 9999,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarChevron: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: -2,
  },
  bannerTitleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  bootBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 12,
  },
  chatContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 6,
    width: "100%",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#6C4DF7",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderColor: "#EBEBEB",
    borderWidth: 1,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#222",
  },
  speakBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#F2EFFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speakTxt: {
    marginLeft: 4,
    color: "#4B2AA8",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 4,
  },
  loadingTxt: {
    marginLeft: 8,
    color: "#666",
    fontSize: 13,
  },
  bottomBar: {
    paddingBottom: 12,
    paddingTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: 24,
    elevation: 4,
  },
  voiceBtn: {
    padding: 8,
    backgroundColor: "#F2EFFE",
    borderRadius: 20,
  },
  voiceBtnActive: {
    backgroundColor: "#6C4DF7",
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
    color: "#333",
    maxHeight: 90,
    paddingVertical: 6,
  },
  sendBtn: {
    backgroundColor: "#4B2AA8",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  deleteModalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  deleteModalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E1A6B",
    textAlign: "center",
    marginBottom: 18,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: "#F1F2F6",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelModalTxt: {
    color: "#555",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteModalBtn: {
    flex: 1,
    backgroundColor: "#4B2AA8",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  deleteModalTxt: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
