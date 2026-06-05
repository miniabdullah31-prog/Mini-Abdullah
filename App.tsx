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
import BackButton from "./src/Components/BackButton";
import IslamicLearningScreen from "./src/Components/IslamicLearningScreen";
import NamesOfAllahScreen from "./src/Components/NamesOfAllahScreen";
import ActivitiesScreen from "./src/Components/ActivitiesScreen";
import SalahScreen from "./src/Components/SalahScreen";
import IslamicQuizScreen from "./src/Components/IslamicQuizScreen";
import GoodDeedsScreen from "./src/Components/GoodDeedsScreen";
//LogBox.ignoreAllLogs(true);
const App = () => {

  const [screen, setScreen] =
    useState(1);

  const [onboardStep, setOnboardStep] =
    useState(1);

  /* ---------------- NAVIGATION FUNCTIONS ---------------- */

  const goToWelcome = () => {
    setScreen(3);
  };

  const goToHome = () => {
    setScreen(10);
  };

  const goToQuran = () => {
    setScreen(11);
  };

  const goToStories = () => {
    setScreen(12);
  };

  const goToDuas = () => {
    setScreen(13);
  };

  const goToIslamicLearning = () => {
    setScreen(14);
  };
  const goToNamesOfAllah = () => {
    setScreen(16);
  };
  const goToActivities = () => {
    setScreen(17);
  };
  const goToSalah = () => {
    console.log("Salah Pressed");
    setScreen(18);
  };
  const goToQuiz = () => {
    setScreen(19);
  };
  const goToGoodDeeds = () => {
  setScreen(20);
};
  /* ---------------- GLOBAL BACK FUNCTION ---------------- */

  const goBack = () => {

    if (
      screen === 11 ||
      screen === 12 ||
      screen === 13 ||
      screen === 14 ||
      screen === 16 ||
      screen === 17 ||
      screen === 18 ||
      screen === 19 ||
      screen === 20
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

      {/* SPLASH SCREEN */}

      {screen === 1 && (

        <SplashScreen
          onFinish={() => setScreen(2)}
        />

      )}

      {/* ONBOARDING */}

      {screen === 2 && (

        <OnBoarding
          step={onboardStep}
          next={() => {

            if (onboardStep < 3) {

              setOnboardStep(
                onboardStep + 1
              );

            } else {

              goToWelcome();
            }
          }}
        />

      )}

      {/* WELCOME SCREEN */}

      {screen === 3 && (

        <MiniAbdullahWelcome
          goToSignup={() => setScreen(4)}
          goToLogin={() => setScreen(5)}
        />

      )}

      {/* SIGNUP SCREEN */}

      {screen === 4 && (

        <Signup
          goToLogin={() => setScreen(5)}
          goToHome={goToHome}
          goToSuccess={() => setScreen(9)}
        />

      )}

      {/* LOGIN SCREEN */}

      {screen === 5 && (

        <Login
          goToSignup={() => setScreen(4)}
          goToForgot={() => setScreen(6)}
          goToHome={goToHome}
        />

      )}

      {/* FORGOT PASSWORD */}

      {screen === 6 && (

        <ForgotPassword
          goToLogin={() => setScreen(5)}
        />

      )}

      {/* OTP VERIFICATION */}

      {screen === 7 && (

        <OtpVerification
          goToNewPassword={() =>
            setScreen(8)
          }
        />

      )}

      {/* RESET PASSWORD */}

      {screen === 8 && (

        <ResetPassword
          goToLogin={() => setScreen(5)}
        />

      )}

      {/* SUCCESS SCREEN */}

      {screen === 9 && (

        <SuccessScreen
          goToHome={goToHome}
        />

      )}

      {/* HOME SCREEN */}

      {screen === 10 && (

        <HomeScreen
          goToQuran={goToQuran}
          goToStories={goToStories}
          goToDuas={goToDuas}
          goToIslamicLearning={goToIslamicLearning}
          goToNamesOfAllah={goToNamesOfAllah}
          goToActivities={goToActivities}
          goToSalah={goToSalah}
          goToQuiz={goToQuiz}
          goToGoodDeeds={goToGoodDeeds}
        />

      )}

      {/* QURAN SCREEN */}

      {screen === 11 && (

        <QuranScreen
          goBack={goBack}
        />

      )}

      {/* STORIES SCREEN */}

      {screen === 12 && (

        <StoriesScreen
          goBack={goBack}
        />

      )}

      {/* DUAS SCREEN */}

      {screen === 13 && (

        <DuasScreen
          goBack={goBack}
        />

      )}

      {/* ISLAMIC LEARNING SCREEN */}

      {screen === 14 && (

        <IslamicLearningScreen
          goBack={goBack}
        />

      )}
      {/* NAMES OF ALLAH SCREEN */}

      {screen === 16 && (

        <NamesOfAllahScreen
          goBack={goBack}
        />

      )}
      {/* ACTIVITIES SCREEN */}

      {screen === 17 && (

        <ActivitiesScreen
          goBack={goBack}
        />

      )}
      {screen === 18 && (
        <SalahScreen
          goBack={goBack}
        />
      )}
      {screen === 19 && (

  <IslamicQuizScreen
    goBack={goBack}
  />

)} 
{screen === 20 && (

  <GoodDeedsScreen
    goBack={goBack}
  />

)}
    </SafeAreaView>

  );
};

export default App;