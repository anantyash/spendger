import { PaymentMethod, TransactionCategory } from "@/constants/enums";
import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type TransactionRow } from "../../database/db";
import { DbService, type CategoryRow } from "../../database/dbService"; // Import clean service engine

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function HomeScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  // App States
  const [dbSpends, setDbSpends] = useState<TransactionRow[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryRow[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // Modals visibility toggles
  const [isTxModalVisible, setIsTxModalVisible] = useState(false);

  // const [isCatModalVisible, setIsCatModalVisible] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form Input States
  const [txName, setTxName] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>(
    TransactionCategory.OTHER,
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );

  // const [newCatName, setNewCatName] = useState("");
  // Re-usable presentation sync interface
  const loadAppData = async () => {
    try {
      const transactions = await DbService.getAllTransactions(db);
      const categories = await DbService.getAllCategories(db);

      // console.log("Trans: ", transactions);

      setDbSpends(transactions);
      setDbCategories(categories);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 💸 Accurate production-grade filter
      const monthlySpendSum = transactions.reduce((sum, tx) => {
        if (tx.amount >= 0) return sum;

        const txDate = new Date(tx.timestamp); // Parses ISO string cleanly

        const isCurrentMonth =
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear;

        return isCurrentMonth ? sum + Math.abs(tx.amount) : sum;
      }, 0);

      setTotalBalance(monthlySpendSum);
    } catch (error) {
      console.error("Presentation mapping error layout breakdown:", error);
    }
  };

  useEffect(() => {
    // If the expo-sqlite context provider isn't ready or is null,
    // bail out early to prevent firing a premature empty query!

    if (!db) {
      console.log("⏳ SQLite context hook is warming up, delaying fetch...");
      return;
    }

    console.log(
      "⚡ Database context is fully active! Syncing application data...",
    );
    loadAppData();
  }, [db]);

  const handleAddTransaction = async () => {
    // 1. Fallback to category if name is empty, using a synchronous variable
    const finalTxName = txName.trim() ? txName.trim() : selectedCategory;

    // 2. Validate using our final name variable and the amount text
    if (!finalTxName || !txAmount.trim()) {
      Alert.alert(
        "Fields missing",
        "Merchant name and transaction totals are mandatory.",
      );
      return;
    }

    const parsedAmount = parseFloat(txAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        "Invalid Input",
        "Please state a logical base transaction digit.",
      );
      return;
    }

    try {
      // 3. Pass the clean, evaluated name to your database service
      await DbService.addTransaction(
        db,
        finalTxName,
        -parsedAmount,
        selectedCategory,
        paymentMethod,
      );

      // 4. Reset states cleanly
      setTxName("");
      setTxAmount("");
      setIsTxModalVisible(false);
      setIsDropdownOpen(false); // Clean up dropdown state too if it was open
      await loadAppData();
    } catch (error) {
      console.log("Saving Error", error);
      Alert.alert("Error", "Could not complete save operation.");
    }
  };

  const formatDisplayTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();

      // Reset clock details to compute absolute calendar day offsets
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
      };
      const formattedTime = date.toLocaleTimeString("en-US", timeOptions);
      // console.log("Time:", formattedTime);
      if (date >= startOfToday) {
        return `${formattedTime}`;
      } else if (date >= startOfYesterday) {
        return `Yesterday, ${formattedTime}`;
      } else {
        // Return clear compact date representation for older entries (e.g., "12 Oct, 2025")
        const dateOptions: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "short",
          year: "numeric",
        };
        return date.toLocaleDateString("en-IN", dateOptions);
      }
    } catch (e) {
      return "Unknown date";
    }
  };

  // Keep your style definitions and render markup exactly the same...
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Brand Header */}

      <View style={styles.header}>
        <Text style={styles.brandText}>Spendger</Text>

        <TouchableOpacity
          style={styles.notificationCircle}
          onPress={() => loadAppData()}
        >
          <Ionicons name="notifications-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Primary virtual scroll interface handling complete layout elements */}

      <FlatList
        data={dbSpends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const matchingCategory = dbCategories.find(
            (c) => c.name === item.category,
          );

          const iconName = (matchingCategory?.icon ||
            "wallet-outline") as IoniconsName;

          return (
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={styles.txIconContainer}>
                  <Ionicons name={iconName} size={22} color="#00A86B" />
                </View>

                <View>
                  <Text style={styles.txName}>{item.name}</Text>

                  <View
                    style={{ display: "flex", flexDirection: "row", gap: "2" }}
                  >
                    <Text style={styles.txTime}>{item.category},</Text>

                    <Text style={styles.txTime}>
                      {formatDisplayTimestamp(item.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,

                    { color: item.amount < 0 ? "#D32F2F" : "#0D382B" },
                  ]}
                >
                  {item.amount < 0
                    ? `- ₹${Math.abs(item.amount)}`
                    : `₹${item.amount}`}
                </Text>

                <Text style={styles.txMethod}>{item.method}</Text>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.balanceCard}>
              {/* The dominant header shows exactly what the calculated scope is */}

              <Text style={styles.balanceLabel}>This Month's Spending</Text>

              <Text style={styles.balanceAmount}>
                ₹
                {totalBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>

              {/* Clean informative meta-badge text replacing the repeat sentence */}

              <View style={styles.trendBadge}>
                <Ionicons name="calendar-outline" size={14} color="#00A86B" />

                <Text style={styles.trendText}>Auto-resets next month</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>

            {/* Dynamic Local DB-driven category list widget */}

            <FlatList
              horizontal
              data={dbCategories}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    selectedCategory === item.name &&
                      styles.categoryCardSelected,
                  ]}
                  onPress={() =>
                    setSelectedCategory(item.name as TransactionCategory)
                  }
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: item.color + "22" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as IoniconsName}
                      size={22}
                      color={item.color}
                    />
                  </View>

                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Spends</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={44} color="#A3B8B0" />
            <Text style={styles.emptyText}>No recent spends recorded</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 100) }}
      />

      {/* FAB Launcher */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsTxModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* MODAL 1: ADD TRANSACTION SHEET */}

      <Modal visible={isTxModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Spend</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsTxModalVisible(false);
                  setIsDropdownOpen(false); // Close dropdown if modal closes
                }}
              >
                <Ionicons name="close-circle" size={26} color="#A3B8B0" />
              </TouchableOpacity>
            </View>

            {/* Input Field: Merchant Name */}
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Subway Wrap"
              placeholderTextColor="#A3B8B0"
              value={txName}
              onChangeText={setTxName}
            />

            {/* Input Field: Amount */}

            <Text style={styles.inputLabel}>Amount (₹)</Text>

            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#A3B8B0"
              keyboardType="numeric"
              value={txAmount}
              onChangeText={setTxAmount}
            />
            {/* Payment Method Selector Segment */}
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.methodContainer}>
              {Object.values(PaymentMethod).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodSegment,

                    paymentMethod === method && styles.methodSegmentActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name={
                      method === PaymentMethod.UPI
                        ? "qr-code-outline"
                        : "card-outline"
                    }
                    size={16}
                    color={paymentMethod === method ? "#FFFFFF" : "#0D382B"}
                  />

                  <Text
                    style={[
                      styles.methodSegmentText,
                      paymentMethod === method &&
                        styles.methodSegmentTextActive,
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dropdown Header Selector Row */}
            <View style={styles.dropdownLabelContainer}>
              <Text style={styles.inputLabel}>Select Category</Text>
            </View>

            {/* The Dynamic Dropdown Trigger Button */}
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                Keyboard.dismiss();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownTriggerText}>
                {selectedCategory || "Choose a category"}
              </Text>
              <Ionicons
                name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#0D382B"
              />
            </TouchableOpacity>

            {/* Dropdown Items Expansion Panel */}
            {isDropdownOpen && (
              <View style={styles.dropdownMenuContainer}>
                <FlatList
                  data={dbCategories}
                  keyExtractor={(item) => item.id.toString()}
                  nestedScrollEnabled={true} // Permits smooth scrolling inside the modal view
                  style={styles.dropdownList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        selectedCategory === item.name &&
                          styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedCategory(item.name as TransactionCategory);
                        setIsDropdownOpen(false); // Close menu automatically on item press
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={item.color}
                        />
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedCategory === item.name &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </View>
                      {selectedCategory === item.name && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#00B56C"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Action Submit Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { marginTop: isDropdownOpen ? 16 : 28 },
              ]}
              onPress={handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>Save Expense Log</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },

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

  balanceCard: {
    backgroundColor: "#00B56C",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },

  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },

  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 12,
  },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  trendText: {
    fontSize: 11,
    color: "#FFF",
    marginLeft: 4,
    fontWeight: "500",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 10,
  },

  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#0D382B" },

  viewAllText: { color: "#00A86B", fontSize: 13, fontWeight: "600" },

  categoryContainer: { paddingLeft: 20, paddingRight: 6, marginBottom: 24 },

  categoryCard: {
    backgroundColor: "#FFF",
    width: 96,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryCardSelected: { borderColor: "#00B56C", borderWidth: 2 },

  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D382B",
    textAlign: "center",
  },

  txRow: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  txLeft: { flexDirection: "row", alignItems: "center" },

  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  txName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0D382B",
    marginBottom: 3,
  },

  txTime: { fontSize: 11, color: "#7F948C" },

  txRight: { alignItems: "flex-end" },

  txAmount: { fontSize: 15, fontWeight: "bold", marginBottom: 3 },

  txMethod: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#00A86B",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyText: { fontSize: 14, color: "#7F948C" },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#05291E",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 21, 16, 0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0D382B" },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5A54",
    marginBottom: 6,
    marginTop: 12,
  },

  dropdownLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 6,
  },
  createNewCategoryLink: {
    color: "#00A86B",
    fontSize: 12,
    fontWeight: "600",
  },
  dropdownTrigger: {
    backgroundColor: "#F4F7F6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECE9",
  },
  dropdownTriggerText: {
    fontSize: 15,
    color: "#0D382B",
    fontWeight: "500",
  },
  dropdownMenuContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5ECE9",
    maxHeight: 160, // Restricts size and turns on scrolling when list gets long
    overflow: "hidden",
    // Drop shadow styling
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dropdownList: {
    paddingHorizontal: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },

  dropdownItemActive: {
    backgroundColor: "#F4F7F6",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#4A5A54",
  },

  dropdownItemTextActive: {
    color: "#0D382B",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F4F7F6",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0D382B",
  },

  saveButton: {
    backgroundColor: "#00B56C",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  methodContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F4F2", // soft tinted gray-green background
    borderRadius: 8,
    padding: 4,
    marginBottom: 0,
    gap: 4,
  },
  methodSegment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  methodSegmentActive: {
    backgroundColor: "#0D382B", // active button filled accent
  },
  methodSegmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D382B",
  },
  methodSegmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
