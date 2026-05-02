/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Main UI Engine
 * File: js/main.js
 *
 * Handles:
 *  - Sticky glassmorphism header on scroll
 *  - Hamburger mobile menu
 *  - Hero slider (also callable by website-data.js)
 *  - Scroll reveal animations (IntersectionObserver)
 *  - Scroll-to-top button
 *  - Live countdown timer
 *  - Horizontal scroll buttons (best sellers, reviews)
 *  - Subscribe form → WhatsApp
 *  - Contact form → WhatsApp
 *  - Active nav link detection
 *  - Cart page rendering
 *  - Admin triple-click access
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function () {

  // ═══════════════ STICKY HEADER ═══════════════
  var header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ═══════════════ MOBILE HAMBURGER ═══════════════
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      // Prevent body scroll when menu open
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('open') && !header.contains(e.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ═══════════════ HERO SLIDER ═══════════════
  // Exposed as window function so website-data.js can re-init after injecting dynamic slides
  window.initHeroSlider = function () {
    var hero   = document.getElementById('hero');
    if (!hero)  return;
    var slides = hero.querySelectorAll('.hero-slide');
    var dots   = hero.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    var cur = 0;
    clearInterval(window._heroSliderTimer);

    function goTo(n) {
      slides[cur].classList.remove('active');
      if (dots[cur]) dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (dots[cur]) dots[cur].classList.add('active');
    }

    function startAuto() {
      clearInterval(window._heroSliderTimer);
      window._heroSliderTimer = setInterval(function () { goTo(cur + 1); }, 5000);
    }

    goTo(0);
    startAuto();

    var prev = hero.querySelector('.slider-arrow.prev');
    var next = hero.querySelector('.slider-arrow.next');
    if (prev) prev.onclick = function () { goTo(cur - 1); startAuto(); };
    if (next) next.onclick = function () { goTo(cur + 1); startAuto(); };
    dots.forEach(function (d, i) {
      d.onclick = function () { goTo(i); startAuto(); };
    });
  };

  // Init slider with existing static slides (before Firebase fires)
  window.initHeroSlider();

  // ═══════════════ CATEGORY PAGE MINI-SLIDER ═══════════════
  (function () {
    var slides = document.querySelectorAll('.cat-hero-slide');
    var dots   = document.querySelectorAll('.cat-hero-dots .slider-dot');
    if (!slides.length) return;
    var cur = 0;
    function go(n) {
      slides[cur].classList.remove('active'); dots[cur] && dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active'); dots[cur] && dots[cur].classList.add('active');
    }
    go(0);
    setInterval(function () { go(cur + 1); }, 4500);
    dots.forEach(function (d, i) { d.onclick = function () { go(i); }; });
  })();

  // ═══════════════ SCROLL REVEAL ═══════════════
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ═══════════════ SCROLL-TO-TOP ═══════════════
  var scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ═══════════════ COUNTDOWN TIMER ═══════════════
  var cdEl = document.getElementById('deal-countdown');
  if (cdEl) {
    var endTime = new Date();
    endTime.setHours(endTime.getHours() + 5, 30, 0, 0);

    function updateCountdown() {
      var diff = endTime - new Date();
      if (diff <= 0) {
        // Reset to tomorrow
        endTime = new Date();
        endTime.setHours(endTime.getHours() + 5, 30, 0, 0);
        diff = endTime - new Date();
      }
      var h  = Math.floor(diff / 3600000);
      var m  = Math.floor((diff % 3600000) / 60000);
      var s  = Math.floor((diff % 60000)   / 1000);
      var hEl = document.getElementById('cd-hours');
      var mEl = document.getElementById('cd-minutes');
      var sEl = document.getElementById('cd-seconds');
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ═══════════════ HORIZONTAL SCROLL BUTTONS ═══════════════
  document.querySelectorAll('.scroll-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap  = btn.closest('.scroll-container-wrap');
      if (!wrap) return;
      var cont  = wrap.querySelector('.scroll-container');
      if (!cont) return;
      var dir   = btn.classList.contains('left') ? -1 : 1;
      cont.scrollBy({ left: dir * 290, behavior: 'smooth' });
    });
  });

  // ═══════════════ SUBSCRIBE FORM → WHATSAPP ═══════════════
  var subForm = document.getElementById('subscribe-form');
  if (subForm) {
    subForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var phoneInput = subForm.querySelector('input');
      if (phoneInput && phoneInput.value.trim()) {
        var waNum = (typeof BUSINESS_INFO !== 'undefined' && BUSINESS_INFO.whatsapp) || '923467407813';
        var msg   = 'Hi! I want to subscribe to Ahsan Ullah Food Point deals. My number is: ' + phoneInput.value.trim();
        window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(msg), '_blank');
        phoneInput.value = '';
        if (typeof showToast === 'function') showToast('Subscribed! You will receive deals on WhatsApp.');
      }
    });
  }

  // ═══════════════ CONTACT FORM → WHATSAPP ═══════════════
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl  = contactForm.querySelector('[name="name"]');
      var emailEl = contactForm.querySelector('[name="email"]');
      var msgEl   = contactForm.querySelector('[name="message"]');
      var text = 'Hello Ahsan Ullah Food Point!\n'
        + 'Name: '    + (nameEl  ? nameEl.value  : '') + '\n'
        + 'Email: '   + (emailEl ? emailEl.value : '') + '\n'
        + 'Message: ' + (msgEl   ? msgEl.value   : '');
      var waNum = (typeof BUSINESS_INFO !== 'undefined' && BUSINESS_INFO.whatsapp) || '923467407813';
      window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(text), '_blank');
    });
  }

  // ═══════════════ ACTIVE NAV LINK ═══════════════
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function (link) {
    var href = (link.getAttribute('href') || '').split('#')[0];
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  // ═══════════════ CART PAGE RENDERER ═══════════════
  var cartContainer = document.getElementById('cart-items-container');
  if (cartContainer) {
    window.renderCart = function () {
      var items      = window.getCart();
      var emptyMsg   = document.getElementById('empty-cart-msg');
      var addrSec    = document.getElementById('address-section');
      var summItems  = document.getElementById('summary-items');
      var subtotalEl = document.getElementById('summary-subtotal');
      var totalEl    = document.getElementById('summary-total');
      var dc         = window.DELIVERY_CHARGE || 60;

      if (!items.length) {
        cartContainer.innerHTML = '';
        if (emptyMsg)  emptyMsg.classList.remove('hidden');
        if (addrSec)   addrSec.style.opacity = '0.4';
        if (summItems) summItems.innerHTML   = '';
      } else {
        if (emptyMsg)  emptyMsg.classList.add('hidden');
        if (addrSec)   addrSec.style.opacity = '1';

        cartContainer.innerHTML = items.map(function (item) {
          var lineTotal = item.price * item.qty;
          var imgSrc    = item.image || (window.IS_ROOT ? 'Assets/logo/logo.png' : '../Assets/logo/logo.png');
          return '<div class="cart-item">'
            + '<img src="' + imgSrc + '" alt="' + item.name + '" onerror="this.src=\'https://via.placeholder.com/72\'" />'
            + '<div style="flex:1;min-width:0;">'
            + '<p style="font-family:\'Oswald\',sans-serif;font-size:0.9rem;font-weight:600;text-transform:uppercase;color:#090808;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.name + '</p>'
            + '<p style="color:#D8040B;font-weight:700;font-size:0.85rem;font-family:\'Oswald\',sans-serif;">Rs. ' + item.price.toLocaleString() + ' each</p>'
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:6px;">'
            + '<button class="qty-btn" onclick="updateQty(\'' + item.id + '\',' + (item.qty - 1) + ');window.renderCart()">−</button>'
            + '<span class="qty-display">' + item.qty + '</span>'
            + '<button class="qty-btn" onclick="updateQty(\'' + item.id + '\',' + (item.qty + 1) + ');window.renderCart()">+</button>'
            + '</div>'
            + '<div style="text-align:right;flex-shrink:0;">'
            + '<p style="font-family:\'Oswald\',sans-serif;font-weight:700;color:#090808;font-size:0.95rem;">Rs. ' + lineTotal.toLocaleString() + '</p>'
            + '<button onclick="removeFromCart(\'' + item.id + '\');window.renderCart();" style="font-size:0.72rem;color:#9ca3af;background:none;border:none;cursor:pointer;margin-top:2px;transition:color 0.2s;" onmouseover="this.style.color=\'#D8040B\'" onmouseout="this.style.color=\'#9ca3af\'"><i class="fas fa-trash-alt"></i> Remove</button>'
            + '</div>'
            + '</div>';
        }).join('');

        if (summItems) {
          summItems.innerHTML = items.map(function (item) {
            return '<div class="summary-row" style="font-size:0.8rem;">'
              + '<span style="color:#6b7280;">' + item.name + ' × ' + item.qty + '</span>'
              + '<span>Rs. ' + (item.price * item.qty).toLocaleString() + '</span>'
              + '</div>';
          }).join('');
        }
      }

      var subtotal = window.getTotal();
      var total    = subtotal + dc;
      if (subtotalEl) subtotalEl.textContent = 'Rs. ' + subtotal.toLocaleString();
      if (totalEl)    totalEl.textContent    = 'Rs. ' + total.toLocaleString();
    };

    // Initial render
    window.renderCart();

    // Place order button
    var placeBtn = document.getElementById('place-order-btn');
    if (placeBtn) {
      placeBtn.addEventListener('click', function () {
        var items = window.getCart();
        if (!items.length) {
          if (typeof showToast === 'function') showToast('Your cart is empty! Add items from the menu.', 'error');
          return;
        }
        var firstName  = _val('addr-first');
        var lastName   = _val('addr-last');
        var phone      = _val('addr-phone');
        var village    = _val('addr-village');
        var street     = _val('addr-street');
        var house      = _val('addr-house');
        var note       = _val('addr-note');

        if (!firstName || !phone || !village) {
          if (typeof showToast === 'function') showToast('Please fill: Name, Phone and Village/Area.', 'error');
          _highlightEmpty(['addr-first', 'addr-phone', 'addr-village']);
          return;
        }

        var fullName = (firstName + ' ' + lastName).trim();
        var address  = village + (street ? ', Street ' + street : '') + (house ? ', House ' + house : '');

        var success = window.placeOrderOnWhatsApp({
          name:    fullName,
          phone:   phone,
          address: address,
          note:    note
        });

        if (success) {
          // Clear cart after placing order
          setTimeout(function () {
            window.clearCart();
            window.renderCart();
            if (typeof showToast === 'function') showToast('Order sent! Check your WhatsApp.');
          }, 1500);
        }
      });
    }
  }

  function _val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function _highlightEmpty(ids) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        el.style.borderColor = '#D8040B';
        setTimeout(function () { el.style.borderColor = ''; }, 2500);
      }
    });
  }

  // ═══════════════ ADMIN TRIPLE-CLICK ACCESS ═══════════════
  var adminBtn = document.getElementById('admin-access-btn');
  if (adminBtn) {
    var _clicks = 0, _timer;
    adminBtn.addEventListener('click', function () {
      _clicks++;
      clearTimeout(_timer);
      _timer = setTimeout(function () { _clicks = 0; }, 600);
      if (_clicks >= 3) {
        _clicks = 0;
        window.location.href = window.IS_ROOT ? 'pages/login.html' : 'login.html';
      }
    });
  }

  // ═══════════════ PRODUCT CARD HOVER FIX ═══════════════
  // Ensure product images scale correctly
  document.querySelectorAll('.product-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var img = card.querySelector('.product-card-img');
      if (img) img.style.transform = 'scale(1.06)';
    });
    card.addEventListener('mouseleave', function () {
      var img = card.querySelector('.product-card-img');
      if (img) img.style.transform = 'scale(1)';
    });
  });

  // ═══════════════ HERO VIDEO AUDIO TOGGLE ═══════════════
  var videoTrigger = document.getElementById('hero-video-trigger');
  var heroVideo    = document.getElementById('hero-main-video');
  var muteIcon     = document.getElementById('mute-icon');
  
  if (videoTrigger && heroVideo && muteIcon) {
    // Set default volume
    heroVideo.volume = 0.4; 

    videoTrigger.addEventListener('click', function () {
      // Toggle muted state
      heroVideo.muted = !heroVideo.muted;
      
      // Update icon and volume
      if (heroVideo.muted) {
        muteIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
      } else {
        muteIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
        // Ensure it's playing if user unmuted
        heroVideo.play().catch(function(e) {
          console.warn("Video play interrupted:", e);
        });
      }
    });

    // Ensure initial icon state matches muted attribute
    if (heroVideo.muted) {
      muteIcon.classList.add('fa-volume-mute');
      muteIcon.classList.remove('fa-volume-up');
    } else {
      muteIcon.classList.add('fa-volume-up');
      muteIcon.classList.remove('fa-volume-mute');
    }
  }

  // ═══════════════ SETTINGS TABS (admin pages) ═══════════════
  document.querySelectorAll('.settings-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.settings-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.settings-section').forEach(function (s) { s.style.display = 'none'; });
      var target = document.getElementById('stab-' + tab.dataset.stab);
      if (target) target.style.display = 'block';
    });
  });

});
