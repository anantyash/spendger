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
      // Basic sanitize and evaluation matching split/math operators
      const sanitized = displayValue.replace(/×/g, "*").replace(/÷/g, "/");
      // Using Function constructor as a safer simple math parser fallback
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

    // Placeholder trigger representing intent transfer to installed apps (GPay/PhonePe/Paytm)
    Alert.alert(
      "Launching UPI Ecosystem",
      `Processing Request for ₹${finalAmount}\nOpening system payment sheet...`,
    );
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
            <Ionicons name="backspace-outline" size={24} color="#00E676" />
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
            <Text style={[styles.buttonText, { color: "#061A14" }]}>=</Text>
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
            color="#061A14"
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
    backgroundColor: "#061A14",
    justifyContent: "space-between",
  },
  header: { paddingHorizontal: 24, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "#657D74", marginTop: 4 },
  displayContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingHorizontal: 32,
    marginVertical: 20,
  },
  currencySymbol: {
    fontSize: 36,
    color: "#00E676",
    fontWeight: "300",
    marginRight: 8,
    bottom: 8,
  },
  displayText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "right",
  },
  keyboardContainer: { paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: "row", gap: 12, flexShrink: 1 },
  bottomRowLeft: { flex: 3, gap: 12 },
  button: {
    flex: 1,
    height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "rgba(0, 230, 118, 0.05)",
    borderColor: "rgba(0, 230, 118, 0.1)",
  },
  equalsButton: {
    backgroundColor: "#00E676",
    height: "auto",
    flex: 1,
    marginVertical: 1,
  },
  buttonText: { fontSize: 22, fontWeight: "600", color: "#FFFFFF" },
  actionText: { color: "#00E676" },
  footer: { paddingHorizontal: 24, marginTop: 20 },
  payButton: {
    backgroundColor: "#00E676",
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: { color: "#061A14", fontSize: 16, fontWeight: "700" },
});
