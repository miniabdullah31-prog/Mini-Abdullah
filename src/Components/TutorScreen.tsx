import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  ImageBackground,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";
import {
  AvailabilitySlot,
  Tutor,
  TutorAppointment,
  cancelAppointment,
  createAppointment,
  fetchMyAppointments,
  fetchTutorAvailability,
  fetchTutors,
  formatFriendlyDate,
  formatSlotLabel,
} from "../services/tutorService";

type Props = { goBack: () => void };
type TutorView = "hub" | "booking" | "confirm" | "success" | "appointments";

const STATUS_STYLE: Record<
  TutorAppointment["status"],
  { bg: string; fg: string; label: string }
> = {
  pending: { bg: "#FFF4E5", fg: "#C2410C", label: "Pending" },
  confirmed: { bg: "#EDE9FE", fg: "#5B21B6", label: "Confirmed" },
  completed: { bg: "#ECFDF5", fg: "#047857", label: "Completed" },
  cancelled: { bg: "#FEF2F2", fg: "#B91C1C", label: "Cancelled" },
};

function nextDateKeys(count: number) {
  const keys: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    keys.push(`${y}-${m}-${day}`);
  }
  return keys;
}

function tutorTheme(tutor: Tutor) {
  if (tutor.slug === "islamic-studies-teacher") {
    return {
      colors: ["#0F9B8E", "#34D1BF"] as [string, string],
      icon: "library" as const,
    };
  }
  return {
    colors: ["#6C4DF7", "#4B2AA8"] as [string, string],
    icon: "book" as const,
  };
}

