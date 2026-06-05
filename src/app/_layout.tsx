import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import * as SQLite from "expo-sqlite"; // 👈 Import base SQLite tool
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
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

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"(auth)" | "(tabs)">(
    "(auth)",
  );
  const router = useRouter();
  const pathname = usePathname();
  const didNavigateRef = useRef(false);

  // 🛡️ Run initialization safely in a controlled useEffect hook
  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Open the DB connection with Android crash protections
        const db = await SQLite.openDatabaseAsync("spendger.db", {
          useNewConnection: true, // Prevents Android NullPointer pointer conflicts
        });

        // 2. Safely run migrations
        await migrateDbIfNeeded(db);

        // 3. Check auth state
        const hasSeenWelcome = await SecureStore.getItemAsync("hasSeenWelcome");
        if (hasSeenWelcome === "true") {
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("(auth)");
        }

        // 4. Premium brand pause
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error("Initialization Failed: ", error);
      } finally {
        setDbReady(true);
      }
    }

    initializeApp();
  }, []); // 👈 Hard guarantee: Runs exactly ONCE on app launch

  // Handle routing redirects once ready
  useEffect(() => {
    if (!dbReady || didNavigateRef.current) return;

    SplashScreen.hideAsync().catch(() => {});

    if (initialRoute === "(tabs)" && pathname === "/") {
      const timer = setTimeout(() => {
        didNavigateRef.current = true;
        router.replace("/(tabs)/home");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dbReady, initialRoute, pathname, router]);

  // Render Loading Splash View
  if (!dbReady) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#E6F9F2" />
        <View style={styles.splashContainer}>
          <View style={{ height: 60 }} />
          <View style={styles.centerContent}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.titleText}>Spendger</Text>
            <Text style={styles.taglineText}>FINTECH FUTURISM</Text>
            <ActivityIndicator
              size="small"
              color="#00A86B"
              style={{ marginTop: 24 }}
            />
          </View>
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
      </SafeAreaProvider>
    );
  }

  // Render Core Application once DB & Logic are finalized
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F9F2" />
      <SQLiteProvider databaseName="spendger.db">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
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
  centerContent: { alignItems: "center", justifyContent: "center" },
  logo: { width: 140, height: 140, marginBottom: 16 },
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
  secureText: { fontSize: 12, fontWeight: "600", color: "#3A4D44" },
});
