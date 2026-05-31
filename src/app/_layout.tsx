import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { migrateDbIfNeeded } from "../database/db";

// Keep the native splash screen locked until our custom layout takes over
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"(auth)" | "(tabs)">(
    "(auth)",
  );
  const router = useRouter();

  useEffect(() => {
    if (dbReady) {
      // Hide the native background screen completely
      SplashScreen.hideAsync().catch(() => {});

      // ✅ FIX THE CRASH: Delay navigation until the next JavaScript execution cycle
      // This gives the Expo Router context time to safely initialize and mount.
      if (initialRoute === "(tabs)") {
        const timer = setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [dbReady, initialRoute]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F9F2" />

      <SQLiteProvider
        databaseName="spendger.db"
        onInit={async (db) => {
          try {
            // Run your database configuration & tables setup
            await migrateDbIfNeeded(db);

            // 🔐 SecureStore Implementation
            const hasSeenWelcome =
              await SecureStore.getItemAsync("hasSeenWelcome");

            if (hasSeenWelcome === "true") {
              setInitialRoute("(tabs)"); // Existing User -> Direct to Dashboard
            } else {
              setInitialRoute("(auth)"); // New User -> Direct to Welcome Onboarding
            }

            // Give it 1.5 seconds so users can experience the premium branding layout
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } catch (error) {
            console.error("Database Migration Failed: ", error);
          } finally {
            setDbReady(true);
          }
        }}
      >
        {!dbReady ? (
          /* Custom Splash Layout cloned directly from image_954438.png */
          <View style={styles.splashContainer}>
            {/* Top Empty Space to Balance Center Content */}
            <View style={{ height: 60 }} />

            {/* Central Branding Elements */}
            <View style={styles.centerContent}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>Spendger</Text>
              <Text style={styles.taglineText}>FINTECH FUTURISM</Text>

              {/* Subtle loading spinner to let users know it's initializing */}
              <ActivityIndicator
                size="small"
                color="#00A86B"
                style={{ marginTop: 24 }}
              />
            </View>

            {/* Bottom Security Badging & Accents */}
            <View style={styles.bottomContainer}>
              <View style={styles.decorativeLine} />
              <View style={styles.secureBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#00A86B"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.secureText}>Secure & Encrypted</Text>
              </View>
            </View>
          </View>
        ) : (
          /* Core App Navigation Screens once active */
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        )}
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#E6F9F2",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#006B46",
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A8C85",
    letterSpacing: 3,
    marginTop: 4,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  decorativeLine: {
    width: 160,
    height: 3,
    backgroundColor: "#00E676",
    borderRadius: 2,
    marginBottom: 24,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 168, 107, 0.06)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 168, 107, 0.12)",
  },
  secureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3A4D44",
  },
});
