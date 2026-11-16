const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const E = process.env;
const PORT = E.PORT || 3001;
const ADMIN = E.ADMIN_PASSWORD || 'admin123';
const DATA = E.DATA_DIR || path.join(__dirname, 'data');
const PUB = path.join(__dirname, 'public');

fs.mkdirSync(DATA, { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'lucknowestate.db'));

db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS callers(id TEXT PRIMARY KEY, name TEXT, pin_hash TEXT);
CREATE TABLE IF NOT EXISTS leads(
  id TEXT PRIMARY KEY,
  created_at TEXT,
  name TEXT,
  phone TEXT,
  email TEXT,
  interest TEXT,
  budget TEXT,
  message TEXT,
  property TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  landing TEXT,
  status TEXT DEFAULT 'new',
  assigned_to TEXT
);
CREATE TABLE IF NOT EXISTS calls(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT,
  caller_id TEXT,
  caller_name TEXT,
  at TEXT,
  outcome TEXT,
  note TEXT,
  next_follow_up TEXT
);
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  t TEXT,
  type TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  page TEXT
);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  role TEXT,
  caller_id TEXT,
  expires INTEGER
);
CREATE INDEX IF NOT EXISTS i1 ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS i2 ON calls(lead_id);
`);

const q = (s, ...a) => db.prepare(s).all(...a);
const one = (s, ...a) => db.prepare(s).get(...a);
const run = (s, ...a) => db.prepare(s).run(...a);

const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const hash = pin => {
  const s = crypto.randomBytes(8).toString('hex');
  return s + ':' + crypto.scryptSync(pin, s, 32).toString('hex');
};
const check = (pin, h) => {
  try {
    const [s, x] = h.split(':');
    return crypto.timingSafeEqual(Buffer.from(x, 'hex'), crypto.scryptSync(pin, s, 32));
  } catch {
    return false;
  }
};
const clean = v => String(v == null ? '' : v).slice(0, 500);
const uid = () => crypto.randomUUID();

// Standard Property Catalog for Lucknow
const PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Royal Palms Luxury Villa',
    slug: 'royal-palms-villa',
    type: 'Ghar / Villa',
    category: 'villa',
    location: 'Sushant Golf City, Shaheed Path',
    area: '2,400 sq.ft (Built-up 3,100 sq.ft)',
    config: '4 BHK Duplex Villa + Lawn',
    price: '₹ 1.85 Cr',
    priceNum: 18500000,
    emi: '₹ 1.25 L / mo*',
    status: 'Ready to Move',
    badge: 'RERA & LDA Verified',
    featured: true,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['Private Landscaped Lawn', 'Double Height Living Room', 'Clubhouse & Pool Access', 'Near Lulu Mall & Medanta', 'Immediate Registry']
  },
  {
    id: 'prop-2',
    title: 'Greenwood Gated Plots',
    slug: 'greenwood-plots',
    type: 'Plot',
    category: 'plot',
    location: 'Sultanpur Road, Near Kisan Path (Ring Road)',
    area: '1,200 – 2,500 sq.ft',
    config: 'LDA Zone Residential Plots',
    price: '₹ 28 Lakh*',
    priceNum: 2800000,
    emi: '₹ 22,000 / mo*',
    status: 'Ready for Construction',
    badge: 'Immediate Dakhil-Kharij',
    featured: true,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['40ft & 30ft Wide Damar Roads', 'Underground Electricity & Drainage', 'Boundary Gated Community with CCTV', 'SBI & HDFC Loan Approved', '10 Min to HCL IT City']
  },
  {
    id: 'prop-3',
    title: 'Skyline Heights Luxury Towers',
    slug: 'skyline-heights',
    type: 'Flat',
    category: 'flat',
    location: 'Gomti Nagar Extension, Shaheed Path',
    area: '1,780 – 2,450 sq.ft',
    config: '3 & 4 BHK + Servant Room',
    price: '₹ 95 Lakh*',
    priceNum: 9500000,
    emi: '₹ 68,000 / mo*',
    status: 'Possession Dec 2026',
    badge: 'Riverfront & Stadium View',
    featured: true,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['Infinity Pool on Rooftop', 'Walking distance from Ekana Cricket Stadium', 'Next to Phoenix Palassio', '3-Tier Biometric Security', 'Pre-Certified Green Building']
  },
  {
    id: 'prop-4',
    title: 'Nawab Greens Independent Floors',
    slug: 'nawab-greens',
    type: 'Flat',
    category: 'flat',
    location: 'Shaheed Path, Near Medanta Hospital',
    area: '1,650 sq.ft',
    config: '3 BHK Luxury Low-Rise (Stilt+4)',
    price: '₹ 78 Lakh*',
    priceNum: 7800000,
    emi: '₹ 56,000 / mo*',
    status: 'Ready to Move',
    badge: 'Zero Brokerage Direct',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['Dedicated Covered Parking with Lift', 'Italian Marble Flooring', '100% Power Backup', '3 Min to Medanta Super-specialty', 'Ready Registry']
  },
  {
    id: 'prop-5',
    title: 'Apex Boulevard High-Street Retail',
    slug: 'apex-boulevard',
    type: 'Commercial',
    category: 'commercial',
    location: 'Faizabad Road, Ayodhya Highway Corridor',
    area: '450 – 1,800 sq.ft',
    config: 'Double Height Showrooms & Anchor Shops',
    price: '₹ 68 Lakh*',
    priceNum: 6800000,
    emi: '₹ 52,000 / mo*',
    status: 'Under Construction',
    badge: 'High Rental Yield',
    featured: false,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['150ft Wide Main Highway Frontage', 'Glass Capsule Lifts & Escalators', 'High Footfall Catchment', 'Ideal for Clinics, Banks & Brands', 'RERA Registered']
  },
  {
    id: 'prop-6',
    title: 'Eldeco County Township Plots',
    slug: 'eldeco-county',
    type: 'Plot',
    category: 'plot',
    location: 'Vrindavan Yojna / Raebareli Road',
    area: '1,500 – 3,200 sq.ft',
    config: 'Freehold Residential Plots',
    price: '₹ 45 Lakh*',
    priceNum: 4500000,
    emi: '₹ 34,000 / mo*',
    status: 'Immediate Registry',
    badge: 'Bank Loan Pre-Approved',
    featured: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    highlights: ['Well Planned Township Infrastructure', 'Near SGPGI & Shaheed Path', 'Wide Tree-Lined Avenues', 'Gated Security 24x7', 'Direct Registry & Possession']
  }
];

const OUT = {
  'Phone nahi uthaya': 'contacted',
  'Baad mein call karein': 'contacted',
  'Interested': 'interested',
  'Site visit fixed': 'site-visit',
  'Deal done': 'won',
  'Interested nahi': 'lost',
  'Wrong number': 'lost'
};
const STAT = ['new', 'contacted', 'interested', 'site-visit', 'won', 'lost'];

const hits = new Map();
const rl = (k, max, ms) => {
  const n = Date.now(), h = (hits.get(k) || []).filter(t => n - t < ms);
  h.push(n);
  hits.set(k, h);
  return h.length <= max;
};

setInterval(() => {
  hits.clear();
  run('DELETE FROM sessions WHERE expires < ?', Date.now());
}, 36e5).unref();

const body = req =>
  new Promise(r => {
    let b = '';
    req.on('data', c => {
      b += c;
      if (b.length > 1e5) req.destroy();
    });
    req.on('end', () => {
      try {
        r(JSON.parse(b));
      } catch {
        r({});
      }
    });
  });

const send = (res, c, d, t = 'application/json', h = {}) => {
  res.writeHead(c, {
    'Content-Type': t,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Access-Control-Allow-Origin': '*',
    ...h
  });
  res.end(typeof d === 'string' || Buffer.isBuffer(d) ? d : JSON.stringify(d));
};

const ip = req => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
const cookie = (req, n) => ((req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(n + '=')) || '').slice(n.length + 1);
const session = req => {
  const t = cookie(req, 'lko');
  return t ? one('SELECT * FROM sessions WHERE token=? AND expires>?', sha(t), Date.now()) : null;
};

const callsMap = () => {
  const m = {};
  q('SELECT * FROM calls ORDER BY id ASC').forEach(c => {
    (m[c.lead_id] = m[c.lead_id] || []).push({
      id: c.id,
      at: c.at,
      by: c.caller_name,
      outcome: c.outcome,
      note: c.note,
      next: c.next_follow_up
    });
  });
  return m;
};

const L = (r, m) => ({
  id: r.id,
  createdAt: r.created_at,
  name: r.name,
  phone: r.phone,
  email: r.email,
  interest: r.interest,
  budget: r.budget,
  message: r.message,
  property: r.property,
  utm_source: r.utm_source,
  utm_medium: r.utm_medium,
  utm_campaign: r.utm_campaign,
  referrer: r.referrer,
  landing: r.landing,
  status: r.status,
  assignedTo: r.assigned_to,
  calls: m[r.id] || []
});

function notify(l) {
  const t = `🏠 Lucknow Estate Nayi Lead:\n👤 ${l.name}\n📞 ${l.phone}\n📍 ${l.interest} | ${l.budget} | ${l.property}\n🌐 Source: ${l.utm_source} ${l.utm_campaign || ''}`;
  const j = (u, b, h = {}) =>
    fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...h },
      body: JSON.stringify(b)
    }).catch(e => console.log('alert fail:', e.message));

  if (E.TG_TOKEN && E.TG_CHAT_ID) j(`https://api.telegram.org/bot${E.TG_TOKEN}/sendMessage`, { chat_id: E.TG_CHAT_ID, text: t });
  if (E.RESEND_API_KEY && E.ALERT_EMAIL) {
    j('https://api.resend.com/emails', {
      from: E.FROM_EMAIL || 'onboarding@resend.dev',
      to: [E.ALERT_EMAIL],
      subject: '🏠 Nayi Lead: ' + l.name + ' (' + l.phone + ')',
      text: t
    }, { Authorization: 'Bearer ' + E.RESEND_API_KEY });
  }
  if (E.WEBHOOK_URL) j(E.WEBHOOK_URL, { text: t, lead: l });
}

