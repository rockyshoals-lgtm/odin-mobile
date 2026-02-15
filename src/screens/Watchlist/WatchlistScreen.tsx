import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useCatalystStore } from '../../stores/catalystStore';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { CatalystCard } from '../Catalysts/CatalystCard';
import { CatalystDetail } from '../Catalysts/CatalystDetail';
import { Catalyst } from '../../constants/types';

export function WatchlistScreen() {
  const { catalysts } = useCatalystStore();
  const { watchedIds } = useWatchlistStore();
  const [selectedCatalyst, setSelectedCatalyst] = useState<Catalyst | null>(null);

  const watchedCatalysts = useMemo(() =>
    catalysts.filter(c => watchedIds.includes(c.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [catalysts, watchedIds]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>WATCHLIST</Text>
        <Text style={styles.subtitle}>Your tracked catalysts</Text>
      </View>

      {watchedCatalysts.length > 0 ? (
        <FlatList
          data={watchedCatalysts}
          renderItem={({ item }) => <CatalystCard catalyst={item} onPress={setSelectedCatalyst} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>★</Text>
          <Text style={styles.emptyTitle}>No catalysts watched yet</Text>
          <Text style={styles.emptyText}>
            Tap the star icon on any catalyst card to add it to your watchlist.
            You'll get push notifications for watched events.
          </Text>
        </View>
      )}

      {/* Badge showing count */}
      {watchedCatalysts.length > 0 && (
        <View style={styles.countBanner}>
          <Text style={styles.countText}>Tracking {watchedCatalysts.length} catalyst{watchedCatalysts.length !== 1 ? 's' : ''}</Text>
        </View>
      )}

      <Modal visible={!!selectedCatalyst} animationType="slide" transparent>
        {selectedCatalyst && (
          <CatalystDetail catalyst={selectedCatalyst} onClose={() => setSelectedCatalyst(null)} />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.textMuted, fontSize: 12 },
  listContent: { paddingTop: 6, paddingBottom: 100 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, color: COLORS.coin, marginBottom: 16 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  countBanner: { position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: COLORS.bgCard, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  countText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
});
