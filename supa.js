/* B.CREA · Gestion boutique hors Claude
   Connexion Supabase (email + mot de passe + double authentification)
   et stockage privé des données (table « gestion », dossier privé « gestion »). */
(() => {
'use strict';
const CFG = window.BCREA_CONFIG || {};
const SB = String(CFG.supabaseUrl || '').replace(/\/+$/, ''), K = String(CFG.supabaseAnonKey || '').trim();
const READY = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SB) && K.length > 20;
const BUCKET = 'gestion', SKEY = 'bcrea-sess';
let sess = null;
try { const r = sessionStorage.getItem(SKEY); if (r) sess = JSON.parse(r); } catch (e) {}
const jwt = t => { try { return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return {}; } };
const aal = () => sess ? jwt(sess.access_token).aal : null;
function setSess(j) {
  sess = { access_token: j.access_token, refresh_token: j.refresh_token || (sess && sess.refresh_token), expires_at: Date.now() + (j.expires_in || 3600) * 1000, user: j.user || (sess && sess.user) };
  try { sessionStorage.setItem(SKEY, JSON.stringify(sess)); } catch (e) {}
}
function clearSess() { sess = null; try { sessionStorage.removeItem(SKEY); } catch (e) {} }

async function raw(path, opt = {}) {
  const h = { apikey: K, ...(opt.headers || {}) };
  let body = opt.body;
  if (body && !(body instanceof Blob)) { h['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  if (opt.auth !== false && sess) h.Authorization = 'Bearer ' + sess.access_token;
  const r = await fetch(SB + path, { method: opt.method || 'GET', headers: h, body });
  const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
  if (!r.ok) { const err = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ('Erreur ' + r.status)); err.status = r.status; err.code = r.status === 401 || r.status === 403 ? 'not_granted' : 'error'; throw err; }
  return j;
}
let refreshing = null;
async function api(path, opt = {}) {
  if (sess && Date.now() > sess.expires_at - 60000) {
    refreshing = refreshing || raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: { refresh_token: sess.refresh_token } })
      .then(setSess).finally(() => { refreshing = null; });
    try { await refreshing; } catch (e) { clearSess(); showLogin('login', 'Votre session a expiré : reconnectez-vous.'); throw e; }
  }
  return raw(path, opt);
}

