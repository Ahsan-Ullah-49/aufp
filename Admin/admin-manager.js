/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Admin Manager v2
 * File: Admin/admin-manager.js
 * ============================================================
 */

// ── Auth guard ─────────────────────────────────────────────
if (!sessionStorage.getItem('aufp_admin')) {
  window.location.href = '../pages/login.html';
}

// ── Set user display ───────────────────────────────────────
var _email = sessionStorage.getItem('aufp_admin_email') || 'admin@aufp.com';
var el = document.getElementById('u-av');    if (el) el.textContent = _email.charAt(0).toUpperCase();
var el2 = document.getElementById('u-email'); if (el2) el2.textContent = _email;

// ── Wait for AUFP ready, then init ────────────────────────
AUFP.onReady(function () {
  _updateModeUI();
  nav('dashboard');
  _attachNav();
  _attachLogout();
  _attachSettingsTabs();
  _attachModalCloseOutside();
});

// ════════════════════════════════════════════════════════
// MODE UI
// ════════════════════════════════════════════════════════
function _updateModeUI() {
  var dot     = document.getElementById('fb-dot');
  var mode    = document.getElementById('mode-badge');
  var banner  = document.getElementById('firebase-banner');
  var isFB    = AUFP.isFirebase();

  if (dot) {
    dot.className = 'odot ' + (isFB ? 'live' : 'demo');
    dot.title     = isFB ? '✅ Firebase Connected' : '⚠️ localStorage Mode (same device only)';
  }
  if (mode) {
    if (isFB) {
      mode.textContent = '✅ Firebase Connected — All changes update the website LIVE on every device!';
      mode.style.color = '#22c55e';
    } else {
      mode.textContent = '⚠️ Demo Mode — Changes save to this browser only. Add Firebase credentials for full sync.';
      mode.style.color = '#FEA600';
    }
  }
  // Show/hide the setup banner on the dashboard
  if (banner) {
    banner.style.display = isFB ? 'none' : 'flex';
  }
}

// ════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════
var _titles = {
  dashboard:'Dashboard', products:'Products', categories:'Categories',
  deals:'Deals', hero:'Hero Slides',
  reviews:'Reviews', orders:'Orders', settings:'Settings', setup:'Firebase Setup'
};

function nav(page) {
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.toggle('active', p.id === 'page-' + page);
  });
  var bc = document.getElementById('bc');
  if (bc) bc.innerHTML = '<span>' + (_titles[page]||page) + '</span>';

  var loaders = {
    dashboard:  loadDashboard,
    products:   loadProducts,
    categories: loadCategories,
    deals:      loadDeals,
    hero:       loadSlides,
    reviews:    loadReviews,
    orders:     loadOrders,
    settings:   loadSettings
  };
  if (loaders[page]) loaders[page]();
}

function _attachNav() {
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.addEventListener('click', function () { nav(b.dataset.page); });
  });
  var colBtn = document.getElementById('col-btn');
  if (colBtn) colBtn.addEventListener('click', function () {
    document.getElementById('sb').classList.toggle('col');
  });
}

function _attachLogout() {
  var btn = document.getElementById('logout-btn');
  if (btn) btn.addEventListener('click', function () {
    AUFP.signOut(function () { window.location.href = '../pages/login.html'; });
  });
}

// ════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════
function toast(msg, type) {
  type = type || 'success';
  var colors = { success:'var(--green)', error:'var(--red)', warning:'var(--gold)' };
  var icons  = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle' };
  var el     = document.createElement('div');
  el.className = 'ti2' + (type==='error'?' err':type==='warning'?' wrn':'');
  el.style.borderLeftColor = colors[type]||colors.success;
  el.innerHTML = '<i class="fas ' + (icons[type]||'fa-check') + '" style="color:' + (colors[type]||colors.success) + ';"></i>' + msg;
  var toastEl = document.getElementById('toast');
  if (toastEl) toastEl.appendChild(el);
  else document.body.appendChild(el);
  setTimeout(function () { el.classList.add('show'); }, 10);
  setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 400); }, 3500);
}

// ════════════════════════════════════════════════════════
// MODAL HELPERS
// ════════════════════════════════════════════════════════
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function _attachModalCloseOutside() {
  document.querySelectorAll('.mo').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
  });
}

