import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalEntries: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalEntries,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  disabled = false,
}) => {
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  const isPreviousDisabled = disabled || currentPage === 1;
  const isNextDisabled = disabled || currentPage >= totalPages;

  return (
    <View style={styles.container}>
      {/* Page Size Selector */}
      <View style={styles.pageSizeContainer}>
        <Text style={styles.label}>Show:</Text>
        <View style={styles.pageSizeOptions}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Pressable
              key={size}
              style={[
                styles.pageSizeButton,
                pageSize === size && styles.pageSizeButtonActive,
              ]}
              onPress={() => onPageSizeChange(size)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.pageSizeText,
                  pageSize === size && styles.pageSizeTextActive,
                ]}
              >
                {size}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Entry Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Showing {startEntry}-{endEntry} of {totalEntries}
        </Text>
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <Pressable
          style={[
            styles.navButton,
            isPreviousDisabled && styles.navButtonDisabled,
          ]}
          onPress={onPreviousPage}
          disabled={isPreviousDisabled}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              isPreviousDisabled
                ? colors.text.disabled
                : colors.background.primary
            }
          />
          <Text
            style={[
              styles.navButtonText,
              isPreviousDisabled && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </Pressable>

        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>

        <Pressable
          style={[
            styles.navButton,
            isNextDisabled && styles.navButtonDisabled,
          ]}
          onPress={onNextPage}
          disabled={isNextDisabled}
        >
          <Text
            style={[
              styles.navButtonText,
              isNextDisabled && styles.navButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              isNextDisabled
                ? colors.text.disabled
                : colors.background.primary
            }
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  pageSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  pageSizeOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pageSizeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.secondary,
    minWidth: 40,
    alignItems: 'center',
  },
  pageSizeButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  pageSizeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  pageSizeTextActive: {
    color: colors.background.primary,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.primary,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: colors.accent.secondary, // Using darker green for depth
  },
  navButtonDisabled: {
    backgroundColor: colors.background.tertiary, // Grey background when disabled
    borderBottomColor: colors.border.subtle,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background.primary, // Dark text
  },
  navButtonTextDisabled: {
    color: colors.text.disabled,
  },
  pageInfo: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
