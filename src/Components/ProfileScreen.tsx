import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ImageBackground,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import {
  SavedAccount,
  MAX_SAVED_ACCOUNTS,
  ensureAccountsHydrated,
  getActiveAccountEmail,
  logoutCurrentAccount,
  switchToAccount,
  updateSavedAccountProfile,
} from "../services/accountStore";
import { authFetch, getValidAccessToken, revokeServerSession } from "../services/authSession";
import {
  AvatarId,
  getAvatarSource,
  getAvatarsForGender,
  isAvatarId,
  ProfileGender,
} from "../data/avatars";
import {
  getRatingStars,
  setRatingStars,
  getNotificationsEnabled,
  setNotificationsEnabled,
  getSoundEnabled,
  setSoundEnabled,
} from "../services/appPrefsStore";
import { syncNotificationsFromPreference } from "../services/notificationService";
import {
  hydrateUiSoundPref,
  setUiSoundEnabledCache,
} from "../services/soundService";
import { resetChatMemoryCache } from "../services/chatHistoryStore";
import { API_BASE_URL } from "../config/api";
import { playUiSound } from "../services/soundService";
import { useFormScroll } from "../hooks/useFormScroll";
import RateAppModal from "./RateAppModal";

type Props = {
  goToHome: () => void;
  goToWelcome: () => void;
  goToTutor: () => void;
};

const SUPPORT_EMAIL = "support@miniabdullah31";

