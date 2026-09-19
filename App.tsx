import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform, SafeAreaView } from "react-native";

import SplashScreen from "./src/Components/SplashScreen";
import OnBoarding from "./src/Components/onBoardingScreens";
import MiniAbdullahWelcome from "./src/Components/WelcomeScreen";
import Signup from "./src/Components/Signup";
import Login from "./src/Components/Login";
import ForgotPassword from "./src/Components/ForgetPassword";
import OtpVerification from "./src/Components/OtpVerification";
import ResetPassword from "./src/Components/ResetPassword";
import SuccessScreen from "./src/Components/SuccessScreen";
import HomeScreen from "./src/Components/Home";
import QuranScreen from "./src/Components/QuranScreen";
import StoriesScreen from "./src/Components/StoriesScreen";
import DuasScreen from "./src/Components/DuasScreen";
import ChatbotScreen from "./src/Components/ChatbotScreen";
import NamesOfAllahScreen from "./src/Components/NamesOfAllahScreen";
import SalahScreen from "./src/Components/SalahScreen";
import IslamicQuizScreen from "./src/Components/IslamicQuizScreen";
import DailySunnahScreen from "./src/Components/DailySunnahScreen";
import ProfileScreen from "./src/Components/ProfileScreen";
import TalkingAbdullahScreen from "./src/Components/TalkingAbdullahScreen";
import TutorScreen from "./src/Components/TutorScreen";
import {
  isOnboardingDone,
  markOnboardingDone,
  markFeatureUsed,
} from "./src/services/appPrefsStore";
import { getRestorableActiveAccount } from "./src/services/accountStore";
import { hydrateNotificationsIfEnabled } from "./src/services/notificationService";
import { hydrateUiSoundPref } from "./src/services/soundService";
import {
  initFcmForAuthenticatedUser,
  teardownFcmListeners,
  attachNotifeePressHandler,
} from "./src/services/fcmService";
import {
  setNotificationNavigator,
  consumePendingNotificationNav,
} from "./src/services/notificationNavigation";
import { tryFeatureBack } from "./src/navigation/featureBackHandler";

const APP_SCREEN_MIN = 10;
const APP_SCREEN_MAX = 21;

function isLoggedInAppScreen(n: number): boolean {
  return n >= APP_SCREEN_MIN && n <= APP_SCREEN_MAX;
}

