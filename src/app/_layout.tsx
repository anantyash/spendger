import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../database/db';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="spendger.db" onInit={migrateDbIfNeeded} useSuspense>
      <Suspense 
        fallback={
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F4F7F6' }}>
            <ActivityIndicator size="large" color="#00E676" />
          </View>
        }
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Suspense>
    </SQLiteProvider>
  );
}