const ProfileScreen: React.FC<Props> = ({ goToHome, goToWelcome, goToTutor }) => {
  const [notifications, setNotifications] = useState(true);
  const [appSounds, setAppSounds] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);
  const [addProfileModal, setAddProfileModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStars, setFeedbackStars] = useState(0);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [rateModal, setRateModal] = useState(false);
  const [ratingStars, setRatingStarsState] = useState(0);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  /** False until first ensureAccountsHydrated finishes — avoids false Guest flash. */
  const [accountsHydrated, setAccountsHydrated] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchToastName, setSwitchToastName] = useState<string | null>(null);

  const [editAccount, setEditAccount] = useState<SavedAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<ProfileGender | null>(null);
  const [editAvatarId, setEditAvatarId] = useState<AvatarId | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const { scrollRef, onCardLayout, registerField, scrollToField } =
    useFormScroll(24);
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editKeyboardOpen, setEditKeyboardOpen] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(14)).current;
  const switchGenRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSwitchToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const playContentSwitchAnimation = useCallback(() => {
    contentOpacity.stopAnimation();
    contentScale.stopAnimation();
    contentOpacity.setValue(1);
    contentScale.setValue(1);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0.4,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 0.985,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [contentOpacity, contentScale]);

  const showLoggedInToast = useCallback(
    (name: string, gen: number) => {
      const label = String(name || "").trim();
      if (!label) return;

      clearSwitchToastTimer();
      setSwitchToastName(label);
      toastOpacity.stopAnimation();
      toastTranslateY.stopAnimation();
      toastOpacity.setValue(0);
      toastTranslateY.setValue(14);

      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      toastTimerRef.current = setTimeout(() => {
        if (switchGenRef.current !== gen) return;
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: 10,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished && switchGenRef.current === gen) {
            setSwitchToastName(null);
          }
        });
      }, 2000);
    },
    [clearSwitchToastTimer, toastOpacity, toastTranslateY],
  );

  useEffect(() => {
    return () => {
      clearSwitchToastTimer();
    };
  }, [clearSwitchToastTimer]);

  const refreshAccounts = useCallback(async () => {
    try {
      const list = await ensureAccountsHydrated();
      const active = await getActiveAccountEmail();
      setAccounts(list);
      setActiveEmail(active);
    } catch {
      // Keep previous list if hydrate fails — never invent Guest mid-session
    } finally {
      setAccountsHydrated(true);
    }
  }, []);

  const refreshRating = useCallback(async () => {
    const stars = await getRatingStars();
    setRatingStarsState(stars);
  }, []);

  const refreshNotificationsPref = useCallback(async () => {
    try {
      const on = await getNotificationsEnabled();
      setNotifications(on);
    } catch {
      // keep default
    }
  }, []);

  const handleNotificationsChange = useCallback(async (value: boolean) => {
    setNotifications(value);
    try {
      await setNotificationsEnabled(value);
      const ok = await syncNotificationsFromPreference(value);
      if (value && !ok) {
        setNotifications(false);
        await setNotificationsEnabled(false);
        Alert.alert(
          "Notifications",
          "Permission was not granted. Turn on notifications in system settings to get prayer and learning reminders.",
        );
      }
    } catch {
      // never crash Profile on notification errors
    }
  }, []);

  const refreshSoundPref = useCallback(async () => {
    try {
      const on = await getSoundEnabled();
      setAppSounds(on);
      setUiSoundEnabledCache(on);
    } catch {
      // keep default
    }
  }, []);

  const handleSoundChange = useCallback(async (value: boolean) => {
    setAppSounds(value);
    setUiSoundEnabledCache(value);
    try {
      await setSoundEnabled(value);
    } catch {
      // never crash Profile on sound pref errors
    }
  }, []);

  // Refresh when Profile screen mounts (screen-number navigation)
  useEffect(() => {
    refreshAccounts();
    refreshRating();
    refreshNotificationsPref();
    refreshSoundPref();
    hydrateUiSoundPref().catch(() => undefined);
  }, [refreshAccounts, refreshRating, refreshNotificationsPref, refreshSoundPref]);

  const openEditProfile = (account: SavedAccount) => {
    setEditAccount(account);
    setEditName(account.name || "");
    setEditGender(account.gender || null);
    setEditAvatarId(account.avatarId || null);
    setEditPassword("");
    setEditConfirmPassword("");
  };

  const closeEditProfile = () => {
    if (editSaving) return;
    setEditAccount(null);
    setEditPassword("");
    setEditConfirmPassword("");
    setEditKeyboardOpen(false);
  };

  useEffect(() => {
    if (!editAccount) {
      setEditKeyboardOpen(false);
      return;
    }
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setEditKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setEditKeyboardOpen(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [editAccount]);

  const handleEditGenderSelect = (gender: ProfileGender) => {
    setEditGender(gender);
    const options = getAvatarsForGender(gender);
    if (
      !editAvatarId ||
      !options.some((o) => o.id === editAvatarId)
    ) {
      setEditAvatarId(options[0]?.id || null);
    }
  };

  const saveEditProfile = async () => {
    if (!editAccount || editSaving) return;

    const name = editName.trim();
    if (!name) {
      Alert.alert("Name required", "Please enter a name.");
      return;
    }

    if (editPassword || editConfirmPassword) {
      if (editPassword.length < 6) {
        Alert.alert("Password", "Password must be at least 6 characters.");
        return;
      }
      if (editPassword !== editConfirmPassword) {
        Alert.alert("Password", "Passwords do not match.");
        return;
      }
    }

    if (editGender && !editAvatarId) {
      Alert.alert("Avatar", "Please select an avatar.");
      return;
    }

    if (
      editGender &&
      editAvatarId &&
      !getAvatarsForGender(editGender).some((o) => o.id === editAvatarId)
    ) {
      Alert.alert("Avatar", "Please pick an avatar that matches the gender.");
      return;
    }

    setEditSaving(true);
    try {
      const token = (await getValidAccessToken()) || "";
      const needsServer =
        name !== editAccount.name || !!editPassword;

      if (needsServer) {
        if (!token) {
          Alert.alert(
            "Session missing",
            "This profile has no login token. Please log in again to update name or password.",
          );
          return;
        }

        const body: { name?: string; password?: string } = { name };
        if (editPassword) {
          body.password = editPassword;
        }

        const res = await authFetch(`${API_BASE_URL}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data?.success) {
          Alert.alert(
            "Update failed",
            typeof data?.message === "string"
              ? data.message
              : "Could not update profile on server.",
          );
          return;
        }
      }

      const updated = await updateSavedAccountProfile(editAccount.email, {
        name,
        ...(editGender ? { gender: editGender } : {}),
        ...(isAvatarId(editAvatarId) ? { avatarId: editAvatarId } : {}),
      });

      if (!updated) {
        Alert.alert("Update failed", "Could not save profile locally.");
        return;
      }

      const list = await ensureAccountsHydrated();
      setAccounts(list);
      setEditAccount(null);
      setEditPassword("");
      setEditConfirmPassword("");
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Update failed", detail);
    } finally {
      setEditSaving(false);
    }
  };

  const handleAddProfilePress = () => {
    setAddProfileModal(true);
  };

  const confirmAddProfile = () => {
    setAddProfileModal(false);
    if (accounts.length >= MAX_SAVED_ACCOUNTS) {
      Alert.alert(
        "Limit reached",
        "Max 2 IDs login at a time. Delete one if you want another ID to log in.",
      );
      return;
    }
    goToWelcome();
  };

  const handleSwitch = async (email: string) => {
    const target = email.toLowerCase().trim();
    const current = (activeEmail || "").toLowerCase().trim();
    if (!target || target === current || switching) return;

    const gen = ++switchGenRef.current;
    const targetAccount = accounts.find(
      (a) => a.email.toLowerCase().trim() === target,
    );
    const displayName =
      (targetAccount?.name || "").trim() ||
      (target ? target.split("@")[0] : "") ||
      "User";

    // Immediate UI feedback — do not wait for AsyncStorage / hydrate / rating
    setSwitching(true);
    setActiveEmail(target);
    playUiSound("tap");
    playContentSwitchAnimation();
    showLoggedInToast(displayName, gen);

    try {
      const ok = await switchToAccount(target);
      if (!ok) {
        if (switchGenRef.current === gen) {
          setActiveEmail(current || null);
        }
        Alert.alert("Switch failed", "Could not switch account. Try again.");
        return;
      }
      resetChatMemoryCache();
      const active = await getActiveAccountEmail();
      if (active !== target) {
        if (switchGenRef.current === gen) {
          setActiveEmail(current || null);
        }
        Alert.alert("Switch failed", "Active ID did not save. Try again.");
        return;
      }
      if (switchGenRef.current !== gen) return;

      setActiveEmail(active);
      try {
        const list = await ensureAccountsHydrated();
        setAccounts(list);
      } catch {
        // keep current list
      }
      try {
        await refreshRating();
      } catch {
        // ignore
      }
    } catch {
      if (switchGenRef.current === gen) {
        setActiveEmail(current || null);
      }
      Alert.alert("Switch failed", "Could not switch account. Try again.");
    } finally {
      if (switchGenRef.current === gen) {
        setSwitching(false);
      }
    }
  };

  const handleLogout = async () => {
    setLogoutModal(false);
    const wasOnlyOne = accounts.length <= 1;

    try {
      try {
        await revokeServerSession();
      } catch {
        // Server revoke is best-effort
      }
      try {
        const { signOutGoogleSession } = await import(
          "../services/googleAuthService"
        );
        await signOutGoogleSession();
      } catch {
        // Google Sign-In native module may be unavailable — still logout locally
      }
      const remaining = await logoutCurrentAccount();
      resetChatMemoryCache();

      if (wasOnlyOne || remaining.length === 0) {
        goToWelcome();
        return;
      }

      setAccounts(remaining);
      const active = await getActiveAccountEmail();
      setActiveEmail(active);
      await refreshRating();
      goToHome();
    } catch {
      // Never leave user stuck on Profile after logout tap
      resetChatMemoryCache();
      if (wasOnlyOne) {
        goToWelcome();
        return;
      }
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  const openMail = (subject: string, body = "") => {
    const qs = [
      `subject=${encodeURIComponent(subject)}`,
      body ? `body=${encodeURIComponent(body)}` : "",
    ]
      .filter(Boolean)
      .join("&");
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${qs}`).catch(() =>
      Alert.alert("Email", `Please write to ${SUPPORT_EMAIL}`),
    );
  };

  const getActiveAccount = () => {
    if (!activeEmail) return null;
    const key = activeEmail.toLowerCase().trim();
    return (
      accounts.find((a) => a.email.toLowerCase().trim() === key) || null
    );
  };

  const sendSupportMessage = async () => {
    const message = supportMessage.trim();
    if (!message) {
      Alert.alert("Message needed", "Please write what help you need.");
      return;
    }

    const active = getActiveAccount();
    const email = (active?.email || activeEmail || "").trim();
    if (!email) {
      Alert.alert(
        "Login required",
        "Please log in so we know which account needs help.",
      );
      return;
    }

    setSupportSending(true);

    try {
      const token = await getValidAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await authFetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: active?.name || "User",
          email,
          message,
          type: "support",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSupportModal(false);
        setSupportMessage("");
        Alert.alert(
          "Sent",
          data.message || "Your support message was submitted.",
        );
      } else {
        Alert.alert(
          "Could not send",
          data.message || "Please try again, or use email.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Email",
              onPress: () => openMail("Mini Abdullah — Support", message),
            },
          ],
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Server Error",
        `Could not reach backend.\n${API_BASE_URL}\n${detail}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Email",
            onPress: () => openMail("Mini Abdullah — Support", message),
          },
        ],
      );
    } finally {
      setSupportSending(false);
    }
  };

  const saveProfileRating = async (stars: number) => {
    const saved = await setRatingStars(stars);
    setRatingStarsState(saved);
    setRateModal(false);
  };

  const openFeedbackModal = () => {
    setFeedbackStars(ratingStars > 0 ? ratingStars : 0);
    setFeedbackMessage("");
    setFeedbackModal(true);
  };

  const sendFeedbackMessage = async () => {
    const message = feedbackMessage.trim();
    if (!message) {
      Alert.alert("Feedback needed", "Please write your feedback.");
      return;
    }
    if (feedbackStars < 1) {
      Alert.alert("Rate first", "Please tap stars to rate the app.");
      return;
    }

    const active = getActiveAccount();
    const email = (active?.email || activeEmail || "").trim();
    if (!email) {
      Alert.alert(
        "Login required",
        "Please log in so we can link feedback to your account.",
      );
      return;
    }

    const fullMessage = `Rating: ${feedbackStars}/5 stars\n\nFeedback:\n${message}`;
    setFeedbackSending(true);

    try {
      const token = await getValidAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await authFetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: active?.name || "User",
          email,
          message: fullMessage,
          type: "feedback",
        }),
      });

      const data = await res.json();

      if (data.success) {
        const saved = await setRatingStars(feedbackStars);
        setRatingStarsState(saved);
        setFeedbackModal(false);
        setFeedbackMessage("");
        Alert.alert(
          "Thanks!",
          data.message || "Your feedback was submitted.",
        );
      } else {
        Alert.alert(
          "Could not send",
          data.message || "Please try again, or use email.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Email",
              onPress: () =>
                openMail("Mini Abdullah — Feedback", fullMessage),
            },
          ],
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Server Error",
        `Could not reach backend.\n${API_BASE_URL}\n${detail}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Email",
            onPress: () =>
              openMail("Mini Abdullah — Feedback", fullMessage),
          },
        ],
      );
    } finally {
      setFeedbackSending(false);
    }
  };

  return (
    <View style={styles.root}>
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          }}
        >
        <ImageBackground
          source={require("../homeAssets/learn_bg.png")}
          style={styles.headerBg}
          imageStyle={{
            borderBottomLeftRadius: 35,
            borderBottomRightRadius: 35,
          }}
        >
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>
            Manage accounts & settings · {accounts.length}/{MAX_SAVED_ACCOUNTS}
          </Text>
        </ImageBackground>

        <View style={styles.accountsSection}>
          <View style={styles.accountsPanel}>
            <View style={styles.accountsPanelHeader}>
              <View>
                <Text style={styles.accountsPanelTitle}>Your IDs</Text>
                <Text style={styles.accountsPanelSub}>
                  Tap to switch · {accounts.length}/{MAX_SAVED_ACCOUNTS}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddProfilePress}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {!accountsHydrated ? (
              <View style={styles.accountCard}>
                <LinearGradient
                  colors={["#EDE7FF", "#F7F4FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.accountCardInner, { justifyContent: "center" }]}
                >
                  <ActivityIndicator size="small" color="#6C4DF7" />
                  <Text style={[styles.email, { marginLeft: 12 }]}>
                    Loading profiles…
                  </Text>
                </LinearGradient>
              </View>
            ) : accounts.length === 0 ? (
              <View style={styles.accountCard}>
                <LinearGradient
                  colors={["#EDE7FF", "#F7F4FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.accountCardInner}
                >
                  <View style={styles.avatarRing}>
                    <Image
                      source={require("../assets/miniAbdullah.png")}
                      style={styles.profileImg}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>Guest User</Text>
                    <Text style={styles.email}>Not logged in</Text>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              accounts.map((account) => {
                const isActive =
                  !!activeEmail &&
                  account.email.toLowerCase() === activeEmail.toLowerCase();
                return (
                  <View key={account.email} style={styles.accountCard}>
                    <LinearGradient
                      colors={
                        isActive
                          ? ["#6C4DF7", "#8B6CFF"]
                          : ["#EDE7FF", "#F7F4FF"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.accountCardInnerCol}
                    >
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => handleSwitch(account.email)}
                        style={styles.accountCardRow}
                        accessibilityRole="button"
                        accessibilityLabel={
                          isActive
                            ? `${account.name}, active account`
                            : `Switch to ${account.name}`
                        }
                        accessibilityState={{ selected: isActive }}
                      >
                        <View
                          style={[
                            styles.avatarRing,
                            isActive && styles.avatarRingActive,
                          ]}
                        >
                          <Image
                            source={getAvatarSource(
                              account.avatarId,
                              account.gender,
                            )}
                            style={styles.profileImg}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            style={[
                              styles.name,
                              isActive && styles.nameActive,
                            ]}
                          >
                            {account.name}
                          </Text>
                          <Text
                            style={[
                              styles.email,
                              isActive && styles.emailActive,
                            ]}
                          >
                            {account.email}
                          </Text>
                        </View>
                        {isActive ? (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Active</Text>
                          </View>
                        ) : (
                          <Ionicons
                            name="swap-horizontal"
                            size={18}
                            color="#6C4DF7"
                          />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.editProfileBtn,
                          isActive && styles.editProfileBtnActive,
                        ]}
                        onPress={() => openEditProfile(account)}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${account.name}`}
                      >
                        <Ionicons
                          name="create-outline"
                          size={14}
                          color={isActive ? "#fff" : "#6C4DF7"}
                        />
                        <Text
                          style={[
                            styles.editProfileBtnText,
                            isActive && styles.editProfileBtnTextActive,
                          ]}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Local reminders</Text>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsChange}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>App sounds</Text>
          <Switch value={appSounds} onValueChange={handleSoundChange} />
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setSupportModal(true)}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="mail-outline" size={22} color="#6C4DF7" />
            <Text style={styles.label}>Contact Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={openFeedbackModal}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6C4DF7" />
            <Text style={styles.label}>Feedback</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setRateModal(true)}
        >
          <View style={styles.cardLeft}>
            <Ionicons
              name={ratingStars > 0 ? "star" : "star-outline"}
              size={22}
              color="#6C4DF7"
            />
            <View>
              <Text style={styles.label}>Rate App</Text>
              <View style={styles.inlineStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons
                    key={n}
                    name={n <= ratingStars ? "star" : "star-outline"}
                    size={16}
                    color={n <= ratingStars ? "#F5B301" : "#C8C2D8"}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setAboutModal(true)}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="information-circle-outline" size={22} color="#6C4DF7" />
            <Text style={styles.label}>About App</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logout}
          onPress={() => setLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {switchToastName ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.switchToast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.switchToastText} numberOfLines={1}>
            Logged in as {switchToastName}
          </Text>
        </Animated.View>
      ) : null}

      {addProfileModal ? (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={styles.modalBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color="#6C4DF7" />
            </View>
            <Text style={styles.modalTitle}>Manage Profiles</Text>
            <Text style={styles.modalDesc}>
              Do you want to add another profile to this app?
            </Text>

            <View style={styles.verticalModalButtons}>
              <TouchableOpacity
                onPress={confirmAddProfile}
                style={[styles.actionModalBtn, { backgroundColor: "#6C4DF7" }]}
              >
                <Text style={styles.actionBtnText}>Add New Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddProfileModal(false)}
                style={[
                  styles.actionModalBtn,
                  { backgroundColor: "#F1F2F6", marginTop: 10 },
                ]}
              >
                <Text style={[styles.actionBtnText, { color: "#555" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {logoutModal ? (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Logout current account from this device?
            </Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                onPress={() => setLogoutModal(false)}
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.modalBtn, { backgroundColor: "#E53935" }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {supportModal ? (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={styles.modalBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={30} color="#6C4DF7" />
            </View>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.modalDesc}>
              Write your message below. It will be sent to our support team
              ({SUPPORT_EMAIL}).
            </Text>
            <TextInput
              style={styles.supportInput}
              value={supportMessage}
              onChangeText={setSupportMessage}
              placeholder="What help do you need?"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              editable={!supportSending}
            />
            <View style={styles.verticalModalButtons}>
              <TouchableOpacity
                onPress={sendSupportMessage}
                disabled={supportSending}
                style={[
                  styles.actionModalBtn,
                  { backgroundColor: "#6C4DF7" },
                  supportSending && { opacity: 0.7 },
                ]}
              >
                {supportSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Send Message</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (supportSending) return;
                  setSupportModal(false);
                  setSupportMessage("");
                }}
                style={[
                  styles.actionModalBtn,
                  { backgroundColor: "#F1F2F6", marginTop: 10 },
                ]}
              >
                <Text style={[styles.actionBtnText, { color: "#555" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {feedbackModal ? (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={styles.modalBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble-ellipses" size={30} color="#6C4DF7" />
            </View>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <Text style={styles.modalDesc}>
              Share your thoughts and rate Mini Abdullah. We’ll send it to our
              team.
            </Text>
            <TextInput
              style={styles.supportInput}
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              placeholder="Write your feedback..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              editable={!feedbackSending}
            />
            <Text style={styles.feedbackRateLabel}>Rate Mini Abdullah</Text>
            <View style={styles.feedbackStarsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => {
                    if (!feedbackSending) setFeedbackStars(n);
                  }}
                  hitSlop={8}
                  disabled={feedbackSending}
                >
                  <Ionicons
                    name={n <= feedbackStars ? "star" : "star-outline"}
                    size={32}
                    color={n <= feedbackStars ? "#F5B301" : "#C8C2D8"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.verticalModalButtons}>
              <TouchableOpacity
                onPress={sendFeedbackMessage}
                disabled={feedbackSending}
                style={[
                  styles.actionModalBtn,
                  { backgroundColor: "#6C4DF7" },
                  feedbackSending && { opacity: 0.7 },
                ]}
              >
                {feedbackSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Send Feedback</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (feedbackSending) return;
                  setFeedbackModal(false);
                  setFeedbackMessage("");
                }}
                style={[
                  styles.actionModalBtn,
                  { backgroundColor: "#F1F2F6", marginTop: 10 },
                ]}
              >
                <Text style={[styles.actionBtnText, { color: "#555" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {aboutModal ? (
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={styles.modalBox}>
            <Image
              source={require("../assets/miniAbdullah.png")}
              style={styles.aboutLogo}
            />
            <Text style={styles.modalTitle}>Mini Abdullah</Text>
            <Text style={styles.aboutTagline}>Islam essentials for kids</Text>
            <Text style={styles.modalDesc}>
              Mini Abdullah helps children learn Quran, Salah, Daily Sunnah,
              Duas, Names of Allah, Islamic Shorts, and fun quizzes — with an AI
              chatbot for simple Islamic questions.
            </Text>
            <View style={styles.aboutFeatures}>
              <Text style={styles.aboutFeatureLine}>• Quran learning & offline paras</Text>
              <Text style={styles.aboutFeatureLine}>• Salah steps · Sunnah · Duas</Text>
              <Text style={styles.aboutFeatureLine}>• 99 Names of Allah · Quiz games</Text>
              <Text style={styles.aboutFeatureLine}>• Prayer times · Daily Islamic quote</Text>
              <Text style={styles.aboutFeatureLine}>• Multi-account profiles (max 2)</Text>
            </View>
            <Text style={styles.aboutVersion}>Version 1.0 · BSCS Final Year Project</Text>
            <TouchableOpacity
              onPress={() => setAboutModal(false)}
              style={[
                styles.actionModalBtn,
                { backgroundColor: "#6C4DF7", marginTop: 16, width: "100%" },
              ]}
            >
              <Text style={styles.actionBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {editAccount ? (
        <View style={styles.editModalOverlay} pointerEvents="auto">
          <KeyboardAvoidingView
            style={styles.editKeyboardWrap}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.editOuterScroll}
              contentContainerStyle={[
                styles.editScrollContent,
                editKeyboardOpen && styles.editScrollContentKeyboard,
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View
                style={[styles.modalBox, styles.editModalBox]}
                onLayout={(e) => onCardLayout(e.nativeEvent.layout.y)}
              >
                <Text style={styles.modalTitle}>Edit profile</Text>
                <Text style={styles.modalDesc}>{editAccount.email}</Text>

                <View
                  style={styles.editFieldWrap}
                  onLayout={(e) =>
                    registerField("name", e.nativeEvent.layout.y)
                  }
                >
                  <Text style={styles.editFieldLabel}>Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Name"
                    placeholderTextColor="#999"
                    editable={!editSaving}
                    onFocus={() => scrollToField("name")}
                  />
                </View>

                <Text style={styles.editFieldLabel}>Gender</Text>
                <View style={styles.editGenderRow}>
                  <TouchableOpacity
                    style={[
                      styles.editGenderChip,
                      editGender === "girl" && styles.editGenderChipOn,
                    ]}
                    onPress={() => handleEditGenderSelect("girl")}
                    disabled={editSaving}
                  >
                    <Text
                      style={[
                        styles.editGenderChipText,
                        editGender === "girl" && styles.editGenderChipTextOn,
                      ]}
                    >
                      👧 Girl
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.editGenderChip,
                      editGender === "boy" && styles.editGenderChipOn,
                    ]}
                    onPress={() => handleEditGenderSelect("boy")}
                    disabled={editSaving}
                  >
                    <Text
                      style={[
                        styles.editGenderChipText,
                        editGender === "boy" && styles.editGenderChipTextOn,
                      ]}
                    >
                      👦 Boy
                    </Text>
                  </TouchableOpacity>
                </View>

                {editGender ? (
                  <>
                    <Text style={styles.editFieldLabel}>Avatar</Text>
                    <View style={styles.editAvatarRow}>
                      {getAvatarsForGender(editGender).map((opt) => {
                        const selected = editAvatarId === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[
                              styles.editAvatarWrap,
                              selected && styles.editAvatarWrapOn,
                            ]}
                            onPress={() => setEditAvatarId(opt.id)}
                            disabled={editSaving}
                          >
                            <Image
                              source={opt.source}
                              style={styles.editAvatarImg}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                <View
                  style={styles.editFieldWrap}
                  onLayout={(e) =>
                    registerField("password", e.nativeEvent.layout.y)
                  }
                >
                  <Text style={styles.editFieldLabel}>
                    New password (optional)
                  </Text>
                  <TextInput
                    style={styles.editInput}
                    value={editPassword}
                    onChangeText={setEditPassword}
                    placeholder="Leave blank to keep current"
                    placeholderTextColor="#999"
                    secureTextEntry
                    editable={!editSaving}
                    onFocus={() => scrollToField("password")}
                  />
                </View>

                <View
                  style={styles.editFieldWrap}
                  onLayout={(e) =>
                    registerField("confirm", e.nativeEvent.layout.y)
                  }
                >
                  <TextInput
                    style={[styles.editInput, { marginTop: 8 }]}
                    value={editConfirmPassword}
                    onChangeText={setEditConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    editable={!editSaving}
                    onFocus={() => scrollToField("confirm")}
                  />
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionModalBtn,
                      { backgroundColor: "#6C4DF7", flex: 1 },
                      editSaving && { opacity: 0.7 },
                    ]}
                    onPress={saveEditProfile}
                    disabled={editSaving}
                  >
                    {editSaving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.actionBtnText}>Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionModalBtn,
                      {
                        backgroundColor: "#F1F2F6",
                        marginLeft: 10,
                        flex: 1,
                      },
                    ]}
                    onPress={closeEditProfile}
                    disabled={editSaving}
                  >
                    <Text style={[styles.actionBtnText, { color: "#555" }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      ) : null}

      <RateAppModal
        visible={rateModal}
        initialStars={ratingStars}
        title="Your rating"
        subtitle="Tap stars to rate or change anytime. Updates instantly."
        confirmLabel="Save rating"
        allowSkip={false}
        onSave={saveProfileRating}
        onClose={() => setRateModal(false)}
      />

      {/* Same navbar as Home */}
      <View style={styles.navbar}>
        <View style={styles.navbarInner}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              playUiSound("tap");
              goToHome();
            }}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <Ionicons name="home" size={26} color="#B8A4F0" />
            <Text style={[styles.navText, styles.navTextInactive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              playUiSound("tap");
              goToTutor();
            }}
            accessibilityRole="button"
            accessibilityLabel="Tutor"
          >
            <Ionicons name="school" size={26} color="#B8A4F0" />
            <Text style={[styles.navText, styles.navTextInactive]}>Tutor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons name="person" size={30} color="#4B2AA8" />
            <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  headerBg: {
    padding: 25,
    paddingTop: 50,
    paddingBottom: 40,
    backgroundColor: "#6C4DF7",
  },
  headerTitle: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  headerSub: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
    opacity: 0.9,
  },
  accountsSection: {
    marginHorizontal: 15,
    marginTop: -25,
    marginBottom: 8,
  },
  accountsPanel: {
    backgroundColor: "#E8E0FF",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D2C4FF",
    elevation: 6,
    shadowColor: "#4B2AA8",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  accountsPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  accountsPanelTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#32158A",
  },
  accountsPanelSub: {
    fontSize: 12,
    color: "#6C4DF7",
    fontWeight: "600",
    marginTop: 2,
  },
  accountCard: {
    marginBottom: 10,
    borderRadius: 18,
    overflow: "hidden",
  },
  accountCardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  accountCardInnerCol: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  accountCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginLeft: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(108,77,247,0.12)",
  },
  editProfileBtnActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C4DF7",
  },
  editProfileBtnTextActive: {
    color: "#fff",
  },
  editModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10000,
    elevation: 10000,
  },
  editKeyboardWrap: {
    width: "100%",
    maxHeight: "100%",
  },
  editOuterScroll: {
    width: "100%",
  },
  editScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editScrollContentKeyboard: {
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  editModalBox: {
    width: "100%",
    // Cap only; card height stays content-sized (not stretched).
    maxHeight: "88%",
  },
  editFieldWrap: {
    width: "100%",
  },
  editFieldLabel: {
    alignSelf: "flex-start",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#4B2AA8",
  },
  editInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0D7F7",
    backgroundColor: "#F8F6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2E1A6B",
  },
  editGenderRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  editGenderChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0D7F7",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F8F6FF",
  },
  editGenderChipOn: {
    borderColor: "#6C4DF7",
    backgroundColor: "#6C4DF7",
  },
  editGenderChipText: {
    fontWeight: "700",
    color: "#4B2AA8",
  },
  editGenderChipTextOn: {
    color: "#fff",
  },
  editAvatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    marginBottom: 4,
  },
  editAvatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#E0D7F7",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  editAvatarWrapOn: {
    borderColor: "#6C4DF7",
  },
  editAvatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#C4B0FF",
  },
  avatarRingActive: {
    borderColor: "#fff",
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E1A6B",
  },
  nameActive: {
    color: "#fff",
  },
  email: {
    fontSize: 12,
    color: "#6B5FA0",
    marginTop: 3,
    fontWeight: "500",
  },
  emailActive: {
    color: "#EAE2FF",
  },
  activePill: {
    backgroundColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  activePillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  addBtn: {
    backgroundColor: "#6C4DF7",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  inlineStars: {
    flexDirection: "row",
    marginTop: 4,
  },
  supportInput: {
    width: "100%",
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#F6F7FB",
    marginBottom: 14,
  },
  feedbackRateLabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "700",
    color: "#2E1A6B",
    marginBottom: 10,
  },
  feedbackStarsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    alignSelf: "center",
  },
  aboutLogo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
  },
  aboutTagline: {
    fontSize: 15,
    color: "#6C4DF7",
    fontWeight: "700",
    marginBottom: 10,
  },
  aboutFeatures: {
    alignSelf: "stretch",
    backgroundColor: "#F5F2FF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  aboutFeatureLine: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
    lineHeight: 22,
  },
  aboutVersion: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
  logout: {
    backgroundColor: "#E53935",
    marginHorizontal: 15,
    marginTop: 25,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10000,
    elevation: 10000,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  verticalModalButtons: {
    width: "100%",
  },
  actionModalBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  modalRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  navbar: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    backgroundColor: "transparent",
    paddingVertical: 0,
    zIndex: 9999,
  },
  navbarInner: {
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    elevation: 12,
    zIndex: 9999,
  },
  navItem: { alignItems: "center" },
  navText: { marginTop: 4, fontWeight: "700" },
  navTextActive: { color: "#4B2AA8", fontSize: 16 },
  navTextInactive: { color: "#B8A4F0", fontSize: 13 },
  switchToast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 96,
    zIndex: 10000,
    elevation: 14,
    backgroundColor: "#4B2AA8",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2E1A6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  switchToastText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
    flexShrink: 1,
  },
});
