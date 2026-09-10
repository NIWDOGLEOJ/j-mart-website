# J MART — Customer Shop Website & Live Stock Tracker

A modern, high-performance customer-facing website for your store that connects with your retail inventory so shoppers can check live product stock availability, current prices, and special discounts before visiting your shop.

---

## 🌟 Key Features

* **⚡ Live Stock Availability Status**:
  - 🟢 **In Stock**: Product is available on store shelves (with exact available count option).
  - 🟡 **Low Stock**: Highlights items with fewer units left (e.g., "Only 3 left!").
  - 🔴 **Out of Stock**: Clearly marked to prevent wasted customer visits.
* **🔍 Instant Search & Multi-Category Filtering**:
  - Search by name, brand, SKU, or tags with live autocomplete feel.
  - Horizontal scrolling category pills with live product counts.
  - **"In Stock Only"** quick toggle switch.
  - Sort by Featured, Price (Low to High, High to Low), Name, or Stock availability.
* **📱 WhatsApp Reserve & In-Store Order**:
  - Customers can assemble a shopping bag / reservation list.
  - Generates a pre-formatted WhatsApp message directly to your store's WhatsApp number with items, quantities, and pickup times.
* **📍 Store Timings & Maps Direction**:
  - Live "Open Now / Closes at" status badge.
  - One-click Google Maps navigation, direct phone calling, and store info modal.
* **🔒 Website-only integration boundary**:
  - Completely self-contained in this `/website` folder with its own `package.json`, TypeScript configuration, and Vite build pipeline.
  - The website calls the existing billing API for public inventory and reservations; billing code and schema are not changed here.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Start Local Development Server
```bash
pnpm dev
# or
npm run dev
```
The website will open at:
```
http://localhost:5174
```

### 3. Build for Production
```bash
pnpm build
# or
npm run build
```
Generates a static, production-ready `dist/` bundle that can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any web server.

---

## 🐧 Setup Guide for Garuda Linux (Arch-based)

This guide provides clear, step-by-step instructions specifically optimized for running and developing this project on **Garuda Linux** with your hardware profile:
* **Processor**: Intel Core i5-1135G7 (4 cores, 8 threads, Iris Xe graphics)
* **RAM**: 8 GB
* **Graphics**: NVIDIA GeForce MX350 (2 GB) + Intel Iris Xe hybrid setup
* **Storage**: 256 GB SSD (Btrfs)
* **Connectivity**: Wi-Fi (local network device testing)

---

### Step 1: Update Garuda & Install Prerequisites

Garuda uses `pacman` (and `paru` / `yay` for AUR packages). Open your terminal (**Fish** shell by default in Garuda) and run:

```bash
# 1. Update system package databases
sudo pacman -Syu

# 2. Install Git, Node.js (LTS), and pnpm
sudo pacman -S --needed git nodejs npm pnpm
```

> **Why `pnpm` on a 256 GB SSD?**  
> `pnpm` uses a single content-addressable storage on disk and hard-links dependencies. Unlike standard `npm` (which duplicates files inside every `node_modules`), `pnpm` saves gigabytes of valuable space on your 256 GB SSD and installs packages much faster.

---

### Step 2: Clone Repository & Install Project Packages

```bash
# 1. Clone your repository
git clone https://github.com/NIWDOGLEOJ/j-mart-website.git

# 2. Enter directory
cd j-mart-website

# 3. Install dependencies using pnpm
pnpm install
```

---

### Step 3: Launch Local Development Server

```bash
pnpm dev
```

Your terminal will display:
```text
  VITE v6.2.0  ready in 180 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Hold `Ctrl` and click the link (or open your browser to `http://localhost:5174`).

---

### Step 4: Testing on Mobile Phones Over Local Wi-Fi

To test how the store website looks on your phone or customer devices connected to the same Wi-Fi router:

```bash
pnpm dev -- --host
```

Vite will print a network address like `http://192.168.x.x:5174/`.

#### If Garuda Linux Firewall Blocks Inbound Wi-Fi Connections:
Garuda comes with `ufw` or `firewalld` enabled by default. If your phone cannot connect to your laptop's IP, allow port 5174:

