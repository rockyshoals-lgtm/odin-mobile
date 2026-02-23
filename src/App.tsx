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
const CONFIDENTIAL_ACCEPTED_KEY = 'odin-confidential-accepted-v1.2';
const DISCLAIMER_ACCEPTED_KEY = 'odin-disclaimer-accepted-v1.2';
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

// Confidential access gate — shown only on first launch
function ConfidentialGate({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <View style={confidentialStyles.container}>
      <View style={confidentialStyles.iconRow}>
        <Text style={confidentialStyles.icon}>🔒</Text>
      </View>

      <Text style={confidentialStyles.classification}>EXCLUSIVE ACCESS</Text>
      <View style={confidentialStyles.divider} />

      <Text style={confidentialStyles.headline}>
        WELCOME TO THE INNER CIRCLE
      </Text>
      <Text style={confidentialStyles.subheadline}>
        You're one of ten people with early access to ODIN.
      </Text>

      <View style={confidentialStyles.card}>
        <Text style={confidentialStyles.cardText}>
          This is not a public beta. This is exclusive early access to the most advanced
          FDA catalyst prediction engine on the planet.{'\n\n'}
          Please keep this access private while we perfect the experience for public launch.
        </Text>
      </View>

      <View style={confidentialStyles.quoteCard}>
        <Text style={confidentialStyles.quoteText}>
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </Text>
        <Text style={confidentialStyles.quoteAttrib}>— Chinese Proverb</Text>
      </View>

      <Text style={confidentialStyles.footnote}>
        Let's get started.
      </Text>

      <TouchableOpacity style={confidentialStyles.acceptBtn} onPress={onAcknowledge} activeOpacity={0.8}>
        <Text style={confidentialStyles.acceptText}>I UNDERSTAND — LET'S GO</Text>
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

// Disclaimer modal — shown only on first launch
function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <View style={disclaimerStyles.overlay}>
      <View style={disclaimerStyles.modal}>
        <Text style={disclaimerStyles.warningIcon}>⚖️</Text>
        <Text style={disclaimerStyles.title}>QUICK LEGAL NOTE</Text>
        <Text style={disclaimerStyles.intro}>
          Before we dive in, here's the standard disclaimer (our attorneys insist):
        </Text>
        <Text style={disclaimerStyles.text}>
          PDUFA.BIO is not affiliated with the FDA or any government agency. "PDUFA" refers to the Prescription Drug User Fee Act — we built a prediction engine around FDA catalyst events.{'\n\n'}
          This is not financial advice. ODIN scores are ML model outputs that help you make better-informed decisions. They should never be the sole basis for any investment decision.{'\n\n'}
          All investing carries risk, including total loss. Trade responsibly.
        </Text>
        <TouchableOpacity style={disclaimerStyles.acceptBtn} onPress={onAccept}>
          <Text style={disclaimerStyles.acceptText}>GOT IT — SHOW ME ODIN</Text>
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

      // Check if user has completed onboarding
      const confidentialAccepted = await AsyncStorage.getItem(CONFIDENTIAL_ACCEPTED_KEY);
      const disclaimerAccepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
      const quizDone = await AsyncStorage.getItem(QUIZ_DONE_KEY);

      setTimeout(() => {
        // First-time user flow
        if (!confidentialAccepted) {
          setStep('confidential');
        } else if (!disclaimerAccepted) {
          setStep('disclaimer');
        } else if (!quizDone) {
          setStep('welcome');
        } else {
          // Returning user - go straight to app
          setStep('app');
        }
      }, 1500);
    };
    init();
  }, []);

  // ─── Confidential Gate ─────────────
  const handleConfidentialAcknowledge = async () => {
    await AsyncStorage.setItem(CONFIDENTIAL_ACCEPTED_KEY, 'true');
    setStep('disclaimer');
  };

  // ─── Disclaimer Accepted ────────────
  const handleDisclaimerAccept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
    setStep('welcome');
  };

  // ─── Welcome Screen ─────────────────
  const handleWelcomeContinue = async () => {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
    const quizVal = await AsyncStorage.getItem(QUIZ_DONE_KEY);
    if (quizVal === 'true') {
      setStep('app');
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
    setStep('app');
  };

  // ─── Tutorial Complete ──────────────
  const handleTutorialComplete = async () => {
    await AsyncStorage.setItem(QUIZ_DONE_KEY, 'true');
    setStep('app');
  };

  // ─── Render ─────────────────────────
  switch (step) {
    case 'loading':
      return <SplashScreen />;
    case 'confidential':
      return <ConfidentialGate onAcknowledge={handleConfidentialAcknowledge} />;
    case 'disclaimer':
      return <DisclaimerModal onAccept={handleDisclaimerAccept} />;
    case 'welcome':
      return <WelcomeScreen onContinue={handleWelcomeContinue} />;
    case 'quiz':
      return <OptionsQuiz onComplete={handleQuizComplete} />;
    case 'quiz-result':
      return <QuizResult level={quizLevel} onStartTutorial={handleStartTutorial} onSkipToApp={handleSkipToApp} />;
    case 'tutorial':
      return <OptionsTutorial onComplete={handleTutorialComplete} />;
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
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.accentLight,
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
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
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
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  quoteText: {
    color: COLORS.accentLight,
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
    backgroundColor: COLORS.accentBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    width: '100%',
  },
  acceptText: {
    color: COLORS.accentLight,
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
    borderColor: COLORS.accent + '40',
    maxWidth: 400,
    width: '100%',
  },
  warningIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.accentLight,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  intro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
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
