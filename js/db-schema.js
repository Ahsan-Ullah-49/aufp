/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Database Schema & Default Data
 * File: js/db-schema.js
 * Purpose: Fallback data when Firebase is offline + seed data
 * ============================================================
 */

var DEFAULT_DATA = {

  settings: {
    businessName:   "Ahsan Ullah Food Point",
    tagline:        "Pizza Aisa, Ke Dil Khush Ho Jaye!",
    subTagline:     "Bhook Mitao, Magar Pyar Se.",
    phone:          "+92 346 7407813",
    whatsapp:       "923467407813",
    address:        "Adda 49/3.R, Okara, Punjab, Pakistan",
    openingHours:   "12 PM – 12 AM Daily",
    facebookUrl:    "https://facebook.com/",
    instagramUrl:   "https://instagram.com/",
    aboutText:      "At Ahsan Ullah Food Point, we believe that quality food is the heart of community. Our founder Muhammad Ahsan Ullah envisioned a place where families could enjoy fast food without compromise. Serving fresh and delicious food since 2019.",
    logoUrl:        "Assets/logo/logo.png",
    deliveryCharge: 60,
    minOrderAmount: 200,
    establishedYear: 2019,
    mapEmbed:       "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1706.1517452684784!2d73.29378169999999!3d30.815052499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922a3db21ccdfcb%3A0x841ace418dd31282!2z2K3Ys9in2YYg2KfZhNmE2YAg2YHZiNmN2K_ZvtmI2KfZh9mG2L8!5e0!3m2!1sen!2spk!4v1711666000000",
    heroTitle:      "Fresh Fast Food",
    heroBadge:      "🔥 Limited Time Offers"
  },

  categories: {
    pizza:  { name:"Pizzas",     icon:"🍕", order:1, active:true,  slug:"category-pizza.html" },
    burger: { name:"Burgers",    icon:"🍔", order:2, active:true,  slug:"category-burgers.html" },
    wrap:   { name:"Wraps",      icon:"🌯", order:3, active:true,  slug:"category-wraps.html" },
    wings:  { name:"Wings",      icon:"🍗", order:4, active:true,  slug:"category-wings.html" },
    tea:    { name:"Tea",        icon:"☕", order:5, active:true,  slug:"category-tea.html" },
    cold:   { name:"Colddrinks", icon:"🥤", order:6, active:true,  slug:"category-cold.html" }
  },

  products: {
    "sp-pizza": {
      name:"Ahsan Special Pizza", category:"pizza",
      priceSmall:700, priceMedium:1000, priceLarge:1300,
      description:"Loaded with chicken, veggies and our signature sauce. Baked fresh in our stone oven.",
      image:"Assets/images/32.png",
      badge:"Best Seller", badgeType:"gold",
      available:true, featured:true, order:1
    },
    "mb-pizza": {
      name:"Malai Boti Pizza", category:"pizza",
      priceSmall:750, priceMedium:1100, priceLarge:1400,
      description:"Creamy malai boti chunks over a cheesy, flavour-packed base. A crowd favourite!",
      image:"Assets/images/36.png",
      badge:"Popular", badgeType:"red",
      available:true, featured:true, order:2
    },
    "ct-pizza": {
      name:"Chicken Tikka Pizza", category:"pizza",
      priceSmall:650, priceMedium:950, priceLarge:1250,
      description:"Spicy tikka chicken with peppers and mozzarella on a thin crispy crust.",
      image:"Assets/images/31.png",
      badge:"", badgeType:"",
      available:true, featured:false, order:3
    },
    "zinger": {
      name:"Zinger Burger", category:"burger",
      priceSmall:280, priceMedium:350, priceLarge:420,
      description:"Crispy fried chicken fillet with special sauce, fresh lettuce and tomato.",
      image:"Assets/images/19.png",
      badge:"", badgeType:"",
      available:true, featured:true, order:1
    },
    "cdg-burger": {
      name:"Chicken D.Gr Burger", category:"burger",
      priceSmall:340, priceMedium:420, priceLarge:500,
      description:"Double grilled chicken patty with signature mayo and fresh vegetables.",
      image:"Assets/images/Malai boti.jpeg",
      badge:"", badgeType:"",
      available:true, featured:true, order:2
    },
    "mb-wrap": {
      name:"Malai Boti Wrap", category:"wrap",
      priceSmall:220, priceMedium:280, priceLarge:350,
      description:"Tender malai boti in soft roti with fresh raita and green chutney.",
      image:"Assets/images/45.png",
      badge:"Best Seller", badgeType:"gold",
      available:true, featured:false, order:1
    },
    "ct-wrap": {
      name:"Chicken Tikka Wrap", category:"wrap",
      priceSmall:200, priceMedium:260, priceLarge:320,
      description:"Spicy tikka pieces wrapped with fresh salad and mint chutney.",
      image:"Assets/images/48.png",
      badge:"", badgeType:"",
      available:true, featured:false, order:2
    },
    "wings-10": {
      name:"Hot Wings (10 Pcs)", category:"wings",
      priceSmall:700, priceMedium:700, priceLarge:700,
      description:"Spicy, crispy and juicy wings. Served with garlic dipping sauce.",
      image:"Assets/images/22.png",
      badge:"🔥 Hot", badgeType:"gold",
      available:true, featured:true, order:1
    },
    "wings-20": {
      name:"Hot Wings (20 Pcs)", category:"wings",
      priceSmall:1300, priceMedium:1300, priceLarge:1300,
      description:"Double the wings, double the fun! Perfect for family sharing.",
      image:"Assets/images/42.png",
      badge:"Family", badgeType:"red",
      available:true, featured:false, order:2
    },
    "chai-dp": {
      name:"Doodh Pati Chai", category:"tea",
      priceSmall:80, priceMedium:80, priceLarge:80,
      description:"Rich, creamy milk tea brewed fresh. Classic Pakistani doodh pati.",
      image:"Assets/images/WhatsApp Image 2026-03-12 at 1.12.22 PM (1).jpeg",
      badge:"Classic", badgeType:"gold",
      available:true, featured:false, order:1
    },
    "cola-1.5": {
      name:"Coca-Cola 1.5L", category:"cold",
      priceSmall:200, priceMedium:200, priceLarge:200,
      description:"Chilled Coca-Cola 1.5 litre. Pairs perfectly with any meal.",
      image:"Assets/images/crown crest.jpeg",
      badge:"", badgeType:"",
      available:true, featured:false, order:1
    },
    "pepsi-1.5": {
      name:"Pepsi 1.5L", category:"cold",
      priceSmall:200, priceMedium:200, priceLarge:200,
      description:"Chilled Pepsi to refresh your taste buds after every bite.",
      image:"Assets/images/23.png",
      badge:"", badgeType:"",
      available:true, featured:false, order:2
    }
  },

  deals: {
    "deal-2pizza": {
      title:"Buy 2 Special Large Pizzas",
      subtitle:"Get 2 Litre Colddrink FREE!",
      originalPrice:2400, dealPrice:1800,
      description:"2x Large Special Pizzas + 2 Litre Colddrink. Best value for families!",
      image:"Assets/images/WhatsApp Image 2026-03-12 at 1.12.14 PM (1).jpeg",
      badge:"🔥 Best Deal", active:true, featured:true, order:1
    },
    "deal-wings": {
      title:"20 Wings + Fries Combo",
      subtitle:"Perfect for the whole family!",
      originalPrice:1600, dealPrice:1200,
      description:"20 Pieces Spicy Hot Wings + Large Fries. Great for sharing!",
      image:"Assets/images/burger.jpeg",
      badge:"🍗 Hot Deal", active:true, featured:true, order:2
    },
    "deal-burger2": {
      title:"Burger Combo for 2",
      subtitle:"Perfect for a date!",
      originalPrice:1450, dealPrice:1100,
      description:"2x Zinger Burgers + 2x Fries + 1.5L Colddrink.",
      image:"Assets/images/34.png",
      badge:"🍔 Combo", active:true, featured:false, order:3
    },
    "family-feast": {
      title:"Family Feast Combo",
      subtitle:"Feed the whole family!",
      originalPrice:3000, dealPrice:2200,
      description:"1 Large Pizza + 10 Wings + 2 Wraps + 2L Colddrink.",
      image:"Assets/images/38.png",
      badge:"👨‍👩‍👧 Family", active:true, featured:false, order:4
    }
  },

  hero_slides: {
    "slide-1": {
      image:"Assets/images/33.png",
      label:"Fresh Fast Food",
      headline:"Pizza Aisa, Ke Dil Khush Ho Jaye!",
      subtext:"Baked fresh daily with premium ingredients. Best pizza in Okara — guaranteed.",
      btnText:"View Menu", btnLink:"menu.html", active:true, order:1
    },
    "slide-2": {
      image:"Assets/images/22.png",
      label:"Hot & Crispy",
      headline:"Burgers Loaded With Flavour",
      subtext:"Zinger, Malai Boti, Special Chicken — every bite tells a story.",
      btnText:"Order Now", btnLink:"menu.html", active:true, order:2
    },
    "slide-3": {
      image:"Assets/images/27.png",
      label:"Sizzling Deals",
      headline:"Khao Magar Pyar Se!",
      subtext:"From our oven to your table — fresh, tasty, affordable. Since 2019.",
      btnText:"See Deals", btnLink:"deals.html", active:true, order:3
    },
    "slide-4": {
      image:"Assets/images/7.png",
      label:"Bhook Mitao",
      headline:"Wings, Wraps & More!",
      subtext:"A menu for every craving — Wings, Wraps, Tea, Colddrinks and Pizzas.",
      btnText:"Full Menu", btnLink:"menu.html", active:true, order:4
    }
  },


  reviews: {
    "rev-1": { name:"Ali Hassan",    location:"Okara City",        rating:5, text:"Ekdum lajawab pizza! Maine kabhi itna tasty pizza Okara mein nahi khaya. Delivery bhi fast thi. Highly recommended!", avatar:"https://i.pravatar.cc/42?img=3",  active:true, order:1 },
    "rev-2": { name:"Hina Fatima",   location:"Model Town, Okara", rating:5, text:"Zinger burger was absolutely amazing! Better than any fast food chain in the city. Will definitely order again.",        avatar:"https://i.pravatar.cc/42?img=5",  active:true, order:2 },
    "rev-3": { name:"Usman Tariq",   location:"Depalpur Road",     rating:4, text:"Wings were super crispy and perfectly spiced. Ordered for family gathering and everyone loved it. Great value!",         avatar:"https://i.pravatar.cc/42?img=8",  active:true, order:3 },
    "rev-4": { name:"Sara Ahmed",    location:"New Colony, Okara", rating:5, text:"Malai Boti Wrap is my absolute favourite! Taste is authentic and the portion is generous. Best in Okara!",              avatar:"https://i.pravatar.cc/42?img=12", active:true, order:4 },
    "rev-5": { name:"Bilal Sheikh",  location:"Satellite Town",    rating:5, text:"WhatsApp ordering is so convenient! Order kiya aur 20 min mein deliver ho gaya. Bahut acha experience!",                avatar:"https://i.pravatar.cc/42?img=15", active:true, order:5 }
  }

};

// ── Utility: Sort object by .order field ──────────────────
function sortByOrder(obj) {
  if (!obj) return [];
  return Object.entries(obj)
    .map(function(e) { return Object.assign({ _id: e[0] }, e[1]); })
    .sort(function(a, b) { return (a.order || 99) - (b.order || 99); });
}
