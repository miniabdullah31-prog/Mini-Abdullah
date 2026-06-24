import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton"; 

const { width } = Dimensions.get("window");

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

type HistoryItem = {
  id: string;
  title: string;
  messages: Message[];
};

type Props = {
  goBack: () => void;
};

const ChatbotScreen: React.FC<Props> = ({ goBack }) => {
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Default fresh conversation template
  const welcomeMessage: Message = { 
    id: 1, 
    sender: "bot", 
    text: "Asalam o Alaikum! How can I help you today? ✨" 
  };

  const [chatMessages, setChatMessages] = useState<Message[]>([welcomeMessage]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Send message handle aur dynamic history generation module
  const handleSendMessage = () => {
    if (message.trim() === "") return;
    
    const newUserMessage: Message = { id: Date.now(), sender: "user", text: message };
    const updatedMessages = [...chatMessages, newUserMessage];
    
    setChatMessages(updatedMessages);
    setMessage("");

    // Agar ye is session ki pehli user message hai, toh isko history list mein add karein
    if (chatMessages.length === 1) {
      const newHistoryItem: HistoryItem = {
        id: `h-${Date.now()}`,
        title: message.length > 22 ? message.substring(0, 22) + "..." : message,
        messages: updatedMessages
      };
      setHistoryList([newHistoryItem, ...historyList]);
    } else {
      // Agar purani chat chal rhi hai toh history stack ke andar message sync karein
      setHistoryList(prev => prev.map((item, idx) => idx === 0 ? { ...item, messages: updatedMessages } : item));
    }

    // AI BOT ka automatic response mock up data setup 
    setTimeout(() => {
      const botResponse: Message = { 
        id: Date.now() + 1, 
        sender: "bot", 
        text: "JazakAllah Khair! Main aapke is sawal par jald hi mukammal maloomat faraham karunga." 
      };
      setChatMessages(prev => {
        const dynamicFinal = [...prev, botResponse];
        setHistoryList(hPrev => hPrev.map((item, idx) => idx === 0 ? { ...item, messages: dynamicFinal } : item));
        return dynamicFinal;
      });
    }, 1000);
  };

  // Click on any saved history item to load it
  const loadSavedChat = (savedChat: HistoryItem) => {
    setChatMessages(savedChat.messages);
    setIsSidebarOpen(false);
  };

  // Start a fresh clear screen configuration session
  const handleNewChatTrigger = () => {
    setChatMessages([welcomeMessage]);
    setIsSidebarOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- SIDEBAR PANEL OVERLAY LAYER --- */}
      {isSidebarOpen && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Chat Options</Text>
            <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
              <Ionicons name="close" size={26} color="#333" />
            </TouchableOpacity>
          </View>

          {/* New Chat Top CTA Option */}
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChatTrigger}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.newChatTxt}>New Chat</Text>
          </TouchableOpacity>

          <Text style={styles.historyHeading}>Chat History</Text>
          
          {/* Dynamic Active Session History List container */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {historyList.length === 0 ? (
              <Text style={styles.emptyHistoryTxt}>No recent history found</Text>
            ) : (
              historyList.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyItem}
                  onPress={() => loadSavedChat(item)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#4B2AA8" />
                  <Text style={styles.historyTxt} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* --- MAIN INTERFACE WINDOW --- */}
      <View style={styles.mainContent}>
        
        {/* TOP IMAGE BANNER HEADER (Updated to use dailyInspiration banner) */}
        <ImageBackground 
          source={require("../homeAssets/Quotebg.jpg")} 
          style={styles.headerImageBanner}
          resizeMode="cover"
        >
          <View style={styles.overlayShade} />
          
          {/* Organized Action Row: BackButton stays on top, Sidebar/History trigger sits cleanly below it */}
          <View style={styles.topActionNavContainer}>
            <View style={styles.backButtonRow}>
              <BackButton onPress={goBack} />
            </View>
            <View style={styles.menuButtonRow}>
              <TouchableOpacity style={styles.menuBtn} onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Ionicons name="chevron-forward-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.bannerTitleText}>AI Chatbot</Text>
        </ImageBackground>

        {/* MESSAGES LAYER VIEW AREA */}
        <ScrollView 
          style={styles.chatArea}
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow, 
                msg.sender === "user" ? styles.userRow : styles.botRow
              ]}
            >
              <View 
                style={[
                  styles.bubble, 
                  msg.sender === "user" ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={[
                  styles.msgText, 
                  msg.sender === "user" ? styles.userText : styles.botText
                ]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* BOTTOM ACTION INPUT FLEX BAR */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.voiceBtn} activeOpacity={0.7}>
            <Ionicons name="mic" size={24} color="#6C4DF7" />
          </TouchableOpacity>

          <TextInput
            placeholder="Ask anything about Islam..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            multiline
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage} activeOpacity={0.7}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  /* Sidebar styles configurations */
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#fff",
    zIndex: 999,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  newChatBtn: {
    backgroundColor: "#4B2AA8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 15,
    marginBottom: 25,
  },
  newChatTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  historyHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F3",
  },
  historyTxt: {
    fontSize: 15,
    color: "#444",
    marginLeft: 10,
    fontWeight: "500",
  },
  emptyHistoryTxt: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 20,
    fontSize: 14,
  },
  /* UI Layout Banner Structure styling template */
  mainContent: {
    flex: 1,
  },
  headerImageBanner: {
    width: "100%",
    height: 190,
    justifyContent: "flex-end",
    paddingBottom: 15,
  },
  overlayShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(75, 42, 168, 0.4)", // Perfectly balances readability over your standard background cards
  },
  topActionNavContainer: {
    position: "absolute",
    top: 40,
    left: 15,
    right: 15,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  backButtonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButtonRow: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  menuBtn: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitleText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 15,
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
    maxWidth: "82%",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#222",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 15,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  voiceBtn: {
    padding: 8,
    backgroundColor: "#F2EFFE",
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
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
});