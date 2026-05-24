const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'melodys.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    initSchema();
    seedData();
    saveDb();
  }

  return db;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'pza',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedData() {
  const hashed = bcrypt.hashSync('admin123', 10);
  db.run(
    `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    ['admin', hashed, 'admin']
  );

  const products = [
    ['Guitarra Acústica', 'Guitarra acústica de 6 cuerdas', 'Cuerdas', 3500, 5, 'pza'],
    ['Violín 4/4', 'Violín tamaño completo para adulto', 'Cuerdas', 4200, 3, 'pza'],
    ['Piano Digital', 'Piano digital 88 teclas con pedales', 'Teclados', 12500, 2, 'pza'],
    ['Batería Completa', 'Set de batería acústica 5 piezas', 'Percusión', 18000, 1, 'set'],
    ['Flauta Traversa', 'Flauta traversa plateada', 'Viento', 2800, 7, 'pza'],
    ['Cuerdas para Guitarra', 'Juego de cuerdas .010-.046', 'Accesorios', 120, 50, 'set'],
  ];

  for (const [name, desc, cat, price, stock, unit] of products) {
    db.run(
      `INSERT INTO products (name, description, category, price, stock, unit) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, desc, cat, price, stock, unit]
    );
  }
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helpers: run a write query with params and save
function run(sql, params = []) {
  const d = db;
  d.run(sql, params);
  saveDb();
}

// Helpers: query returning all rows as objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helpers: query returning single row
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

module.exports = { getDb, run, get, all, saveDb };