// ════════════════════════════════════════════════════════
// IMAGE PATH & PREVIEW
// ════════════════════════════════════════════════════════
function _getImgPath(img) {
  if (!img) return '../Assets/logo/logo.png';
  var s = String(img).trim();
  // Absolute URLs
  if (/^(https?:|data:|(\/\/)|(\/))/i.test(s)) return s;
  // Local paths (relative to root, but admin is in /Admin/)
  return '../' + s;
}

function prevImg(inputId, previewId) {
  var url  = (document.getElementById(inputId)||{}).value||'';
  var prev = document.getElementById(previewId);
  if (!prev) return;
  if (!url) {
    prev.innerHTML = '<div class="img-ph"><i class="fas fa-image"></i><span>Image preview</span></div>';
    return;
  }
  var path = _getImgPath(url);
  prev.innerHTML = '<img src="' + path + '" onerror="this.parentElement.innerHTML=\'<div class=\\\"img-ph\\\"><i class=\\\"fas fa-exclamation-triangle\\\"></i><span>Invalid URL</span></div>\'" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/>';
}

// ════════════════════════════════════════════════════════
// GENERIC SAVE / DELETE helpers
// ════════════════════════════════════════════════════════
function dbSave(path, data, msg, modalId) {
  AUFP.set(path, data,
    function () { toast(msg || '✅ Saved! Changes now live on website.'); if (modalId) closeModal(modalId); },
    function (e) { toast('❌ Error: ' + e.message, 'error'); }
  );
}

function confirmDelete(path, label, msg) {
  document.getElementById('del-msg').textContent = 'Delete "' + label + '"? This cannot be undone.';
  document.getElementById('del-confirm-btn').onclick = function () {
    AUFP.remove(path,
      function () { toast(msg || '✅ Deleted!'); closeModal('del-modal'); },
      function (e) { toast('❌ ' + e.message, 'error'); }
    );
    closeModal('del-modal');
  };
  openModal('del-modal');
}

function genId() { return AUFP.genId(); }

function _val(id) { var el=document.getElementById(id); return el?el.value.trim():''; }
function _chk(id) { var el=document.getElementById(id); return el?el.checked:false; }
function _num(id) { return parseInt(_val(id))||0; }

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
var _catIcons = {pizza:'🍕',burger:'🍔',wrap:'🌯',wings:'🍗',tea:'☕',cold:'🥤'};

function loadDashboard() {
  AUFP.read('products', function(d){ document.getElementById('s-products').textContent = d?Object.keys(d).length:0; });
  AUFP.read('deals',    function(d){ document.getElementById('s-deals').textContent    = d?Object.keys(d).length:0; });
  AUFP.read('reviews',  function(d){ document.getElementById('s-reviews').textContent  = d?Object.keys(d).length:0; });

  AUFP.read('products', function(data) {
    var items = _sort(data).slice(0,5);
    document.getElementById('dash-prod-body').innerHTML = items.length ? items.map(function(p) {
      return '<tr>'
        + '<td><img src="'+_getImgPath(p.image)+'" class="ti" onerror="this.style.display=\'none\'"/></td>'
        + '<td><div class="tn">'+p.name+'</div></td>'
        + '<td><span class="bx bm">'+(_catIcons[p.category]||'')+' '+p.category+'</span></td>'
        + '<td class="tp">Rs. '+(p.priceMedium||0).toLocaleString()+'</td>'
        + '<td><span class="bx '+(p.available?'bv':'br')+'">'+(p.available?'Live':'Off')+'</span></td>'
        + '</tr>';
    }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--muted);">No products yet. Go to Products → Add Product.</td></tr>';
  });
}

// ════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════
var _allProds = {};

// Toggle price fields based on category (pizza = 3 sizes, others = 1 price)
function togglePricingFields() {
  var cat      = (document.getElementById('pm-cat') || {}).value || 'pizza';
  var isPizza  = cat === 'pizza';
  var single   = document.getElementById('pm-single-row');
  var sizes    = document.getElementById('pm-size-rows');
  if (single) single.style.display = isPizza ? 'none' : '';
  if (sizes) {
    // display:contents doesn't support toggling well — swap to none/contents
    sizes.style.display = isPizza ? 'contents' : 'none';
  }
}

