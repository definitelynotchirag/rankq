import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface RankBadgeProps {
  rank: number;
  previousRank?: number;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, previousRank }) => {
  const getRankColor = () => {
    if (rank === 1) return colors.rank.top1;
    if (rank === 2) return colors.rank.top2;
    if (rank === 3) return colors.rank.top3;
    return colors.rank.default;
  };

  const getRankChange = () => {
    if (!previousRank || previousRank === rank) return null;
    return previousRank > rank ? 'up' : 'down';
  };

  const rankChange = getRankChange();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          { backgroundColor: getRankColor() },
        ]}
      >
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      {rankChange && (
        <View style={styles.changeIndicator}>
          <Ionicons
            name={rankChange === 'up' ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={rankChange === 'up' ? colors.rankChange.up : colors.rankChange.down}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rankText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fonts.bold,
  },
  changeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
});