const App = () => {
  const [screen, setScreen] = useState(1);
  const [onboardStep, setOnboardStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  /** Previous logged-in screens (Home/Games/Learn/…). Never includes Splash/auth. */
  const navHistoryRef = useRef<number[]>([]);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  const pushNavHistory = useCallback((from: number) => {
    if (!isLoggedInAppScreen(from)) {
      return;
    }
    const hist = navHistoryRef.current;
    if (hist[hist.length - 1] === from) {
      return;
    }
    hist.push(from);
    if (hist.length > 16) {
      hist.shift();
    }
  }, []);

  const clearNavHistory = useCallback(() => {
    navHistoryRef.current = [];
  }, []);

  useEffect(() => {
    hydrateNotificationsIfEnabled().catch(() => undefined);
    hydrateUiSoundPref().catch(() => undefined);
  }, []);

  useEffect(() => {
    setNotificationNavigator((target) => {
      const next = target.screen;
      if (next === 10) {
        navHistoryRef.current = [];
        setScreen(10);
        return;
      }
      const current = screenRef.current;
      if (current !== next && isLoggedInAppScreen(current)) {
        pushNavHistory(current);
      }
      setScreen(next);
    });

    const pending = consumePendingNotificationNav();
    if (pending) {
      setScreen(pending.screen);
    }

    const unsubNotifee = attachNotifeePressHandler();

    return () => {
      unsubNotifee?.();
    };
  }, [pushNavHistory]);

  useEffect(() => {
    if (screen !== 10) {
      return;
    }

    console.log("[FCM] Home reached (screen=10) — calling initFcmForAuthenticatedUser()");

    initFcmForAuthenticatedUser()
      .then(() => {
        console.log("[FCM] initFcmForAuthenticatedUser() finished");
      })
      .catch((error) => {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[FCM] ERROR: App.tsx init — ${msg}`);
      });

    return () => {
      teardownFcmListeners();
    };
  }, [screen]);

  const goToWelcome = () => {
    clearNavHistory();
    setScreen(3);
  };
  const goToHome = () => {
    clearNavHistory();
    setScreen(10);
  };

  const openFeature = useCallback((target: number) => {
    markFeatureUsed().catch(() => undefined);
    const current = screenRef.current;
    if (current !== target && isLoggedInAppScreen(current)) {
      pushNavHistory(current);
    }
    setScreen(target);
  }, [pushNavHistory]);

  const goToQuran = () => openFeature(11);
  const goToSalah = () => openFeature(12);
  const goToDailySunnah = () => openFeature(13);
  const goToStories = () => openFeature(14);
  const goToDuas = () => openFeature(15);
  const goToNamesOfAllah = () => openFeature(16);
  const goToChatbot = () => openFeature(17);
  const goToQuiz = () => openFeature(18);
  const goToTalkingAbdullah = () => openFeature(20);
  const goToTutor = () => openFeature(21);
  const goToProfile = () => {
    const current = screenRef.current;
    if (current !== 19 && isLoggedInAppScreen(current)) {
      pushNavHistory(current);
    }
    setScreen(19);
  };

  const finishOnboarding = async () => {
    try {
      await markOnboardingDone();
    } catch {
      // ignore
    }
    goToWelcome();
  };

  /** Hydrate prefs + accounts; restore Home if session exists. */
  const resolvePostSplashScreen = useCallback(async (): Promise<number> => {
    try {
      const [onboardingDone, session] = await Promise.all([
        isOnboardingDone(),
        getRestorableActiveAccount(),
      ]);

      if (session?.token) {
        return 10;
      }

      return onboardingDone ? 3 : 2;
    } catch {
      return 2;
    }
  }, []);

  const goBack = useCallback(() => {
    if (tryFeatureBack()) {
      return;
    }

    if (isLoggedInAppScreen(screen)) {
      const prev = navHistoryRef.current.pop();
      if (typeof prev === "number" && isLoggedInAppScreen(prev) && prev !== screen) {
        setScreen(prev);
        return;
      }
      if (screen !== 10) {
        setScreen(10);
      }
      return;
    }

    setScreen((current) => Math.max(1, current - 1));
  }, [screen]);

  const handleAndroidBackPress = useCallback(() => {
    if (screen === 1) {
      // Splash — allow default app exit
      return false;
    }

    if (screen === 2) {
      if (onboardStep > 1) {
        setOnboardStep((step) => step - 1);
        return true;
      }
      setScreen(1);
      return true;
    }

    goBack();
    return true;
  }, [screen, onboardStep, goBack]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleAndroidBackPress,
    );

    return () => subscription.remove();
  }, [handleAndroidBackPress]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {screen === 1 && (
        <SplashScreen
          resolveNext={resolvePostSplashScreen}
          onNavigate={setScreen}
        />
      )}

      {screen === 2 && (
        <OnBoarding
          step={onboardStep}
          onSkip={finishOnboarding}
          next={() => {
            if (onboardStep < 3) {
              setOnboardStep(onboardStep + 1);
            } else {
              finishOnboarding();
            }
          }}
        />
      )}

      {screen === 3 && (
        <MiniAbdullahWelcome
          goToSignup={() => setScreen(4)}
          goToLogin={() => setScreen(5)}
        />
      )}

      {screen === 4 && (
        <Signup
          goToLogin={() => setScreen(5)}
          goToSuccess={() => setScreen(9)}
        />
      )}

      {screen === 5 && (
        <Login
          goToSignup={() => setScreen(4)}
          goToForgot={() => setScreen(6)}
          goToHome={goToHome}
        />
      )}

      {screen === 6 && (
        <ForgotPassword
          goToLogin={() => setScreen(5)}
          goToOtp={(email) => {
            setResetEmail(email);
            setResetOtp("");
            setScreen(7);
          }}
        />
      )}
      {screen === 7 && (
        <OtpVerification
          email={resetEmail}
          goToNewPassword={(otp) => {
            setResetOtp(otp);
            setScreen(8);
          }}
          goToLogin={() => setScreen(5)}
        />
      )}
      {screen === 8 && (
        <ResetPassword
          email={resetEmail}
          otp={resetOtp}
          goToLogin={() => {
            setResetEmail("");
            setResetOtp("");
            setScreen(5);
          }}
        />
      )}
      {screen === 9 && <SuccessScreen goToHome={goToHome} />}

      {screen === 10 && (
        <HomeScreen
          goToQuran={goToQuran}
          goToStories={goToStories}
          goToDuas={goToDuas}
          goToChatbot={goToChatbot}
          goToNamesOfAllah={goToNamesOfAllah}
          goToSalah={goToSalah}
          goToQuiz={goToQuiz}
          goToDailySunnah={goToDailySunnah}
          goToProfile={goToProfile}
          goToTalkingAbdullah={goToTalkingAbdullah}
          goToTutor={goToTutor}
        />
      )}

      {screen === 11 && <QuranScreen goBack={goBack} />}
      {screen === 12 && <SalahScreen goBack={goBack} />}
      {screen === 13 && <DailySunnahScreen goBack={goBack} />}
      {screen === 14 && <StoriesScreen goBack={goBack} />}
      {screen === 15 && <DuasScreen goBack={goBack} />}
      {screen === 16 && <NamesOfAllahScreen goBack={goBack} />}
      {screen === 17 && <ChatbotScreen goBack={goBack} />}
      {screen === 18 && <IslamicQuizScreen goBack={goBack} />}
      {screen === 19 && (
        <ProfileScreen
          goToHome={goToHome}
          goToWelcome={goToWelcome}
          goToTutor={goToTutor}
        />
      )}
      {screen === 20 && <TalkingAbdullahScreen goBack={goBack} />}
      {screen === 21 && (
        <TutorScreen
          goBack={goBack}
          goToHome={goToHome}
          goToProfile={goToProfile}
        />
      )}
    </SafeAreaView>
  );
};

export default App;