import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export const SkeletonLoader: React.FC = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View style={[styles.rank, animatedStyle]} />
        <View style={styles.content}>
          <Animated.View style={[styles.username, animatedStyle]} />
          <Animated.View style={[styles.rating, animatedStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  username: {
    height: 20,
    width: '60%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  rating: {
    height: 16,
    width: '40%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
});
