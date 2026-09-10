# Inventory Synchronization Guide

This directory contains standalone, non-intrusive tools for synchronizing your store's local billing inventory (`retail.db`) to your customer-facing website.

---

## 🔒 100% Decoupled & Safe Architecture

1. **Strict Read-Only Connection**:
   The sync script connects to SQLite using `better-sqlite3` with `{ readonly: true }`. It never acquires write locks, modifies schema, or interferes with active cashier checkout sessions.

2. **Data Sanitization**:
   Only customer-facing public fields are exported:
   - `id`, `sku`, `name`, `category`, `brand`
   - `price`, `mrp`, `discount_percent`
   - `stock`, `low_stock_threshold`, `uom`

   *Sensitive business information is stripped completely*:
   - ❌ Purchase cost / Wholesale price
   - ❌ Distributor price
   - ❌ Supplier / Vendor details
   - ❌ Batch margins & profit data

---

## 🚀 How to Run the Sync

### Option 1: On-Demand Manual Export
Whenever you add new products or want to push an immediate stock refresh:
```bash
node sync/export-inventory.js
```
This updates `website/public/inventory.json`.

### Option 2: Automated Periodic Sync (Cron or Scheduled Task)
To automatically refresh customer stock every 15 minutes:

**On macOS / Linux (cron):**
```bash
crontab -e
# Add this line to run every 15 minutes:
*/15 * * * * cd "/path/to/website" && node sync/export-inventory.js >> sync/sync.log 2>&1
```

**On Windows (Task Scheduler):**
Create a Basic Task to trigger `node.exe "C:\path\to\website\sync\export-inventory.js"` every 15 or 30 minutes.

---

## ☁️ Connecting to Cloud Database (Optional)

If your website is hosted on the public internet (e.g., Vercel, Netlify, Cloudflare Pages), you can:
1. Export `inventory.json` and deploy it with your static build.
2. OR modify `export-inventory.js` to push the array directly to a free cloud table (like Supabase, Firebase, or Cloudflare D1) using their REST API key.
3. In `website/.env`, set:
   ```env
   VITE_INVENTORY_API_URL=https://your-cloud-database-url/products
   ```
   The website will automatically fetch real-time data from that endpoint!
