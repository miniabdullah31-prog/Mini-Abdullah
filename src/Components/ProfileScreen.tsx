import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  ImageBackground,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  goToHome: () => void;
  goToLearn: () => void;
  goToWelcome: () => void;
  user?: {
    name: string;
    email: string;
  };
};

const ProfileScreen: React.FC<Props> = ({
  goToHome,
  goToLearn,
  goToWelcome,
  user = { name: "Guest User", email: "guest@email.com" },
}) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  
  // 1. Nayi Profile add karne wale popup ke liye state
  const [addProfileModal, setAddProfileModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* 🔷 TOP HEADER */}
        <ImageBackground
          source={require("../homeAssets/learn_bg.png")}
          style={styles.headerBg}
          imageStyle={{ borderBottomLeftRadius: 35, borderBottomRightRadius: 35 }}
        >
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>Manage your account & settings</Text>
        </ImageBackground>

        {/* 👤 DYNAMIC PROFILE CARD */}
        <View style={styles.profileBox}>
          <Image
            source={require("../assets/miniAbdullah.png")}
            style={styles.profileImg}
          />

          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>

            <TouchableOpacity style={styles.editBtn}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Plus sign button par trigger lagaya hai */}
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setAddProfileModal(true)}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ⚙️ SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.label}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Language</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>About App</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Rate App ⭐</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity
          style={styles.logout}
          onPress={() => setLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ➕ ADD NEW PROFILE MODAL (POPUP) */}
      <Modal transparent visible={addProfileModal} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color="#6C4DF7" />
            </View>
            <Text style={styles.modalTitle}>Manage Profiles</Text>
            <Text style={styles.modalDesc}>Do you want to add another profile to this app?</Text>

            <View style={styles.verticalModalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setAddProfileModal(false);
                  goToWelcome(); // Directing to your welcome/login-signup screen
                }}
                style={[styles.actionModalBtn, { backgroundColor: "#6C4DF7" }]}
              >
                <Text style={styles.actionBtnText}>Add New Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddProfileModal(false)}
                style={[styles.actionModalBtn, { backgroundColor: "#F1F2F6", marginTop: 10 }]}
              >
                <Text style={[styles.actionBtnText, { color: "#555" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🚪 LOGOUT MODAL */}
      <Modal transparent visible={logoutModal} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Are you sure you want to logout?</Text>

            <View style={styles.modalRow}>
              <TouchableOpacity
                onPress={() => setLogoutModal(false)}
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLogoutModal(false);
                  goToWelcome();
                }}
                style={[styles.modalBtn, { backgroundColor: "#E53935" }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔻 NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarInner}>
          <TouchableOpacity style={styles.navItem} onPress={goToHome}>
            <Ionicons name="home" size={28} color="#7A3DFF" />
            <Text style={[styles.navText, { color: "#7A3DFF" }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goToLearn}>
            <Ionicons name="book" size={28} color="#2FB65D" />
            <Text style={[styles.navText, { color: "#2FB65D" }]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="star" size={28} color="#F4B400" />
            <Text style={[styles.navText, { color: "#F4B400" }]}>Rewards</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person" size={28} color="#2196F3" />
            <Text style={[styles.navText, { color: "#2196F3" }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

/* STYLES */
const styles = StyleSheet.create({
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
  profileBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 15,
    marginTop: -25,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
  },
  profileImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "#777",
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: "#6c4df7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  addBtn: {
    backgroundColor: "#2FB65D",
    padding: 10,
    borderRadius: 30,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  logout: {
    margin: 20,
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  logoutText: {
    color: "#E53935",
    fontWeight: "bold",
  },
  
  /* MODAL BASICS */
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    width: "85%",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#F0ECFF",
    padding: 15,
    borderRadius: 50,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#1A1A1A",
  },
  modalDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    padding: 14,
    borderRadius: 14,
    width: "47%",
    alignItems: "center",
  },

  /* NEW PROFILE MODAL CUSTOM BUTTONS */
  verticalModalButtons: {
    width: "100%",
  },
  actionModalBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  /* NAVBAR */
  navbar: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
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
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
});