function loadProducts() {
  AUFP.listen('products', function(data) {
    _allProds = data || {};
    _renderProdsTable(_allProds);
  });
}

function _renderProdsTable(data) {
  var s  = (_val('prod-search')||'').toLowerCase();
  var cf = _val('prod-cat-f');
  var items = _sort(data).filter(function(p) {
    return (!cf||p.category===cf) && (!s||p.name.toLowerCase().includes(s));
  });

  document.getElementById('prod-tbody').innerHTML = items.length ? items.map(function(p) {
    return '<tr>'
      + '<td><img src="'+_getImgPath(p.image)+'" class="ti" onerror="this.style.display=\'none\'"/></td>'
      + '<td><div class="tn">'+_esc(p.name)+'</div><div class="ts">'+(p.description||'').substring(0,50)+'…</div></td>'
      + '<td><span class="bx bm">'+(_catIcons[p.category]||'')+' '+(p.category||'')+'</span></td>'
      + '<td class="tp">Rs. '+(p.priceMedium||0).toLocaleString()+'</td>'
      + '<td><label class="tg"><input type="checkbox" '+(p.featured?'checked':'')+' onchange="AUFP.set(\'products/'+p._id+'/featured\',this.checked,function(){toast(\'✅ Updated!\')})"/><span class="tg-sl"></span></label></td>'
      + '<td><label class="tg"><input type="checkbox" '+(p.available?'checked':'')+' onchange="AUFP.set(\'products/'+p._id+'/available\',this.checked,function(){toast(\'✅ Updated! Item is now '+(p.available?'hidden':'visible')+' on website.\')})"/><span class="tg-sl"></span></label></td>'
      + '<td><div style="display:flex;gap:5px;">'
      + '<button class="btn btn-g btn-sm" onclick="openProdModal(\''+p._id+'\')"><i class="fas fa-edit"></i></button>'
      + '<button class="btn btn-d btn-sm" onclick="confirmDelete(\'products/'+p._id+'\',\''+_jesc(p.name)+'\',\'✅ Product deleted from website!\')"><i class="fas fa-trash"></i></button>'
      + '</div></td>'
      + '</tr>';
  }).join('')
  : '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted);">No products found. Click "+ Add Product"</td></tr>';
}

function filterProds() { _renderProdsTable(_allProds); }

function openProdModal(id) {
  var isEdit = id && _allProds[id];
  document.getElementById('prod-modal-ttl').textContent = isEdit ? 'Edit Product' : 'Add Product';
  document.getElementById('pm-id').value = id||'';

  // Reset
  ['name','order','ps','pm','pl','desc','img','badge'].forEach(function(f){ var el=document.getElementById('pm-'+f); if(el) el.value=''; });
  var priceEl = document.getElementById('pm-price'); if (priceEl) priceEl.value = '';
  document.getElementById('pm-cat').value = 'pizza';
  document.getElementById('pm-badge-t').value = 'gold';
  document.getElementById('pm-feat').checked  = false;
  document.getElementById('pm-avail').checked = true;
  document.getElementById('pm-prev').innerHTML = '<div class="img-ph"><i class="fas fa-image"></i><span>Image preview</span></div>';
  togglePricingFields(); // reset to pizza mode by default

  if (isEdit) {
    var p = _allProds[id];
    document.getElementById('pm-name').value    = p.name||'';
    document.getElementById('pm-cat').value     = p.category||'pizza';
    document.getElementById('pm-order').value   = p.order||1;
    document.getElementById('pm-desc').value    = p.description||'';
    document.getElementById('pm-img').value     = p.image||'';
    document.getElementById('pm-badge').value   = p.badge||'';
    document.getElementById('pm-badge-t').value = p.badgeType||'gold';
    document.getElementById('pm-feat').checked  = !!p.featured;
    document.getElementById('pm-avail').checked = p.available!==false;
    togglePricingFields(); // toggle fields BEFORE filling prices
    if (p.category === 'pizza') {
      document.getElementById('pm-ps').value = p.priceSmall||'';
      document.getElementById('pm-pm').value = p.priceMedium||'';
      document.getElementById('pm-pl').value = p.priceLarge||'';
    } else {
      // For non-pizza, single price is priceSmall (stored as priceSmall = priceMedium = priceLarge)
      var priceEl = document.getElementById('pm-price');
      if (priceEl) priceEl.value = p.priceSmall || p.priceMedium || '';
    }
    if (p.image) prevImg('pm-img','pm-prev');
  }
  openModal('prod-modal');
}

