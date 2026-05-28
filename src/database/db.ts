import { type SQLiteDatabase } from "expo-sqlite";

export interface TransactionRow {
  id: number;
  name: string;
  amount: number;
  category: string;
  timestamp: string;
  method: string;
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // ----------------------------------------------------
  // 🧪 1. DEVELOPMENT MODE: Auto-wipe on reload
  // ----------------------------------------------------
  if (__DEV__) {
    console.log(
      "🛠️ DEV MODE DETECTED: Wiping and resetting database tables...",
    );

    // Drop existing tables so schema modifications happen instantly
    await db.execAsync(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS categories;
    `);

    // Recreate fresh schemas instantly
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await createTables(db);
    await seedDefaultData(db);

    // Set user version to maximum so production migrations don't misfire in dev
    await db.execAsync("PRAGMA user_version = 2;");
    console.log("✅ Dev Reset Complete!");
    return; // Stop here during development
  }

  // ----------------------------------------------------
  // 🚀 2. PRODUCTION MODE: Safe Incremental Migrations
  // ----------------------------------------------------
  const PRODUCTION_DATABASE_VERSION = 2;

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= PRODUCTION_DATABASE_VERSION) return;

  // Fresh Install on user's phone (Version 0 -> 1)
  if (currentDbVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await createTables(db);
    currentDbVersion = 1;
    await db.execAsync("PRAGMA user_version = 1;");
  }

  // App Update on user's phone (Version 1 -> 2: Seeding daily life categories)
  if (currentDbVersion === 1) {
    console.log("🚀 PRODUCTION MIGRATION: Upgrading user schema to V2...");

    // Safely refresh categories without wiping user transactions
    await db.execAsync("DELETE FROM categories;");
    await seedCategoriesOnly(db);

    await db.execAsync(`PRAGMA user_version = ${PRODUCTION_DATABASE_VERSION};`);
    console.log("✅ Production Migration to V2 Successful!");
  }
}

// ----------------------------------------------------
// 📦 Reusable SQL Execution Blocks
// ----------------------------------------------------

async function createTables(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NULL,
      amount REAL NOT NULL,
      category TEXT DEFAULT 'Uncategorized',
      timestamp TEXT NOT NULL,
      method TEXT DEFAULT 'UPI'
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
    ('Food', 'fast-food-outline', '#FF9E80'),
    ('Groceries', 'cart-outline', '#FFD740'),
    ('Transport', 'bus-outline', '#82B1FF'),
    ('Bills', 'receipt-outline', '#FF8A80'),
    ('Shopping', 'shirt-outline', '#B388FF'),
    ('Leisure', 'tv-outline', '#EA80FC');
  `);
}

async function seedDefaultData(db: SQLiteDatabase) {
  // Seed categories
  await seedCategoriesOnly(db);

  // Seed sample transactions for rapid UI prototyping
  // await db.runAsync(
  //   "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
  //   ["Blue Tokai Coffee", -340.0, "Food", "Today, 10:45 AM", "UPI"],
  // );
  // await db.runAsync(
  //   "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
  //   ["Zomato Delivery", -1240.0, "Food", "Yesterday, 08:20 PM", "UPI"],
  // );
  // await db.runAsync(
  //   "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
  //   ["Netflix Premium", -649.0, "Leisure", "12 Oct, 2025", "Auto-Pay"],
  // );
}
