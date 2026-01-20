import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface SimulationConfig {
  interval_ms: number;
  updates_per_tick: number;
}

interface SimulationConfigModalProps {
  visible: boolean;
  onConfirm: (config: SimulationConfig) => void;
  onCancel: () => void;
}

export const SimulationConfigModal: React.FC<SimulationConfigModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const [intervalMs, setIntervalMs] = useState('1000');
  const [updatesPerTick, setUpdatesPerTick] = useState('5');

  const handleConfirm = () => {
    const config: SimulationConfig = {
      interval_ms: parseInt(intervalMs) || 1000,
      updates_per_tick: parseInt(updatesPerTick) || 5,
    };
    onConfirm(config);
  };

  const handleCancel = () => {
    // Reset to defaults
    setIntervalMs('1000');
    setUpdatesPerTick('5');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Simulation Config</Text>
          <Text style={styles.subtitle}>Configure simulation parameters</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Interval (ms)</Text>
            <TextInput
              style={styles.input}
              value={intervalMs}
              onChangeText={setIntervalMs}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.hint}>Time between simulation updates</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Updates Per Tick</Text>
            <TextInput
              style={styles.input}
              value={updatesPerTick}
              onChangeText={setUpdatesPerTick}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.hint}>Number of updates per interval</Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Start</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fonts.semibold,
    color: colors.text.secondary,
  },
  confirmButton: {
    backgroundColor: colors.accent.primary,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fonts.semibold,
    color: colors.background.primary,
  },
});