function saveProd() {
  var id   = _val('pm-id') || genId();
  var name = _val('pm-name');
  var cat  = _val('pm-cat');
  if (!name) { toast('Product name is required!', 'error'); return; }

  var data;
  if (cat === 'pizza') {
    // Pizza — 3 separate size prices
    var sm = _num('pm-ps'); var md = _num('pm-pm'); var lg = _num('pm-pl');
    if (!md) { toast('Medium price is required for pizza!', 'error'); return; }
    data = {
      name: name, category: cat, order: _num('pm-order')||1,
      priceSmall: sm || md, priceMedium: md, priceLarge: lg || md,
      description: _val('pm-desc'), image: _val('pm-img'),
      badge: _val('pm-badge'), badgeType: _val('pm-badge-t'),
      featured: _chk('pm-feat'), available: _chk('pm-avail')
    };
  } else {
    // Non-pizza — single price stored in all 3 fields for compatibility
    var p = _num('pm-price');
    if (!p) { toast('Price is required!', 'error'); return; }
    data = {
      name: name, category: cat, order: _num('pm-order')||1,
      priceSmall: p, priceMedium: p, priceLarge: p,
      description: _val('pm-desc'), image: _val('pm-img'),
      badge: _val('pm-badge'), badgeType: _val('pm-badge-t'),
      featured: _chk('pm-feat'), available: _chk('pm-avail')
    };
  }

  dbSave('products/'+id, data, '✅ Product saved! Now visible on website menu.', 'prod-modal');
}

// ════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════
function loadCategories() {
  AUFP.listen('categories', function(data) {
    var items = data ? _sort(data) : _sort(DEFAULT_DATA.categories);
    document.getElementById('cats-body').innerHTML = items.map(function(c) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--bdr);">'
        + '<div style="display:flex;align-items:center;gap:12px;">'
        + '<span style="font-size:1.3rem;">'+c.icon+'</span>'
        + '<div><div style="font-weight:600;color:#fff;">'+_esc(c.name)+'</div><div style="font-size:0.7rem;color:var(--muted);">ID: '+c._id+'</div></div>'
        + '</div>'
        + '<div class="tg-row"><label class="tg"><input type="checkbox" '+(c.active?'checked':'')+' onchange="AUFP.set(\'categories/'+c._id+'/active\',this.checked,function(){toast(\'✅ Category updated!\')})"/><span class="tg-sl"></span></label>'
        + '<span class="tg-lbl" style="font-size:0.76rem;">'+(c.active?'Visible':'Hidden')+'</span></div>'
        + '</div>';
    }).join('');
  });
}

// ════════════════════════════════════════════════════════
// DEALS
// ════════════════════════════════════════════════════════
var _allDeals = {};

function loadDeals() {
  AUFP.listen('deals', function(data) {
    _allDeals = data||{};
    var items = _sort(_allDeals);
    document.getElementById('deals-list').innerHTML = items.length ? items.map(function(d) {
      var sav = (d.originalPrice||0)-(d.dealPrice||0);
      return '<div class="panel" style="margin-bottom:14px;"><div class="p-bdy">'
        + '<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">'
        + '<img src="'+_getImgPath(d.image)+'" style="width:100px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.style.display=\'none\'"/>'
        + '<div style="flex:1;min-width:180px;">'
        + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;"><span style="font-weight:700;color:#fff;">'+_esc(d.title)+'</span>'
        + '<span class="bx '+(d.active?'bv':'br')+'">'+(d.active?'Live':'Off')+'</span></div>'
        + '<div style="font-size:0.8rem;color:var(--muted);margin-bottom:6px;">'+(d.description||'')+'</div>'
        + '<div style="display:flex;gap:10px;align-items:center;">'
        + '<span style="font-family:var(--fh);font-size:1.1rem;color:var(--gold);font-weight:700;">Rs. '+(d.dealPrice||0).toLocaleString()+'</span>'
        + '<span style="text-decoration:line-through;color:var(--muted);font-size:0.83rem;">Rs. '+(d.originalPrice||0).toLocaleString()+'</span>'
        + (sav>0?'<span class="bx bv">Save Rs. '+sav.toLocaleString()+'</span>':'')
        + '</div></div>'
        + '<div style="display:flex;gap:6px;flex-shrink:0;">'
        + '<button class="btn btn-g btn-sm" onclick="openDealModal(\''+d._id+'\')"><i class="fas fa-edit"></i></button>'
        + '<button class="btn btn-d btn-sm" onclick="confirmDelete(\'deals/'+d._id+'\',\''+_jesc(d.title)+'\',\'✅ Deal deleted!\')"><i class="fas fa-trash"></i></button>'
        + '</div></div></div></div>';
    }).join('')
    : '<div class="panel"><div class="p-bdy" style="text-align:center;padding:40px;color:var(--muted);">No deals yet. Click "+ New Deal".</div></div>';
  });
}

