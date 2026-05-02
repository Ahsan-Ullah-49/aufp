/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Firebase Configuration
 * File: Admin/firebase-config.js
 * ============================================================
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  HOW TO GET YOUR FIREBASE CONFIG (takes ~5 minutes)     │
 * │                                                         │
 * │  1. Go to https://console.firebase.google.com/          │
 * │  2. Click "Add project" → name it anything you like     │
 * │  3. Disable Google Analytics (optional) → Create        │
 * │  4. Click "</>" (Web) icon → Register → copy the config │
 * │  5. Paste your config values below (replace the XXX...) │
 * │  6. Go to "Realtime Database" → Create DB → Test Mode   │
 * │  7. Authentication → Sign-in → Enable Email/Password    │
 * │  8. Authentication → Users → Add User (your admin)      │
 * │  9. In Admin Panel → Firebase Setup → click "Seed Data" │
 * └─────────────────────────────────────────────────────────┘
 *
 * ⭐ CURRENT MODE: DEMO (localStorage only)
 *    → Changes show only in the SAME browser
 *    → To sync across all devices, fill in your config below
 * ============================================================
 */

// ──────────────────────────────────────────────────────────
// ▼▼▼ PASTE YOUR FIREBASE CONFIG HERE ▼▼▼
// (Replace each placeholder value with your real value)
// ──────────────────────────────────────────────────────────
var FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAKQC-lNsZeJo4upvmPDisKoF1fT9jJndw",
  authDomain:        "aufp-cd19c.firebaseapp.com",
  databaseURL:       "https://aufp-cd19c-default-rtdb.firebaseio.com",
  projectId:         "aufp-cd19c",
  storageBucket:     "aufp-cd19c.firebasestorage.app",
  messagingSenderId: "868721814992",
  appId:             "1:868721814992:web:9633a8396d3c326c1d1dd5"
};
// ▲▲▲ PASTE YOUR FIREBASE CONFIG ABOVE ▲▲▲

// ──────────────────────────────────────────────────────────
// DEMO / FALLBACK ADMIN CREDENTIALS
// (Used when Firebase is not configured)
// ──────────────────────────────────────────────────────────
var DEMO_ADMIN = {
  email:    "admin@aufp.com",
  password: "AhsanAdmin@2026"
};

// ──────────────────────────────────────────────────────────
// BUSINESS INFO
// ──────────────────────────────────────────────────────────
var BUSINESS_INFO = {
  name:      "Ahsan Ullah Food Point",
  phone:     "+92 346 7407813",
  whatsapp:  "923467407813",
  address:   "Adda 49/3.R, Okara, Punjab, Pakistan",
  hours:     "12:00 PM – 12:00 AM Daily",
  mapEmbed:  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1706.1517452684784!2d73.29378169999999!3d30.815052499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922a3db21ccdfcb%3A0x841ace418dd31282!2z2K3Ys9in2YYg2KfZhNmE2YAg2YHZiNmN2K_ZvtmI2KfZh9mG2L8!5e0!3m2!1sen!2spk!4v1711666000000",
  facebook:  "https://facebook.com/",
  instagram: "https://instagram.com/",
  delivery:  60,
  minOrder:  200
};

// ──────────────────────────────────────────────────────────
// DATABASE PATH CONSTANTS (do not change)
// ──────────────────────────────────────────────────────────
var DB_PATHS = {
  products:   "products",
  deals:      "deals",
  heroSlides: "hero_slides",
  reviews:    "reviews",
  settings:   "settings",
  categories: "categories",
  orders:     "orders"
};
