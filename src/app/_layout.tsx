import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
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

  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Check auth state via SecureStore
        const hasSeenWelcome = await SecureStore.getItemAsync("hasSeenWelcome");
        console.log("Has Seen: ", hasSeenWelcome);
        if (hasSeenWelcome === "true") {
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("(auth)");
        }

        // 2. Premium brand pause (gives database a second to settle in the provider)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error("Initialization Failed: ", error);
      } finally {
        setDbReady(true);
      }
    }

    initializeApp();
  }, []);

  // Handle routing redirects once ready
  useEffect(() => {
    if (!dbReady || didNavigateRef.current) return;

    SplashScreen.hideAsync().catch(() => {});

    // If they are logged in, swap out the root path for the home dashboard immediately
    if (initialRoute === "(tabs)" && pathname === "/") {
      didNavigateRef.current = true;
      router.replace("/(tabs)/home");
    }
  }, [dbReady, initialRoute, pathname, router]);

  // Render Your Beautiful Custom Loading Splash View while initializing
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

  // SINGLE, UNIFIED APPLICATION WRAPPER
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F9F2" />
      {/* The single database provider runs your migrations natively here */}
      <SQLiteProvider
        databaseName="spendger.db"
        onInit={migrateDbIfNeeded}
        onError={(err) => console.error("Database boot error: ", err)}
      >
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
    justifyContent: "space-between",
    backgroundColor: "#E6F9F2",
  },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120 },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#061A14",
    marginTop: 16,
  },
  taglineText: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#00A86B",
    marginTop: 4,
  },
  bottomContainer: { alignItems: "center", marginBottom: 36 },
  decorativeLine: {
    width: 40,
    height: 2,
    backgroundColor: "#00A86B",
    marginBottom: 16,
  },
  secureBadge: { flexDirection: "row", alignItems: "center" },
  secureText: { fontSize: 12, color: "#061A14" },
});
