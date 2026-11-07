// Comptes · table `accounts` (id, email unique, first, last, birth, height, profil, coach, status, created)
// Rôle = table `user_roles` (account_id, role: client | coach | admin) · modifiable uniquement par un admin (jamais par le compte lui-même).
// Lovable : la sécurité réelle = règles RLS Supabase (un client ne lit que ses rows ; seuls coach/admin lisent clients, programmes, séances). Le lien ne protège rien.
// Un compte = un espace client indépendant. Le coach peut pré-créer le compte (status 'invité') ;
// quand le client s'inscrit avec le même email, il récupère ce compte (status 'actif').
(function () {
  if (window.TCMVA) return;
  const K = 'tcmv.accounts.v1', KC = 'tcmv.accounts.cur', subs = new Set();
  // DÉMO UNIQUEMENT · ne pas importer dans Lovable : aucun compte n'est repris, tous sont recréés à l'inscription.
  // Lovable : le compte admin = l'e-mail thomasandres34@gmail.com (rôle admin attribué automatiquement à son inscription, voir doc Lovable).
  const SEED = [
    { id: 'julien', email: 'julien@mail.com', first: 'Julien', last: 'Risterucci', birth: '1998-03-14', height: '180', sex: 'H', profil: 'Coaching privé', coach: 'Thomas', role: 'client', status: 'actif' },
    { id: 'demo', email: 'thomas@tcmv.fr', first: 'Thomas', last: 'Andres', birth: '1993-04-12', height: '182', sex: 'H', profil: 'Programme du catalogue', coach: '', role: 'admin', status: 'actif' },
    { id: 'justine', email: 'justine@mail.com', first: 'Justine', last: 'Morel', birth: '1995-09-02', height: '168', sex: 'F', profil: 'Pilates (Aurore)', coach: '', role: 'client', status: 'actif' }
  ];
  const norm = e => String(e || '').trim().toLowerCase();
  const read = () => { try { const v = JSON.parse(localStorage.getItem(K)); if (Array.isArray(v)) return v.map(a => a.role ? a : { ...a, role: (SEED.find(x => x.id === a.id) || {}).role || 'client' }); } catch (e) {} return SEED.map(a => ({ ...a })); };
  const write = L => { try { localStorage.setItem(K, JSON.stringify(L)); } catch (e) {} subs.forEach(f => f()); };
  const slug = a => (norm(a.first || a.email.split('@')[0]).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || 'client') + '-' + Date.now().toString(36).slice(-4);
  const A = window.TCMVA = {
    all: () => read(),
    byEmail: e => read().find(a => norm(a.email) === norm(e)) || null,
    byId: id => read().find(a => a.id === id) || null,
    byName: n => read().find(a => (a.first + ' ' + a.last).trim() === n) || null,
    name: a => a ? (a.first + ' ' + (a.last || '')).trim() : '',
    // Clé stable d'un client (accounts.id) à partir d'un id, d'un nom ou d'un e-mail · toutes les données coach ↔ client sont rangées par id
    key: x => { if (!x) return ''; if (A.byId(x)) return x; const a = A.byName(x) || A.byEmail(x); return a ? a.id : String(x); },
    // Connecté = session ouverte (Lovable : auth.session) · sans session, l’app ouvre la connexion
    signedIn: () => { try { return !!localStorage.getItem(KC); } catch (e) { return false; } },
    current: () => { let id = null; try { id = localStorage.getItem(KC); } catch (e) {} if (id === '') return null; return A.byId(id || 'julien'); },
    signIn: email => { const a = A.byEmail(email); if (!a) return null; if (a.status === 'invité') A.update(a.id, { status: 'actif' }); try { localStorage.setItem(KC, a.id); } catch (e) {} subs.forEach(f => f()); return A.byId(a.id); },
    signUp: d => { const ex = A.byEmail(d.email); if (ex) return A.signIn(d.email); const L = read(), a = { id: slug(d), email: d.email.trim(), first: d.first.trim(), last: (d.last || '').trim(), birth: '', height: '', sex: d.sex || '', profil: 'Nouveau (sans programme)', coach: '', status: 'actif', created: new Date().toISOString().slice(0, 10) }; L.push(a); write(L); return A.signIn(a.email); },
    signOut: () => { try { const c = localStorage.getItem(KC); if (c) localStorage.setItem('tcmv.accounts.last', c); localStorage.setItem(KC, ''); } catch (e) {} subs.forEach(f => f()); },
    // Onboarding fait = profil client complet (accounts.onb) · sinon questions à la 1re connexion
    needsOnb: a => !!a && !a.onb && !(a.birth && a.height),
    invite: d => { const ex = A.byEmail(d.email); if (ex) { A.update(ex.id, { coach: d.coach || 'Thomas', profil: 'Coaching privé' }); return A.byId(ex.id); } const L = read(), a = { id: slug(d), email: d.email.trim(), first: d.first.trim(), last: (d.last || '').trim(), birth: d.birth || '', height: '', profil: 'Coaching privé', coach: d.coach || 'Thomas', status: 'invité', created: new Date().toISOString().slice(0, 10) }; L.push(a); write(L); return a; },
    // Rôle + espace d’arrivée : coach/admin sur ordinateur → Espace Coach · tout le reste → app client
    role: a => (a && a.role) || 'client',
    // Comptes admin (propriétaire) · Lovable : user_roles
    isCoach: a => ['coach', 'admin'].includes(A.role(a)) || ['thomas@tcmv.fr', 'thomasandres34@gmail.com'].includes(norm(a && a.email)),
    isDesktop: () => { try { return matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024; } catch (e) { return false; } },
    home: a => A.isCoach(a) && A.isDesktop() ? 'coach' : 'app',
    update: (id, p) => write(read().map(a => a.id === id ? { ...a, ...p } : a)),
    get: (id, k) => { try { const v = localStorage.getItem('tcmv.acct.' + id + '.' + k); return v == null ? undefined : JSON.parse(v); } catch (e) { return undefined; } },
    put: (id, k, v) => { try { localStorage.setItem('tcmv.acct.' + id + '.' + k, JSON.stringify(v)); } catch (e) {} if (k === 'photo') subs.forEach(f => f()); },
    // Historique des séances faites · table `sessions_done` (account_id, date, title, prog, kind, min) + `sets_done` (session_id, ex, kg, reps, target)
    // Séances réellement validées (stockées) · migration : retire les entrées de l'ancien générateur de démo
    real: id => { const v = A.get(id, 'hist'); if (!Array.isArray(v)) return []; const OLD = /^(Lowerbody|Upperbody|EMOM 20|Fractionné 10×400)$/, L = v.filter(x => !(x.gen || (x.prog === 'Coaching Thomas' && OLD.test(x.title || '')))); if (L.length !== v.length) A.put(id, 'hist', L); return L; },
    // Aucune simulation : uniquement les séances réellement validées par le client
    hist: id => A.real(id),
    addHist: (id, s) => { const L = A.real(id).slice(); L.push({ date: new Date().toISOString().slice(0, 10), ...s }); A.put(id, 'hist', L); subs.forEach(f => f()); },
    // Séances prévues cette semaine : calculées depuis le programme suivi / planning coach (App › Aujourd’hui) · 0 si aucun programme
    perWeek: id => { const v = A.get(id, 'perWeek'); return v != null ? v : 0; },
    isSeed: id => SEED.some(a => a.id === id),
    subscribe: f => { subs.add(f); return () => subs.delete(f); }
  };
})();

