import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
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

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface CategoryRow {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export default function HomeScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  // App States
  const [dbSpends, setDbSpends] = useState<TransactionRow[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryRow[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // Modals visibility toggles
  const [isTxModalVisible, setIsTxModalVisible] = useState(false);
  const [isCatModalVisible, setIsCatModalVisible] = useState(false);

  // Form Input States
  const [txName, setTxName] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [newCatName, setNewCatName] = useState("");

  // Re-usable dynamic database fetch pipeline
  const loadAppData = async () => {
    try {
      // Fetch Transactions
      const allRows = await db.getAllAsync<TransactionRow>(
        "SELECT * FROM transactions ORDER BY id DESC",
      );
      setDbSpends(allRows);

      // Calculate active dynamic sum balance
      const calculatedSum = allRows.reduce((sum, tx) => sum + tx.amount, 0);
      setTotalBalance(calculatedSum);

      // Fetch dynamic custom category cards
      const allCats = await db.getAllAsync<CategoryRow>(
        "SELECT * FROM categories ORDER BY id ASC",
      );
      setDbCategories(allCats);
    } catch (error) {
      console.error("Database fetch runtime breakdown:", error);
    }
  };

  useEffect(() => {
    loadAppData();
  }, [db]);

  // Handle building brand new system categories dynamically
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert(
        "Empty Title",
        "Please type a name for your new custom category.",
      );
      return;
    }

    try {
      // Insert with a default vibrant color asset assignment rule
      await db.runAsync(
        "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?);",
        [newCatName.trim(), "wallet-outline", "#B0BEC5"],
      );

      Alert.alert("Success", `Category "${newCatName.trim()}" created!`);
      setSelectedCategory(newCatName.trim()); // Auto-select it
      setNewCatName("");
      setIsCatModalVisible(false);
      await loadAppData(); // Live reload carousel view metrics
    } catch (error) {
      Alert.alert(
        "Duplicate Blocked",
        "A category with that name already exists.",
      );
    }
  };

  // Submit manual transaction logic
  const handleAddTransaction = async () => {
    if (!txName.trim() || !txAmount.trim()) {
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
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
      };
      const timeString = `Today, ${new Date().toLocaleTimeString("en-US", options)}`;

      await db.runAsync(
        "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
        [txName.trim(), parsedAmount, selectedCategory, timeString, "Manual"],
      );

      setTxName("");
      setTxAmount("");
      setIsTxModalVisible(false);
      await loadAppData();
    } catch (error) {
      Alert.alert("Error", "Could not complete save operation.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandText}>Spendger</Text>
        <TouchableOpacity style={styles.notificationCircle}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Primary virtual scroll interface handling complete layout elements */}
      <FlatList
        data={dbSpends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={styles.txLeft}>
              <View style={styles.txIconContainer}>
                <Ionicons
                  name={
                    (item.category === "Food"
                      ? "fast-food-outline"
                      : item.category === "Tech"
                        ? "laptop-outline"
                        : item.category === "Travel"
                          ? "airplane-outline"
                          : item.category === "Leisure"
                            ? "tv-outline"
                            : "wallet-outline") as IoniconsName
                  }
                  size={22}
                  color="#00A86B"
                />
              </View>
              <View>
                <Text style={styles.txName}>{item.name}</Text>
                <Text style={styles.txTime}>{item.timestamp}</Text>
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
        )}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>
                ₹
                {totalBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <View style={styles.trendBadge}>
                <Ionicons name="sync-outline" size={14} color="#00A86B" />
                <Text style={styles.trendText}>
                  Dynamic local ledger synced
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setIsCatModalVisible(true)}>
                <Text style={styles.viewAllText}>+ Create New</Text>
              </TouchableOpacity>
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
                  onPress={() => setSelectedCategory(item.name)}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Spend</Text>
              <TouchableOpacity onPress={() => setIsTxModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#A3B8B0" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Merchant / Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Subway Wrap"
              placeholderTextColor="#A3B8B0"
              value={txName}
              onChangeText={setTxName}
            />

            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#A3B8B0"
              keyboardType="numeric"
              value={txAmount}
              onChangeText={setTxAmount}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 14,
              }}
            >
              <Text style={styles.inputLabel}>
                Selected Category:{" "}
                <Text style={{ color: "#00B56C" }}>{selectedCategory}</Text>
              </Text>
              <TouchableOpacity onPress={() => setIsCatModalVisible(true)}>
                <Text
                  style={{ color: "#00A86B", fontSize: 12, fontWeight: "600" }}
                >
                  + New Category
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>Save Expense Log</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2: NESTED CREATE CATEGORY PROMPT */}
      <Modal visible={isCatModalVisible} animationType="fade" transparent>
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              paddingHorizontal: 30,
            },
          ]}
        >
          <View style={[styles.modalContent, { borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
              Create Custom Category
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g., Subscriptions, Gym"
              placeholderTextColor="#A3B8B0"
              value={newCatName}
              onChangeText={setNewCatName}
              maxLength={15}
            />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { flex: 1, backgroundColor: "#E5ECE9" },
                ]}
                onPress={() => setIsCatModalVisible(false)}
              >
                <Text style={{ color: "#4A5A54", fontWeight: "700" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginTop: 0 }]}
                onPress={handleCreateCategory}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  trendText: { fontSize: 11, color: "#FFF", marginLeft: 4, fontWeight: "500" },
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
});
