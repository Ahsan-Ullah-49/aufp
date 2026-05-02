/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Shopping Cart System
 * File: js/cart.js
 *
 * Features:
 *  - localStorage persistence across pages
 *  - Add / Remove / Update quantity
 *  - Real-time badge counter on all pages
 *  - WhatsApp message builder (auto-formatted)
 *  - Firebase order saving (when connected)
 *  - Toast notifications
 *  - Delivery charge + total calculator
 * ============================================================
 */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────
  var CART_KEY = 'aufp_cart_v2';
  var WA_NUMBER = '923467407813';
  window.DELIVERY_CHARGE = window.DELIVERY_CHARGE || 60;

  // ── State ──────────────────────────────────────────────────
  var _cart = _loadCart();

  // ── Private: Load from localStorage ───────────────────────
  function _loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  // ── Private: Save to localStorage ─────────────────────────
  function _save() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(_cart));
    } catch (e) {
      console.warn('[AUFP Cart] localStorage write failed');
    }
    _updateUI();
  }

  // ── Public: Add item ───────────────────────────────────────
  window.addToCart = function (id, name, price, image) {
    price = parseFloat(price) || 0;
    var existing = _cart.find(function (i) { return i.id === id; });
    if (existing) {
      existing.qty += 1;
    } else {
      _cart.push({ id: id, name: name, price: price, image: image || '', qty: 1 });
    }
    _save();
    _showToast('\u2713 ' + name + ' added to cart!');
    _animateCartIcon();

    // Save to Firebase orders draft (optional tracking)
    _syncCartToFirebase();
  };

  // ── Public: Remove item ────────────────────────────────────
  window.removeFromCart = function (id) {
    _cart = _cart.filter(function (i) { return i.id !== id; });
    _save();
    _syncCartToFirebase();
  };

  // ── Public: Update quantity ────────────────────────────────
  window.updateQty = function (id, newQty) {
    newQty = parseInt(newQty);
    if (isNaN(newQty) || newQty <= 0) {
      window.removeFromCart(id);
      return;
    }
    var item = _cart.find(function (i) { return i.id === id; });
    if (item) {
      item.qty = newQty;
      _save();
      _syncCartToFirebase();
    }
  };

  // ── Public: Clear cart ─────────────────────────────────────
  window.clearCart = function () {
    _cart = [];
    _save();
  };

  // ── Public: Getters ────────────────────────────────────────
  window.getCart    = function () { return _cart.slice(); };
  window.getTotal   = function () { return _cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); };
  window.getCount   = function () { return _cart.reduce(function (s, i) { return s + i.qty; }, 0); };

  // ── UI: Update all badges ──────────────────────────────────
  function _updateUI() {
    var count = window.getCount();
    document.querySelectorAll('.cart-count, .cart-badge').forEach(function (el) {
      el.textContent = count;
      // cart-badge uses display:flex when visible
      if (el.classList.contains('cart-badge')) {
        el.style.display = count > 0 ? 'flex' : 'none';
      }
    });
  }

  // ── UI: Cart icon bounce animation ────────────────────────
  function _animateCartIcon() {
    document.querySelectorAll('.cart-icon-wrapper').forEach(function (el) {
      el.classList.add('cart-bounce');
      setTimeout(function () { el.classList.remove('cart-bounce'); }, 600);
    });
  }

  // ── Toast notification ─────────────────────────────────────
  window.showToast = function (msg, type) {
    // Remove existing toast
    var old = document.getElementById('aufp-cart-toast');
    if (old) old.remove();

    var toast = document.createElement('div');
    toast.id = 'aufp-cart-toast';
    var colors = { success: '#FEA600', error: '#D8040B', info: '#3b82f6' };
    var t = type || 'success';
    toast.style.cssText = [
      'position:fixed', 'bottom:80px', 'right:24px', 'z-index:9999',
      'background:#090808', 'color:#fff',
      'font-family:"Nunito Sans",sans-serif', 'font-size:0.85rem', 'font-weight:600',
      'padding:12px 18px', 'border-radius:10px',
      'border-left:4px solid ' + (colors[t] || colors.success),
      'box-shadow:0 4px 20px rgba(0,0,0,0.35)',
      'display:flex', 'align-items:center', 'gap:10px',
      'max-width:280px',
      'transform:translateX(120%)', 'transition:transform 0.35s ease',
      'pointer-events:none'
    ].join(';');
    toast.innerHTML = '<i class="fas ' + (t === 'error' ? 'fa-times-circle' : 'fa-check-circle') + '" style="color:' + (colors[t] || colors.success) + ';font-size:1rem;"></i>' + msg;
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.transform = 'translateX(0)'; }, 10);
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toast.style.transform = 'translateX(120%)';
      setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
  };

  // Alias for backward compat
  window._showToast = window.showToast;

  // ── Firebase: Sync cart (light tracking) ──────────────────
  function _syncCartToFirebase() {
    // Only syncs if Firebase is connected — non-blocking
    if (typeof AUFP === 'undefined' || !AUFP.isReady() || AUFP.isFallback()) return;
    // We don't push draft carts — just save when order placed
  }

  // ── WhatsApp: Build message ────────────────────────────────
  function _buildWAMessage(customerData) {
    var d          = customerData || {};
    var name       = d.name    || 'Customer';
    var phone      = d.phone   || 'N/A';
    var address    = d.address || 'N/A';
    var note       = d.note    || '';
    var dc         = window.DELIVERY_CHARGE || 60;
    var subtotal   = window.getTotal();
    var total      = subtotal + dc;
    var orderId    = 'ORD-' + Date.now().toString().slice(-6);

    var itemLines  = _cart.map(function (i) {
      return '  - ' + i.name + ' x ' + i.qty + '  →  Rs. ' + (i.price * i.qty).toLocaleString();
    }).join('\n');

    var msg =
      '*━━━ NEW ORDER ━━━*\n' +
      '*Ahsan Ullah Food Point*\n' +
      'Order ID: #' + orderId + '\n\n' +
      '🛒 *ITEMS:*\n' + itemLines + '\n\n' +
      '💰 Subtotal:  Rs. ' + subtotal.toLocaleString() + '\n' +
      '🚗 Delivery:  Rs. ' + dc + '\n' +
      '✅ *TOTAL:    Rs. ' + total.toLocaleString() + '*\n\n' +
      '👤 *CUSTOMER:*\n' +
      'Name:    ' + name + '\n' +
      'Phone:   ' + phone + '\n' +
      'Address: ' + address +
      (note ? '\nNote:    ' + note : '') + '\n\n' +
      '_Powered by AhsanUllahFoodPoint.com_';

    return { msg: msg, total: total, orderId: orderId };
  }

  // ── WhatsApp: Place order ─────────────────────────────────
  window.placeOrderOnWhatsApp = function (customerData) {
    if (_cart.length === 0) {
      window.showToast('Your cart is empty! Add items first.', 'error');
      return false;
    }
    var built   = _buildWAMessage(customerData);
    var encoded = encodeURIComponent(built.msg);
    var waNum   = (typeof BUSINESS_INFO !== 'undefined' && BUSINESS_INFO.whatsapp) || WA_NUMBER;

    // Save order to Firebase
    _saveOrderToFirebase(customerData, built.total, built.orderId);

    // Open WhatsApp
    window.open('https://wa.me/' + waNum + '?text=' + encoded, '_blank');
    return true;
  };

  // ── Save order (always — both localStorage and Firebase modes) ────
  function _saveOrderToFirebase(customerData, total, orderId) {
    var orderData = {
      orderId:   orderId,
      name:      (customerData && customerData.name)    || 'Customer',
      phone:     (customerData && customerData.phone)   || '',
      address:   (customerData && customerData.address) || '',
      note:      (customerData && customerData.note)    || '',
      items:     _cart.slice(),
      subtotal:  window.getTotal(),
      delivery:  window.DELIVERY_CHARGE || 60,
      total:     total,
      status:    'pending',
      timestamp: Date.now(),
      source:    'whatsapp'
    };

    if (typeof AUFP !== 'undefined' && AUFP.isReady()) {
      // Works in BOTH demo (localStorage) and Firebase modes
      AUFP.push('orders', orderData,
        function () { console.info('[AUFP Cart] Order saved: ' + orderId); },
        function (e) { console.warn('[AUFP Cart] Order save error:', e && e.message); }
      );
    } else {
      // AUFP not ready yet — save directly to localStorage as fallback
      try {
        var existing = JSON.parse(localStorage.getItem('aufp_v2_orders')) || {};
        var newKey   = 'ord-' + Date.now().toString(36);
        existing[newKey] = orderData;
        localStorage.setItem('aufp_v2_orders', JSON.stringify(existing));
        console.info('[AUFP Cart] Order saved to localStorage directly: ' + orderId);
      } catch(e) { console.warn('[AUFP Cart] Direct localStorage save failed'); }
    }
  }

  // ── Size Modal (category pages) ───────────────────────────
  var _sizeModal = { id: '', name: '', prices: {}, image: '', selected: 'medium' };

  window.openSizeModal = function (id, name, priceSmall, priceMed, priceLarge, img) {
    _sizeModal = { id: id, name: name, prices: { small: priceSmall, medium: priceMed, large: priceLarge }, image: img || '', selected: 'medium' };

    var modal = document.getElementById('size-modal');
    if (!modal) {
      // Build modal if not in page
      _buildSizeModal();
      modal = document.getElementById('size-modal');
    }

    var titleEl = document.getElementById('sm-product-title');
    if (titleEl) titleEl.textContent = name;

    ['small', 'medium', 'large'].forEach(function (sz) {
      var btn      = document.getElementById('sm-btn-' + sz);
      var priceEl  = document.getElementById('sm-price-' + sz);
      var p        = _sizeModal.prices[sz] || 0;
      if (priceEl) priceEl.textContent = 'Rs. ' + p.toLocaleString();
      if (btn)    btn.classList.toggle('selected', sz === 'medium');
    });

    if (modal) modal.classList.add('open');
  };

  window.selectSizeOption = function (sz) {
    _sizeModal.selected = sz;
    ['small', 'medium', 'large'].forEach(function (s) {
      var btn = document.getElementById('sm-btn-' + s);
      if (btn) btn.classList.toggle('selected', s === sz);
    });
  };

  window.confirmSizeAdd = function () {
    var price  = _sizeModal.prices[_sizeModal.selected] || 0;
    var szLbl  = _sizeModal.selected.charAt(0).toUpperCase() + _sizeModal.selected.slice(1);
    var fullId = _sizeModal.id + '-' + _sizeModal.selected;
    window.addToCart(fullId, _sizeModal.name + ' (' + szLbl + ')', price, _sizeModal.image);
    var modal = document.getElementById('size-modal');
    if (modal) modal.classList.remove('open');
  };

  // Build size modal dynamically if not present in HTML
  function _buildSizeModal() {
    var div = document.createElement('div');
    div.id  = 'size-modal';
    div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s;';
    div.innerHTML = [
      '<div class="size-modal-card" style="background:#fff;border-radius:20px;padding:26px;max-width:380px;width:90%;transform:scale(0.95);transition:transform 0.3s;">',
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">',
      '<div>',
      '<p style="font-size:0.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:4px;">Choose Size</p>',
      '<h3 id="sm-product-title" style="font-family:\'Oswald\',sans-serif;font-size:1.1rem;font-weight:700;text-transform:uppercase;color:#090808;"></h3>',
      '</div>',
      '<button onclick="document.getElementById(\'size-modal\').classList.remove(\'open\')" style="background:#f3f4f6;border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:1rem;color:#555;">✕</button>',
      '</div>',
      _szBtn('small',  'Small (7")',   '2 slices – Personal'),
      _szBtn('medium', 'Medium (10")', '4 slices – Regular'),
      _szBtn('large',  'Large (14")',  '8 slices – Family'),
      '<button onclick="window.confirmSizeAdd()" style="width:100%;background:#D8040B;color:#fff;border:none;padding:13px;border-radius:10px;font-family:\'Oswald\',sans-serif;font-size:0.92rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;">',
      '<span>🛒</span> Add to Cart</button>',
      '</div>'
    ].join('');
    document.body.appendChild(div);
    // Click outside to close
    div.addEventListener('click', function (e) {
      if (e.target === div) div.classList.remove('open');
    });
    // CSS open state
    var style = document.createElement('style');
    style.textContent = '#size-modal.open{opacity:1!important;pointer-events:all!important;}#size-modal.open .size-modal-card{transform:scale(1)!important;}';
    document.head.appendChild(style);
  }

  function _szBtn(id, label, sublabel) {
    return '<button id="sm-btn-' + id + '" class="size-sel-btn" onclick="window.selectSizeOption(\'' + id + '\')"'
      + ' style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;cursor:pointer;width:100%;background:#fff;margin-bottom:10px;transition:all 0.2s;">'
      + '<div><p style="font-family:\'Oswald\',sans-serif;font-size:0.88rem;font-weight:600;text-transform:uppercase;color:#090808;">' + label + '</p>'
      + '<p style="font-size:0.72rem;color:#888;">' + sublabel + '</p></div>'
      + '<p id="sm-price-' + id + '" style="font-family:\'Oswald\',sans-serif;font-weight:700;color:#D8040B;font-size:1rem;"></p>'
      + '</button>';
  }

  // ── Init ───────────────────────────────────────────────────
  var _bounceCSS = document.createElement('style');
  _bounceCSS.textContent = '@keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.3)}60%{transform:scale(0.9)}}.cart-bounce{animation:cartBounce 0.6s ease}';
  document.head.appendChild(_bounceCSS);

  document.addEventListener('DOMContentLoaded', function () {
    _updateUI();
  });

  // Expose internal for cart page render
  window._cartInternal = {
    getCart:  function () { return _cart; },
    save:     _save,
    buildMsg: _buildWAMessage
  };

})();
