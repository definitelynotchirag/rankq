import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api/v1';
    }
    return 'http://localhost:8080/api/v1';
  }
  return 'https://api.rankq.com/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
  POLLING_INTERVAL: 300,
  DEBOUNCE_DELAY: 500,
};
