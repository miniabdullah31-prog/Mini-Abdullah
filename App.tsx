import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";

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
import {
  isOnboardingDone,
  markOnboardingDone,
  markFeatureUsed,
} from "./src/services/appPrefsStore";
import { getRestorableActiveAccount } from "./src/services/accountStore";
import { hydrateNotificationsIfEnabled } from "./src/services/notificationService";

const App = () => {
  const [screen, setScreen] = useState(1);
  const [onboardStep, setOnboardStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");

  useEffect(() => {
    hydrateNotificationsIfEnabled().catch(() => undefined);
  }, []);

  const goToWelcome = () => {
    setScreen(3);
  };
  const goToHome = () => {
    setScreen(10);
  };

  const openFeature = useCallback((target: number) => {
    markFeatureUsed().catch(() => undefined);
    setScreen(target);
  }, []);

  const goToQuran = () => openFeature(11);
  const goToSalah = () => openFeature(12);
  const goToDailySunnah = () => openFeature(13);
  const goToStories = () => openFeature(14);
  const goToDuas = () => openFeature(15);
  const goToNamesOfAllah = () => openFeature(16);
  const goToChatbot = () => openFeature(17);
  const goToQuiz = () => openFeature(18);
  const goToProfile = () => setScreen(19);

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

  const goBack = () => {
    if (screen >= 11 && screen <= 19) {
      setScreen(10);
    } else if (screen === 10) {
      setScreen(3);
    } else {
      setScreen(screen - 1);
    }
  };

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
        <ProfileScreen goToHome={goToHome} goToWelcome={goToWelcome} />
      )}
    </SafeAreaView>
  );
};

export default App;
