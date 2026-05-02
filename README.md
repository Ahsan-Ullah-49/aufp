# Ahsan Ullah Food Point — Official Website 🍔🍕

Professional, high-performance fast-food website built for **Ahsan Ullah Food Point (Okara)**. This project features a real-time admin panel, automated menu management via Firebase, and a premium user interface.

## 🚀 Live Demo
[https://ahsanullahfoodpoint.vercel.app/](https://ahsanullahfoodpoint.vercel.app/)

## ✨ Key Features
- **Modern UI/UX**: Premium design with smooth animations, dark mode aesthetics, and glassmorphism.
- **Dynamic Menu**: Manage products, prices, and availability via the Admin Panel.
- **Real-time Database**: Powered by Firebase Realtime DB for instant updates across all users.
- **WhatsApp Ordering**: Direct "Click to Order" functionality for seamless customer communication.
- **SEO Optimized**: Fully compliant with modern SEO standards, OG tags, and Schema.org structured data.
- **Admin Dashboard**: Secure panel to manage categories, products, deals, and hero slides.

## 📁 Project Structure
```text
aufp/
├── Admin/              # Admin Panel HTML, CSS, and Logic
├── Assets/             # Images, Logos, and Media
├── css/                # Global and Category-specific Styles
├── js/                 # Core logic (Cart, Firebase, DB Management)
├── pages/              # Category pages (Pizza, Burgers, etc.)
└── index.html          # Main Entry Point
```

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6)
- **Frameworks**: TailwindCSS (Utility styles), FontAwesome 6
- **Backend**: Firebase Authentication & Realtime Database
- **Hosting**: Recommended Vercel or Netlify

## ⚙️ Configuration & Deployment

### 1. Firebase Setup
Update the configuration in `Admin/firebase-config.js` with your own Firebase keys:
```javascript
var FIREBASE_CONFIG = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Admin Access
- **Default Credentials**: `admin@aufp.com` / `AhsanAdmin@2026`
- **Accessing Panel**: Triple-click the logo in the footer or visit `Admin/admin-panel.html`.

### 3. Deployment
Simply upload the entire folder to **Vercel** or **Netlify**. No build step is required as this is a high-performance static project.

## 📄 License
© 2026 Ahsan Ullah Food Point. Designed with ❤️ for Okara.
