import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) return;

  if (currentDbVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT DEFAULT 'Uncategorized',
        timestamp TEXT NOT NULL,
        method TEXT DEFAULT 'UPI'
      );
    `);

    // Create dynamic categories table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );
  `);

    // Seed default categories if empty
    const countRes = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM categories;",
    );
    if (countRes && countRes.count === 0) {
      await db.execAsync(`
      INSERT INTO categories (name, icon, color) VALUES 
      ('Food', 'fast-food-outline', '#FF9E80'),
      ('Tech', 'laptop-outline', '#82B1FF'),
      ('Travel', 'airplane-outline', '#B9F6CA'),
      ('Leisure', 'tv-outline', '#EA80FC');
    `);
    }

    // Seed initial records
    await db.runAsync(
      "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
      "Blue Tokai Coffee",
      -340.0,
      "Food",
      "Today, 10:45 AM",
      "UPI",
    );
    await db.runAsync(
      "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
      "Blinkit Delivery",
      -1240.0,
      "Tech",
      "Yesterday, 08:20 PM",
      "UPI",
    );
    await db.runAsync(
      "INSERT INTO transactions (name, amount, category, timestamp, method) VALUES (?, ?, ?, ?, ?)",
      "Netflix Premium",
      -649.0,
      "Entertainment",
      "12 Oct, 2023",
      "AUTO-PAY",
    );

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
}

export interface TransactionRow {
  id: number;
  name: string;
  amount: number;
  category: string;
  timestamp: string;
  method: string;
}
