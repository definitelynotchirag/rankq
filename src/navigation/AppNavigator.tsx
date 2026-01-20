import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LandingScreen } from '../screens/LandingScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Landing: undefined;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
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
