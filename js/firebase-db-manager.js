/**
 * ============================================================
 * AHSAN ULLAH FOOD POINT — Core Data Manager v2
 * File: js/firebase-db-manager.js
 *
 * WORKS IN 2 MODES:
 *  LOCAL MODE  → localStorage (no Firebase needed, same domain)
 *  FIREBASE MODE → Firebase Realtime DB (cross-server, real-time)
 *
 * MODE is auto-detected from firebase-config.js
 * ============================================================
 */

var AUFP = (function () {
  'use strict';

  var LS_PREFIX = 'aufp_v2_';
  var _db       = null;
  var _auth     = null;
  var _fbMode   = false;
  var _ready    = false;
  var _queue    = [];
  var _subs     = {};   // path -> [callback]

  // ════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════
  function init() {
    var ok = _checkFBConfig();
    if (ok && typeof firebase !== 'undefined') {
      _tryFirebase();
    } else {
      _goLocal(ok ? 'firebase-sdk-missing' : 'config-placeholder');
    }
  }

  function _checkFBConfig() {
    if (typeof FIREBASE_CONFIG === 'undefined') return false;
    var k = FIREBASE_CONFIG.apiKey || '';
    return k.length > 10 && k !== 'YOUR_API_KEY_HERE';
  }

  function _tryFirebase() {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      _db   = firebase.database();
      _auth = firebase.auth();
      _fbMode = true;
      _ready  = true;
      _seedLS();
      _dispatch('firebase');
      
      // Auto-sync logic: If Firebase is completely empty, auto-sync local data
      _db.ref('settings').once('value').then(function(s) {
        if (s.val() === null) {
          console.info('[AUFP] Firebase is empty. Auto-syncing local data to cloud...');
          seedAll();
        }
      }).catch(function(){});
      
    } catch (e) {
      console.warn('[AUFP] Firebase failed:', e.message);
      _goLocal('firebase-error');
    }
  }

  function _goLocal(reason) {
    _fbMode = false;
    _ready  = true;
    if (reason === 'config-placeholder') {
      console.info('[AUFP] localStorage mode — Update Admin/firebase-config.js to enable Firebase');
    }
    _seedLS();
    _dispatch('local');
  }

  function _dispatch(mode) {
    document.dispatchEvent(new CustomEvent('aufp:ready', { detail: { mode: mode, firebase: _fbMode } }));
    _queue.forEach(function (fn) { try { fn(); } catch(e){} });
    _queue = [];
  }

  // ════════════════════════════════════════════
  // SEED localStorage with defaults on first run
  // ════════════════════════════════════════════
  function _seedLS() {
    if (typeof DEFAULT_DATA === 'undefined') return;
    var paths = ['products','deals','hero_slides','reviews','settings','categories'];
    paths.forEach(function(p) {
      if (!localStorage.getItem(LS_PREFIX + p) && DEFAULT_DATA[p]) {
        try { localStorage.setItem(LS_PREFIX + p, JSON.stringify(DEFAULT_DATA[p])); } catch(e) {}
      }
    });
  }

  // ════════════════════════════════════════════
  // READ (once)
  // ════════════════════════════════════════════
  function read(path, cb) {
    if (_fbMode && _db) {
      _db.ref(path).once('value')
        .then(function(s) { cb(s.val() !== null ? s.val() : _lsGet(path)); })
        .catch(function()  { cb(_lsGet(path)); });
    } else {
      cb(_lsGet(path));
    }
  }

  // ════════════════════════════════════════════
  // LISTEN (real-time — re-fires on every change)
  // ════════════════════════════════════════════
  function listen(path, cb) {
    if (!_subs[path]) _subs[path] = [];
    _subs[path].push(cb);

    if (_fbMode && _db) {
      // Firebase real-time listener
      _db.ref(path).on('value',
        function(s) { var v = s.val(); cb(v !== null ? v : _lsGet(path)); },
        function(e) { console.warn('[AUFP]', e.message); cb(_lsGet(path)); }
      );
    } else {
      // Initial value
      cb(_lsGet(path));
    }

    // Always listen for local changes as a fallback (fixes cross-tab sync when Firebase fails)
    document.addEventListener('aufp:changed', function(e) {
      if (e.detail && _pathMatches(path, e.detail.path)) {
        cb(_lsGet(path));
      }
    });

    window.addEventListener('storage', function(e) {
      if (e.key === LS_PREFIX + path.split('/')[0]) {
        cb(_lsGet(path));
      }
    });

    return function() { // unsubscribe
      _subs[path] = (_subs[path]||[]).filter(function(c){ return c !== cb; });
    };
  }

  function _pathMatches(listenPath, changedPath) {
    return changedPath === listenPath || changedPath.startsWith(listenPath + '/') || listenPath.startsWith(changedPath + '/');
  }

  // ════════════════════════════════════════════
  // SET (write full value)
  // ════════════════════════════════════════════
  function set(path, value, onOk, onErr) {
    // Write localStorage FIRST — immediate local update
    _lsSet(path, value);
    _broadcast(path);

    if (_fbMode && _db) {
      _db.ref(path).set(value)
        .then(function() { if (onOk) onOk(); })
        .catch(function(e) {
          console.error('[AUFP] Firebase set error:', e.message);
          if (onOk) onOk(); // LS already saved, treat as success
        });
    } else {
      if (onOk) onOk();
    }
  }

  // ════════════════════════════════════════════
  // PUSH (auto-generated ID)
  // ════════════════════════════════════════════
  function push(path, value, onOk, onErr) {
    var newId   = genId();
    var current = _lsGet(path) || {};
    current[newId] = value;
    _lsSet(path, current);
    _broadcast(path);

    if (_fbMode && _db) {
      var ref = _db.ref(path).push(value);
      ref.then(function() { if (onOk) onOk(ref.key); })
         .catch(function() { if (onOk) onOk(newId); });
    } else {
      if (onOk) onOk(newId);
    }
  }

  // ════════════════════════════════════════════
  // REMOVE (delete)
  // ════════════════════════════════════════════
  function remove(path, onOk, onErr) {
    _lsRemove(path);
    var parent = path.split('/').slice(0,-1).join('/');
    _broadcast(parent || path);

    if (_fbMode && _db) {
      _db.ref(path).remove()
        .then(function() { if (onOk) onOk(); })
        .catch(function() { if (onOk) onOk(); });
    } else {
      if (onOk) onOk();
    }
  }

  // ════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════
  function signIn(email, pw, onOk, onErr) {
    if (_fbMode && _auth) {
      _auth.signInWithEmailAndPassword(email, pw)
        .then(function(c) {
          sessionStorage.setItem('aufp_admin', c.user.uid);
          sessionStorage.setItem('aufp_admin_email', c.user.email);
          if (onOk) onOk(c.user);
        })
        .catch(function(e) { if (onErr) onErr(e); });
    } else {
      var de = (typeof DEMO_ADMIN!=='undefined' && DEMO_ADMIN.email)    || 'admin@aufp.com';
      var dp = (typeof DEMO_ADMIN!=='undefined' && DEMO_ADMIN.password) || 'AhsanFoodPoint123!';
      if (email === de && pw === dp) {
        sessionStorage.setItem('aufp_admin', 'local');
        sessionStorage.setItem('aufp_admin_email', email);
        if (onOk) onOk({ uid:'local', email:email });
      } else {
        if (onErr) onErr({ code:'auth/wrong-password', message:'Demo: ' + de + ' / ' + dp });
      }
    }
  }

  function signOut(cb) {
    sessionStorage.removeItem('aufp_admin');
    sessionStorage.removeItem('aufp_admin_email');
    if (_fbMode && _auth) { _auth.signOut().then(function(){ if(cb) cb(); }); }
    else if (cb) cb();
  }

  function isLoggedIn() { return !!sessionStorage.getItem('aufp_admin'); }

  // ════════════════════════════════════════════
  // SEED ALL DATA (admin setup button)
  // ════════════════════════════════════════════
  function seedAll(onDone) {
    var paths = ['products','deals','hero_slides','reviews','settings','categories'];

    // Ensure localStorage has at least default data
    if (typeof DEFAULT_DATA !== 'undefined') {
      paths.forEach(function(p) {
        if (!_lsGet(p) && DEFAULT_DATA[p]) {
          try { localStorage.setItem(LS_PREFIX + p, JSON.stringify(DEFAULT_DATA[p])); } catch(e) {}
        }
      });
    }
    _broadcastAll();

    if (_fbMode && _db) {
      var done = 0;
      paths.forEach(function(p) {
        var dataToSync = _lsGet(p);
        if (!dataToSync && typeof DEFAULT_DATA !== 'undefined') dataToSync = DEFAULT_DATA[p];
        if (!dataToSync) { done++; return; }
        
        _db.ref(p).set(dataToSync)
          .then(function() { done++; if (done===paths.length && onDone) onDone(); })
          .catch(function(e) {
            console.error('[AUFP] Sync err:', p, e.message);
            done++; if (done===paths.length && onDone) onDone();
          });
      });
    } else {
      if (onDone) onDone();
    }
  }

  // ════════════════════════════════════════════
  // TEST CONNECTION
  // ════════════════════════════════════════════
  function testConnection(cb) {
    if (!_checkFBConfig()) {
      cb({ ok:false, msg:'Firebase config has placeholder values. Update Admin/firebase-config.js first.' });
      return;
    }
    if (_fbMode && _db) {
      _db.ref('.info/connected').once('value', function(s) {
        if (s.val()) cb({ ok:true,  msg:'✅ Firebase connected and working!' });
        else          cb({ ok:false, msg:'Firebase SDK loaded but database unreachable. Check database URL.' });
      }).catch(function(e) { cb({ ok:false, msg:'Error: ' + e.message }); });
    } else {
      cb({ ok:false, msg:'Not in Firebase mode. Check firebase-config.js credentials.' });
    }
  }

  // ════════════════════════════════════════════
  // LOCALSTORAGE HELPERS
  // ════════════════════════════════════════════
  function _lsGet(path) {
    var parts  = path.split('/');
    var topKey = LS_PREFIX + parts[0];
    try {
      var data = JSON.parse(localStorage.getItem(topKey));
      if (!data) return null;
      for (var i = 1; i < parts.length; i++) {
        if (data == null || typeof data !== 'object') return null;
        data = data[parts[i]];
      }
      return data !== undefined ? data : null;
    } catch(e) { return null; }
  }

  function _lsSet(path, value) {
    var parts  = path.split('/');
    var topKey = LS_PREFIX + parts[0];
    if (parts.length === 1) {
      try { localStorage.setItem(topKey, JSON.stringify(value)); } catch(e) {}
      return;
    }
    try {
      var root = JSON.parse(localStorage.getItem(topKey)) || {};
      var cur  = root;
      for (var i = 1; i < parts.length - 1; i++) {
        if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length-1]] = value;
      localStorage.setItem(topKey, JSON.stringify(root));
    } catch(e) {}
  }

  function _lsRemove(path) {
    var parts  = path.split('/');
    var topKey = LS_PREFIX + parts[0];
    if (parts.length === 1) { localStorage.removeItem(topKey); return; }
    try {
      var root = JSON.parse(localStorage.getItem(topKey)) || {};
      var cur  = root;
      for (var i = 1; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) return;
        cur = cur[parts[i]];
      }
      delete cur[parts[parts.length-1]];
      localStorage.setItem(topKey, JSON.stringify(root));
    } catch(e) {}
  }

  // ════════════════════════════════════════════
  // BROADCAST (notify same-tab listeners)
  // ════════════════════════════════════════════
  function _broadcast(path) {
    document.dispatchEvent(new CustomEvent('aufp:changed', { detail: { path: path } }));
    // Also trigger subs directly
    if (_subs[path]) {
      var val = _lsGet(path);
      _subs[path].forEach(function(cb) { try { cb(val); } catch(e){} });
    }
  }

  function _broadcastAll() {
    Object.keys(_subs).forEach(function(p) { _broadcast(p); });
  }

  // ════════════════════════════════════════════
  // UTILS
  // ════════════════════════════════════════════
  function genId() {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
  }

  function onReady(fn) {
    if (_ready) { try { fn(); } catch(e){} }
    else         { _queue.push(fn); }
  }

  // Auto-init
  document.addEventListener('DOMContentLoaded', function() { init(); });

  return {
    init:           init,
    onReady:        onReady,
    isReady:        function() { return _ready; },
    isFallback:     function() { return !_fbMode; },
    isFirebase:     function() { return _fbMode; },
    isLoggedIn:     isLoggedIn,
    getDB:          function() { return _db; },
    getAuth:        function() { return _auth; },
    read:           read,
    listen:         listen,
    set:            set,
    push:           push,
    remove:         remove,
    signIn:         signIn,
    signOut:        signOut,
    seedAll:        seedAll,
    testConnection: testConnection,
    genId:          genId
  };
})();
