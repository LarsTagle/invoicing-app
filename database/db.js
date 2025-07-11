// database/db.js
import * as SQLite from "expo-sqlite";

const dbName = "invoice.db";

// Initialize the database
export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });

  try {
    // Create invoices table
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client TEXT NOT NULL,
        due_date TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL
      );
    `);

    // Create items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      );
    `);

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Insert a new invoice
export async function insertInvoice(client, due_date, total, status) {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });
  try {
    const result = await db.runAsync(
      `INSERT INTO invoices (client, due_date, total, status) VALUES (?, ?, ?, ?);`,
      [client, due_date, total, status]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error inserting invoice:", error);
    throw error;
  }
}

// Insert an item for an invoice
export async function insertItem(invoice_id, name, quantity, price) {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });
  try {
    await db.runAsync(
      `INSERT INTO items (invoice_id, name, quantity, price) VALUES (?, ?, ?, ?);`,
      [invoice_id, name, quantity, price]
    );
  } catch (error) {
    console.error("Error inserting item:", error);
    throw error;
  }
}

// Fetch all invoices
export async function getInvoices() {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });
  try {
    const invoices = await db.getAllAsync(`SELECT * FROM invoices;`);
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

// Fetch items for a specific invoice
export async function getItemsByInvoiceId(invoice_id) {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });
  try {
    const items = await db.getAllAsync(
      `SELECT * FROM items WHERE invoice_id = ?;`,
      [invoice_id]
    );
    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

// Update invoice status
export async function updateInvoiceStatus(id, status) {
  const db = await SQLite.openDatabaseAsync(dbName, {
    useNewConnection: false,
  });
  try {
    await db.runAsync(`UPDATE invoices SET status = ? WHERE id = ?;`, [
      status,
      id,
    ]);
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
}
