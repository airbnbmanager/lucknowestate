const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const db = new DatabaseSync(path.join(DATA, 'lucknowestate.db'));

const hash = pin => {
  const s = crypto.randomBytes(8).toString('hex');
  return s + ':' + crypto.scryptSync(pin, s, 32).toString('hex');
};

const uid = () => crypto.randomUUID();

console.log('--- Seeding Lucknow Estate Demo Data ---');

// Clear existing tables
db.exec(`
DELETE FROM calls;
DELETE FROM leads;
DELETE FROM callers;
DELETE FROM events;
DELETE FROM sessions;
`);

// 1. Create Callers
const callerRiyaId = uid();
const callerAmitId = uid();

db.prepare('INSERT INTO callers VALUES (?, ?, ?)').run(callerRiyaId, 'Riya Sharma', hash('1234'));
db.prepare('INSERT INTO callers VALUES (?, ?, ?)').run(callerAmitId, 'Amit Verma', hash('5678'));

console.log('Created Callers:');
console.log('  1. Riya Sharma (PIN: 1234)');
console.log('  2. Amit Verma  (PIN: 5678)');

// 2. Sources & Campaigns
const sources = [
  { source: 'google', medium: 'cpc', campaign: 'lucknow_plots_search' },
  { source: 'instagram', medium: 'social_reel', campaign: 'luxury_villas_gomti_nagar' },
  { source: 'facebook', medium: 'cpc', campaign: 'flats_shaheed_path' },
  { source: 'whatsapp', medium: 'referral', campaign: 'investor_group_blast' },
  { source: 'direct', medium: 'direct', campaign: 'brand' }
];

// Seed Events (Traffic visits)
const now = new Date();
for (let i = 0; i < 280; i++) {
  const s = sources[Math.floor(Math.random() * sources.length)];
  const t = new Date(now.getTime() - Math.floor(Math.random() * 7 * 86400000)).toISOString();
  db.prepare('INSERT INTO events(t, type, utm_source, utm_campaign, page) VALUES(?, ?, ?, ?, ?)')
    .run(t, 'pageview', s.source, s.campaign, '/');
}

// Helper date strings
const today = now.toISOString().slice(0, 10);
const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
const dayAfter = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10);

