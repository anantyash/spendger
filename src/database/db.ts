import { PaymentMethod, TransactionCategory } from "@/constants/enums";
import { type SQLiteDatabase } from "expo-sqlite";

export interface TransactionRow {
  id: number;
  name: string;
  amount: number;
  category: TransactionCategory;
  timestamp: string;
  method: PaymentMethod;
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // 1. Ensure WAL mode is active for performance
  await db.execAsync("PRAGMA journal_mode = WAL;");

  // 2. Clear old database tables ONLY in development mode
  if (__DEV__) {
    console.log("🛠️ Dev mode detected: Resetting database tables...");
    await dropTables(db);
  }

  // 3. Create tables if they don't exist
  await createTables(db);

  // 4. Seed default categories if they are missing
  await seedCategoriesOnly(db);
}

// ----------------------------------------------------
// 📦 Reusable SQL Execution Blocks
// ----------------------------------------------------

async function dropTables(db: SQLiteDatabase) {
  await db.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
  `);
}

async function createTables(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NULL,
      amount REAL NOT NULL,
      category TEXT DEFAULT '${TransactionCategory.OTHER}',
      timestamp TEXT NOT NULL,
      method TEXT DEFAULT '${PaymentMethod.UPI}'
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );
  `);
}

async function seedCategoriesOnly(db: SQLiteDatabase) {
  await db.execAsync(`
    INSERT OR IGNORE INTO categories (name, icon, color) VALUES 
     ('${TransactionCategory.FOOD}', 'fast-food-outline', '#FF9E80'),
     ('${TransactionCategory.GROCERIES}', 'cart-outline', '#FFD740'),
     ('${TransactionCategory.TRANSPORT}', 'bus-outline', '#82B1FF'),
     ('${TransactionCategory.RECHARGE}', 'laptop-outline', '#FF8A80'),
     ('${TransactionCategory.SHOPPING}', 'shirt-outline', '#B388FF'),
     ('${TransactionCategory.EDUCATION}', 'tv-outline', '#80D8FF'),
     ('${TransactionCategory.OTHER}', 'wallet-outline', '#CFD8DC');
  `);
}
