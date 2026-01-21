import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { LandingScreen } from '../screens/LandingScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { colors } from '../theme/colors';
import { trackPageView } from '../services/analytics';

export type RootStackParamList = {
  Landing: undefined;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: true,
        colors: {
          primary: colors.accent.primary,
          background: colors.background.primary,
          card: colors.background.secondary,
          text: colors.text.primary,
          border: colors.border.default,
          notification: colors.accent.primary,
        },
        fonts: {
          regular: { fontFamily: 'Montserrat_400Regular', fontWeight: '400' },
          medium: { fontFamily: 'Montserrat_500Medium', fontWeight: '500' },
          bold: { fontFamily: 'Montserrat_700Bold', fontWeight: '700' },
          heavy: { fontFamily: 'Montserrat_800ExtraBold', fontWeight: '900' },
        },
      }}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute?.()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute?.()?.name;

        if (previousRouteName !== currentRouteName) {
          // Track the page view with Vercel Analytics
          trackPageView(`/${currentRouteName || 'unknown'}`, currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