/* ---------- écran de connexion ---------- */
const css = document.createElement('style');
css.textContent = `
#gl{position:fixed;inset:0;z-index:100;background:var(--bg);display:grid;place-items:center;padding:16px;overflow:auto}
#gl[hidden]{display:none}
#gl .card{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:26px 24px;box-shadow:var(--shadow)}
#gl img{width:64px;height:auto;display:block;margin:0 auto 6px}
#gl h1{font-family:'Bodoni Moda',serif;font-weight:600;font-size:20px;text-align:center;margin:0 0 4px}
#gl .sub{text-align:center;color:var(--muted);font-size:13px;margin:0 0 18px}
#gl label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted);margin-bottom:12px}
#gl input{padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--field);color:var(--text);font:inherit;font-size:16px}
#gl button.go{width:100%;justify-content:center;padding:10px;font-size:15px;margin-top:4px}
#gl .st{min-height:20px;font-size:13px;color:var(--bad);margin:10px 0 0;text-align:center}
#gl .lnk{background:none;border:0;color:var(--accent-dark);cursor:pointer;font:inherit;font-size:13px;padding:0;margin-top:12px;display:block;margin-left:auto;margin-right:auto}
#gl .lnk[hidden],#gl label[hidden]{display:none}
#gl .back{display:block;text-align:center;font-size:12px;color:var(--muted);margin-top:16px}`;
document.head.appendChild(css);
const gl = document.createElement('div'); gl.id = 'gl';
gl.innerHTML = `<form class="card" id="gl-form" novalidate autocomplete="on">
  <img src="../images/logo.jpg" alt="B.CREA">
  <h1 id="gl-t">Gestion boutique</h1>
  <p class="sub" id="gl-sub">Espace privé de B.CREA</p>
  <label id="gl-ef">Email<input id="gl-email" type="email" autocomplete="username" required></label>
  <label id="gl-pf">Mot de passe<input id="gl-pass" type="password" autocomplete="current-password" required></label>
  <label id="gl-cf" hidden>Code de l'application d'authentification<input id="gl-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456"></label>
  <label id="gl-nf" hidden>Nouveau mot de passe (8 caractères minimum)<input id="gl-new" type="password" autocomplete="new-password"></label>
  <button class="btn primary go" id="gl-go" type="submit">Se connecter</button>
  <p class="st" id="gl-st" aria-live="polite"></p>
  <button class="lnk" id="gl-forgot" type="button">Mot de passe oublié ?</button>
  <button class="lnk" id="gl-out" type="button" hidden>Utiliser un autre compte</button>
  <a class="back" href="../">← Retour au site</a>
</form>`;
document.body.appendChild(gl);
const $ = id => document.getElementById(id);
let step = 'login', factorId = null, granted = false, waiters = [];
const say = t => { $('gl-st').textContent = t || ''; };
function showLogin(s, msg) {
  step = s; gl.hidden = false;
  $('gl-ef').hidden = $('gl-pf').hidden = s !== 'login'; $('gl-forgot').hidden = s !== 'login';
  $('gl-cf').hidden = s !== 'code'; $('gl-nf').hidden = s !== 'newpass'; $('gl-out').hidden = s === 'login';
  $('gl-sub').textContent = s === 'code' ? 'Double authentification' : s === 'newpass' ? 'Choisissez un nouveau mot de passe' : 'Espace privé de B.CREA';
  $('gl-go').textContent = s === 'code' ? 'Valider le code' : s === 'newpass' ? 'Enregistrer' : 'Se connecter';
  say(msg || (s === 'code' ? '' : ''));
  setTimeout(() => { const f = s === 'code' ? $('gl-code') : s === 'newpass' ? $('gl-new') : $('gl-email'); if (f) f.focus(); }, 50);
}
const verified = u => ((u && u.factors) || []).filter(f => f.factor_type === 'totp' && f.status === 'verified');
async function check() {
  const u = await api('/auth/v1/user'); setSess({ ...sess, user: u, expires_in: Math.round((sess.expires_at - Date.now()) / 1000) });
  const f = verified(u);
  if (f.length && aal() !== 'aal2') { factorId = f[0].id; showLogin('code'); return; }
  let ok = false; try { ok = await api('/rest/v1/rpc/acces_gestion', { method: 'POST', body: {} }); } catch (e) {
    showLogin('login', e.status === 404 ? 'La gestion n’est pas encore installée dans Supabase (fichier supabase/gestion.sql).' : 'Vérification impossible pour le moment. Réessayez.'); return; }
  if (ok !== true) { showLogin('login', 'Ce compte n’a pas accès à la gestion.'); clearSess(); return; }
  gl.hidden = true; granted = true; addLogout(); waiters.splice(0).forEach(fn => fn());
}
$('gl-form').addEventListener('submit', async e => {
  e.preventDefault(); const b = $('gl-go'); b.disabled = true;
  try {
    if (step === 'login') {
      const email = $('gl-email').value.trim(), pw = $('gl-pass').value;
      if (!email || !pw) { say('Renseignez votre email et votre mot de passe.'); return; }
      say('Connexion…');
      try { setSess(await raw('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email, password: pw } })); }
      catch (err) { await new Promise(r => setTimeout(r, 600)); say(err.status === 400 || err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Connexion impossible pour le moment. Réessayez.'); return; }
      $('gl-pass').value = ''; say(''); await check();
    } else if (step === 'code') {
      const code = $('gl-code').value.replace(/\s/g, '');
      if (!/^\d{6}$/.test(code)) { say('Le code contient 6 chiffres.'); return; }
      say('Vérification…');
      try { const ch = await api('/auth/v1/factors/' + factorId + '/challenge', { method: 'POST', body: {} }); setSess(await api('/auth/v1/factors/' + factorId + '/verify', { method: 'POST', body: { challenge_id: ch.id, code } })); }
      catch (err) { say('Code incorrect ou expiré. Réessayez avec le code affiché maintenant.'); return; }
      $('gl-code').value = ''; say(''); await check();
    } else if (step === 'newpass') {
      const pw = $('gl-new').value;
      if (pw.length < 8) { say('Le mot de passe doit faire au moins 8 caractères.'); return; }
      try { await api('/auth/v1/user', { method: 'PUT', body: { password: pw } }); } catch (err) { say('Le mot de passe n’a pas pu être changé. Recommencez depuis « Mot de passe oublié ».'); return; }
      $('gl-new').value = ''; await check();
    }
  } catch (err) { say('Une erreur est survenue. Réessayez.'); }
  finally { b.disabled = false; }
});
$('gl-forgot').addEventListener('click', async () => {
  const email = $('gl-email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say('Entrez d’abord votre adresse email, puis cliquez à nouveau sur « Mot de passe oublié ».'); $('gl-email').focus(); return; }
  try { await raw('/auth/v1/recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { method: 'POST', auth: false, body: { email } }); } catch (e) {}
  $('gl-st').style.color = 'var(--good)'; say('Si ce compte existe, un email vient de vous être envoyé avec un lien pour choisir un nouveau mot de passe.');
  setTimeout(() => { $('gl-st').style.color = ''; }, 8000);
});
function logout() { if (sess) raw('/auth/v1/logout', { method: 'POST' }).catch(() => {}); clearSess(); location.reload(); }
$('gl-out').addEventListener('click', logout);
function addLogout() {
  if (document.getElementById('gl-logout')) return;
  const t = document.getElementById('theme'); if (!t) return;
  const b = document.createElement('button'); b.className = 'iconbtn'; b.id = 'gl-logout'; b.title = 'Se déconnecter';
  b.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
  b.addEventListener('click', logout); t.after(b);
}

/* ---------- lien « mot de passe oublié » : #access_token=…&type=recovery ---------- */
let recovery = false;
(() => {
  const h = location.hash.slice(1); if (!h.includes('access_token=')) return;
  const p = new URLSearchParams(h);
  if (p.get('access_token')) { setSess({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: +p.get('expires_in') || 3600 }); recovery = p.get('type') === 'recovery'; }
  history.replaceState(null, '', location.pathname);
})();

function start() {
  if (!READY) { showLogin('login', 'Supabase n’est pas encore configuré (js/config.js).'); $('gl-go').disabled = true; return; }
  if (recovery) { showLogin('newpass'); return; }
  if (sess) { check().catch(() => { clearSess(); showLogin('login'); }); return; }
  showLogin('login');
}
const whenGranted = () => granted ? Promise.resolve() : new Promise(r => waiters.push(r));

/* ---------- fichiers privés : adresses signées ---------- */
const signed = {};  // id -> {url, until}
function walkIds(o, out) { if (Array.isArray(o)) o.forEach(x => walkIds(x, out)); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => { if ((k === 'photos' || k === 'files') && Array.isArray(v)) v.forEach(f => { if (f && f.id) out.add(f.id); }); else walkIds(v, out); }); return out; }
async function sign(ids) {
  const need = [...ids].filter(id => !signed[id] || signed[id].until < Date.now() + 3600e3);
  for (let i = 0; i < need.length; i += 100) {
    try {
      const r = await api('/storage/v1/object/sign/' + BUCKET, { method: 'POST', body: { expiresIn: 43200, paths: need.slice(i, i + 100) } });
      (r || []).forEach(x => { if (x && x.signedURL && !x.error) signed[x.path] = { url: SB + '/storage/v1' + (x.signedURL.startsWith('/') ? '' : '/') + x.signedURL, until: Date.now() + 43200e3 }; });
    } catch (e) {}
  }
}
window.BLOB_URL = id => (signed[id] && signed[id].url) || '';

/* ---------- base de données (même interface que dans Claude) ---------- */
const cache = {}, subs = {};
const snap = c => ({ metadata: { fromCache: false }, docs: Object.entries(cache[c] || {}).map(([id, data]) => ({ id, exists: true, data: () => JSON.parse(JSON.stringify(data)) })) });
async function fetchCol(c) {
  const rows = []; let off = 0;
  for (;;) { const r = await api(`/rest/v1/gestion?select=id,data&col=eq.${encodeURIComponent(c)}&order=id&limit=1000&offset=${off}`); rows.push(...r); if (r.length < 1000) break; off += 1000; }
  cache[c] = Object.fromEntries(rows.map(r => [r.id, r.data || {}]));
  await sign(walkIds(cache[c], new Set()));
  return cache[c];
}
function emit(c) { (subs[c] || []).forEach(s => { try { s.cb(view(c, s.q)); } catch (e) {} }); }
function view(c, q) {
  const s = snap(c); if (!q) return s;
  let d = s.docs; if (q.ob) { const [f, dir] = q.ob; d = [...d].sort((a, b) => { const x = a.data()[f], y = b.data()[f]; return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'desc' ? -1 : 1); }); }
  if (q.lim) d = d.slice(0, q.lim); return { ...s, docs: d };
}
async function refreshAll() { if (!granted) return; for (const c of Object.keys(subs)) { try { await fetchCol(c); emit(c); } catch (e) { (subs[c] || []).forEach(s => s.err && s.err(e)); } } }
setInterval(refreshAll, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAll(); });
const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
async function put(c, id, data) {
  await api('/rest/v1/gestion', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { col: c, id, data, maj: new Date().toISOString() } });
  (cache[c] = cache[c] || {})[id] = JSON.parse(JSON.stringify(data));
  await sign(walkIds(data, new Set())); emit(c);
}
function docRef(c, id) {
  return {
    id,
    async get() { const r = await api(`/rest/v1/gestion?select=data&col=eq.${encodeURIComponent(c)}&id=eq.${encodeURIComponent(id)}`); const d = r && r[0] ? r[0].data : undefined; return { id, exists: !!r[0], data: () => d }; },
    set: data => put(c, id, data),
    async update(patch) {
      let cur = cache[c] && cache[c][id];
      if (!cur) { const g = await this.get(); if (!g.exists) { const e = new Error('not_found'); e.code = 'not_found'; throw e; } cur = g.data(); }
      const next = { ...cur }; Object.entries(patch).forEach(([k, v]) => { if (v && typeof v === 'object' && v.__delete__) delete next[k]; else next[k] = v; });
      return put(c, id, next);
    },
    async delete() { await api(`/rest/v1/gestion?col=eq.${encodeURIComponent(c)}&id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }); if (cache[c]) delete cache[c][id]; emit(c); }
  };
}
function colRef(c, q) {
  return {
    doc: id => docRef(c, id),
    orderBy: (f, dir) => colRef(c, { ...(q || {}), ob: [f, dir || 'asc'] }),
    limit: n => colRef(c, { ...(q || {}), lim: n }),
    async add(data) { const id = newKey(); await put(c, id, data); return docRef(c, id); },
    async get() { await fetchCol(c); return view(c, q); },
    onSnapshot(cb, err) {
      const s = { cb, err, q }; (subs[c] = subs[c] || []).push(s);
      fetchCol(c).then(() => cb(view(c, q))).catch(e => err && err(e));
      return () => { subs[c] = (subs[c] || []).filter(x => x !== s); };
    }
  };
}
const db = { collection: c => colRef(c) };

/* ---------- fichiers ---------- */
const assets = {
  async upload(blob, opt = {}) {
    const id = newKey(), type = (opt && opt.type) || blob.type || 'application/octet-stream';
    await api('/storage/v1/object/' + BUCKET + '/' + id, { method: 'POST', headers: { 'Content-Type': type, 'x-upsert': 'false' }, body: blob });
    await sign([id]); return { id, url: window.BLOB_URL(id), contentType: type, sizeBytes: blob.size };
  },
  async delete(id) { await api('/storage/v1/object/' + BUCKET + '/' + encodeURIComponent(id), { method: 'DELETE' }); delete signed[id]; }
};
const downloads = {
  async save({ filename, data }) {
    const u = URL.createObjectURL(data); const a = document.createElement('a'); a.href = u; a.download = filename || 'document';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); return { ok: true };
  }
};
const CAPS = { db, assets, downloads };
window.claude = { use: async name => { if (!(name in CAPS)) return null; await whenGranted(); return CAPS[name]; } };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
