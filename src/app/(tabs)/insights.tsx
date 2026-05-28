import { Ionicons } from "@expo/vector-icons";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.brandText}>Spendger</Text>

        <TouchableOpacity style={styles.notificationCircle}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        <Text style={styles.text}>Soon to be coming...</Text>
        <Text style={styles.text}>AI Insights & Analytics Screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },

  bodyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F6",
  },
  text: { fontSize: 18, color: "#0D382B", fontWeight: "bold" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  brandText: { fontSize: 20, fontWeight: "bold", color: "#0D382B" },

  notificationCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5ECE9",
    justifyContent: "center",
    alignItems: "center",
  },
});