function openDealModal(id) {
  var isEdit = id && _allDeals[id];
  document.getElementById('deal-modal-ttl').textContent = isEdit ? 'Edit Deal' : 'New Deal';
  document.getElementById('dm-id').value = id||'';
  ['title','sub','desc','orig','price','badge','order','img'].forEach(function(f){ document.getElementById('dm-'+f).value=''; });
  document.getElementById('dm-active').checked = true;
  document.getElementById('dm-feat').checked   = false;
  document.getElementById('dm-prev').innerHTML = '<div class="img-ph"><i class="fas fa-image"></i><span>Preview</span></div>';
  if (isEdit) {
    var d = _allDeals[id];
    document.getElementById('dm-title').value  = d.title||'';
    document.getElementById('dm-sub').value    = d.subtitle||'';
    document.getElementById('dm-desc').value   = d.description||'';
    document.getElementById('dm-orig').value   = d.originalPrice||'';
    document.getElementById('dm-price').value  = d.dealPrice||'';
    document.getElementById('dm-badge').value  = d.badge||'';
    document.getElementById('dm-order').value  = d.order||1;
    document.getElementById('dm-img').value    = d.image||'';
    document.getElementById('dm-active').checked = d.active!==false;
    document.getElementById('dm-feat').checked   = !!d.featured;
    if (d.image) prevImg('dm-img','dm-prev');
  }
  openModal('deal-modal');
}

function saveDeal() {
  var id    = _val('dm-id') || genId();
  var title = _val('dm-title');
  if (!title) { toast('Deal title is required!', 'error'); return; }
  dbSave('deals/'+id, {
    title:         title,
    subtitle:      _val('dm-sub'),
    description:   _val('dm-desc'),
    originalPrice: _num('dm-orig'),
    dealPrice:     _num('dm-price'),
    badge:         _val('dm-badge'),
    order:         _num('dm-order')||1,
    image:         _val('dm-img'),
    active:        _chk('dm-active'),
    featured:      _chk('dm-feat')
  }, '✅ Deal saved! Visible on Deals page.', 'deal-modal');
}

// ════════════════════════════════════════════════════════
// HERO SLIDES
// ════════════════════════════════════════════════════════
var _allSlides = {};

function loadSlides() {
  AUFP.listen('hero_slides', function(data) {
    _allSlides = data||{};
    var items  = _sort(_allSlides);
    document.getElementById('slides-list').innerHTML = items.length ? items.map(function(s) {
      return '<div class="panel" style="margin-bottom:14px;"><div class="p-bdy">'
        + '<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">'
        + '<div class="slide-prev"><img src="'+_getImgPath(s.image)+'" onerror="this.style.display=\'none\'"/>'
        + '<div class="slide-ov"><div><strong>'+(s.headline||'').substring(0,28)+'</strong><span>'+(s.label||'')+'</span></div></div></div>'
        + '<div style="flex:1;min-width:180px;">'
        + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">'
        + '<span style="font-weight:700;color:#fff;">'+_esc(s.label||'Slide')+'</span>'
        + '<span class="bx '+(s.active?'bv':'br')+'">'+(s.active?'Active':'Hidden')+'</span></div>'
        + '<div style="font-size:0.8rem;color:var(--muted);margin-bottom:4px;">'+(s.subtext||'').substring(0,70)+'</div>'
        + '<div style="font-size:0.76rem;color:var(--blue);">→ '+(s.btnText||'')+' ('+(s.btnLink||'')+')</div>'
        + '</div>'
        + '<div style="display:flex;gap:6px;flex-shrink:0;">'
        + '<button class="btn btn-g btn-sm" onclick="openSlideModal(\''+s._id+'\')"><i class="fas fa-edit"></i></button>'
        + '<button class="btn btn-d btn-sm" onclick="confirmDelete(\'hero_slides/'+s._id+'\',\'Slide: '+_jesc(s.label||'')+'\',\'✅ Slide deleted!\')"><i class="fas fa-trash"></i></button>'
        + '</div></div></div></div>';
    }).join('')
    : '<div class="panel"><div class="p-bdy" style="text-align:center;padding:40px;color:var(--muted);">No slides. Click "+ Add Slide".</div></div>';
  });
}