* **If using UFW** (default on most Garuda editions):
  ```bash
  sudo ufw allow 5174/tcp
  sudo ufw reload
  ```
* **If using Firewalld**:
  ```bash
  sudo firewall-cmd --add-port=5174/tcp --permanent
  sudo firewall-cmd --reload
  ```

---

### Step 5: Hardware & Battery Optimizations for Your Laptop

Your laptop configuration (i5-1135G7 + 8GB RAM + MX350) is well-suited for web development. Here are quick tips to ensure smooth performance, cool temperatures, and long battery life:

#### 1. Keep Web Dev on Integrated Graphics (Intel Iris Xe)
The dedicated NVIDIA MX350 GPU draws significant battery power. Web development (Vite + Node + Chrome/Firefox) runs with hardware acceleration on the **Intel Iris Xe** graphics:
* Ensure your browser runs on the integrated GPU (the default behavior).
* Do **not** prefix Vite commands with `prime-run` unless you are profiling heavy WebGL 3D graphics.
* If you use `optimus-manager` or `envycontrol`, keep the profile on `hybrid` or `integrated` when on battery:
  ```bash
  # Check current power profile (if using power-profiles-daemon / Garuda settings)
  powerprofilesctl get

  # Set balanced or power-saver mode while working on battery:
  powerprofilesctl set balanced
  ```

#### 2. RAM Management (8 GB RAM)
Garuda Linux has `zram-generator` enabled by default, which compresses RAM in real-time. If you have many browser tabs and dev tools open:
* If running large builds in Fish shell, you can optionally set Node's memory ceiling:
  ```fish
  set -gx NODE_OPTIONS "--max-old-space-size=4096"
  ```
  *(In Bash / Zsh: `export NODE_OPTIONS="--max-old-space-size=4096"`)*

#### 3. SSD Health & Space (256 GB SSD)
* Clean unused package caches periodically:
  ```bash
  # Clean pnpm global store
  pnpm store prune

  # Clean pacman cache
  sudo pacman -Sc
  ```
* Verify that SSD TRIM timer is active:
  ```bash
  systemctl status fstrim.timer
  ```
  *(If inactive, enable it with: `sudo systemctl enable --now fstrim.timer`)*

---

### Step 6: Production Build & Testing Locally

When ready to test the compiled, optimized bundle before deploying:

```bash
# 1. Compile TypeScript & build minified assets
pnpm build

# 2. Preview the exact production build locally
pnpm preview
```

---

## ⚙️ Customizing Your Store Information

Open [`src/config/storeConfig.ts`](./src/config/storeConfig.ts) to update:
- Store Name, Tagline, and Description
- Physical Address & Google Maps Direction Link
- Phone Number & WhatsApp Number
- Operating Hours (Weekdays & Weekends)
- Feature toggles (WhatsApp orders, exact stock count vs badges)

---

## 🔄 Synchronizing with Store Billing Inventory

See the complete guide in [`sync/README.md`](./sync/README.md).
To run an instant export from your store database:
```bash
node sync/export-inventory.js
```
This generates `public/inventory.json`, which the website automatically detects and displays.

### Shared API configuration

For a hosted website that can reach the existing billing server, set these frontend variables:

Copy [`.env.example`](./.env.example) to `.env` before customizing these values. These are public frontend variables; never put database credentials, passwords, or private API keys in them.

```env
VITE_API_BASE_URL=https://your-billing-api.example.com
VITE_INVENTORY_API_URL=https://your-billing-api.example.com/api/products/public
VITE_CUSTOMER_FEED_URL=https://your-store-site.example.com/loyalty-customers.json
VITE_WS_URL=wss://your-billing-api.example.com
```

`VITE_API_BASE_URL` is used for reservations and the default inventory endpoint. `VITE_WS_URL` is optional; when it is absent, the website uses its normal refresh behavior without attempting a hard-coded local socket.
`VITE_CUSTOMER_FEED_URL` is optional and should point to a sanitized customer feed generated from the shared store data. It updates loyalty totals without replacing a customer’s website password or local coupons.
The public customer feed updates existing website accounts; it does not provision new login credentials. The existing name/password login method remains unchanged.
