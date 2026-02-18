import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Linking } from 'react-native';
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
const WEB_URL = 'https://pdufa.bio?access=odin-allfather-9realms-2026';

type OnboardingStep = 'loading' | 'confidential' | 'welcome' | 'quiz' | 'quiz-result' | 'tutorial' | 'disclaimer' | 'app';

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

// Confidential access gate — shown before Welcome/Eye screen every launch
function ConfidentialGate({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <View style={confidentialStyles.container}>
      <View style={confidentialStyles.iconRow}>
        <Text style={confidentialStyles.icon}>🔒</Text>
      </View>

      <Text style={confidentialStyles.classification}>CLASSIFIED</Text>
      <View style={confidentialStyles.divider} />

      <Text style={confidentialStyles.headline}>
        DO NOT DISTRIBUTE THIS APK.
      </Text>
      <Text style={confidentialStyles.subheadline}>
        Not to friends. Not to "people in the space."{'\n'}Not to your group chat. Not to anyone.
      </Text>

      <View style={confidentialStyles.card}>
        <Text style={confidentialStyles.cardText}>
          You have been admitted to a circle of exactly ten. Out of eight billion
          on this planet, I find precisely ten tolerable enough to breathe the same
          digital air — and you drew one of those slots.{'\n\n'}
          This is not a public beta. This is not a soft launch. This is a velvet
          rope with a bouncer who doesn't care about your name.
        </Text>
      </View>

      <View style={confidentialStyles.quoteCard}>
        <Text style={confidentialStyles.quoteText}>
          "Three may keep a secret, if two of them are dead."
        </Text>
        <Text style={confidentialStyles.quoteAttrib}>— Benjamin Franklin</Text>
      </View>

      <Text style={confidentialStyles.footnote}>
        Treat the link accordingly.
      </Text>

      <TouchableOpacity style={confidentialStyles.acceptBtn} onPress={onAcknowledge} activeOpacity={0.8}>
        <Text style={confidentialStyles.acceptText}>I AM WORTHY — PROCEED</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={confidentialStyles.webLink}
        onPress={() => Linking.openURL(WEB_URL)}
        activeOpacity={0.7}
      >
        <Text style={confidentialStyles.webLinkText}>🌐  Open PDUFA.BIO on Web</Text>
      </TouchableOpacity>
    </View>
  );
}

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

      // Always show confidential gate → welcome screen on every app launch
      // (quiz/tutorial progress is still remembered so returning users skip those)
      setTimeout(() => {
        setStep('confidential');
      }, 1500);
    };
    init();
  }, []);

  // ─── Confidential Gate ─────────────
  const handleConfidentialAcknowledge = () => setStep('welcome');

  // ─── Welcome Screen ─────────────────
  const handleWelcomeContinue = async () => {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
    // If quiz was already completed, skip straight to disclaimer
    const quizVal = await AsyncStorage.getItem(QUIZ_DONE_KEY);
    if (quizVal === 'true') {
      setStep('disclaimer');
    } else {
      setStep('quiz');
    }
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
    case 'confidential':
      return <ConfidentialGate onAcknowledge={handleConfidentialAcknowledge} />;
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

const confidentialStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconRow: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 36,
  },
  classification: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#ef4444',
    opacity: 0.4,
    marginBottom: 20,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subheadline: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 16,
    width: '100%',
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.15)',
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  quoteText: {
    color: '#eab308',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAttrib: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  footnote: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 24,
  },
  acceptBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    width: '100%',
  },
  acceptText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  webLink: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  webLinkText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

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
