import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* 1. Custom Branding Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.glowRadial} />
        <View style={styles.logoShapeWrapper}>
          <Ionicons
            name="infinite"
            size={90}
            color="#00E676"
            style={styles.mainLogoIcon}
          />
          <View style={styles.logoInterlaceSlash} />
        </View>
      </View>

      {/* 2. Typography Block aligned with Product Summary */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Effortless Expense{"\n"}Tracking.</Text>
        <Text style={styles.subtitle}>
          Spendger automatically records your UPI payments from GPay, PhonePe,
          and Paytm in the background. No manual entry required.
        </Text>
      </View>

      {/* 3. Feature Information Cards aligned with Product Summary */}
      <View style={styles.featureGrid}>
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sync-outline" size={18} color="#00E676" />
          </View>
          <Text style={styles.featureTitle}>Auto UPI Sync</Text>
          <Text style={styles.featureDesc}>Background Tracking</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="calculator-outline" size={18} color="#00E676" />
          </View>
          <Text style={styles.featureTitle}>Calculate & Pay</Text>
          <Text style={styles.featureDesc}>Split, Math & Pay</Text>
        </View>
      </View>

      {/* 4. Interactive Call-To-Action Layout Footer */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons
            name="arrow-forward"
            size={22}
            color="#061A14"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          100% secure, local-first storage. Start for free.
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badgeItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#465c54"
            />
            <Text style={styles.badgeText}>SECURE & LOCAL</Text>
          </View>
          <View style={styles.badgeItem}>
            <Ionicons name="flash-outline" size={14} color="#465c54" />
            <Text style={styles.badgeText}>AUTOMATIC</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#051510",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  logoContainer: {
    flex: 1.3,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  glowRadial: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#00E676",
    opacity: 0.12,
  },
  logoShapeWrapper: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  mainLogoIcon: {
    transform: [{ rotate: "-45deg" }],
  },
  logoInterlaceSlash: {
    position: "absolute",
    width: 6,
    height: 75,
    backgroundColor: "#051510",
    transform: [{ rotate: "15deg" }],
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14.5,
    color: "#839990",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featureGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#081d16",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0f2e24",
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 230, 118, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#5A756C",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#00E676",
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  buttonText: {
    color: "#061A14",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonIcon: {
    marginLeft: 6,
    top: 0.5,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#465c54",
    marginBottom: 36,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#465c54",
    letterSpacing: 0.5,
  },
});
