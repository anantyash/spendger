import { type SQLiteDatabase } from "expo-sqlite";
import { type TransactionRow } from "./db";

export interface CategoryRow {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// 📦 A centralized engine for all database CRUD interactions
export const DbService = {
  // 1. Fetch all raw transaction logs
  async getAllTransactions(db: SQLiteDatabase): Promise<TransactionRow[]> {
    return await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY id DESC",
    );
  },

  // 2. Fetch all system categories
  async getAllCategories(db: SQLiteDatabase): Promise<CategoryRow[]> {
    return await db.getAllAsync<CategoryRow>(
      "SELECT * FROM categories ORDER BY id ASC",
    );
  },

  // 3. Add a new manual spend transaction row
  async addTransaction(
    db: SQLiteDatabase,
    name: string,
    amount: number,
    category: string,
  ): Promise<void> {
    // 🌐 Production Standard: Store UTC ISO string (e.g., "2026-05-29T18:30:00.000Z")
    const isoTimestamp = new Date().toISOString();

    await db.runAsync(
      "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
      [name, amount, category, isoTimestamp, "Manual"],
    );
  },

  // 4. Create a custom category type item
  async createCategory(db: SQLiteDatabase, name: string): Promise<void> {
    await db.runAsync(
      "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?);",
      [name, "wallet-outline", "#B0BEC5"],
    );
  },
};