function openSlideModal(id) {
  var isEdit = id && _allSlides[id];
  document.getElementById('slide-modal-ttl').textContent = isEdit ? 'Edit Slide' : 'Add Slide';
  document.getElementById('sm-id').value = id||'';
  ['img','label','order','head','sub','btxt','blink'].forEach(function(f){ document.getElementById('sm-'+f).value=''; });
  document.getElementById('sm-active').checked = true;
  document.getElementById('sm-prev').innerHTML = '<div class="img-ph"><i class="fas fa-image"></i><span>Slide preview</span></div>';
  if (isEdit) {
    var s = _allSlides[id];
    document.getElementById('sm-img').value   = s.image||'';
    document.getElementById('sm-label').value = s.label||'';
    document.getElementById('sm-order').value = s.order||1;
    document.getElementById('sm-head').value  = s.headline||'';
    document.getElementById('sm-sub').value   = s.subtext||'';
    document.getElementById('sm-btxt').value  = s.btnText||'';
    document.getElementById('sm-blink').value = s.btnLink||'';
    document.getElementById('sm-active').checked = s.active!==false;
    if (s.image) prevImg('sm-img','sm-prev');
  }
  openModal('slide-modal');
}

function saveSlide() {
  var id  = _val('sm-id') || genId();
  var img = _val('sm-img');
  if (!img) { toast('Image URL is required!', 'error'); return; }
  dbSave('hero_slides/'+id, {
    image:    img,
    label:    _val('sm-label'),
    order:    _num('sm-order')||1,
    headline: _val('sm-head'),
    subtext:  _val('sm-sub'),
    btnText:  _val('sm-btxt')||'Order Now',
    btnLink:  _val('sm-blink')||'menu.html',
    active:   _chk('sm-active')
  }, '✅ Slide saved! Homepage slider updated.', 'slide-modal');
}


// ════════════════════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════════════════════
var _allRevs = {};

function loadReviews() {
  AUFP.listen('reviews', function(data) {
    _allRevs = data||{};
    var items = _sort(_allRevs);
    function stars(n){ return '★'.repeat(n)+'☆'.repeat(5-n); }
    document.getElementById('revs-list').innerHTML = items.length ? items.map(function(r) {
      return '<div class="panel" style="margin-bottom:12px;"><div class="p-bdy">'
        + '<div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;">'
        + '<img src="'+(r.avatar||'https://i.pravatar.cc/48')+'" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.src=\'https://i.pravatar.cc/48\'"/>'
        + '<div style="flex:1;min-width:180px;">'
        + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:3px;">'
        + '<span style="font-weight:700;color:#fff;">'+_esc(r.name)+'</span>'
        + '<span style="font-size:0.76rem;color:var(--muted);">'+_esc(r.location||'')+'</span>'
        + '<span class="bx '+(r.active?'bv':'br')+'">'+(r.active?'Visible':'Hidden')+'</span></div>'
        + '<div style="color:var(--gold);font-size:0.85rem;margin-bottom:3px;">'+stars(r.rating||5)+'</div>'
        + '<div style="font-size:0.8rem;color:var(--muted);">"'+_esc(r.text||'')+'"</div>'
        + '</div>'
        + '<div style="display:flex;gap:6px;flex-shrink:0;">'
        + '<button class="btn btn-g btn-sm" onclick="openRevModal(\''+r._id+'\')"><i class="fas fa-edit"></i></button>'
        + '<button class="btn btn-d btn-sm" onclick="confirmDelete(\'reviews/'+r._id+'\',\'Review by '+_jesc(r.name)+'\',\'✅ Review deleted!\')"><i class="fas fa-trash"></i></button>'
        + '</div></div></div></div>';
    }).join('')
    : '<div class="panel"><div class="p-bdy" style="text-align:center;padding:40px;color:var(--muted);">No reviews yet.</div></div>';
  });
}

