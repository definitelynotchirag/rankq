import React, { useLayoutEffect, useRef } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LeaderboardEntry } from '../../types';
import { PaginationControls } from '../ui/PaginationControls';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  loading: boolean;
  refreshing: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalEntries: number;
  onRefresh: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageSizeChange: (size: number) => void;
  isSearching: boolean;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  data,
  loading,
  refreshing,
  currentPage,
  totalPages,
  pageSize,
  totalEntries,
  onRefresh,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  isSearching,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const isRestoringRef = useRef(false);

  const handleScroll = (event: any) => {
    if (!isRestoringRef.current) {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }
  };

  useLayoutEffect(() => {
    if (Platform.OS === 'web' && scrollViewRef.current && scrollOffsetRef.current > 0) {
      isRestoringRef.current = true;
      scrollViewRef.current.scrollTo({ y: scrollOffsetRef.current, animated: false });
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    }
  }, [data]);

  const renderFooter = () => {
    if (isSearching || loading || data.length === 0) {
      return null;
    }

    return (
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageSizeChange={onPageSizeChange}
        disabled={refreshing}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No players found</Text>
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent.primary}
          colors={[colors.accent.primary]}
        />
      }
    >
      {data.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {data.map((item, index) => (
            <LeaderboardRow key={item.id} entry={item} index={index} />
          ))}
          {renderFooter()}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  emptyContainer: {
    paddingTop: spacing.xl,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fonts.medium,
    textAlign: 'center',
  },
});
