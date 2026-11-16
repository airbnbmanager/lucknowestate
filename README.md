# Lucknow Estate – Lead Generation + Caller CRM (v2)
Node 22.5+ chahiye (built-in SQLite). Koi npm install nahi.

    cd /Users/praveen/Developer/lucknowestate
    PORT=3001 ADMIN_PASSWORD=mazboot_password npm start

- Website `/` | Owner `/admin.html` | Caller `/caller.html`
- Database: `data/lucknowestate.db` (backup = ye ek file copy karna). Purana v1 JSON data pehli baar apne aap import hota hai.
- Login: httpOnly cookie, PIN scrypt-hashed, login par rate-limit.
- Alerts: `.env.example` ke variables environment mein set karein (Telegram / Email / Webhook).

## Live deploy
1. Code GitHub par daalein. 2. Render.com > New > Blueprint (render.yaml) ya Docker web service. 3. `ADMIN_PASSWORD` set karein, disk `/var/data` par lagayein (warna redeploy par data ud jayega). 4. HTTPS domain milte hi PWA install hoga.
VPS par: `ADMIN_PASSWORD=... DATA_DIR=/var/data node server.js` + Caddy/nginx HTTPS.
