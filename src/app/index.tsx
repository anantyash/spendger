import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { migrateDbIfNeeded } from "../database/db";

export default function RootLayout() {
  return (
    // Initializes the local storage wrapper safely globally before rendering views
    <SQLiteProvider
      databaseName="spendger.db"
      onInit={migrateDbIfNeeded}
      useSuspense
    >
      <Suspense
        fallback={
          <View style={styles.loadingContainer}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#061A14", // Matches Spendger's dark theme
  },
});
