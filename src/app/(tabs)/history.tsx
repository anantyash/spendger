import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type TransactionRow } from "../../database/db";
import { DbService } from "../../database/dbService";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Helper structure to pool data into logical time buckets
interface GroupedTransactions {
  title: string;
  data: TransactionRow[];
}

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  const [historyList, setHistoryList] = useState<GroupedTransactions[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  // Dynamic grouping logic to categorize transactions cleanly
  const organizeTransactionsByDate = (txs: TransactionRow[]) => {
    const todayGroup: TransactionRow[] = [];
    const yesterdayGroup: TransactionRow[] = [];
    const olderGroup: TransactionRow[] = [];
    let netOutflow = 0;

    txs.forEach((tx) => {
      // Calculate total expenditures
      if (tx.amount < 0) {
        netOutflow += Math.abs(tx.amount);
      }

      // Check current timestamp headers
      if (tx.timestamp.startsWith("Today")) {
        todayGroup.push(tx);
      } else if (tx.timestamp.startsWith("Yesterday")) {
        yesterdayGroup.push(tx);
      } else {
        olderGroup.push(tx);
      }
    });

    setTotalSpent(netOutflow);

    // Filter out completely empty timeframe groupings
    const buckets: GroupedTransactions[] = [];
    if (todayGroup.length > 0)
      buckets.push({ title: "Today", data: todayGroup });
    if (yesterdayGroup.length > 0)
      buckets.push({ title: "Yesterday", data: yesterdayGroup });
    if (olderGroup.length > 0)
      buckets.push({ title: "Older Spends", data: olderGroup });

    setHistoryList(buckets);
  };

  const loadHistoryLogs = async () => {
    try {
      // Query raw database list via clean service interface
      const rawRows = await DbService.getAllTransactions(db);
      organizeTransactionsByDate(rawRows);
    } catch (err) {
      console.error("History logging pipeline crash:", err);
    }
  };

  // Re-fetch ledger updates whenever the user navigates back to this screen
  useEffect(() => {
    loadHistoryLogs();
  }, [db]);

  const mapCategoryIcon = (category: string): IoniconsName => {
    switch (category.toLowerCase()) {
      case "food":
        return "fast-food-outline";
      case "groceries":
        return "cart-outline";
      case "transport":
        return "bus-outline";
      case "bills":
        return "receipt-outline";
      case "shopping":
        return "shirt-outline";
      case "leisure":
        return "tv-outline";
      default:
        return "wallet-outline";
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Total Statistics Board */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Passbook History</Text>
          <Text style={styles.subtext}>
            Track your historical money pipeline
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadHistoryLogs}
        >
          <Ionicons name="refresh-outline" size={20} color="#0D382B" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Outflow Stream</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Main Historical Logs List */}
      <FlatList
        data={historyList}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
        renderItem={({ item: group }) => (
          <View style={styles.groupContainer}>
            <Text style={styles.groupTimeHeader}>{group.title}</Text>

            {group.data.map((tx) => (
              <View key={tx.id.toString()} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={mapCategoryIcon(tx.category)}
                      size={20}
                      color="#0D382B"
                    />
                  </View>
                  <View>
                    <Text style={styles.txName}>{tx.name}</Text>
                    <Text style={styles.txCategoryTag}>{tx.category}</Text>
                  </View>
                </View>

                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount < 0 ? "#D32F2F" : "#0D382B" },
                    ]}
                  >
                    {tx.amount < 0
                      ? `- ₹${Math.abs(tx.amount)}`
                      : `₹${tx.amount}`}
                  </Text>
                  <Text style={styles.txMethodBadge}>{tx.method}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={48} color="#A3B8B0" />
            <Text style={styles.emptyText}>
              No historical records logged yet.
            </Text>
          </View>
        )}
      />
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
    paddingVertical: 12,
  },
  screenTitle: { fontSize: 22, fontWeight: "bold", color: "#0D382B" },
  subtext: { fontSize: 13, color: "#7F948C", marginTop: 2 },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5ECE9",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: "#0D382B",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: { color: "#FFF", fontSize: 26, fontWeight: "bold" },
  groupContainer: { marginBottom: 20 },
  groupTimeHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A5A54",
    marginHorizontal: 24,
    marginBottom: 10,
  },
  txRow: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5ECE9",
  },
  txLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F4F7F6",
    justifyContent: "center",
    alignItems: "center",
  },
  txName: { fontSize: 14, fontWeight: "700", color: "#0D382B" },
  txCategoryTag: { fontSize: 11, color: "#7F948C", marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontWeight: "bold" },
  txMethodBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4A5A54",
    marginTop: 3,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 10,
  },
  emptyText: { color: "#7F948C", fontSize: 14 },
});
