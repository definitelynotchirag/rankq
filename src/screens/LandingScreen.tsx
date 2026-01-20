import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = {
  Landing: undefined;
  Leaderboard: undefined;
};

type LandingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

const { width, height } = Dimensions.get('window');

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="flash" size={80} color={colors.accent.primary} style={styles.logo} />
          <Text style={styles.title}>RankQ</Text>
        </View>
        
        <Text style={styles.tagline}>
          Real-time competitive leaderboard
        </Text>
        
        <Text style={styles.description}>
          Track rankings, compete with millions, and climb to the top
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>View Leaderboard</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontFamily: typography.fonts.extrabold,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fonts.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fonts.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    maxWidth: 300,
  },
  button: {
    width: width * 0.7,
    maxWidth: 300,
  },
  buttonContent: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: colors.accent.secondary,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fonts.bold,
    color: colors.background.primary,
  },
});
