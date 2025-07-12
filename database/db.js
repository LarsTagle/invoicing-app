import * as SQLite from "expo-sqlite";

const dbName = "invoice.db";

// Clear the database by dropping all tables
export async function clearDatabase() {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS invoices;
      DROP TABLE IF EXISTS items;
      DROP TABLE IF EXISTS clients;
    `);
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Initialize the database
export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    // Create invoices table
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(client_id)
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

    // Create clients table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company_name TEXT
      );
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Generate a unique client_id
async function generateClientId() {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    const result = await db.getFirstAsync(
      `SELECT client_id FROM clients ORDER BY client_id DESC LIMIT 1;`
    );
    let nextNumber = 1;
    if (result && result.client_id) {
      const lastNumber = parseInt(result.client_id.replace("CUST-", ""));
      nextNumber = lastNumber + 1;
    }
    return `CUST-${nextNumber.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating client_id:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Insert a new client
export async function insertClient(
  first_name,
  last_name,
  email,
  phone,
  company_name
) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    if (!first_name || !last_name) {
      throw new Error(
        `Invalid client parameters: first_name=${first_name}, last_name=${last_name}`
      );
    }
    const client_id = await generateClientId();
    const result = await db.runAsync(
      `INSERT INTO clients (client_id, first_name, last_name, email, phone, company_name) VALUES (?, ?, ?, ?, ?, ?);`,
      [client_id, first_name, last_name, email, phone, company_name]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error inserting client:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Fetch all clients
export async function getClients() {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    const clients = await db.getAllAsync(`SELECT * FROM clients;`);
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Delete a client
export async function deleteClient(id) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    await db.runAsync(`DELETE FROM clients WHERE id = ?;`, [id]);
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Insert a new invoice
export async function insertInvoice(
  client_id,
  first_name,
  last_name,
  issue_date,
  due_date,
  total,
  status
) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    // Validate parameters
    if (
      !client_id ||
      !first_name ||
      !last_name ||
      !issue_date ||
      !due_date ||
      total == null ||
      !status
    ) {
      throw new Error(
        `Invalid invoice parameters: client_id=${client_id}, first_name=${first_name}, last_name=${last_name}, issue_date=${issue_date}, due_date=${due_date}, total=${total}, status=${status}`
      );
    }

    console.log("Inserting invoice with values:", {
      client_id,
      first_name,
      last_name,
      issue_date,
      due_date,
      total: Number(total),
      status,
    });

    const result = await db.runAsync(
      `INSERT INTO invoices (client_id, first_name, last_name, issue_date, due_date, total, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        client_id,
        first_name,
        last_name,
        issue_date,
        due_date,
        Number(total),
        status,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error inserting invoice:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Insert an item for an invoice
export async function insertItem(invoice_id, name, quantity, price) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    await db.runAsync(
      `INSERT INTO items (invoice_id, name, quantity, price) VALUES (?, ?, ?, ?);`,
      [invoice_id, name, Number(quantity), Number(price)]
    );
  } catch (error) {
    console.error("Error inserting item:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Fetch all invoices
export async function getInvoices() {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    const invoices = await db.getAllAsync(`SELECT * FROM invoices;`);
    console.log("Fetched invoices:", invoices);
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Fetch items for a specific invoice
export async function getItemsByInvoiceId(invoice_id) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    const items = await db.getAllAsync(
      `SELECT * FROM items WHERE invoice_id = ?;`,
      [invoice_id]
    );
    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}

// Update invoice status
export async function updateInvoiceStatus(id, status) {
  const db = await SQLite.openDatabaseAsync(dbName);
  try {
    await db.runAsync(`UPDATE invoices SET status = ? WHERE id = ?;`, [
      status,
      id,
    ]);
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  } finally {
    await db.closeAsync();
  }
}
