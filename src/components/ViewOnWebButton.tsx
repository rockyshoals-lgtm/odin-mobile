/**
 * ViewOnWebButton — Opens catalyst detail on pdufa.bio
 *
 * Reusable button component that opens the corresponding pdufa.bio
 * page in the device browser. Includes haptic feedback and
 * analytics tracking.
 *
 * @module ViewOnWebButton
 */

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { trackEvent } from '../services/analyticsService';

interface Props {
  /** Catalyst ID used to generate the web URL */
  catalystId: string;
  /** Ticker symbol for the catalyst */
  ticker: string;
  /** Optional custom label (defaults to "View on Web") */
  label?: string;
  /** Optional compact mode for inline usage */
  compact?: boolean;
}

/**
 * Button that opens the catalyst's pdufa.bio page in the browser.
 *
 * @example
 * ```tsx
 * <ViewOnWebButton
 *   catalystId="aldx-reproxalap-2026-03-16"
 *   ticker="ALDX"
 * />
 * ```
 */
export function ViewOnWebButton({ catalystId, ticker, label, compact = false }: Props) {
  const webUrl = `https://pdufa.bio/${ticker.toLowerCase()}-pdufa`;

  const handlePress = useCallback(async () => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Track the event
      trackEvent('web_link_opened', {
        catalystId,
        ticker,
        url: webUrl,
        source: 'catalyst_detail',
      });

      // Open in browser
      const canOpen = await Linking.canOpenURL(webUrl);
      if (canOpen) {
        await Linking.openURL(webUrl);
      } else {
        Alert.alert('Unable to Open', 'Could not open the browser. Please visit pdufa.bio directly.');
      }
    } catch (error) {
      console.warn('[ViewOnWeb] Error opening URL:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }, [catalystId, ticker, webUrl]);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactBtn}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.compactIcon}>🌐</Text>
        <Text style={styles.compactText}>{label || 'Web'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>🌐</Text>
      <Text style={styles.text}>{label || 'View on Web'}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrow: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.7,
  },
  // ── Compact variant ────────────────────
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    gap: 4,
  },
  compactIcon: {
    fontSize: 12,
  },
  compactText: {
    color: COLORS.accentLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
