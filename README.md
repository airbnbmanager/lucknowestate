# 🏰 Lucknow Estate – Luxury Real Estate Portal & Telecaller CRM (v2)

A production-ready real estate lead generation portal, mobile-first telecaller CRM, and executive analytics dashboard tailored specifically for Lucknow's luxury property market.

- **GitHub Repository**: [https://github.com/airbnbmanager/lucknowestate](https://github.com/airbnbmanager/lucknowestate)
- **Built With**: Node.js 22+ (Native SQLite `node:sqlite`), zero external npm runtime dependencies.

---

## 🚀 Live Demo URLs (Ready for Tomorrow's Client Presentation)

| Portal | Local URL | Live Public URL | Access Credentials |
| :--- | :--- | :--- | :--- |
| **Public Real Estate Website** | [http://localhost:3001/](http://localhost:3001/) | [Live Website](https://e3f1e232f96e98b0-104-28-244-14.serveousercontent.com/) | Public (No login needed) |
| **Telecaller CRM Panel** | [http://localhost:3001/caller.html](http://localhost:3001/caller.html) | [Live Caller CRM](https://e3f1e232f96e98b0-104-28-244-14.serveousercontent.com/caller.html) | Name: **Riya Sharma** (PIN: `1234`)<br>Name: **Amit Verma** (PIN: `5678`) |
| **Executive Admin Dashboard** | [http://localhost:3001/admin.html](http://localhost:3001/admin.html) | [Live Admin CRM](https://e3f1e232f96e98b0-104-28-244-14.serveousercontent.com/admin.html) | Password: **`admin123`** |

---

## ✨ What's Included & Built for the Demo

### 1. 🏠 Public Luxury Real Estate Portal (`/`)
- **Royal Lucknow Brand Identity**: Emerald forest, heritage amber, and clean architectural typography.
- **Top Announcement & Contact Strip**: Direct WhatsApp and phone inquiry to `+91 94544 70872`.
- **Live Search & Filter Dock**: Instant filtering by prime Lucknow locations (*Sushant Golf City, Gomti Nagar Ext., Shaheed Path, Sultanpur Road, Faizabad Road, Vrindavan Yojna*), property category (*Plots, Luxury Villas, Flats, Commercial*), and budget brackets.
- **Curated Property Catalog**:
  1. *Royal Palms Luxury Villa* – Sushant Golf City (4 BHK Duplex, ₹1.85 Cr)
  2. *Greenwood Gated Plots* – Sultanpur Road, Near Kisan Path (LDA Zone, ₹28 Lakh*)
  3. *Skyline Heights Luxury Towers* – Gomti Nagar Ext. (3 & 4 BHK, ₹95 Lakh*)
  4. *Nawab Greens Independent Floors* – Shaheed Path (3 BHK, ₹78 Lakh*)
  5. *Apex Boulevard High-Street Retail* – Faizabad Road (Double Height Showrooms, ₹68 Lakh*)
  6. *Eldeco County Township Plots* – Vrindavan Yojna (Freehold Plots, ₹45 Lakh*)
- **Interactive Property Detail Modal**: High-res gallery preview, project specifications, pre-approved banks list, and instant site visit booking.
- **Interactive Home Loan EMI Calculator**: Real-time sliders for Loan Amount, Interest Rate, and Tenure with live EMI breakdown.
- **High-Conversion VIP Site Visit Form**: Captures customer name, phone, budget, property interest, and preferred date with automated WhatsApp redirect.
- **Mobile Sticky Bottom Bar**: Pinned Call & WhatsApp concierge actions for mobile buyers.

### 2. 📞 Mobile-First Telecaller CRM (`/caller.html`)
- Dedicated portal for sales agents (*Riya Sharma*, *Amit Verma*).
- **Productivity Counter**: Total Assigned Leads, Follow-ups Due Today, Uncontacted Leads, and Calls Made Today.
- **Smart Filter Tabs**: All Leads, 🚨 Due / Overdue, 🆕 New Leads, 🚗 Site Visits Fixed, ⭐ Interested, ✅ Won.
- **One-Tap Dialing (`tel:`)** & **Personalized WhatsApp Direct Chat** with pre-filled buyer greeting.
- **Call Logging Modal**: Record call outcomes (*Interested, Site visit fixed, Baad mein call karein, Phone nahi uthaya, Deal done, Lost*), write notes, and set next follow-up date with automatic status transitions.

### 3. 📊 Executive Command Center (`/admin.html`)
- **Real-Time KPI Suite**: Total Leads, Today's Fresh Inquiries, Uncontacted, Follow-ups Overdue, Site Visits Booked, Closed Won Deals, and Website Conversion %.
- **Pipeline Stage Funnel**: Tracks lead velocity through New ➔ Contacted ➔ Interested ➔ Site Visit ➔ Won.
- **Telecaller Leaderboard**: Performance metrics per caller (Assigned, Calls Made, Site Visits, Closed Deals, Conversion %).
- **Marketing Attribution Matrix**: Traffic visitors vs leads generated across channels (*Google Ads, Instagram Reels, Facebook, WhatsApp, Direct*).
- **Overdue Alert Center**: Highlights missed follow-up deadlines for immediate managerial action.
- **Master Leads Registry**: Search, filter, inline status editor, telecaller reassignment, and full call history audit trail.
- **One-Click CSV Export**: Downloads complete leads database with full interaction transcripts.

---

## 🛠️ Local Setup & Commands

### Prerequisites
- Node.js 22.5+ (uses built-in `node:sqlite`)
- No `npm install` needed!

### Start Server
```bash
cd /Users/praveen/Developer/lucknowestate
PORT=3001 ADMIN_PASSWORD=admin123 node server.js
```

### Reset Demo Seed Data
```bash
node scripts/seed.js
```

---

## 🌐 Cloud Deployment Options

### Option 1: Render.com (Blueprint included)
1. Link GitHub repository `airbnbmanager/lucknowestate`.
2. Deploy as Web Service (Docker runtime).
3. Set Environment Variable: `ADMIN_PASSWORD=your_secure_password`.
4. Attach Persistent Disk to `/var/data` (1 GB) so the SQLite database persists across redeploys.

### Option 2: VPS / Linux Server (Caddy / Nginx)
```bash
git clone https://github.com/airbnbmanager/lucknowestate.git
cd lucknowestate
PORT=3000 ADMIN_PASSWORD=your_secret DATA_DIR=/var/lucknowestate/data node server.js
```
