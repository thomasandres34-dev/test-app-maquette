// Comptes · table `accounts` (id, email unique, first, last, birth, height, profil, coach, status, created)
// Rôle = table `user_roles` (account_id, role: client | coach | admin) · modifiable uniquement par un admin (jamais par le compte lui-même).
// Lovable : la sécurité réelle = règles RLS Supabase (un client ne lit que ses rows ; seuls coach/admin lisent clients, programmes, séances). Le lien ne protège rien.
// Un compte = un espace client indépendant. Le coach peut pré-créer le compte (status 'invité') ;
// quand le client s'inscrit avec le même email, il récupère ce compte (status 'actif').
(function () {
  if (window.TCMVA) return;
  const K = 'tcmv.accounts.v1', KC = 'tcmv.accounts.cur', subs = new Set();
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
    isCoach: a => ['coach', 'admin'].includes(A.role(a)),
    isDesktop: () => { try { return matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024; } catch (e) { return false; } },
    home: a => A.isCoach(a) && A.isDesktop() ? 'coach' : 'app',
    update: (id, p) => write(read().map(a => a.id === id ? { ...a, ...p } : a)),
    get: (id, k) => { try { const v = localStorage.getItem('tcmv.acct.' + id + '.' + k); return v == null ? undefined : JSON.parse(v); } catch (e) { return undefined; } },
    put: (id, k, v) => { try { localStorage.setItem('tcmv.acct.' + id + '.' + k, JSON.stringify(v)); } catch (e) {} if (k === 'photo') subs.forEach(f => f()); },
    // Historique des séances faites · table `sessions_done` (account_id, date, title, prog, kind, min) + `sets_done` (session_id, ex, kg, reps, target)
    hist: id => { const v = A.get(id, 'hist'); if (v) return v; if (!A.isSeed(id)) return []; const P = id === 'justine' ? [['Pilates Fondamentaux', 'Pilates', 'Core & posture', 35], ['Stretching Mobilité', 'Mobilité', 'Hanches & dos', 25]] : id === 'julien' ? [['Coaching Thomas', 'Renfo', 'Lowerbody', 55], ['Coaching Thomas', 'Running', 'Fractionné 10×400', 41], ['Coaching Thomas', 'Renfo', 'Upperbody', 48], ['Coaching Thomas', 'Metcon', 'EMOM 20', 30]] : [['Hybrid Fondation', 'Renfo', 'Upper 1', 50], ['Hybrid Fondation', 'Running', 'Run EF', 40], ['Hybrid Fondation', 'Metcon', 'Metcon', 35], ['Objectif 10 km', 'Running', 'Seuil', 45]];
      const per = id === 'justine' ? 2 : 4, out = [], t = new Date(); for (let w = 0; w < 10; w++) for (let k = 0; k < per; k++) { if ((w * 7 + k * 3) % 11 === 5) continue; const d = new Date(t.getTime() - (w * 7 + k * 2 + 1) * 864e5); const p = P[(w + k) % P.length], EX = { Lowerbody: [['Back squat', 70, 5], ['Soulevé de terre roumain', 60, 8], ['Hip thrust', 80, 10]], Upperbody: [['Bench Press', 60, 6], ['Weighted pull ups', 10, 6], ['Dumbbell strict press', 16, 10]], 'Upper 1': [['Bench Press', 62.5, 6], ['Rowing barre', 55, 8], ['Dumbbell strict press', 18, 10]], 'EMOM 20': [['Power clean', 50, 5], ['Wall balls', 9, 15]], Metcon: [['Thruster', 40, 10], ['Power clean', 55, 5]] }[p[2]] || [], r25 = v => Math.round(v / 2.5) * 2.5; out.push({ date: d.toISOString().slice(0, 10), prog: p[0], kind: p[1], title: p[2], min: p[3], sets: EX.flatMap(([ex, kg, r], ei) => [0, 1, 2].map(n => ({ ex, kg: r25(kg + (9 - w) * 1.25 + (n === 2 ? 2.5 : 0)), target: r, reps: n === 2 && (w + k + ei) % 3 === 0 ? Math.max(1, r - 2) : r }))) }); } return out.sort((a, b) => a.date.localeCompare(b.date)); },
    addHist: (id, s) => { const L = A.hist(id).slice(); L.push({ date: new Date().toISOString().slice(0, 10), ...s }); A.put(id, 'hist', L); subs.forEach(f => f()); },
    // Séances prévues cette semaine : calculées depuis le programme suivi / planning coach (App › Aujourd’hui) · 0 si aucun programme
    perWeek: id => { const v = A.get(id, 'perWeek'); return v != null ? v : 0; },
    isSeed: id => SEED.some(a => a.id === id),
    subscribe: f => { subs.add(f); return () => subs.delete(f); }
  };
})();
