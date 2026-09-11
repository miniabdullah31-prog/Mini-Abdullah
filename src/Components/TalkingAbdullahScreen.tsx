import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import BackButton from "./BackButton";
import AnimatedAbdullahCharacter from "./AnimatedAbdullahCharacter";
import { sendVoiceChatMessage } from "../services/chatService";
import { API_BASE_URL } from "../config/api";
import {
  appendVoiceTurns,
  loadVoiceTurns,
  toVoiceApiHistory,
  VoiceTurn,
} from "../services/talkingAbdullahStore";
import {
  speakConversationalAndWait,
  stopSpeaking,
} from "../services/quranTts";
import { playTalkSound, stopTalkSound } from "../services/talkSounds";
import {
  isBenignSpeechError,
  releaseVoiceSession,
  shouldSuppressVoiceError,
  startVoiceListening,
  stopVoiceListening,
  suppressVoiceErrorsFor,
} from "../services/voiceInputService";

type Props = {
  goBack: () => void;
};

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const STATE_LABELS: Record<VoiceState, string> = {
  idle: "Tap the mic and say Assalamu Alaikum",
  listening: "I'm listening...",
  thinking: "Let me think...",
  speaking: "Abdullah is talking...",
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const TalkingAbdullahScreen: React.FC<Props> = ({ goBack }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [booting, setBooting] = useState(true);
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);

  const transcriptRef = useRef("");
  const sendingRef = useRef(false);
  const turnsRef = useRef<VoiceTurn[]>([]);
  const listeningRef = useRef(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    let mounted = true;
    loadVoiceTurns().then((saved) => {
      if (mounted) {
        setTurns(saved);
        setBooting(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/ping`, { signal: controller.signal })
      .then((res) => {
        if (mounted) {
          setServerReachable(res.ok);
        }
      })
      .catch(() => {
        if (mounted) {
          setServerReachable(false);
        }
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const processUserSpeech = useCallback(async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || sendingRef.current) {
      setVoiceState("idle");
      return;
    }

    sendingRef.current = true;
    setLiveTranscript("");
    transcriptRef.current = "";
    setVoiceState("thinking");
    playTalkSound("think");

    stopSpeaking();
    suppressVoiceErrorsFor(900);
    await releaseVoiceSession();

    const userTurn: VoiceTurn = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    try {
      const reply = await sendVoiceChatMessage(
        trimmed,
        toVoiceApiHistory(turnsRef.current),
      );

      const botTurn: VoiceTurn = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: reply,
      };

      const updated = await appendVoiceTurns([userTurn, botTurn]);
      setTurns(updated);
      setVoiceState("speaking");
      playTalkSound("speak");
      await wait(280);
      stopTalkSound();
      await speakConversationalAndWait(reply);
    } catch (error: any) {
      const errText =
        error?.response?.data?.message ||
        error?.message ||
        "Abhi jawab nahi mil saka. Dobara try karo.";

      const botTurn: VoiceTurn = {
        id: `b-err-${Date.now()}`,
        role: "bot",
        text: errText,
      };

      const updated = await appendVoiceTurns([userTurn, botTurn]);
      setTurns(updated);
      setVoiceState("speaking");
      playTalkSound("speak");
      await wait(280);
      stopTalkSound();
      await speakConversationalAndWait(errText);
    } finally {
      sendingRef.current = false;
      setVoiceState("idle");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
      }
      stopSpeaking();
      releaseVoiceSession().catch(() => undefined);
    };
  }, []);

  const startListening = async () => {
    if (listeningRef.current) {
      return;
    }

    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }

    stopSpeaking();
    transcriptRef.current = "";
    setLiveTranscript("");

    const afterAudioMs = voiceState === "speaking" ? 900 : 520;

    try {
      listeningRef.current = true;
      playTalkSound("listen");
      await wait(260);
      await startVoiceListening(
        {
          onPartial: (text) => {
            transcriptRef.current = text;
            setLiveTranscript(text);
          },
          onResult: (text) => {
            transcriptRef.current = text;
            setLiveTranscript(text);
          },
          onEnd: () => {
            if (endTimerRef.current) {
              clearTimeout(endTimerRef.current);
            }
            endTimerRef.current = setTimeout(() => {
              endTimerRef.current = null;
              listeningRef.current = false;
              const text = transcriptRef.current.trim();
              transcriptRef.current = "";
              if (text) {
                processUserSpeech(text);
              } else {
                setVoiceState("idle");
                setLiveTranscript("");
              }
            }, 500);
          },
          onError: (message) => {
            if (endTimerRef.current) {
              clearTimeout(endTimerRef.current);
              endTimerRef.current = null;
            }
            listeningRef.current = false;
            setVoiceState("idle");
            setLiveTranscript("");

            if (shouldSuppressVoiceError() || isBenignSpeechError(message)) {
              return;
            }

            Alert.alert(
              "Voice",
              "Sun nahi saka. Dubara mic dabao aur zor se bolo.",
            );
          },
        },
        { afterAudioMs },
      );
      setVoiceState("listening");
    } catch (error: any) {
      listeningRef.current = false;
      setVoiceState("idle");
      Alert.alert(
        "Mic",
        error?.message ||
          "Mic start nahi ho saka. Google Speech install karo ya thori der baad try karo.",
      );
    }
  };

  const stopListening = async () => {
    listeningRef.current = false;
    try {
      await stopVoiceListening();
    } catch {
      setVoiceState("idle");
    }
  };

  const handleMicPress = async () => {
    if (booting || voiceState === "thinking") {
      return;
    }

    playTalkSound("tap");

    if (voiceState === "speaking") {
      stopSpeaking();
      setVoiceState("idle");
      return;
    }

    if (voiceState === "listening") {
      await stopListening();
      return;
    }

    await startListening();
  };

  const recentTurns = turns.slice(-4);
  const statusLabel =
    voiceState === "listening" && liveTranscript
      ? `"${liveTranscript}"`
      : STATE_LABELS[voiceState];

  const micColors =
    voiceState === "listening"
      ? (["#FF6B6B", "#EE5A24"] as const)
      : voiceState === "speaking"
        ? (["#7C5CFF", "#4B2AA8"] as const)
        : (["#9B6DFF", "#6C4DF7"] as const);

  const micIcon =
    voiceState === "listening"
      ? "stop"
      : voiceState === "speaking"
        ? "volume-mute"
        : "mic";

  const micHint =
    voiceState === "listening"
      ? "Tap to stop"
      : voiceState === "speaking"
        ? "Tap to mute"
        : voiceState === "thinking"
          ? "Please wait"
          : "Hold a conversation";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4B2AA8" />
      <BackButton onPress={goBack} />

      <LinearGradient
        colors={["#4B2AA8", "#6C4DF7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerEyebrow}>Mini Abdullah</Text>
        <Text style={styles.headerTitle}>Talk together</Text>
        <Text style={styles.headerSubtitle}>
          A calm voice friend for kids
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {booting ? (
          <View style={styles.bootBox}>
            <ActivityIndicator color="#4B2AA8" size="large" />
          </View>
        ) : (
          <>
            <View style={styles.characterArea}>
              <View style={styles.stage}>
                <AnimatedAbdullahCharacter state={voiceState} size={216} />
              </View>

              {voiceState === "thinking" && (
                <ActivityIndicator
                  style={styles.thinkingSpinner}
                  color="#6C4DF7"
                  size="small"
                />
              )}

              <View
                style={[
                  styles.statusPill,
                  voiceState === "listening" && styles.statusListen,
                  voiceState === "speaking" && styles.statusSpeak,
                  voiceState === "thinking" && styles.statusThink,
                ]}
              >
                <Text style={styles.statusText} numberOfLines={2}>
                  {statusLabel}
                </Text>
              </View>

              {serverReachable === false && (
                <View style={styles.offlineChip}>
                  <Ionicons name="cloud-offline-outline" size={14} color="#9A3412" />
                  <Text style={styles.offlineText}>Offline — answers may not load</Text>
                </View>
              )}
            </View>

            <View style={styles.chatCard}>
              <ScrollView
                style={styles.subtitleScroll}
                contentContainerStyle={styles.subtitleContent}
                showsVerticalScrollIndicator={false}
              >
                {recentTurns.length === 0 ? (
                  <Text style={styles.hintText}>
                    Assalamu Alaikum! Tap the mic and ask about Islam, salah, or
                    a story — Abdullah will move and answer in a kid voice.
                  </Text>
                ) : (
                  recentTurns.map((turn) => (
                    <View
                      key={turn.id}
                      style={[
                        styles.turnBubble,
                        turn.role === "user"
                          ? styles.userBubble
                          : styles.botBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.turnText,
                          turn.role === "user" ? styles.userText : styles.botText,
                        ]}
                      >
                        {turn.text}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </>
        )}
      </View>

      <View style={styles.micDock}>
        <Text style={styles.micHint}>{micHint}</Text>
        <Pressable
          android_ripple={{ color: "transparent" }}
          onPress={handleMicPress}
          disabled={booting || voiceState === "thinking"}
          accessibilityRole="button"
          accessibilityLabel="Talk to Abdullah"
          style={[
            styles.micButtonWrap,
            (booting || voiceState === "thinking") && styles.micDisabled,
          ]}
        >
          <LinearGradient colors={[...micColors]} style={styles.micButton}>
            <Ionicons name={micIcon} size={34} color="#fff" />
          </LinearGradient>
        </Pressable>
        <Text style={styles.micLabel}>
          {voiceState === "listening"
            ? "Stop"
            : voiceState === "speaking"
              ? "Mute"
              : "Talk"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default TalkingAbdullahScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0FF",
  },
  header: {
    width: "100%",
    paddingTop: 72,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginTop: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bootBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterArea: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  stage: {
    width: 228,
    height: 228,
    borderRadius: 114,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE7FF",
    overflow: "hidden",
  },
  thinkingSpinner: {
    marginTop: 10,
  },
  statusPill: {
    marginTop: 14,
    backgroundColor: "#EDE7FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    maxWidth: "92%",
    borderWidth: 1,
    borderColor: "#DDD3FF",
  },
  statusListen: {
    backgroundColor: "#FFF1F0",
    borderColor: "#FFD0C9",
  },
  statusSpeak: {
    backgroundColor: "#EDE7FF",
    borderColor: "#CDBEFF",
  },
  statusThink: {
    backgroundColor: "#FFF8EC",
    borderColor: "#F8DEAA",
  },
  statusText: {
    color: "#4B2AA8",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  offlineChip: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF4E5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  offlineText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "700",
  },
  chatCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: "#EDE7FF",
  },
  subtitleScroll: {
    flex: 1,
  },
  subtitleContent: {
    paddingBottom: 12,
  },
  hintText: {
    color: "#6B6288",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  turnBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: "95%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6C4DF7",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F6F3FF",
  },
  turnText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#2A2150",
  },
  micDock: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 18,
    backgroundColor: "#F3F0FF",
  },
  micHint: {
    color: "#8B82A8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  micButtonWrap: {
    borderRadius: 40,
    overflow: "hidden",
  },
  micDisabled: {
    opacity: 0.55,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  micLabel: {
    marginTop: 8,
    color: "#4B2AA8",
    fontSize: 13,
    fontWeight: "800",
  },
});
