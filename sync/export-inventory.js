/**
 * Standalone Inventory Export & Bridge Script
 * 
 * Purpose:
 * Connects to the store's local SQLite database in strict READ-ONLY mode,
 * extracts public customer-facing product information and live stock levels,
 * and writes a sanitized `inventory.json` into the website's public folder.
 * 
 * ZERO coupling: Does not import any billing code, does not modify any table.
 * 
 * Usage:
 *   node sync/export-inventory.js
 * 
 * You can also set this up in crontab or Windows Task Scheduler to run every 5 or 15 minutes!
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store SQLite database (defaulting to retail.db in parent project folder)
const DB_PATH = process.env.STORE_DB_PATH || path.resolve(__dirname, '../../retail.db');
const OUTPUT_PATH = path.resolve(__dirname, '../public/inventory.json');

console.log(`[Sync] Reading store database from: ${DB_PATH}`);

if (!fs.existsSync(DB_PATH)) {
  console.error(`[Sync Error] Database file not found at: ${DB_PATH}`);
  console.log(`Please set STORE_DB_PATH environment variable if located elsewhere.`);
  process.exit(1);
}

try {
  // Open SQLite in read-only mode to prevent any database locks or accidental modifications
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

  const query = `
    SELECT 
      id,
      sku,
      name,
      category,
      brand,
      price,
      mrp,
      discount_percent AS discountPercent,
      stock,
      low_stock_threshold AS lowStockThreshold,
      uom,
      status
    FROM products
    WHERE status = 'Active'
    ORDER BY category, name
  `;

  const rows = db.prepare(query).all();

  const formattedProducts = rows.map((row) => ({
    id: String(row.id),
    sku: String(row.sku || ''),
    name: String(row.name || 'Unnamed Product'),
    category: String(row.category || 'General'),
    brand: row.brand ? String(row.brand) : undefined,
    price: Number(row.price) || 0,
    mrp: row.mrp ? Number(row.mrp) : undefined,
    discountPercent: row.discountPercent ? Number(row.discountPercent) : undefined,
    stock: Math.max(0, Number(row.stock) || 0),
    lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : 5,
    uom: row.uom ? String(row.uom) : 'PCS',
    status: String(row.status || 'Active'),
    lastUpdated: new Date().toISOString()
  }));

  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write out the public inventory JSON
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formattedProducts, null, 2), 'utf-8');

  console.log(`[Sync Success] Successfully exported ${formattedProducts.length} products with live stock to:`);
  console.log(`  ${OUTPUT_PATH}`);
  console.log(`Timestamp: ${new Date().toLocaleString()}`);

  db.close();
} catch (error) {
  console.error('[Sync Error] Failed to export inventory:', error);
  process.exit(1);
}
