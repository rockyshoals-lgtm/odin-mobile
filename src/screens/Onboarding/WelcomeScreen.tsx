// ODIN Mobile — Welcome Screen
// Large eye icon + Hávamál quote + beta info + haunting viking choral drone

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const eyeScale = useRef(new Animated.Value(0.8)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load and play viking choral music
  useEffect(() => {
    let mounted = true;

    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/audio/viking-choral.wav'),
          {
            isLooping: true,
            volume: 0, // Start silent, fade in
            shouldPlay: true,
          }
        );

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;

        // Fade in volume over 2 seconds
        const fadeSteps = 20;
        const fadeInterval = 2000 / fadeSteps;
        for (let i = 1; i <= fadeSteps; i++) {
          if (!mounted) break;
          await new Promise(r => setTimeout(r, fadeInterval));
          await sound.setVolumeAsync(i / fadeSteps * 0.6); // Max 60% volume
        }
      } catch (err) {
        console.warn('[WelcomeScreen] Audio load failed (expected in Expo Go):', err);
      }
    };

    loadAudio();

    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Fade out audio and proceed
  const handleContinue = async () => {
    if (soundRef.current) {
      try {
        // Quick fade out over 800ms
        const fadeSteps = 10;
        const fadeInterval = 800 / fadeSteps;
        const status = await soundRef.current.getStatusAsync();
        const currentVol = status.isLoaded ? status.volume : 0.6;
        for (let i = fadeSteps - 1; i >= 0; i--) {
          await new Promise(r => setTimeout(r, fadeInterval));
          await soundRef.current!.setVolumeAsync((i / fadeSteps) * currentVol);
        }
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // Ignore — audio might already be unloaded
      }
    }
    onContinue();
  };

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Eye fades in and scales up
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(eyeScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      // Quote fades in
      Animated.timing(quoteOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      // Button fades in
      Animated.timing(buttonOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Subtle radial glow behind the eye */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Large ODIN Eye */}
      <Animated.View style={[styles.eyeContainer, { opacity: fadeAnim, transform: [{ scale: eyeScale }] }]}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.eyeImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ODIN Title */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>ODIN</Text>
        <Text style={styles.subtitle}>FDA Catalyst Intelligence</Text>
      </Animated.View>

      {/* Hávamál Quote — Odin's revelation after hanging on Yggdrasil */}
      <Animated.View style={[styles.quoteContainer, { opacity: quoteOpacity }]}>
        <Text style={styles.runicDivider}>- ᚱ ᚢ ᚾ ᛖ ᛊ -</Text>
        <Text style={styles.quote}>
          "I took up the runes,{'\n'}
          screaming I took them,{'\n'}
          then I fell back from there."
        </Text>
        <Text style={styles.quoteSource}>— Hávamál, Stanza 139</Text>
        <Text style={styles.quoteContext}>
          Nine nights Odin hung on Yggdrasil,{'\n'}
          wounded by his own spear, sacrificing{'\n'}
          himself to himself — to gain the wisdom{'\n'}
          of the runes.
        </Text>
      </Animated.View>

      {/* Beta Badge */}
      <Animated.View style={[styles.betaSection, { opacity: buttonOpacity }]}>
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>BETA v1.2.0-beta.1</Text>
        </View>
        <Text style={styles.betaInfo}>
          Inner circle access only.{'\n'}
          ODIN Engine v10.69 | 2,200+ PDUFAs | 2,000+ Readouts | 40B+ Scenarios
        </Text>
      </Animated.View>

      {/* Enter Button */}
      <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
        <TouchableOpacity style={styles.enterButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.enterText}>ENTER THE ALL-SIGHT</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Glow effects
  glowOuter: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: height * 0.05,
  },
  glowInner: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    top: height * 0.15,
  },

  // Eye
  eyeContainer: {
    marginBottom: 8,
  },
  eyeImage: {
    width: width * 0.55,
    height: width * 0.55,
  },

  // Title
  title: {
    color: COLORS.accentLight,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },

  // Quote
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  runicDivider: {
    color: COLORS.accent,
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 12,
    opacity: 0.6,
  },
  quote: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 6,
  },
  quoteSource: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quoteContext: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    opacity: 0.7,
  },

  // Beta
  betaSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  betaBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  betaText: {
    color: COLORS.accentLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  betaInfo: {
    color: COLORS.textDisabled,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },

  // Button
  buttonContainer: {
    width: '100%',
  },
  enterButton: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  enterText: {
    color: COLORS.accentLight,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
