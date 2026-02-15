import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../constants/colors';
import { CatalystsScreen } from '../../screens/Catalysts/CatalystsScreen';
import { WatchlistScreen } from '../../screens/Watchlist/WatchlistScreen';
import { PredictScreen } from '../../screens/Predict/PredictScreen';
import { TrackRecordScreen } from '../../screens/TrackRecord/TrackRecordScreen';
import { SettingsScreen } from '../../screens/Settings/SettingsScreen';
import { useWatchlistStore } from '../../stores/watchlistStore';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, badge }: { label: string; focused: boolean; badge?: number }) {
  const icons: Record<string, string> = {
    'Catalysts': '⚡',
    'Watchlist': '★',
    'Predict': '🎯',
    'Record': '📊',
    'Settings': '⚙',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icons[label] || '•'}</Text>
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function BottomTabNavigator() {
  const { watchedIds } = useWatchlistStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accentLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Catalysts"
        component={CatalystsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Catalysts" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Watchlist" focused={focused} badge={watchedIds.length} />,
        }}
      />
      <Tab.Screen
        name="Predict"
        component={PredictScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Predict" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Record"
        component={TrackRecordScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Record" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgCard,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 84,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