function openRevModal(id) {
  var isEdit = id && _allRevs[id];
  document.getElementById('rev-modal-ttl').textContent = isEdit ? 'Edit Review' : 'Add Review';
  document.getElementById('rm-id').value = id||'';
  ['name','loc','av','text','order'].forEach(function(f){ document.getElementById('rm-'+f).value=''; });
  document.getElementById('rm-rating').value  = '5';
  document.getElementById('rm-active').checked = true;
  if (isEdit) {
    var r = _allRevs[id];
    document.getElementById('rm-name').value   = r.name||'';
    document.getElementById('rm-loc').value    = r.location||'';
    document.getElementById('rm-rating').value = r.rating||5;
    document.getElementById('rm-av').value     = r.avatar||'';
    document.getElementById('rm-text').value   = r.text||'';
    document.getElementById('rm-order').value  = r.order||1;
    document.getElementById('rm-active').checked = r.active!==false;
  }
  openModal('rev-modal');
}

function saveRev() {
  var id   = _val('rm-id') || genId();
  var name = _val('rm-name');
  if (!name) { toast('Customer name is required!', 'error'); return; }
  dbSave('reviews/'+id, {
    name:     name,
    location: _val('rm-loc'),
    rating:   _num('rm-rating')||5,
    avatar:   _val('rm-av'),
    text:     _val('rm-text'),
    order:    _num('rm-order')||1,
    active:   _chk('rm-active')
  }, '✅ Review saved!', 'rev-modal');
}

// ════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════
function loadOrders() {
  AUFP.listen('orders', function(data) {
    if (!data||!Object.keys(data).length) return;
    var items = Object.entries(data)
      .map(function(e){ return Object.assign({_id:e[0]},e[1]); })
      .sort(function(a,b){ return (b.timestamp||0)-(a.timestamp||0); })
      .slice(0,30);

    var badge = document.getElementById('orders-badge');
    var pend  = items.filter(function(o){ return o.status==='pending'; }).length;
    if (badge) { badge.textContent = pend; badge.style.display = pend?'':'none'; }

    var sClr = {pending:'bg',confirmed:'bb',delivered:'bv',cancelled:'br'};

    // Populate dashboard recent orders
    var dashOrders = document.getElementById('dash-orders');
    if (dashOrders) {
      if (items.length === 0) {
        dashOrders.innerHTML = '<i class="fas fa-receipt" style="font-size:2rem;opacity:0.2;display:block;margin-bottom:10px;"></i>Orders via WhatsApp appear here.';
      } else {
        dashOrders.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;text-align:left;">'
          + items.slice(0, 5).map(function(o){
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid var(--bdr);">'
              + '<div><div style="font-weight:700;color:#fff;font-size:0.85rem;">#'+(o.orderId||o._id.slice(-6))+'</div><div style="font-size:0.75rem;color:var(--muted);">' + _esc((o.name||'').split(' ')[0]) + '</div></div>'
              + '<div style="text-align:right;"><div style="color:var(--gold);font-weight:700;font-size:0.85rem;">Rs. '+(o.total||0).toLocaleString()+'</div><span style="font-size:0.65rem;" class="bx '+(sClr[o.status]||'bm')+'">'+_esc(o.status||'pending')+'</span></div>'
              + '</div>';
          }).join('') + '</div>';
        dashOrders.style.padding = '15px';
      }
    }

    document.getElementById('orders-list').innerHTML =
      '<div style="display:flex;flex-direction:column;gap:10px;">'
      + items.map(function(o){
        return '<div class="panel"><div class="p-bdy">'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">'
          + '<div><div style="font-weight:700;color:#fff;margin-bottom:3px;">#'+(o.orderId||o._id.slice(-6))+'</div>'
          + '<div style="font-size:0.8rem;color:var(--muted);">'+_esc(o.name||'')+'  |  '+_esc(o.phone||'')+'</div>'
          + '<div style="font-size:0.76rem;color:var(--muted);">'+_esc(o.address||'')+'</div></div>'
          + '<div style="display:flex;align-items:center;gap:8px;">'
          + '<span class="bx '+(sClr[o.status]||'bm')+'">'+_esc(o.status||'pending')+'</span>'
          + '<span style="font-family:var(--fh);color:var(--gold);font-weight:700;">Rs. '+(o.total||0).toLocaleString()+'</span>'
          + '<select onchange="AUFP.set(\'orders/'+o._id+'/status\',this.value,function(){toast(\'✅ Status updated!\')})" style="background:var(--card2);border:1px solid var(--bdr);color:var(--txt);padding:4px 8px;border-radius:6px;font-size:0.76rem;">'
          + ['pending','confirmed','delivered','cancelled'].map(function(s){ return '<option value="'+s+'"'+(o.status===s?' selected':'')+'>'+s+'</option>'; }).join('')
          + '</select></div></div>'
          + '<div style="font-size:0.73rem;color:var(--muted);margin-top:6px;">'+new Date(o.timestamp||0).toLocaleString('en-PK')+'</div>'
          + '</div></div>';
      }).join('')+'</div>';
  });
}

