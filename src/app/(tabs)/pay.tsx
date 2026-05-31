import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PayScreen() {
  const insets = useSafeAreaInsets();
  const [displayValue, setDisplayValue] = useState("0");

  // Handle calculator button presses
  const handlePress = (value: string) => {
    if (value === "C") {
      setDisplayValue("0");
    } else if (value === "⌫") {
      setDisplayValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else {
      setDisplayValue((prev) => (prev === "0" ? value : prev + value));
    }
  };

  // Evaluate simple expressions safely without eval()
  const calculateResult = () => {
    try {
      const sanitized = displayValue.replace(/×/g, "*").replace(/÷/g, "/");
      const result = new Function(`return ${sanitized}`)();
      setDisplayValue(Number(result).toFixed(2).replace(/\.00$/, ""));
    } catch (error) {
      Alert.alert("Math Error", "Invalid calculation expression");
    }
  };

  // Triggers the device's native UPI apps
  const handleUPIPayment = () => {
    const finalAmount = parseFloat(displayValue);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than ₹0",
      );

      return;
    }

    Alert.alert("Not Activated", `Soon to be Activated !`);
    setDisplayValue("0");
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      {/* Header section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calculator + Pay</Text>
        <Text style={styles.headerSubtitle}>
          Run your math and pay instantly
        </Text>
      </View>

      {/* Calculator Display Panel */}
      <View style={styles.displayContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {displayValue}
        </Text>
      </View>

      {/* Grid Keyboard Layout */}
      <View style={styles.keyboardContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("C")}
          >
            <Text style={[styles.buttonText, styles.actionText]}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("÷")}
          >
            <Text style={[styles.buttonText, styles.actionText]}>÷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("×")}
          >
            <Text style={[styles.buttonText, styles.actionText]}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("⌫")}
          >
            <Ionicons name="backspace-outline" size={24} color="#00A86B" />
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          {[7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.button}
              onPress={() => handlePress(num.toString())}
            >
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("-")}
          >
            <Text style={[styles.buttonText, styles.actionText]}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          {[4, 5, 6].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.button}
              onPress={() => handlePress(num.toString())}
            >
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={() => handlePress("+")}
          >
            <Text style={[styles.buttonText, styles.actionText]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <View style={styles.bottomRowLeft}>
            <View style={styles.row}>
              {[1, 2, 3].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.button}
                  onPress={() => handlePress(num.toString())}
                >
                  <Text style={styles.buttonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, { flex: 2 }]}
                onPress={() => handlePress("0")}
              >
                <Text style={styles.buttonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(".")}
              >
                <Text style={styles.buttonText}>.</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Large Equals Trigger */}
          <TouchableOpacity
            style={[styles.button, styles.equalsButton]}
            onPress={calculateResult}
          >
            <Text style={[styles.buttonText, { color: "#FFF" }]}>=</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main UPI Pay Call-to-Action */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={handleUPIPayment}
        >
          <Ionicons
            name="flash"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.payButtonText}>Pay via Any UPI App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6", // Light slate gray background canvas
    justifyContent: "space-between",
  },
  header: { paddingHorizontal: 24, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#0D382B" },
  headerSubtitle: { fontSize: 13, color: "#7F948C", marginTop: 4 },
  displayContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingHorizontal: 32,
    marginVertical: 20,
  },
  currencySymbol: {
    fontSize: 36,
    color: "#00A86B", // Clean primary brand emerald accent
    fontWeight: "400",
    marginRight: 8,
    bottom: 8,
  },
  displayText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#0D382B", // Crisp deep text readability
    textAlign: "right",
  },
  keyboardContainer: { paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: "row", gap: 12, flexShrink: 1 },
  bottomRowLeft: { flex: 3, gap: 12 },
  button: {
    flex: 1,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#FFFFFF", // Clean stark button cards
    justifyContent: "center",
    alignItems: "center",
    // Premium soft drop shadows for elevated look on light canvas
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E5ECE9",
  },
  actionButton: {
    backgroundColor: "#E8F5E9", // Mild translucent green tint for operators
    borderColor: "#C8E6C9",
  },
  equalsButton: {
    backgroundColor: "#00B56C", // Primary solid brand color
    borderColor: "#00A86B",
    height: "auto",
    flex: 1,
    marginVertical: 1,
  },
  buttonText: { fontSize: 22, fontWeight: "600", color: "#0D382B" },
  actionText: { color: "#00A86B" },
  footer: { paddingHorizontal: 24, marginTop: 20 },
  payButton: {
    backgroundColor: "#05291E", // Dark signature green layout button matching FAB
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
