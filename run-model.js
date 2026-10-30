// Modèle running TCMV — intensités (coach) + profil allures/FC par client + traduction étape → allure / zone FC / ressenti.
// Démo : localStorage. Lovable : run_intensities (coach), pace_profiles (1 row/client), pace_refs (n rows/client), run_test_coefs (coach).
(function () {
  const KI = 'tcmv.run.int.v1', KP = 'tcmv.run.prof.v1', KC = 'tcmv.run.coef.v1';
  const read = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const subs = new Set(), emit = () => subs.forEach(f => { try { f(); } catch (e) {} });
  const INT0 = [
    { id: 'trot', name: 'Récup trot', vlo: 60, vhi: 68, z: 1, flo: 50, fhi: 70, rpe: '1–2', talk: 'très facile', color: 'oklch(0.93 0.015 230)' },
    { id: 'ef', name: 'Endurance', vlo: 65, vhi: 75, z: 2, flo: 70, fhi: 80, rpe: '3–4', talk: 'tu peux discuter', color: 'oklch(0.86 0.06 230)' },
    { id: 'am', name: 'Allure marathon', vlo: 75, vhi: 80, z: 3, flo: 80, fhi: 87, rpe: '5', talk: 'tu parles en phrases', color: 'oklch(0.72 0.09 230)' },
    { id: 'as21', name: 'Allure semi', vlo: 80, vhi: 85, z: 3, flo: 84, fhi: 88, rpe: '6', talk: 'phrases courtes', color: 'oklch(0.6 0.1 235)' },
    { id: 'tempo', name: 'Tempo', vlo: 82, vhi: 86, z: 3, flo: 85, fhi: 89, rpe: '6–7', talk: 'confortablement dur', color: 'oklch(0.52 0.1 240)' },
    { id: 'seuil', name: 'Seuil', vlo: 85, vhi: 88, z: 4, flo: 87, fhi: 92, rpe: '7', talk: 'phrases courtes', color: '#000' },
    { id: 'as10', name: 'Allure 10 km', vlo: 88, vhi: 92, z: 4, flo: 90, fhi: 94, rpe: '8', talk: 'quelques mots', color: 'oklch(0.32 0.08 250)' },
    { id: 'vmal', name: 'VMA longue', vlo: 92, vhi: 97, z: 5, flo: 92, fhi: 97, rpe: '8–9', talk: 'quelques mots', color: 'oklch(0.42 0.12 250)' },
    { id: 'vmac', name: 'VMA courte', vlo: 98, vhi: 105, z: 5, flo: 95, fhi: 100, rpe: '9–10', talk: 'impossible de parler', color: 'oklch(0.5 0.16 255)' }
  ];
  const COEF0 = [{ id: 'c3', name: 'Test 3 km', m: 3000, f: 0.98 }, { id: 'c5', name: 'Test 5 km', m: 5000, f: 0.95 }, { id: 'c10', name: '10 km', m: 10000, f: 0.89 }, { id: 'c21', name: 'Semi', m: 21097, f: 0.82 }, { id: 'c6', name: 'Test 6 min', min: 6, f: 1 }];
  const P0 = { mode: 'auto', fcmax: 0, fcSrc: '', age: 32, refs: [
    { date: '2026-09-27', src: 'decl', label: '10 km déclaré', res: '55:00', vma: 12.3 },
    { date: '2026-09-29', src: 'test', label: 'Test 5 km', res: '25:00', vma: 12.6 },
    { date: '2026-10-14', src: 'test', label: 'Test 5 km', res: '24:10', vma: 12.9 }] };
  const KT = 'tcmv.run.txt.v1';
  const TXT0 = {
    'vma.what': 'Ta vitesse maximale aérobie : la vitesse que tu peux tenir environ 6 minutes à fond.',
    'vma.use': 'C\'est la base de toutes tes allures. Chaque intensité de séance (EF, seuil, VMA…) est un pourcentage de cette vitesse.',
    'seuil.what': 'L\'allure que tu peux tenir environ une heure en course : effort soutenu mais contrôlé.',
    'seuil.use': 'Elle sert dans tes séances de seuil et de tempo, et c\'est un bon indicateur de forme pour le 10 km et le semi.',
    'fc.what': 'Ta fréquence cardiaque maximale.',
    'fc.use': 'Elle donne tes zones cardio Z1 à Z5, affichées dans tes séances si tu cours avec une montre ou une ceinture.',
    'prec.Excellente': 'Tes allures sont calées sur des données récentes et fiables : tu peux t\'y fier à la seconde près.',
    'prec.Bonne': 'Tes allures sont fiables. Une petite marge reste possible selon ta forme du jour.',
    'prec.Correcte': 'Tes allures sont une bonne base, mais à prendre comme une fourchette : écoute aussi tes sensations.',
    'prec.Faible': 'On manque de données : fie-toi d\'abord à l\'effort perçu, les allures sont indicatives.',
    'tip.none': 'Ajoute un chrono récent pour débloquer tes allures.',
    'tip.ref': 'Fais une séance test (5 km ou 6 min) à fond : c\'est ce qui fiabilise le plus tes allures.',
    'tip.fresh': 'Ton dernier test date un peu : refais-en un pour coller à ta forme actuelle.',
    'tip.hist': 'Encore quelques tests et ta progression sera plus fiable.',
    'tip.fc': 'Renseigne une FC max mesurée (montre, test) pour des zones cardio exactes.',
    'thr.Excellente': 80, 'thr.Bonne': 60, 'thr.Correcte': 35
  };
  const r1 = v => Math.round(v * 10) / 10;
  const fmtP = s => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const spk = kmh => 3600 / kmh;
  const M = {
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
    // ——— Intensités (Espace Coach › Admin › Intensités)
    ints() { const L = read(KI); if (!L) return INT0; const t = L.find(i => i.id === 'trot'); if (t && t.vlo === 50 && t.vhi === 60) { t.vlo = 60; t.vhi = 68; write(KI, L); } if (!L.find(i => i.id === 'tempo') && !L._noTempo) { const k = L.findIndex(i => i.id === 'seuil'); L.splice(k < 0 ? L.length : k, 0, { id: 'tempo', name: 'Tempo', vlo: 82, vhi: 86, z: 3, flo: 85, fhi: 89, rpe: '6–7', talk: 'confortablement dur', color: 'oklch(0.52 0.1 240)' }); write(KI, L); } if (L.find(i => i.id === 'as5')) { L.splice(L.findIndex(i => i.id === 'as5'), 1); write(KI, L); } return L; },
    names() { return ['Libre', ...M.ints().map(x => x.name)]; },
    int(name) { return M.ints().find(x => x.name === name || x.id === name) || null; },
    setInt(id, patch) { write(KI, M.ints().map(x => x.id === id ? { ...x, ...patch } : x)); emit(); },
    addInt() { const L = M.ints(); write(KI, [...L, { id: 'i' + Date.now().toString(36), name: 'Nouvelle intensité', vlo: 70, vhi: 75, z: 2, flo: 70, fhi: 80, rpe: '4', talk: '', color: '#888' }]); emit(); },
    setAllInts(L) { write(KI, L); emit(); },
    delInt(id) { write(KI, M.ints().filter(x => x.id !== id)); emit(); },
    resetInts() { write(KI, null); emit(); },
    // ——— Coefficients de test (chrono → VMA)
    coefs() { return read(KC) || COEF0; },
    setCoef(id, f) { write(KC, M.coefs().map(c => c.id === id ? { ...c, f } : c)); emit(); },
    vmaFrom(coefId, sec) { const c = M.coefs().find(x => x.id === coefId); if (!c || !sec) return 0; const km = c.min ? null : c.m / 1000; const kmh = c.min ? 0 : km / (sec / 3600); return c.min ? r1((sec / 1000) / (c.min / 60) / c.f) : r1(kmh / c.f); },
    // ——— Profil client (pace_profiles + pace_refs)
    profile(cid) { const all = read(KP) || {}; const D = { demo: P0, marc: P0, julien: { mode: 'auto', fcmax: 0, age: 28, refs: [] }, hugo: { mode: 'auto', fcmax: 186, fcSrc: 'montre', refs: [] } }; const p = all[cid || 'demo'] || D[cid || 'demo'] || { mode: 'auto', fcmax: 0, refs: [] }; const t = new Date().toISOString().slice(0, 10); if ((p.refs || []).some(r => r.date > t)) return { ...p, refs: p.refs.map(r => r.date > t ? { ...r, date: t } : r) }; return p; },
    saveProfile(cid, p) { const all = read(KP) || {}; all[cid || 'demo'] = p; write(KP, all); emit(); },
    patchProfile(cid, patch) { M.saveProfile(cid, { ...M.profile(cid), ...patch }); },
    addRef(cid, ref) { const p = M.profile(cid), t = new Date().toISOString().slice(0, 10); ref = { ...ref, date: ref.date > t ? t : ref.date }; M.saveProfile(cid, { ...p, refs: [...p.refs, ref].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0) }); },
    delRef(cid, i) { const p = M.profile(cid); M.saveProfile(cid, { ...p, refs: p.refs.filter((_, k) => k !== i) }); },
    resetProfile(cid) { const all = read(KP) || {}; delete all[cid || 'demo']; write(KP, all); emit(); },
    past(p) { const t = new Date().toISOString().slice(0, 10); return (p.refs || []).filter(r => r.date <= t); },
    vma(p) { const L = M.past(p), r = L[L.length - 1]; return r ? r.vma : 0; },
    // FCmax : mesurée (fiche) > saisie > théorique Tanaka 208 − 0,7 × âge
    fcInfo(p, o) { o = o || {}; if (o.measured) return { v: o.measured, src: 'mesurée' }; if (p.fcmax) return { v: p.fcmax, src: p.fcSrc || 'saisie' }; if (o.age) return { v: Math.round(208 - 0.7 * o.age), src: 'théorique · ' + o.age + ' ans' }; return { v: 0, src: '' }; },
    fcmax(p, o) { return M.fcInfo(p, o || p._fc).v; },
    dataLevel(p) { return M.level({ ...p, mode: 'auto' }); },
    level(p) { if (p.mode === 'feel') return 'ressenti'; const L0 = M.past(p), r = L0[L0.length - 1]; if (!r) return M.fcmax(p) ? 'fc' : 'ressenti'; return r.src === 'test' ? 'mesure' : 'estime'; },
    LEVELS: { mesure: 'Élevée', estime: 'Moyenne', fc: 'Cardio', ressenti: 'À calibrer' },
    // ——— Traduction d'une étape : intensité → allure / zone FC / ressenti (affichage auto selon le profil)
    cue(name, p, opt) {
      const it = M.int(name); if (!it) return null; p = p || M.profile(); opt = opt || {};
      const lv = opt.display === 'feel' ? 'ressenti' : M.level(p), v = M.vma(p), fm = M.fcmax(p);
      const feel = 'RPE ' + it.rpe + (it.talk ? ' · ' + it.talk : '');
      let pace = '', fc = '';
      if (opt.display === 'fixed' && opt.fixed) pace = opt.fixed;
      else if ((lv === 'mesure' || lv === 'estime') && v) { let lo = spk(v * it.vhi / 100), hi = spk(v * it.vlo / 100); if (lv === 'estime') { lo -= 8; hi += 8; } pace = (lv === 'estime' ? '≈ ' : '') + fmtP(lo) + '–' + fmtP(hi) + ' /km'; }
      if (fm && lv !== 'ressenti') fc = 'Z' + it.z + ' · ' + Math.round(fm * it.flo / 100) + '–' + Math.round(fm * it.fhi / 100) + ' bpm';
      else if (lv === 'fc' || (lv === 'ressenti' && fm && opt.display !== 'feel')) fc = 'Z' + it.z;
      return { name: it.name, color: it.color, level: lv, pace, fc, feel, txt: [pace, fc, feel].filter(Boolean).join(' · ') };
    },
    // Distance estimée d'une étape en temps (sec) → km, si VMA connue
    kmFor(name, sec, p) { const it = M.int(name), v = M.vma(p || M.profile()); if (!it || !v) return 0; return sec / spk(v * (it.vlo + it.vhi) / 200); },
    texts() { return { ...TXT0, ...(read(KT) || {}) }; },
    txt(k) { return M.texts()[k]; },
    setText(k, v) { write(KT, { ...(read(KT) || {}), [k]: v }); emit(); },
    resetTexts() { write(KT, null); emit(); },
    TXT_KEYS: Object.keys(TXT0),
    fmtP, r1
  };
  window.TCMVRUN = M;
})();
