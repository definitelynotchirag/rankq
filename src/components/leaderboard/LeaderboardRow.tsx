import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LeaderboardEntry } from '../../types';
import { RankBadge } from './RankBadge';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
}

const LeaderboardRowComponent: React.FC<LeaderboardRowProps> = ({ entry, index }) => {
  const flashOpacity = useSharedValue(0);
  const isRankUp = useSharedValue(false);
  const prevRankRef = useRef<number | undefined>(undefined);
  const prevRatingRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const rankChanged = prevRankRef.current !== undefined && prevRankRef.current !== entry.rank;
    const ratingChanged = prevRatingRef.current !== undefined && prevRatingRef.current !== entry.rating;

    if (rankChanged || ratingChanged) {
      // Only flash on rank changes, not rating changes
      if (rankChanged && prevRankRef.current !== undefined) {
        if (entry.rank < prevRankRef.current) {
          isRankUp.value = true;
        } else {
          isRankUp.value = false;
        }
        
        // Quick, subtle flash
        flashOpacity.value = withSequence(
          withTiming(0.25, { duration: 80 }),
          withTiming(0, { duration: 170 })
        );
      }
    }

    prevRankRef.current = entry.rank;
    prevRatingRef.current = entry.rating;
  }, [entry.rank, entry.rating]);

  const flashStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.md,
    backgroundColor: isRankUp.value ? colors.rankChange.up : colors.rankChange.down,
    opacity: flashOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={flashStyle} />
      <RankBadge rank={entry.rank} previousRank={entry.previousRank} />

      <View style={styles.content}>
        <Text style={styles.username} numberOfLines={1}>
          {entry.username}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Rating:</Text>
          <Text style={styles.rating}>{entry.rating}</Text>
        </View>
      </View>
    </View>
  );
};

export const LeaderboardRow = React.memo(
  LeaderboardRowComponent,
  (prevProps, nextProps) => {
    // Only re-render if these specific fields change
    return (
      prevProps.entry.id === nextProps.entry.id &&
      prevProps.entry.rank === nextProps.entry.rank &&
      prevProps.entry.rating === nextProps.entry.rating &&
      prevProps.entry.username === nextProps.entry.username
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,

    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: colors.border.default, // 2.5D feel for Android/Web if shadow fails
    // borderRightWidth: 4, // Optional: add if we want 2.5D on right too
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fonts.semibold,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.regular,
    marginRight: spacing.xs,
  },
  rating: {
    color: colors.accent.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fonts.semibold,
  },
});
