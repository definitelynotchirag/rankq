import { withSpring, withTiming } from 'react-native-reanimated';

export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const timingConfig = {
  duration: 300,
};

export const fadeInConfig = {
  duration: 400,
};

export const scaleConfig = {
  damping: 12,
  stiffness: 200,
};

export const animateValue = (value: number, config = springConfig) => {
  'worklet';
  return withSpring(value, config);
};

export const animateValueTiming = (value: number, config = timingConfig) => {
  'worklet';
  return withTiming(value, config);
};
