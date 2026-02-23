import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../constants/colors';
import { CatalystsScreen } from '../../screens/Catalysts/CatalystsScreen';
import { WatchlistScreen } from '../../screens/Watchlist/WatchlistScreen';
import { PredictScreen } from '../../screens/Predict/PredictScreen';
import { TradeScreen } from '../../screens/Trading/TradeScreen';
import { SettingsScreen } from '../../screens/Settings/SettingsScreen';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { usePaperTradeStore } from '../../stores/paperTradeStore';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, badge }: { label: string; focused: boolean; badge?: number }) {
  const icons: Record<string, string> = {
    'Catalysts': '⚡',
    'Watchlist': '★',
    'Predict': '🎯',
    'Trade': '📈',
    'Settings': '⚙',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icons[label] || '•'}</Text>
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function BottomTabNavigator() {
  const { watchedIds } = useWatchlistStore();
  const { positions } = usePaperTradeStore();
  const positionCount = Object.keys(positions).length;

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
          // Only show badge if there are watched items
          tabBarIcon: ({ focused }) => <TabIcon label="Watchlist" focused={focused} badge={watchedIds.length > 0 ? watchedIds.length : undefined} />,
          tabBarBadge: undefined, // Remove built-in badge, using custom one
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
        name="Trade"
        component={TradeScreen}
        options={{
          // Only show badge if there are active positions
          tabBarIcon: ({ focused }) => <TabIcon label="Trade" focused={focused} badge={positionCount > 0 ? positionCount : undefined} />,
          tabBarBadge: undefined,
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
    height: 70, // Reduced from 84px for better screen real estate
    paddingBottom: 16, // Reduced from 24px
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: -2,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 28,
    height: 28,
  },
  icon: {
    fontSize: 22, // Slightly larger for better visibility
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }], // Subtle scale on active tab
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.bgCard, // Creates visual separation from background
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
