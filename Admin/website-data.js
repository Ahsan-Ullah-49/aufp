/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Website Data Renderer v2
 * File: Admin/website-data.js
 *
 * Reads from AUFP (localStorage or Firebase) and renders
 * dynamic content on all website pages in real-time.
 *
 * Race condition FIXED: Uses AUFP.onReady() instead of events.
 * ============================================================
 */

(function () {
  'use strict';

  // Use AUFP.onReady which queues if not ready yet,
  // OR fires immediately if already ready — no race condition!
  function start() {
    AUFP.onReady(function () {
      _renderHeroSlides();
      _renderBestSellers();
      _renderDeals();
      _renderHotOffers();
      _renderReviews();
      _renderMenu();
      _applySettings();
    });
  }

  // Also register DOMContentLoaded in case AUFP hasn't loaded yet
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // ════════════════════════════════════════════
  // IMAGE PATH HELPER
  // ════════════════════════════════════════════
  /**
   * Robustly determines the correct image path.
   * Handles absolute URLs (http, https, //), data URLs, and root-relative paths.
   */
  function _getImgPath(img) {
    if (!img) return (window.IS_ROOT ? 'Assets/logo/logo.png' : '../Assets/logo/logo.png');
    
    var s = String(img).trim();
    // If it's an absolute URL, data URL, or starts with // or /, use it as is
    if (/^(https?:|data:|(\/\/)|(\/))/i.test(s)) {
      return s;
    }
    // Otherwise, prepend ../ if we are in a subdirectory (like /pages/)
    return (window.IS_ROOT ? '' : '../') + s;
  }

  // ════════════════════════════════════════════
  // HERO SLIDES
  // ════════════════════════════════════════════
  function _renderHeroSlides() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    AUFP.listen('hero_slides', function (data) {
      if (!data) return;
      var slides = _sort(data).filter(function (s) { return s.active; });
      if (!slides.length) return;

      var slidesHtml = slides.map(function (s, i) {
        return '<div class="hero-slide' + (i === 0 ? ' active' : '') + '"'
          + ' style="background-image:url(\'' + _getImgPath(s.image) + '\')">'
          + '<div class="hero-overlay"></div>'
          + '<div class="hero-content">'
          + '<div class="hero-text">'
          + '<p class="font-display text-secondary text-sm font-semibold tracking-widest uppercase mb-3">' + _esc(s.label || '') + '</p>'
          + '<h1 class="hero-tagline">' + (s.headline || '').replace(/\|/g, '<br>') + '</h1>'
          + '<p class="hero-sub">' + _esc(s.subtext || '') + '</p>'
          + '<div class="flex gap-3 flex-wrap">'
          + '<a href="' + (window.IS_ROOT ? 'pages/' : '') + _esc(s.btnLink || 'menu.html') + '" class="btn-gold"><i class="fas fa-utensils"></i> View Menu</a>'
          + '<a href="' + (window.IS_ROOT ? 'pages/' : '') + 'deals.html" class="btn-secondary btn-hero-deals" style="border-color:rgba(255,255,255,0.5);color:#fff;"><i class="fas fa-tag"></i> Deals</a>'
          + '</div></div>'
          + '<div class="hidden lg:block" style="width:280px; flex-shrink:0;"></div>'
          + '</div></div>';
      }).join('');

      var dotsHtml = slides.map(function (_, i) {
        return '<button class="slider-dot' + (i === 0 ? ' active' : '') + '"></button>';
      }).join('');

      // Replace old slides
      hero.querySelectorAll('.hero-slide').forEach(function (s) { s.remove(); });
      hero.insertAdjacentHTML('afterbegin', slidesHtml);

      var dotsDiv = hero.querySelector('.slider-dots');
      if (dotsDiv) dotsDiv.innerHTML = dotsHtml;

      // Re-init slider (function defined in main.js)
      if (typeof window.initHeroSlider === 'function') {
        window.initHeroSlider();
      }
    });
  }

  // ════════════════════════════════════════════
  // BEST SELLERS (homepage)
  // ════════════════════════════════════════════
  function _renderBestSellers() {
    var container = document.getElementById('best-sellers-container');
    if (!container) return;

    AUFP.listen('products', function (data) {
      if (!data) return;
      var items = _sort(data).filter(function (p) { return p.featured && p.available; }).slice(0, 6);
      if (!items.length) return;

      container.innerHTML = items.map(function (p) {
        var badge = p.badge
          ? '<span class="product-badge ' + (p.badgeType === 'red' ? 'red' : '') + '">' + _esc(p.badge) + '</span>'
          : '';
        var price    = p.category === 'pizza' ? (p.priceMedium || p.priceSmall || 0) : (p.priceSmall || p.priceMedium || 0);
        var hasSizes = p.category === 'pizza' && p.priceSmall && p.priceLarge && p.priceSmall !== p.priceLarge;
        var cartBtn  = hasSizes
          ? '<button class="add-to-cart-btn" onclick="openSizeModal(\'' + p._id + '\',\'' + _jesc(p.name) + '\',' + (p.priceSmall||0) + ',' + (p.priceMedium||0) + ',' + (p.priceLarge||0) + ',\'' + _jesc(p.image||'') + '\')"><i class="fas fa-cart-plus"></i> Add to Cart</button>'
          : '<button class="add-to-cart-btn" onclick="addToCart(\'' + p._id + '\',\'' + _jesc(p.name) + '\',' + price + ',\'' + _jesc(p.image||'') + '\')"><i class="fas fa-cart-plus"></i> Add to Cart</button>';

        return '<div class="product-card">'
          + '<div class="product-card-img-wrap">'
          + '<img src="' + _getImgPath(p.image) + '" alt="' + _esc(p.name) + '" class="product-card-img" loading="lazy"'
          + ' onerror="this.src=\'' + _getImgPath('') + '\'"/>'
          + badge + '</div>'
          + '<div class="product-card-body">'
          + '<p class="product-card-name">' + _esc(p.name) + '</p>'
          + '<p class="product-card-desc">' + _esc(p.description || '') + '</p>'
          + '<p class="product-card-price">Rs. ' + price.toLocaleString() + '</p>'
          + cartBtn + '</div></div>';
      }).join('');
    });
  }

  // ════════════════════════════════════════════
  // DEALS PAGE
  // ════════════════════════════════════════════
  function _renderDeals() {
    var container = document.getElementById('deals-container');
    if (!container) return;

    AUFP.listen('deals', function (data) {
      var items = _sort(data).filter(function (d) { return d.active; });

      if (!items.length) {
        container.innerHTML = '<div class="text-center py-16 text-gray-400">'
          + '<i class="fas fa-tag text-5xl mb-4 block opacity-30"></i>'
          + '<p class="font-display text-xl uppercase tracking-wide">No deals available right now</p>'
          + '<p class="text-sm mt-2">Check back soon for amazing offers!</p></div>';
        return;
      }

      container.innerHTML = items.map(function (d) {
        var savings = (d.originalPrice || 0) - (d.dealPrice || 0);
        return '<div class="deal-card-horizontal reveal">'
          + '<img src="' + _getImgPath(d.image) + '" alt="' + _esc(d.title) + '" class="deal-img" loading="lazy"'
          + ' onerror="this.src=\'' + _getImgPath('') + '\'"/>'
          + '<div class="flex flex-col justify-center p-6 flex-1">'
          + '<div class="deal-badge-strip mb-3 self-start">' + _esc(d.badge || 'Special Deal') + '</div>'
          + '<h3 class="font-display text-2xl font-bold uppercase text-dark mb-1">' + _esc(d.title) + '</h3>'
          + '<p class="text-gray-500 text-sm mb-3">' + _esc(d.description || d.subtitle || '') + '</p>'
          + '<div class="flex items-center gap-3 mb-4">'
          + '<span class="font-display text-3xl text-primary font-bold">Rs. ' + (d.dealPrice || 0).toLocaleString() + '</span>'
          + '<span class="text-gray-400 line-through text-sm">Rs. ' + (d.originalPrice || 0).toLocaleString() + '</span>'
          + (savings > 0 ? '<span class="savings-tag">Save Rs. ' + savings.toLocaleString() + '</span>' : '')
          + '</div>'
          + '<div class="flex gap-3 flex-wrap">'
          + '<button class="btn-primary text-sm" onclick="addToCart(\'' + _jesc(d._id) + '\',\'' + _jesc(d.title) + '\',' + (d.dealPrice || 0) + ',\'' + _jesc(d.image || '') + '\')">'
          + '<i class="fas fa-cart-plus"></i> Add to Cart</button>'
          + '</div></div></div>';
      }).join('');
    });
  }

  // ════════════════════════════════════════════
  // HOT OFFERS (homepage)
  // ════════════════════════════════════════════
  function _renderHotOffers() {
    var container = document.getElementById('hot-offers-container');
    if (!container) return;

    AUFP.listen('deals', function (data) {
      if (!data) return;
      var items = _sort(data).filter(function (d) { return d.active && d.featured; }).slice(0, 2);
      if (!items.length) {
        items = _sort(data).filter(function (d) { return d.active; }).slice(0, 2);
      }

      if (!items.length) {
        container.innerHTML = '<p class="text-white/50 text-center py-10">No hot offers available right now.</p>';
        return;
      }

      container.innerHTML = items.map(function (d, i) {
        var mt = (i > 0) ? ' mt-4' : '';
        return '<div class="deal-promo-card' + mt + '">'
          + '<div class="flex gap-5 items-start">'
          + '<img src="' + _getImgPath(d.image) + '" alt="' + _esc(d.title) + '" class="w-36 h-36 rounded-xl object-cover flex-shrink-0 shadow-2xl"'
          + ' onerror="this.src=\'' + _getImgPath('') + '\'"/>'
          + '<div>'
          + '<p class="font-display text-secondary text-xs tracking-widest uppercase mb-1">' + _esc(d.badge || 'Special Deal') + '</p>'
          + '<h3 class="font-display text-white text-2xl font-bold uppercase leading-tight mb-2">' + _esc(d.title) + '</h3>'
          + '<p class="text-white/70 text-sm mb-3">' + _esc(d.subtitle || '') + '</p>'
          + '<p class="font-display text-3xl text-white font-bold">Rs. ' + (d.dealPrice || 0).toLocaleString() + '</p>'
          + '<p class="text-white/50 text-xs line-through mb-4">Rs. ' + (d.originalPrice || 0).toLocaleString() + '</p>'
          + '<button class="btn-gold text-sm px-5 py-2" onclick="addToCart(\'' + _jesc(d._id) + '\',\'' + _jesc(d.title) + '\',' + (d.dealPrice || 0) + ',\'' + _jesc(d.image || '') + '\')"><i class="fas fa-bolt"></i> Order Now</button>'
          + '</div></div></div>';
      }).join('');
    });
  }

  // ════════════════════════════════════════════
  function _renderMenu() {
    var container = document.getElementById('menu-container');
    if (!container) return;

    AUFP.listen('products', function (data) {
      var items = _sort(data).filter(function (p) { return p.available; });

      if (!items.length) {
        container.innerHTML = '<div class="col-span-full text-center py-16 text-gray-400">'
          + '<i class="fas fa-utensils text-4xl mb-4 block opacity-30"></i>'
          + '<p>Menu is being updated. Check back soon!</p></div>';
        return;
      }

      container.innerHTML = items.map(function (p) {
        var badge    = p.badge ? '<span class="product-badge ' + (p.badgeType === 'red' ? 'red' : '') + '">' + _esc(p.badge) + '</span>' : '';
        var price    = p.category === 'pizza' ? (p.priceMedium || p.priceSmall || 0) : (p.priceSmall || p.priceMedium || 0);
        var hasSizes = p.category === 'pizza' && p.priceSmall && p.priceLarge && p.priceSmall !== p.priceLarge;

        var sizeHtml = '';
        if (hasSizes) {
          sizeHtml = '<div class="size-selector">'
            + _sBtn(p, 'small',  p.priceSmall  || 0, 'Small')
            + _sBtn(p, 'medium', p.priceMedium || 0, 'Medium', true)
            + _sBtn(p, 'large',  p.priceLarge  || 0, 'Large')
            + '</div>';
        }

        return '<div class="product-card" data-cat="' + (p.category||'') + '" data-name="' + _esc((p.name||'').toLowerCase()) + '">'
          + '<div class="product-card-img-wrap">'
          + '<img src="' + _getImgPath(p.image) + '" alt="' + _esc(p.name) + '" class="product-card-img" loading="lazy"'
          + ' onerror="this.src=\'' + _getImgPath('') + '\'"/>'
          + badge + '</div>'
          + '<div class="product-card-body">'
          + '<p class="product-card-name">' + _esc(p.name) + '</p>'
          + '<p class="product-card-desc">' + _esc(p.description||'') + '</p>'
          + sizeHtml
          + '<p class="product-card-price" id="mprice-' + p._id + '">Rs. ' + price.toLocaleString() + '</p>'
          + '<button class="add-to-cart-btn" id="mbtn-' + p._id + '"'
          + ' onclick="addToCart(\'' + p._id + '-medium\',\'' + _jesc(p.name) + ' (Medium)\',' + price + ',\'' + _jesc(p.image||'') + '\')">'
          + '<i class="fas fa-cart-plus"></i> Add to Cart</button>'
          + '</div></div>';
      }).join('');

      _attachMenuFilter();
    });
  }

  function _sBtn(p, sz, price, label, selected) {
    var id   = p._id;
    var name = _jesc(p.name);
    var img  = _jesc(p.image||'');
    return '<button class="size-btn' + (selected ? ' selected' : '') + '"'
      + ' onclick="(function(btn,id,name,img,price){'
      + 'btn.parentElement.querySelectorAll(\'.size-btn\').forEach(function(b){b.classList.remove(\'selected\')});'
      + 'btn.classList.add(\'selected\');'
      + 'var pe=document.getElementById(\'mprice-\'+id);if(pe)pe.textContent=\'Rs. \'+price.toLocaleString();'
      + 'var be=document.getElementById(\'mbtn-\'+id);if(be){be.onclick=function(){addToCart(id+\'-' + sz + '\',name+\' (' + label + ')\',price,img);}}'
      + '})(this,\'' + id + '\',\'' + name + '\',\'' + img + '\',' + price + ')">'
      + label + '<br><span style="color:var(--primary);font-size:0.68rem;">Rs.' + price.toLocaleString() + '</span>'
      + '</button>';
  }

  function _attachMenuFilter() {
    var tabs   = document.querySelectorAll('#categories-container .cat-tab, .cat-tab[data-cat]');
    var search = document.getElementById('menu-search');
    var grid   = document.getElementById('menu-container');
    var noRes  = document.getElementById('no-results');

    function doFilter() {
      var active = document.querySelector('.cat-tab.active');
      var cat    = active ? active.dataset.cat : 'all';
      var term   = search ? search.value.toLowerCase().trim() : '';
      var cards  = grid ? grid.querySelectorAll('.product-card') : [];
      var count  = 0;
      cards.forEach(function (c) {
        var cm = cat === 'all' || c.dataset.cat === cat;
        var nm = !term || (c.dataset.name || '').includes(term);
        c.style.display = (cm && nm) ? '' : 'none';
        if (cm && nm) count++;
      });
      if (noRes) noRes.classList.toggle('hidden', count > 0);
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        doFilter();
      });
    });
    if (search) search.addEventListener('input', doFilter);
  }


  // ════════════════════════════════════════════
  // REVIEWS (homepage)
  // ════════════════════════════════════════════
  function _renderReviews() {
    var container = document.getElementById('reviews-container');
    if (!container) return;

    AUFP.listen('reviews', function (data) {
      var items = _sort(data).filter(function (r) { return r.active; });
      if (!items.length) return;

      function stars(n) { return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5-n)); }

      container.innerHTML = items.map(function (r) {
        return '<div class="review-card">'
          + '<div class="stars mb-2">' + stars(r.rating || 5) + '</div>'
          + '<p class="text-sm text-gray-600 leading-relaxed mb-4">"' + _esc(r.text || '') + '"</p>'
          + '<div class="flex items-center gap-3">'
          + '<img src="' + _getImgPath(r.avatar || 'https://i.pravatar.cc/42') + '" alt="' + _esc(r.name) + '" class="review-avatar" loading="lazy"'
          + ' onerror="this.src=\'https://i.pravatar.cc/42\'"/>'
          + '<div><p class="font-display text-sm font-semibold uppercase tracking-wide">' + _esc(r.name) + '</p>'
          + '<p class="text-xs text-gray-400 mb-1">' + _esc(r.location || '') + '</p>'
          + '<div class="verified-badge"><i class="fas fa-check-circle"></i> Verified</div>'
          + '</div></div></div>';
      }).join('');
    });
  }

  // ════════════════════════════════════════════
  // SETTINGS — applies contact info, WhatsApp link, etc.
  // ════════════════════════════════════════════
  function _applySettings() {
    AUFP.listen('settings', function (s) {
      if (!s) return;

      // Helper to update text by ID
      var setText = function(id, val) { 
        var el = document.getElementById(id); 
        if (el && typeof val !== 'undefined') el.textContent = val; 
      };
      
      // Update footer
      setText('footer-address', s.address);
      setText('footer-phone',   s.phone);
      setText('footer-hours',   s.openingHours);

      // Update contact section (if on homepage)
      setText('contact-address', s.address);
      setText('contact-phone',   s.phone);
      setText('contact-hours',   s.openingHours);

      // Update ALL WhatsApp links
      if (s.whatsapp) {
        var waUrl = 'https://wa.me/' + s.whatsapp;
        document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
          a.href = waUrl;
        });
        window.WHATSAPP_NUMBER = s.whatsapp;
      }

      // Update delivery charge
      if (s.deliveryCharge) window.DELIVERY_CHARGE = parseInt(s.deliveryCharge);

      // Update Google Maps iframe (modern ID: location-map)
      var mapEl = document.getElementById('location-map');
      if (mapEl && s.mapEmbed) mapEl.src = s.mapEmbed;

      // Update social links
      document.querySelectorAll('a.social-icon[href*="facebook"]').forEach(function(a){ if(s.facebookUrl) a.href=s.facebookUrl; });
      document.querySelectorAll('a.social-icon[href*="instagram"]').forEach(function(a){ if(s.instagramUrl) a.href=s.instagramUrl; });
    });
  }

  // ════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════
  function _sort(obj) {
    if (!obj) return [];
    return Object.entries(obj)
      .map(function (e) { return Object.assign({ _id: e[0] }, e[1]); })
      .sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
  }

  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _jesc(str) {
    return String(str || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"');
  }

})();