// 3. Demo Leads
const demoLeads = [
  {
    name: 'Praveen Singh',
    phone: '9454470872',
    email: 'praveen.singh@gmail.com',
    interest: 'Flat',
    budget: '50 Lakh–1 Cr',
    property: 'Skyline Heights 3BHK - Gomti Nagar Ext.',
    message: 'Looking for ready to move 3 BHK with park view and club access.',
    utm_source: 'google',
    utm_campaign: 'lucknow_luxury_flats',
    status: 'site-visit',
    assigned_to: callerRiyaId,
    created_offset_hours: 14,
    calls: [
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 12,
        outcome: 'Interested',
        note: 'Customer contacted after seeing Google ad. Prefers higher floor (8th+), verified loan pre-approval.',
        next: today
      },
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 4,
        outcome: 'Site visit fixed',
        note: 'Site visit confirmed with family for tomorrow at 11:30 AM. Cab pickup offered.',
        next: tomorrow
      }
    ]
  },
  {
    name: 'Dr. Alok Srivastava',
    phone: '9839012345',
    email: 'dr.alok.kgmu@gmail.com',
    interest: 'Ghar / Villa',
    budget: '1 Cr+',
    property: 'Royal Palms Luxury Villa - Sushant Golf City',
    message: 'Need 4 BHK independent duplex villa with private lawn.',
    utm_source: 'instagram',
    utm_campaign: 'luxury_villas_gomti_nagar',
    status: 'site-visit',
    assigned_to: callerRiyaId,
    created_offset_hours: 28,
    calls: [
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 24,
        outcome: 'Interested',
        note: 'Senior physician at Medanta. Liked the 2,400 sq.ft corner villa floor plan.',
        next: yesterday
      },
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 5,
        outcome: 'Site visit fixed',
        note: 'Site visit scheduled for tomorrow 4:00 PM. Requested master layout and builder brochure on WhatsApp.',
        next: tomorrow
      }
    ]
  },
  {
    name: 'Col. Rajiv Anand (Retd)',
    phone: '9415098765',
    email: 'rajiv.anand.armylko@yahoo.in',
    interest: 'Plot',
    budget: '25–50 Lakh',
    property: 'Greenwood Gated Plots - Sultanpur Road',
    message: 'Require 2,000 sq.ft plot with immediate registry & mutation.',
    utm_source: 'google',
    utm_campaign: 'lucknow_plots_search',
    status: 'site-visit',
    assigned_to: callerAmitId,
    created_offset_hours: 36,
    calls: [
      {
        by: 'Amit Verma',
        caller_id: callerAmitId,
        offset_hours: 30,
        outcome: 'Interested',
        note: 'Army veteran looking for retirement home plot. Verified LDA compliance and road width (40ft).',
        next: yesterday
      },
      {
        by: 'Amit Verma',
        caller_id: callerAmitId,
        offset_hours: 8,
        outcome: 'Site visit fixed',
        note: 'Site visit fixed for Day after tomorrow 2 PM. Ready for on-spot token if registry paperwork is clean.',
        next: dayAfter
      }
    ]
  },
  {
    name: 'Sunita Agrawal',
    phone: '9935123456',
    email: 'sunita.agrawal.lko@gmail.com',
    interest: 'Flat',
    budget: '50 Lakh–1 Cr',
    property: 'Nawab Greens 3BHK - Shaheed Path',
    message: 'Family looking for 3BHK near international cricket stadium.',
    utm_source: 'facebook',
    utm_campaign: 'flats_shaheed_path',
    status: 'contacted',
    assigned_to: callerAmitId,
    created_offset_hours: 18,
    calls: [
      {
        by: 'Amit Verma',
        caller_id: callerAmitId,
        offset_hours: 16,
        outcome: 'Baad mein call karein',
        note: 'Client was attending parent-teacher meeting. Requested call back tomorrow around 1:00 PM with price sheet.',
        next: tomorrow
      }
    ]
  },
  {
    name: 'Mohd. Tariq Khan',
    phone: '9335889900',
    email: 'tariq.khan.textiles@gmail.com',
    interest: 'Commercial',
    budget: '50 Lakh–1 Cr',
    property: 'Apex Boulevard Showroom - Faizabad Road',
    message: 'Need high footfall front showroom for retail brand.',
    utm_source: 'whatsapp',
    utm_campaign: 'investor_group_blast',
    status: 'won',
    assigned_to: callerRiyaId,
    created_offset_hours: 72,
    calls: [
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 68,
        outcome: 'Site visit fixed',
        note: 'Direct investor. Met on site for ground floor 650 sq ft unit.',
        next: yesterday
      },
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 20,
        outcome: 'Deal done',
        note: 'Token received ₹2,50,000. Agreement to sale drafted. Deal successfully closed!',
        next: ''
      }
    ]
  },
  {
    name: 'Deepak Tandon',
    phone: '9794112233',
    email: 'deepak.tandon@tcs.com',
    interest: 'Plot',
    budget: '25–50 Lakh',
    property: 'Eldeco County Plots - Vrindavan Yojna',
    message: 'Investment plot in approved township.',
    utm_source: 'google',
    utm_campaign: 'lucknow_plots_search',
    status: 'contacted',
    assigned_to: callerAmitId,
    created_offset_hours: 50,
    calls: [
      {
        by: 'Amit Verma',
        caller_id: callerAmitId,
        offset_hours: 48,
        outcome: 'Baad mein call karein',
        note: 'Client traveling to Delhi. Follow-up was set for yesterday.',
        next: yesterday // This makes it OVERDUE for the demo!
      }
    ]
  },
  {
    name: 'Ananya Mishra',
    phone: '9450334411',
    email: 'ananya.mishra.london@gmail.com',
    interest: 'Ghar / Villa',
    budget: '1 Cr+',
    property: 'Royal Palms Luxury Villa - Sushant Golf City',
    message: 'NRI from London looking for premium luxury villa in Lucknow for parents.',
    utm_source: 'instagram',
    utm_campaign: 'luxury_villas_gomti_nagar',
    status: 'interested',
    assigned_to: callerRiyaId,
    created_offset_hours: 22,
    calls: [
      {
        by: 'Riya Sharma',
        caller_id: callerRiyaId,
        offset_hours: 19,
        outcome: 'Interested',
        note: 'Spoke on WhatsApp call. Shared HD video walkthrough. Brother will visit site on Saturday.',
        next: dayAfter
      }
    ]
  },
  {
    name: 'Vikramaditya Yadav',
    phone: '9198776655',
    email: 'vikram.yadav99@gmail.com',
    interest: 'Plot',
    budget: 'Below 25 Lakh',
    property: 'Greenwood Gated Plots - Sultanpur Road',
    message: 'Need 1200 sq ft plot near Outer Ring Road under 25 Lakh.',
    utm_source: 'facebook',
    utm_campaign: 'flats_shaheed_path',
    status: 'new',
    assigned_to: callerAmitId,
    created_offset_hours: 2,
    calls: []
  },
  {
    name: 'Pooja Kashyap',
    phone: '9919554433',
    email: 'pooja.kashyap@gmail.com',
    interest: 'Flat',
    budget: '25–50 Lakh',
    property: 'Nawab Greens 2BHK - Shaheed Path',
    message: 'Looking for 2 BHK ready to move flat with bank loan assistance.',
    utm_source: 'direct',
    utm_campaign: 'brand',
    status: 'new',
    assigned_to: callerRiyaId,
    created_offset_hours: 1,
    calls: []
  },
  {
    name: 'Er. Manish Tiwari',
    phone: '9838776611',
    email: 'manish.tiwari.upcl@gmail.com',
    interest: 'Plot',
    budget: '25–50 Lakh',
    property: 'Ayodhya Highway Township - Near BBD',
    message: 'Looking for commercial or residential plot on Ayodhya highway corridor.',
    utm_source: 'google',
    utm_campaign: 'lucknow_plots_search',
    status: 'interested',
    assigned_to: callerAmitId,
    created_offset_hours: 15,
    calls: [
      {
        by: 'Amit Verma',
        caller_id: callerAmitId,
        offset_hours: 10,
        outcome: 'Interested',
        note: 'Customer wants to invest for 3-5 years capital appreciation on Ayodhya road. Shared master plan.',
        next: tomorrow
      }
    ]
  }
];

demoLeads.forEach(dl => {
  const leadId = uid();
  const createdAt = new Date(now.getTime() - dl.created_offset_hours * 3600000).toISOString();
  db.prepare(`
    INSERT INTO leads(id, created_at, name, phone, email, interest, budget, message, property, utm_source, utm_medium, utm_campaign, referrer, landing, status, assigned_to)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    leadId,
    createdAt,
    dl.name,
    dl.phone,
    dl.email,
    dl.interest,
    dl.budget,
    dl.message,
    dl.property,
    dl.utm_source,
    'cpc',
    dl.utm_campaign,
    'https://www.google.com',
    'http://localhost:3001/',
    dl.status,
    dl.assigned_to
  );

  (dl.calls || []).forEach(c => {
    const callTime = new Date(now.getTime() - c.offset_hours * 3600000).toISOString();
    db.prepare(`
      INSERT INTO calls(lead_id, caller_id, caller_name, at, outcome, note, next_follow_up)
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `).run(
      leadId,
      c.caller_id,
      c.by,
      callTime,
      c.outcome,
      c.note,
      c.next
    );
  });
});

console.log(`Seeded ${demoLeads.length} realistic Lucknow real estate leads!`);
console.log('Database successfully pre-populated for client demo.');