// Vrai téléphone (GitHub / écran d'accueil) : la fausse barre d'état « 9:41 » et les coins arrondis du cadre iPhone de la maquette sont retirés,
// remplacés par l'espace de la vraie barre (safe area). Dans le canvas (ordinateur) rien ne change. Lovable : pas de fausse barre, ce bloc ne part pas.
(function () {
  if (window.__tcmvDevice) return; window.__tcmvDevice = 1;
  let real = false; try { real = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600 && window.top === window; } catch (e) {}
  if (!real) return;
  document.documentElement.classList.add('tcmv-device');
  let q = 0;
  const fix = () => { q = 0;
    document.querySelectorAll('span').forEach(sp => { if (sp.__tdv || sp.textContent !== '9:41') return; sp.__tdv = 1; const bar = sp.parentElement; if (!bar || bar.firstElementChild !== sp || bar.offsetHeight > 70) return;
      [...bar.children].forEach(c => c.style.display = 'none'); bar.style.height = 'env(safe-area-inset-top, 0px)'; bar.style.minHeight = '0'; bar.style.padding = '0'; });
    document.querySelectorAll('[style*="border-radius:55px"],[style*="border-radius:56px"],[style*="border-radius: 55px"],[style*="border-radius: 56px"]').forEach(el => { el.style.borderRadius = '0'; });
  };
  const go = () => { if (!q) q = requestAnimationFrame(fix); };
  const start = () => { fix(); new MutationObserver(go).observe(document.body, { childList: true, subtree: true }); };
  document.body ? start() : document.addEventListener('DOMContentLoaded', start);
})();