const TutorScreen: React.FC<Props> = ({ goBack }) => {
  const [view, setView] = useState<TutorView>("hub");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [hubLoading, setHubLoading] = useState(true);
  const [hubError, setHubError] = useState("");

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const dateKeys = useMemo(() => nextDateKeys(14), []);
  const [selectedDate, setSelectedDate] = useState(dateKeys[0]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );

  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookedAppt, setBookedAppt] = useState<TutorAppointment | null>(null);

  const [appointments, setAppointments] = useState<TutorAppointment[]>([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptError, setApptError] = useState("");

  const bookingLock = useRef(false);

  const loadTutors = useCallback(async () => {
    try {
      setHubLoading(true);
      setHubError("");
      const list = await fetchTutors();
      setTutors(list);
    } catch (error: any) {
      setHubError(error?.message || "Could not load tutors.");
    } finally {
      setHubLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTutors();
  }, [loadTutors]);

  const loadSlots = useCallback(async (tutorId: string, date: string) => {
    try {
      setSlotsLoading(true);
      setSlotsError("");
      const data = await fetchTutorAvailability(tutorId, date);
      setSlots(data.slots || []);
    } catch (error: any) {
      setSlots([]);
      setSlotsError(error?.message || "Could not load times.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view !== "booking" && view !== "confirm") return;
    if (!selectedTutor) return;
    setSelectedSlot(null);
    loadSlots(selectedTutor.id, selectedDate);
  }, [view, selectedTutor, selectedDate, loadSlots]);

  const loadAppointments = useCallback(async () => {
    try {
      setApptLoading(true);
      setApptError("");
      const list = await fetchMyAppointments();
      setAppointments(list);
    } catch (error: any) {
      setApptError(error?.message || "Could not load appointments.");
    } finally {
      setApptLoading(false);
    }
  }, []);

  const openBooking = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setSelectedDate(dateKeys[0]);
    setSelectedSlot(null);
    setView("booking");
  };

  const openAppointments = () => {
    setView("appointments");
    loadAppointments();
  };

  const resetToHub = () => {
    setView("hub");
    setSelectedTutor(null);
    setSelectedSlot(null);
    setBookedAppt(null);
  };

  useFeatureBackHandler(
    useCallback(() => {
      if (view === "confirm") {
        setView("booking");
        return true;
      }
      if (view === "success" || view === "booking" || view === "appointments") {
        resetToHub();
        return true;
      }
      return false;
    }, [view]),
    [view],
  );

  const headerBack = () => {
    if (view === "confirm") {
      setView("booking");
      return;
    }
    if (view === "success" || view === "booking" || view === "appointments") {
      resetToHub();
      return;
    }
    goBack();
  };

  const submitBooking = async () => {
    if (!selectedTutor || !selectedSlot || bookingLock.current) return;
    bookingLock.current = true;
    setBookingBusy(true);
    try {
      const appt = await createAppointment({
        tutorId: selectedTutor.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
      setBookedAppt(appt);
      setView("success");
    } catch (error: any) {
      Alert.alert(
        "Booking",
        error?.message || "Could not book this session. Please try again.",
      );
      if (selectedTutor) {
        loadSlots(selectedTutor.id, selectedDate);
      }
    } finally {
      bookingLock.current = false;
      setBookingBusy(false);
    }
  };

  const joinZoom = async (link: string) => {
    try {
      await Linking.openURL(link);
    } catch {
      Alert.alert("Zoom", "Could not open the Zoom class link.");
    }
  };

  const onCancel = (appt: TutorAppointment) => {
    Alert.alert(
      "Cancel class?",
      "This time will be free for someone else.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel class",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appt.id);
              loadAppointments();
            } catch (error: any) {
              Alert.alert("Cancel", error?.message || "Could not cancel.");
            }
          },
        },
      ],
    );
  };

  const upcoming = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled",
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={headerBack} />

      {view === "hub" && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
            imageStyle={styles.headerRadius}
          >
            <Text style={styles.headerTitle}>Learn with a Tutor</Text>
            <Text style={styles.headerSubtitle}>
              Choose a tutor and book a time that works for you.
            </Text>
            <HeaderSpark />
          </ImageBackground>

          <SmoothPressable
            radius={18}
            style={styles.myApptBtn}
            onPress={openAppointments}
          >
            <Ionicons name="calendar" size={20} color="#5B33C4" />
            <Text style={styles.myApptText}>My Appointments</Text>
            <Ionicons name="chevron-forward" size={18} color="#5B33C4" />
          </SmoothPressable>

          {hubLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#5B33C4" />
          ) : hubError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>Could not load tutors</Text>
              <Text style={styles.stateBody}>{hubError}</Text>
              <SmoothPressable radius={16} style={styles.retryBtn} onPress={loadTutors}>
                <Text style={styles.retryText}>Retry</Text>
              </SmoothPressable>
            </View>
          ) : tutors.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>No tutors are currently available.</Text>
            </View>
          ) : (
            <View style={styles.cards}>
              {tutors.map((tutor) => {
                const theme = tutorTheme(tutor);
                return (
                  <View key={tutor.id} style={styles.cardWrap}>
                    <LinearGradient
                      colors={theme.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tutorCard}
                    >
                      <GradCardDecor />
                      <View style={styles.iconCircle}>
                        <Ionicons name={theme.icon} size={26} color="#fff" />
                      </View>
                      <Text style={styles.tutorName}>{tutor.name}</Text>
                      <Text style={styles.tutorRole}>{tutor.role}</Text>
                      <View style={styles.chipRow}>
                        {tutor.specializations.map((item) => (
                          <View key={item} style={styles.specChip}>
                            <Text style={styles.specChipText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.tutorBio} numberOfLines={3}>
                        {tutor.bio}
                      </Text>
                      <SmoothPressable
                        radius={16}
                        style={styles.bookBtn}
                        onPress={() => openBooking(tutor)}
                      >
                        <Text style={styles.bookBtnText}>Book Session</Text>
                      </SmoothPressable>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {(view === "booking" || view === "confirm") && selectedTutor && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
            imageStyle={styles.headerRadius}
          >
            <Text style={styles.headerTitle}>{selectedTutor.name}</Text>
            <Text style={styles.headerSubtitle}>{selectedTutor.role}</Text>
          </ImageBackground>

          <View style={styles.detailCard}>
            <Text style={styles.sectionLabel}>Online Zoom Class</Text>
            <Text style={styles.bodyText}>{selectedTutor.bio}</Text>
            <View style={styles.chipRow}>
              {selectedTutor.specializations.map((item) => (
                <View key={item} style={styles.specChipLight}>
                  <Text style={styles.specChipLightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {view === "booking" && (
            <>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
              >
                {dateKeys.map((key) => {
                  const active = key === selectedDate;
                  const d = new Date(`${key}T12:00:00`);
                  return (
                    <SmoothPressable
                      key={key}
                      radius={16}
                      style={[styles.dateChip, active && styles.dateChipOn]}
                      onPress={() => setSelectedDate(key)}
                    >
                      <Text style={[styles.dateDow, active && styles.dateOnText]}>
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </Text>
                      <Text style={[styles.dateNum, active && styles.dateOnText]}>
                        {d.getDate()}
                      </Text>
                    </SmoothPressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionTitle}>Select Time</Text>
              {slotsLoading ? (
                <ActivityIndicator color="#5B33C4" style={{ marginVertical: 20 }} />
              ) : slotsError ? (
                <View style={styles.stateBox}>
                  <Text style={styles.stateBody}>{slotsError}</Text>
                  <SmoothPressable
                    radius={16}
                    style={styles.retryBtn}
                    onPress={() =>
                      selectedTutor && loadSlots(selectedTutor.id, selectedDate)
                    }
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </SmoothPressable>
                </View>
              ) : slots.filter((s) => s.available).length === 0 ? (
                <Text style={styles.emptySlot}>
                  No available times for this date.
                </Text>
              ) : (
                <View style={styles.timeWrap}>
                  {slots.map((slot) => {
                    const on =
                      selectedSlot?.startTime === slot.startTime &&
                      slot.available;
                    return (
                      <SmoothPressable
                        key={slot.startTime}
                        radius={14}
                        disabled={!slot.available}
                        style={[
                          styles.timeChip,
                          !slot.available && styles.timeChipOff,
                          on && styles.timeChipOn,
                        ]}
                        onPress={() => slot.available && setSelectedSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            !slot.available && styles.timeTextOff,
                            on && styles.timeTextOn,
                          ]}
                        >
                          {formatSlotLabel(slot.startTime, slot.endTime)}
                        </Text>
                      </SmoothPressable>
                    );
                  })}
                </View>
              )}

              <SmoothPressable
                radius={18}
                disabled={!selectedSlot}
                style={[styles.primaryBtn, !selectedSlot && styles.primaryBtnOff]}
                onPress={() => selectedSlot && setView("confirm")}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </SmoothPressable>
            </>
          )}

          {view === "confirm" && selectedSlot && (
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Confirm Appointment</Text>
              <Text style={styles.confirmHint}>
                Your selected tutor and time will be reserved for your online class.
              </Text>
              <Row label="Tutor" value={selectedTutor.name} />
              <Row label="Class" value="Online Zoom Class" />
              <Row label="Date" value={formatFriendlyDate(selectedDate)} />
              <Row
                label="Time"
                value={formatSlotLabel(selectedSlot.startTime, selectedSlot.endTime)}
              />
              <SmoothPressable
                radius={18}
                disabled={bookingBusy}
                style={styles.primaryBtn}
                onPress={submitBooking}
              >
                {bookingBusy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Confirm Appointment</Text>
                )}
              </SmoothPressable>
            </View>
          )}
        </ScrollView>
      )}

      {view === "success" && bookedAppt && (
        <View style={styles.successWrap}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={64} color="#5B33C4" />
          </View>
          <Text style={styles.successTitle}>Appointment Booked!</Text>
          <Text style={styles.successBody}>
            Your tutor session has been scheduled successfully.
          </Text>
          <View style={styles.confirmCard}>
            <Row label="Tutor" value={bookedAppt.tutorName} />
            <Row label="Date" value={formatFriendlyDate(bookedAppt.date)} />
            <Row
              label="Time"
              value={formatSlotLabel(bookedAppt.startTime, bookedAppt.endTime)}
            />
            <Row label="Status" value={STATUS_STYLE[bookedAppt.status].label} />
          </View>
          <SmoothPressable radius={18} style={styles.primaryBtn} onPress={openAppointments}>
            <Text style={styles.primaryBtnText}>My Appointments</Text>
          </SmoothPressable>
          <SmoothPressable radius={18} style={styles.ghostBtn} onPress={resetToHub}>
            <Text style={styles.ghostBtnText}>Done</Text>
          </SmoothPressable>
        </View>
      )}

      {view === "appointments" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
            imageStyle={styles.headerRadius}
          >
            <Text style={styles.headerTitle}>My Appointments</Text>
            <Text style={styles.headerSubtitle}>
              Upcoming and previous tutor sessions
            </Text>
          </ImageBackground>

          {apptLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#5B33C4" />
          ) : apptError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateBody}>{apptError}</Text>
              <SmoothPressable radius={16} style={styles.retryBtn} onPress={loadAppointments}>
                <Text style={styles.retryText}>Retry</Text>
              </SmoothPressable>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcoming.length === 0 ? (
                <Text style={styles.emptySlot}>No upcoming classes yet.</Text>
              ) : (
                upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onJoin={() => joinZoom(appt.zoomLink)}
                    onCancel={() => onCancel(appt)}
                  />
                ))
              )}
              <Text style={styles.sectionTitle}>Previous</Text>
              {past.length === 0 ? (
                <Text style={styles.emptySlot}>No previous classes yet.</Text>
              ) : (
                past.map((appt) => (
                  <AppointmentCard key={appt.id} appt={appt} />
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const AppointmentCard: React.FC<{
  appt: TutorAppointment;
  onJoin?: () => void;
  onCancel?: () => void;
}> = ({ appt, onJoin, onCancel }) => {
  const badge = STATUS_STYLE[appt.status];
  return (
    <View style={styles.apptCard}>
      <View style={styles.apptTop}>
        <Text style={styles.apptName}>{appt.tutorName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.fg }]}>{badge.label}</Text>
        </View>
      </View>
      <Text style={styles.apptSubject}>{appt.subject}</Text>
      <Text style={styles.apptMeta}>
        {formatFriendlyDate(appt.date)} · {formatSlotLabel(appt.startTime, appt.endTime)}
      </Text>
      {appt.canJoin && onJoin ? (
        <SmoothPressable radius={14} style={styles.zoomBtn} onPress={onJoin}>
          <Ionicons name="videocam" size={18} color="#fff" />
          <Text style={styles.zoomBtnText}>Join Zoom Class</Text>
        </SmoothPressable>
      ) : null}
      {(appt.status === "pending" || appt.status === "confirmed") && onCancel ? (
        <SmoothPressable radius={14} style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </SmoothPressable>
      ) : null}
    </View>
  );
};

export default TutorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    paddingTop: 70,
    paddingBottom: 28,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRadius: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  myApptBtn: {
    marginHorizontal: 20,
    marginTop: -18,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myApptText: {
    flex: 1,
    fontWeight: "800",
    color: "#35158B",
    fontSize: 15,
  },
  cards: { paddingHorizontal: 20, paddingBottom: 40, marginTop: 10 },
  cardWrap: { marginBottom: 16, borderRadius: 24, overflow: "hidden" },
  tutorCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tutorName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  tutorRole: { color: "rgba(255,255,255,0.9)", marginTop: 4, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  specChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  specChipLight: {
    backgroundColor: "#EDE7FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specChipLightText: { color: "#4B2AA8", fontSize: 12, fontWeight: "700" },
  tutorBio: { color: "rgba(255,255,255,0.92)", marginTop: 12, lineHeight: 20 },
  bookBtn: {
    marginTop: 16,
    backgroundColor: "#fff",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnText: { color: "#4B2AA8", fontWeight: "800", fontSize: 16 },
  detailCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 22,
    padding: 18,
  },
  sectionLabel: {
    color: "#6C4DF7",
    fontWeight: "800",
    marginBottom: 6,
  },
  bodyText: { color: "#444", lineHeight: 21, fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#35158B",
    marginTop: 22,
    marginLeft: 20,
    marginBottom: 10,
  },
  dateRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 6 },
  dateChip: {
    width: 64,
    height: 72,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateChipOn: { backgroundColor: "#6C4DF7" },
  dateDow: { color: "#7C7499", fontWeight: "700", fontSize: 12 },
  dateNum: { color: "#35158B", fontWeight: "800", fontSize: 20, marginTop: 4 },
  dateOnText: { color: "#fff" },
  timeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
  },
  timeChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeChipOn: { backgroundColor: "#6C4DF7" },
  timeChipOff: { backgroundColor: "#ECEAF3" },
  timeText: { color: "#35158B", fontWeight: "800" },
  timeTextOn: { color: "#fff" },
  timeTextOff: { color: "#A39BB8" },
  emptySlot: {
    marginHorizontal: 20,
    color: "#6B6288",
    fontWeight: "600",
    marginBottom: 8,
  },
  primaryBtn: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: "#6C4DF7",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnOff: { backgroundColor: "#C4B5FD" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  confirmCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#35158B",
    marginBottom: 6,
  },
  confirmHint: { color: "#6B6288", marginBottom: 14, lineHeight: 20 },
  row: { marginBottom: 10 },
  rowLabel: { color: "#8B82A8", fontWeight: "700", fontSize: 12 },
  rowValue: { color: "#2A2150", fontWeight: "800", fontSize: 16, marginTop: 2 },
  successWrap: { flex: 1, paddingHorizontal: 8, paddingTop: 90 },
  successBadge: { alignItems: "center", marginBottom: 8 },
  successTitle: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#35158B",
  },
  successBody: {
    textAlign: "center",
    color: "#6B6288",
    marginTop: 8,
    marginHorizontal: 28,
    lineHeight: 22,
  },
  ghostBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE7FF",
  },
  ghostBtnText: { color: "#4B2AA8", fontWeight: "800", fontSize: 16 },
  stateBox: { padding: 28, alignItems: "center" },
  stateTitle: {
    color: "#35158B",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  stateBody: { color: "#6B6288", marginTop: 8, textAlign: "center" },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#6C4DF7",
    paddingHorizontal: 22,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: { color: "#fff", fontWeight: "800" },
  apptCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
  },
  apptTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  apptName: { flex: 1, fontWeight: "800", color: "#35158B", fontSize: 16 },
  apptSubject: { color: "#6C4DF7", fontWeight: "700", marginTop: 4 },
  apptMeta: { color: "#6B6288", marginTop: 4, fontWeight: "600" },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontWeight: "800", fontSize: 11 },
  zoomBtn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  zoomBtnText: { color: "#fff", fontWeight: "800" },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#FEE2E2",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: "#B91C1C", fontWeight: "800" },
});
