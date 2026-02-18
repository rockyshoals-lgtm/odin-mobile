import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './constants/colors';
import { BottomTabNavigator } from './components/Navigation/BottomTabNavigator';
import { WelcomeScreen } from './screens/Onboarding/WelcomeScreen';
import { OptionsQuiz, ExperienceLevel } from './screens/Onboarding/OptionsQuiz';
import { QuizResult } from './screens/Onboarding/QuizResult';
import { OptionsTutorial } from './screens/Onboarding/OptionsTutorial';
import { useCatalystStore } from './stores/catalystStore';
import { CATALYSTS_DATA } from './constants/catalysts';
import { notificationService } from './services/notificationService';

const WELCOME_SEEN_KEY = 'odin-welcome-seen-v1.2';
const QUIZ_DONE_KEY = 'odin-quiz-done-v1.2';

type OnboardingStep = 'loading' | 'welcome' | 'quiz' | 'quiz-result' | 'tutorial' | 'disclaimer' | 'app';

// Dark navigation theme
const DarkTheme = {
  dark: true,
  colors: {
    primary: COLORS.accent,
    background: COLORS.bg,
    card: COLORS.bgCard,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.crl,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

// Disclaimer modal shown on first launch
function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <View style={disclaimerStyles.overlay}>
      <View style={disclaimerStyles.modal}>
        <Text style={disclaimerStyles.warningIcon}>⚠️</Text>
        <Text style={disclaimerStyles.title}>IMPORTANT DISCLAIMER</Text>
        <Text style={disclaimerStyles.text}>
          PDUFA.BIO is not affiliated with the FDA. This app is not financial advice.{'\n\n'}
          ODIN probability scores are machine-learning model outputs based on historical
          data — they do NOT predict FDA approval or stock performance and should NEVER
          be the sole basis for investment decisions.{'\n\n'}
          All investment decisions carry risk, including total loss. By using this app,
          you accept full responsibility for your decisions. PDUFA.BIO assumes NO liability
          for losses or damages.
        </Text>
        <TouchableOpacity style={disclaimerStyles.acceptBtn} onPress={onAccept}>
          <Text style={disclaimerStyles.acceptText}>I UNDERSTAND AND ACCEPT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Loading splash
function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <Text style={splashStyles.logo}>ODIN</Text>
      <Text style={splashStyles.tagline}>FDA Catalyst Intelligence</Text>
      <ActivityIndicator color={COLORS.accentLight} style={{ marginTop: 24 }} />
      <Text style={splashStyles.version}>v1.2.0-beta.1 | Engine v10.69</Text>
    </View>
  );
}

export default function App() {
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [quizLevel, setQuizLevel] = useState<ExperienceLevel>('BEGINNER');
  const { setCatalysts } = useCatalystStore();

  useEffect(() => {
    const init = async () => {
      // Load catalyst data
      setCatalysts(CATALYSTS_DATA);

      // Initialize push notifications (non-blocking — degrades in Expo Go)
      notificationService.initialize()
        .then(() => notificationService.scheduleDailySummary())
        .catch(() => console.warn('[App] Notification init skipped'));

      // Check onboarding progress
      const [welcomeVal, quizVal] = await Promise.all([
        AsyncStorage.getItem(WELCOME_SEEN_KEY),
        AsyncStorage.getItem(QUIZ_DONE_KEY),
      ]);

      // Determine starting step
      setTimeout(() => {
        if (welcomeVal !== 'true') {
          setStep('welcome');
        } else if (quizVal !== 'true') {
          setStep('quiz');
        } else {
          setStep('disclaimer');
        }
      }, 1500);
    };
    init();
  }, []);

  // ─── Welcome Screen ─────────────────
  const handleWelcomeContinue = async () => {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setStep('quiz');
  };

  // ─── Quiz Complete ──────────────────
  const handleQuizComplete = (level: ExperienceLevel) => {
    setQuizLevel(level);
    setStep('quiz-result');
  };

  // ─── Quiz Result Actions ────────────
  const handleStartTutorial = () => setStep('tutorial');
  const handleSkipToApp = async () => {
    await AsyncStorage.setItem(QUIZ_DONE_KEY, 'true');
    setStep('disclaimer');
  };

  // ─── Tutorial Complete ──────────────
  const handleTutorialComplete = async () => {
    await AsyncStorage.setItem(QUIZ_DONE_KEY, 'true');
    setStep('disclaimer');
  };

  // ─── Disclaimer Accepted ────────────
  const handleDisclaimerAccept = () => setStep('app');

  // ─── Render ─────────────────────────
  switch (step) {
    case 'loading':
      return <SplashScreen />;
    case 'welcome':
      return <WelcomeScreen onContinue={handleWelcomeContinue} />;
    case 'quiz':
      return <OptionsQuiz onComplete={handleQuizComplete} />;
    case 'quiz-result':
      return <QuizResult level={quizLevel} onStartTutorial={handleStartTutorial} onSkipToApp={handleSkipToApp} />;
    case 'tutorial':
      return <OptionsTutorial onComplete={handleTutorialComplete} />;
    case 'disclaimer':
      return <DisclaimerModal onAccept={handleDisclaimerAccept} />;
    case 'app':
      return (
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
          <NavigationContainer theme={DarkTheme}>
            <BottomTabNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      );
  }
}

const disclaimerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.crl + '40',
    maxWidth: 400,
    width: '100%',
  },
  warningIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.crl,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },
  acceptBtn: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  acceptText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: COLORS.accentLight,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 8,
  },
  version: {
    color: COLORS.textDisabled,
    fontSize: 11,
    marginTop: 32,
  },
});
