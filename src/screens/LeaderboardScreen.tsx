import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LeaderboardList } from '../components/leaderboard/LeaderboardList';
import { SimulationConfig, SimulationConfigModal } from '../components/modals/SimulationConfigModal';
import { SearchBar } from '../components/ui/SearchBar';
import { API_CONFIG } from '../config/api';
import {
  apiClient,
  calculateRankChanges,
  fetchLeaderboard,
  searchUsers,
} from '../services/api';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { LeaderboardEntry } from '../types';

type RootStackParamList = {
  Landing: undefined;
  Leaderboard: undefined;
};

type LeaderboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
};

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkSimulationStatus = useCallback(async () => {
    try {
      const status = await apiClient.getSimulationStatus();
      setSimulationRunning(status.running);
      if (!status.running) {
        setSelectedConfig(null);
      }
    } catch (err) {
      console.error('Failed to check simulation status:', err);
    }
  }, []);

  const handleStartSimulation = useCallback(async (config: SimulationConfig) => {
    try {
      setSimulationLoading(true);
      setShowConfigModal(false);
      console.log('Starting simulation with config:', config);
      await apiClient.startSimulation(config.interval_ms, config.updates_per_tick);
      setSelectedConfig(config);
      setSimulationRunning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(message);
      console.error('Failed to start simulation:', err);
    } finally {
      setSimulationLoading(false);
    }
  }, []);

  const toggleSimulation = useCallback(async () => {
    if (simulationRunning) {
      try {
        setSimulationLoading(true);
        await apiClient.stopSimulation();
        setSimulationRunning(false);
        setSelectedConfig(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to stop simulation';
        setError(message);
        console.error('Failed to stop simulation:', err);
      } finally {
        setSimulationLoading(false);
      }
    } else {
      // Show modal to configure simulation
      setShowConfigModal(true);
    }
  }, [simulationRunning]);

  const loadLeaderboard = useCallback(async (pageNum: number, size: number, isRefresh = false) => {
    try {
      setError(null);

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchLeaderboard(pageNum, size);

      setData(response.entries);
      setTotalEntries(response.total);
      setTotalPages(Math.ceil(response.total / size));
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(message);
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const pollLeaderboard = useCallback(async () => {
    try {
      let newEntries: LeaderboardEntry[];

      if (searchQuery.trim() !== '') {
        newEntries = await searchUsers(searchQuery);
      } else {
        const response = await fetchLeaderboard(page, pageSize);
        newEntries = response.entries;
      }

      setData(prev => {
        const hasChanges = newEntries.some(entry => {
          const prevEntry = prev.find(p => p.id === entry.id);
          if (!prevEntry) return true;
          return prevEntry.rating !== entry.rating || prevEntry.rank !== entry.rank;
        });

        if (!hasChanges && prev.length === newEntries.length) {
          return prev;
        }

        return calculateRankChanges(prev, newEntries);
      });
    } catch (err) {
      console.error('Polling failed:', err);
    }
  }, [searchQuery, page, pageSize]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim() === '') {
      loadLeaderboard(1, pageSize, true);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const results = await searchUsers(query);
      setData(results);
      setTotalEntries(results.length);
      setTotalPages(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [loadLeaderboard, pageSize]);

  const handleRefresh = useCallback(() => {
    if (searchQuery.trim() === '') {
      loadLeaderboard(page, pageSize, true);
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery, page, pageSize, loadLeaderboard, handleSearch]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      loadLeaderboard(page + 1, pageSize);
    }
  }, [page, totalPages, pageSize, loadLeaderboard]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      loadLeaderboard(page - 1, pageSize);
    }
  }, [page, pageSize, loadLeaderboard]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    loadLeaderboard(1, newSize);
  }, [loadLeaderboard]);

  useEffect(() => {
    loadLeaderboard(1, pageSize);
    checkSimulationStatus();
  }, []);

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Always poll, whether searching or viewing full leaderboard
    pollIntervalRef.current = setInterval(pollLeaderboard, API_CONFIG.POLLING_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollLeaderboard]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== '') {
        handleSearch(searchQuery);
      }
    }, API_CONFIG.DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, handleSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <SimulationConfigModal
        visible={showConfigModal}
        onConfirm={handleStartSimulation}
        onCancel={() => setShowConfigModal(false)}
      />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>RankQ</Text>
          <View style={styles.simulationControls}>
            {simulationRunning && selectedConfig && (
              <Text style={styles.statsText}>
                {Math.round((1000 / selectedConfig.interval_ms) * selectedConfig.updates_per_tick)} Games/sec
              </Text>
            )}
            <Pressable
              style={[
                styles.simulationButton,
                simulationRunning && styles.simulationButtonActive,
              ]}
              onPress={toggleSimulation}
              disabled={simulationLoading}
            >
              {simulationLoading ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <>
                  <Ionicons
                    name={simulationRunning ? 'pause' : 'play'}
                    size={16}
                    color={simulationRunning ? colors.background.primary : colors.accent.primary}
                  />
                  <Text
                    style={[
                      styles.simulationButtonText,
                      simulationRunning && styles.simulationButtonTextActive,
                    ]}
                  >
                    {simulationRunning ? 'Stop' : 'Simulate'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search players..."
          />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <LeaderboardList
        data={data}
        loading={loading}
        refreshing={refreshing}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onRefresh={handleRefresh}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        isSearching={searchQuery.trim() !== ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
  },
  simulationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: typography.fonts.medium,
  },
  simulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    gap: spacing.xs,
  },
  simulationButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  simulationButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.semibold,
    color: colors.accent.primary,
  },
  simulationButtonTextActive: {
    color: colors.background.primary,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.fontSize.sm,
  },
});
