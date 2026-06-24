import React, { useState, useEffect } from "react";
import { LogBox, SafeAreaView } from "react-native";

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
import ActivitiesScreen from "./src/Components/ActivitiesScreen";
import SalahScreen from "./src/Components/SalahScreen";
import IslamicQuizScreen from "./src/Components/IslamicQuizScreen";
import GoodDeedsScreen from "./src/Components/GoodDeedsScreen";
import LearnScreen from "./src/Components/LearnScreen";
import ProfileScreen from "./src/Components/ProfileScreen";

const App = () => {
  const [screen, setScreen] = useState(1);
  const [onboardStep, setOnboardStep] = useState(1);

  /* ---------------- NAVIGATION FUNCTIONS ---------------- */
  const goToWelcome = () => { setScreen(10); };
  const goToHome = () => { setScreen(10); };
  const goToQuran = () => setScreen(11);
  const goToStories = () => setScreen(12);
  const goToDuas = () => setScreen(13);
  const goToChatbot = () => setScreen(14); 
  const goToLearn = () => setScreen(15); // Learn Screen Setup
  const goToNamesOfAllah = () => setScreen(16);
  const goToActivities = () => setScreen(17);
  const goToSalah = () => setScreen(18);
  const goToQuiz = () => setScreen(19);
  const goToGoodDeeds = () => setScreen(20);
  const goToProfile = () => setScreen(21);
  
  // LearnScreen sub-navigations
  const goToAqaid = () => setScreen(22);
  const goToAkhlaq = () => setScreen(23);
  const goToIbaadat = () => setScreen(24);
  const goToSeerah = () => setScreen(25);
  const goToMasail = () => setScreen(26);
  const goToPillars = () => setScreen(27);

  /* ---------------- GLOBAL BACK FUNCTION ---------------- */
  const goBack = () => {
    if (
      screen === 11 ||
      screen === 12 ||
      screen === 13 ||
      screen === 14 || 
      screen === 15 || // Learn screen back behavior
      screen === 16 ||
      screen === 17 ||
      screen === 18 ||
      screen === 19 ||
      screen === 20 ||
      screen === 21 ||
      screen === 22 ||
      screen === 23 ||
      screen === 24 ||
      screen === 25 ||
      screen === 26 ||
      screen === 27
    ) {
      setScreen(10);
    } else if (screen === 10) {
      setScreen(3);
    } else {
      setScreen(screen - 1);
    }
  };

  /* ---------------- SPLASH TIMER ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen(2);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen === 1 && <SplashScreen onFinish={() => setScreen(2)} />}

      {screen === 2 && (
        <OnBoarding
          step={onboardStep}
          onSkip={() => setScreen(3)}
          next={() => {
            if (onboardStep < 3) {
              setOnboardStep(onboardStep + 1);
            } else {
              goToWelcome();
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
        <Signup goToLogin={() => setScreen(5)} goToHome={goToHome} goToSuccess={() => setScreen(9)} />
      )}

      {screen === 5 && (
        <Login goToSignup={() => setScreen(4)} goToForgot={() => setScreen(6)} goToHome={goToHome} />
      )}

      {screen === 6 && <ForgotPassword goToLogin={() => setScreen(5)} />}
      {screen === 7 && <OtpVerification goToNewPassword={() => setScreen(8)} />}
      {screen === 8 && <ResetPassword goToLogin={() => setScreen(5)} />}
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
          goToGoodDeeds={goToGoodDeeds}
          goToLearn={goToLearn} // Prop added in Home
          goToProfile={goToProfile}
        />
      )}

      {screen === 11 && <QuranScreen goBack={goBack} />}
      {screen === 12 && <StoriesScreen goBack={goBack} />}
      {screen === 13 && <DuasScreen goBack={goBack} />}
      {screen === 14 && <ChatbotScreen goBack={goBack} />}

      {screen === 15 && (
        <LearnScreen
          goToHome={goToHome}
          goToQuran={goToQuran}
          goToAqaid={goToAqaid}
          goToAkhlaq={goToAkhlaq}
          goToIbaadat={goToIbaadat}
          goToSeerah={goToSeerah}
          goToPillars={goToMasail}
          goToMasail={goToMasail}
          goToProfile={goToProfile}
        />
      )}
      
      {screen === 16 && <NamesOfAllahScreen goBack={goBack} />}
      {screen === 17 && <ActivitiesScreen goBack={goBack} />}
      {screen === 18 && <SalahScreen goBack={goBack} />}
      {screen === 19 && <IslamicQuizScreen goBack={goBack} />}
      {screen === 20 && <GoodDeedsScreen goBack={goBack} />}
      {screen === 21 && <ProfileScreen goToHome={goToHome} goToLearn={goToLearn} goToWelcome={goToWelcome} />}
    </SafeAreaView>
  );
};

export default App;