async function handle(req, res) {
  const U = new URL(req.url, 'http://localhost:' + PORT);
  const p = U.pathname;
  const I = ip(req);
  const M = req.method;

  if (p === '/health') return send(res, 200, { ok: true, app: 'Lucknow Estate', version: '2.0.0' });

  // Public Properties Catalog
  if (p === '/api/properties') {
    return send(res, 200, PROPERTIES);
  }

  // Create Lead
  if (M === 'POST' && p === '/api/leads') {
    if (!rl('lead' + I, 60, 36e5)) return send(res, 429, { error: 'Bahut zyada requests, thodi der baad try karein' });
    const b = await body(req);
    const phone = clean(b.phone).replace(/[^\d+]/g, '');
    if (!clean(b.name).trim() || phone.length < 10) {
      return send(res, 400, { error: 'Kripya apna naam aur 10-digit mobile number bharein' });
    }

    // Auto assign round-robin to caller with least open leads
    const c = one(
      `SELECT c.id FROM callers c ORDER BY (SELECT COUNT(*) FROM leads l WHERE l.assigned_to=c.id AND l.status NOT IN('won','lost')) ASC LIMIT 1`
    );

    const l = {
      id: uid(),
      name: clean(b.name),
      phone,
      email: clean(b.email),
      interest: clean(b.interest) || 'Plot',
      budget: clean(b.budget) || 'Budget',
      message: clean(b.message),
      property: clean(b.property),
      utm_source: clean(b.utm_source) || 'direct',
      utm_medium: clean(b.utm_medium) || '',
      utm_campaign: clean(b.utm_campaign) || '',
      referrer: clean(b.referrer) || '',
      landing: clean(b.landing) || ''
    };

    run(
      'INSERT INTO leads VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      l.id,
      new Date().toISOString(),
      l.name,
      l.phone,
      l.email,
      l.interest,
      l.budget,
      l.message,
      l.property,
      l.utm_source,
      l.utm_medium,
      l.utm_campaign,
      l.referrer,
      l.landing,
      'new',
      c ? c.id : ''
    );

    notify(l);
    return send(res, 200, { ok: true, lead_id: l.id, assigned: Boolean(c) });
  }

  // Track Traffic & Events
  if (M === 'POST' && p === '/api/track') {
    if (!rl('trk' + I, 1000, 36e5)) return send(res, 429, {});
    const b = await body(req);
    run(
      'INSERT INTO events(t,type,utm_source,utm_campaign,page) VALUES(?,?,?,?,?)',
      new Date().toISOString(),
      clean(b.type),
      clean(b.utm_source) || 'direct',
      clean(b.utm_campaign),
      clean(b.page)
    );
    return send(res, 200, { ok: true });
  }

  // Auth Login (Admin or Caller)
  if (M === 'POST' && p === '/api/login') {
    if (!rl('login' + I, 60, 9e5)) return send(res, 429, { error: 'Bahut koshish ho chuki, 15 min baad try karein' });
    const b = await body(req);
    let s = null;

    if (b.role === 'admin') {
      const inputPass = String(b.password || '');
      if (crypto.timingSafeEqual(Buffer.from(sha(inputPass)), Buffer.from(sha(ADMIN)))) {
        s = { role: 'admin', caller_id: '', name: 'Owner / Admin' };
      }
    } else {
      const c = one('SELECT * FROM callers WHERE lower(name)=?', clean(b.name).trim().toLowerCase());
      if (c && check(clean(b.password).trim(), c.pin_hash)) {
        s = { role: 'caller', caller_id: c.id, name: c.name };
      }
    }

    if (!s) return send(res, 401, { error: 'Naam ya PIN/Password galat hai' });

    const tok = crypto.randomBytes(32).toString('hex');
    run('INSERT INTO sessions VALUES(?,?,?,?)', sha(tok), s.role, s.caller_id, Date.now() + 6048e5);

    const isSecure = req.headers['x-forwarded-proto'] === 'https';
    return send(
      res,
      200,
      { ok: true, role: s.role, name: s.name },
      'application/json',
      { 'Set-Cookie': `lko=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${isSecure ? '; Secure' : ''}` }
    );
  }

  // Auth Logout
  if (p === '/api/logout') {
    const t = cookie(req, 'lko');
    if (t) run('DELETE FROM sessions WHERE token=?', sha(t));
    return send(res, 200, { ok: true }, 'application/json', {
      'Set-Cookie': 'lko=; HttpOnly; Path=/; Max-Age=0'
    });
  }

  // Auth Current Session Check
  if (p === '/api/me') {
    const s = session(req);
    if (!s) return send(res, 401, { error: 'not_authenticated' });
    const c = s.caller_id && one('SELECT name FROM callers WHERE id=?', s.caller_id);
    return send(res, 200, { role: s.role, name: c ? c.name : 'Owner / Admin', callerId: s.caller_id });
  }

  // Caller Panel API Endpoints
  if (p.startsWith('/api/caller/')) {
    const s = session(req);
    const c = s && s.role === 'caller' && one('SELECT * FROM callers WHERE id=?', s.caller_id);
    if (!c) return send(res, 401, { error: 'Login required as telecaller' });

    if (p === '/api/caller/leads') {
      const m = callsMap();
      const leads = q('SELECT * FROM leads WHERE assigned_to=? ORDER BY created_at DESC', c.id).map(r => L(r, m));
      return send(res, 200, leads);
    }

    if (M === 'POST' && p === '/api/caller/call') {
      const b = await body(req);
      const x = one('SELECT id FROM leads WHERE id=? AND assigned_to=?', clean(b.id), c.id);
      if (!x || !OUT[b.outcome]) return send(res, 400, { error: 'Invalid call record' });

      const nx = /^\d{4}-\d{2}-\d{2}$/.test(b.next || '') ? b.next : '';
      run(
        'INSERT INTO calls(lead_id,caller_id,caller_name,at,outcome,note,next_follow_up) VALUES(?,?,?,?,?,?,?)',
        x.id,
        c.id,
        c.name,
        new Date().toISOString(),
        b.outcome,
        clean(b.note),
        nx
      );
      run('UPDATE leads SET status=? WHERE id=?', OUT[b.outcome], x.id);
      return send(res, 200, { ok: true });
    }
  }

  // Admin Dashboard API Endpoints
  if (p.startsWith('/api/admin/')) {
    const s = session(req);
    if (!s || s.role !== 'admin') return send(res, 401, { error: 'Unauthorized: Admin access required' });

    if (p === '/api/admin/data') {
      const days = Math.min(Math.max(+U.searchParams.get('days') || 7, 1), 365);
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const m = callsMap();

      const cc = (c, o) => `(SELECT COUNT(*) FROM calls WHERE caller_id=c.id AND at>=?${o ? " AND outcome='" + o + "'" : ''})`;
      const callers = q(
        `SELECT c.id, c.name,
          (SELECT COUNT(*) FROM leads WHERE assigned_to=c.id) assigned,
          (SELECT COUNT(*) FROM leads WHERE assigned_to=c.id AND status='new') pending,
          ${cc(1)} calls,
          ${cc(1, 'Interested')} interested,
          ${cc(1, 'Site visit fixed')} visits,
          ${cc(1, 'Deal done')} won
         FROM callers c`,
        since,
        since,
        since,
        since
      );

      const sources = q(
        `SELECT s source, SUM(v) visits, SUM(l) leads
         FROM (
           SELECT utm_source s, COUNT(*) v, 0 l FROM events WHERE type='pageview' GROUP BY 1
           UNION ALL
           SELECT utm_source, 0, COUNT(*) FROM leads GROUP BY 1
         ) GROUP BY s ORDER BY leads DESC`
      );

      const allLeads = q('SELECT * FROM leads ORDER BY created_at DESC').map(r => L(r, m));
      return send(res, 200, { leads: allLeads, callers, sources });
    }

    if (p === '/api/admin/export') {
      const m = callsMap();
      const l = q('SELECT * FROM leads ORDER BY created_at DESC').map(r => ({
        ...r,
        calls: (m[r.id] || []).map(c => `${c.by} (${c.outcome}): ${c.note} [Follow-up: ${c.next || 'N/A'}]`).join(' | ')
      }));
      const k = Object.keys(l[0] || { id: 1, name: 1, phone: 1, status: 1 });
      const csv = [k.join(',')].concat(
        l.map(r => k.map(c => '"' + String(r[c] || '').replace(/"/g, '""') + '"').join(','))
      ).join('\n');
      return send(res, 200, csv, 'text/csv; charset=utf-8', {
        'Content-Disposition': 'attachment; filename="lucknow_estate_leads.csv"'
      });
    }

    const b = await body(req);

    if (p === '/api/admin/status' && STAT.includes(b.status)) {
      run('UPDATE leads SET status=? WHERE id=?', b.status, clean(b.id));
      return send(res, 200, { ok: true });
    }

    if (p === '/api/admin/assign') {
      run('UPDATE leads SET assigned_to=? WHERE id=?', clean(b.callerId), clean(b.id));
      return send(res, 200, { ok: true });
    }

    if (p === '/api/admin/callers') {
      if (!clean(b.name).trim() || clean(b.pin).trim().length < 4) {
        return send(res, 400, { error: 'Caller ka naam aur 4+ digit PIN dein' });
      }
      if (one('SELECT id FROM callers WHERE lower(name)=?', clean(b.name).trim().toLowerCase())) {
        return send(res, 400, { error: 'Is naam ka caller pehle se maujood hai' });
      }
      run('INSERT INTO callers VALUES(?,?,?)', uid(), clean(b.name).trim(), hash(clean(b.pin).trim()));
      return send(res, 200, { ok: true });
    }

    if (p === '/api/admin/callers/pin') {
      if (clean(b.pin).trim().length < 4) return send(res, 400, { error: 'PIN kam se kam 4 digit hona chahiye' });
      run('UPDATE callers SET pin_hash=? WHERE id=?', hash(clean(b.pin).trim()), clean(b.id));
      run('DELETE FROM sessions WHERE caller_id=?', clean(b.id));
      return send(res, 200, { ok: true });
    }

    if (p === '/api/admin/callers/remove') {
      const id = clean(b.id);
      run("UPDATE leads SET assigned_to='' WHERE assigned_to=?", id);
      run('DELETE FROM sessions WHERE caller_id=?', id);
      run('DELETE FROM callers WHERE id=?', id);
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'Admin API route not found' });
  }

  // Static File Serving
  let fp = path.join(PUB, p === '/' ? 'index.html' : p);
  if (!fp.startsWith(PUB) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    fp = path.join(PUB, 'index.html');
  }

  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };

  send(res, 200, fs.readFileSync(fp), MIME[path.extname(fp)] || 'application/octet-stream');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(e => {
    console.error('Server error:', e);
    send(res, 500, { error: 'Internal Server Error' });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏰 Lucknow Estate Portal & CRM is Running!`);
  console.log(`🌐 Public Website : http://localhost:${PORT}`);
  console.log(`📞 Caller CRM     : http://localhost:${PORT}/caller.html`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🔑 Admin Password : ${ADMIN}`);
  console.log(`====================================================`);
});