// ════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════
function loadSettings() {
  AUFP.read('settings', function(s) {
    if (!s && DEFAULT_DATA) s = DEFAULT_DATA.settings;
    if (!s) return;
    ['businessName','tagline','phone','whatsapp','address','openingHours',
     'facebookUrl','instagramUrl','aboutText','logoUrl','mapEmbed'].forEach(function(f) {
      var el = document.getElementById('s-'+f);
      if (el) el.value = s[f]||'';
    });
    var dc = document.getElementById('s-deliveryCharge');
    var mo = document.getElementById('s-minOrderAmount');
    if (dc) dc.value = s.deliveryCharge||60;
    if (mo) mo.value = s.minOrderAmount||200;
  });
}

function saveSettings() {
  var data = {
    businessName:   _val('s-businessName'),
    tagline:        _val('s-tagline'),
    phone:          _val('s-phone'),
    whatsapp:       _val('s-whatsapp'),
    address:        _val('s-address'),
    openingHours:   _val('s-openingHours'),
    facebookUrl:    _val('s-facebookUrl'),
    instagramUrl:   _val('s-instagramUrl'),
    aboutText:      _val('s-aboutText'),
    logoUrl:        _val('s-logoUrl'),
    mapEmbed:       _val('s-mapEmbed'),
    deliveryCharge: _num('s-deliveryCharge')||60,
    minOrderAmount: _num('s-minOrderAmount')||200
  };
  dbSave('settings', data, '✅ Settings saved! All pages updated.');
}

function _attachSettingsTabs() {
  document.querySelectorAll('.stab').forEach(function(t) {
    t.addEventListener('click', function() {
      document.querySelectorAll('.stab').forEach(function(x){ x.classList.remove('active'); });
      t.classList.add('active');
      document.querySelectorAll('.ssec').forEach(function(s){ s.classList.remove('active'); });
      var sec = document.getElementById('stab-'+t.dataset.stab);
      if (sec) sec.classList.add('active');
    });
  });
}

// ════════════════════════════════════════════════════════
// FIREBASE SETUP SCREEN
// ════════════════════════════════════════════════════════
function seedAll() {
  AUFP.seedAll(function() {
    toast('✅ Default data loaded! Website and admin panel are now populated.');
  });
}

function testConn() {
  var el = document.getElementById('conn-status');
  if (!el) return;
  el.innerHTML = '<span style="color:var(--muted);">Testing...</span>';
  AUFP.testConnection(function(res) {
    el.innerHTML = res.ok
      ? '<span style="color:var(--green);">✅ ' + res.msg + '</span>'
      : '<span style="color:var(--gold);">⚠️ ' + res.msg + '</span>';
  });
}

// ════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════
function _sort(obj) {
  if (!obj) return [];
  return Object.entries(obj)
    .map(function(e){ return Object.assign({_id:e[0]},e[1]); })
    .sort(function(a,b){ return (a.order||99)-(b.order||99); });
}
function _esc(str)  { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function _jesc(str) { return String(str||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
