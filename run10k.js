// Moteur running TCMV — calculs partagés client (App Plateforme / Run 10 km) et coach (Coach Running).
// Démo : stockage localStorage. Lovable : cfg = tables coach, ath = enrollment + pace_refs + session_feedback + adapt_events.
(function () {
  const KC = 'tcmv.run10k.cfg.v3', KA = 'tcmv.run10k.ath.v3.';
  const subs = new Set(), clone = (o) => JSON.parse(JSON.stringify(o));
  const read = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let CFG = null; const ATH = {};
  const emit = () => subs.forEach(f => { try { f(); } catch (e) {} });
  window.addEventListener('storage', (e) => { if (!e.key || e.key.indexOf('tcmv.run10k') !== 0) return; CFG = null; Object.keys(ATH).forEach(k => delete ATH[k]); emit(); });

  const TODAY = '2026-10-08';
  const D = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const iso = (dt) => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  const add = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
  const diff = (a, b) => Math.round((D(a) - D(b)) / 864e5);
  const wdOf = (s) => (D(s).getDay() + 6) % 7;
  const WD = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'], WF = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const fmtDate = (s, long) => { const d = D(s); return (long ? WF : WD)[wdOf(s)] + ' ' + d.getDate() + ' ' + MO[d.getMonth()]; };

  const pad = (n) => String(n).padStart(2, '0');
  const fmtTime = (sec) => { sec = Math.round(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s); };
  const fmtPace = (spk) => { spk = Math.round(spk); return Math.floor(spk / 60) + ':' + pad(spk % 60); };
  const parseTime = (t) => { const p = String(t || '').trim().split(/[:'’h\s]+/).filter(Boolean).map(Number); if (!p.length || p.some(isNaN)) return 0; return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0] * 60; };
  const kmh = (spk) => 3600 / spk, spkOf = (v) => 3600 / v;
  const r1 = (x) => Math.round(x * 10) / 10;

  const R = {
    TODAY, D, iso, add, diff, wdOf, fmtDate, fmtTime, fmtPace, parseTime, WD, WF,
    on(f) { subs.add(f); return () => subs.delete(f); },
    cfg() { if (!CFG) { const s = read(KC); CFG = s && s.version === window.RUN10K_DEFAULT.version ? s : clone(window.RUN10K_DEFAULT); const P0 = window.RUN10K_DEFAULT.program; CFG.program.cover = CFG.program.cover || P0.cover; CFG.program.sessImg = CFG.program.sessImg || P0.sessImg; } return CFG; },
    saveCfg(c) { CFG = c; write(KC, c); emit(); },
    resetCfg() { CFG = clone(window.RUN10K_DEFAULT); write(KC, null); emit(); },
    ath(pid) { if (!(pid in ATH)) { const s = read(KA + pid); ATH[pid] = s || (pid === 'demo' ? R.demoAth() : null); } return ATH[pid]; },
    saveAth(pid, a) { ATH[pid] = a; write(KA + pid, a); emit(); },
    resetAth(pid) { delete ATH[pid]; write(KA + pid, null); emit(); },

    // data: URL → blob: URL (pas de « ; », utilisable dans un style background-image)
    blob(u) { if (!u || u.indexOf('data:') !== 0) return u; const C = R._bc || (R._bc = {}); if (C[u]) return C[u]; try { const [h, b64] = u.split(','), mime = h.slice(5).split(';')[0], bin = atob(b64), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); C[u] = URL.createObjectURL(new Blob([arr], { type: mime })); } catch (x) { C[u] = u; } return C[u]; },
    img(v, fb) { const o = typeof v === 'string' ? { src: v } : (v || {}); const src = R.blob(o.src || (typeof fb === 'string' ? fb : (fb && fb.src)) || ''); const f = o.src ? o : (typeof fb === 'object' && fb) || {}; return { src, pos: (f.x ?? 50) + '% ' + (f.y ?? 50) + '%', z: f.z || 1 }; },
    level(c, id) { return c.levels.find(l => l.id === id) || c.levels[2]; },
    zone(c, code) { return c.zones.find(z => z.code === code) || c.zones[1]; },
    test(c, id) { return c.tests.find(t => t.id === id) || c.tests[0]; },
    vmaFromTest(c, testId, val) { const t = R.test(c, testId); if (!val) return 0; const v = t.kind === 'time' ? (val / 1000) / (t.dur / 3600) : (t.dist / 1000) / (val / 3600); return r1(v / t.factor); },
    vma(a) { const ref = (a.refs || [])[a.refs.length - 1]; return ref ? r1(ref.vma * (1 + (a.adj || 0) / 100)) : 12; },
    est10k(v) { return 10000 / (v * 0.89 / 3.6); },
    curWeek(a) { const n = Math.floor(diff(TODAY, a.start) / 7) + 1; return Math.max(0, Math.min(13, n)); },
    feas(c, levelId, v, goal) {
      const L = R.level(c, levelId), est = R.est10k(v), max = L.maxGain;
      if (!goal || !max) return { est, status: 'finish', proposed: 0, gain: 0 };
      const gain = (est - goal) / est * 100, proposed = Math.round(est * (1 - max / 100) / 15) * 15;
      const status = gain <= 0 ? 'deja' : gain <= max ? 'realiste' : gain <= max * 1.6 ? 'ambitieux' : 'infaisable';
      return { est, gain, status, proposed, max };
    },
    suggestLevel(c, ans, v) {
      const cont = ans.cont ?? 2, exp = ans.exp ?? 2;
      if (cont <= 1 || exp === 0 && cont < 2) return 'dec';
      const est = v ? R.est10k(v) : 0;
      if (est && est < 2700 && (ans.freq ?? 0) >= 2) return 'av';
      if (est && est <= 3600) return 'int';
      if (!est && exp >= 3 && (ans.freq ?? 0) >= 2) return 'int';
      return 'deb';
    },
    as10(c, a, week) {
      const v = R.vma(a), base = spkOf(v * 0.89);
      const g = a.goal || {}; if (week < 9 || g.type !== 'time') return base;
      const tgt = g.use === 'proposed' && g.proposed ? g.proposed : g.time; if (!tgt) return base;
      return Math.min(base, tgt / 10);
    },
    paceFor(c, a, code, week) {
      const z = R.zone(c, code), v = R.vma(a);
      if (z.goal) { const p = R.as10(c, a, week || R.curWeek(a)); return { lo: p, hi: p, txt: fmtPace(p) }; }
      if (!z.min) return { lo: 0, hi: 0, txt: 'à fond' };
      const lo = spkOf(v * z.max / 100), hi = spkOf(v * z.min / 100);
      return { lo, hi, txt: Math.abs(lo - hi) < 3 ? fmtPace(lo) : fmtPace(lo) + '–' + fmtPace(hi) };
    },
    // Profil allures partagé (table pace_profiles, 1 row / athlète) : réutilisé par 10 km, Hybrid Fondation, Hybrid Performance, Hyrox.
    // Source : saisie (test 3/5/10 km ou temps récent) sinon dernière référence du programme 10 km (rien à refaire).
    profile() { const s = read('tcmv.run10k.pace.v1'); if (s && s.vma) return s; const a = R.ath('demo'); if (a && a.refs && a.refs.length) { const ref = a.refs[a.refs.length - 1]; return { vma: R.vma(a), label: ref.label, date: ref.date, src: 'Programme 10 km' }; } return null; },
    setProfile(distM, sec, src) { const f = distM >= 10000 ? 0.89 : distM >= 5000 ? 0.95 : 0.98, vma = r1((distM / 1000) / (sec / 3600) / f); const p = { vma, label: (distM / 1000).toString().replace('.', ',') + ' km · ' + fmtTime(sec), date: TODAY, src: src || 'Saisie athlète' }; write('tcmv.run10k.pace.v1', p); emit(); return p; },
    clearProfile() { write('tcmv.run10k.pace.v1', null); emit(); },
    // Règle ressenti séances running hybrides (adapt_events) : « trop dur » → prochaine course −X % · gêne → prochaine course en endurance. % réglé par programme (Espace Coach).
    hybFlag(mode, pct) { write('tcmv.run10k.hyb.v1', mode ? { mode, pct: pct || 20, date: TODAY } : null); emit(); },
    hybPending() { return read('tcmv.run10k.hyb.v1'); },
    hybConsume() { write('tcmv.run10k.hyb.v1', null); emit(); },
    ZONE_NAMES: { 'Récup trot': 'TROT', 'Endurance': 'EF', 'Seuil': 'SEUIL', 'Allure 10 km': 'AS10', 'VMA longue': 'V95', 'VMA courte': 'VMA' },
    // Bloc « Course » d'une séance hybride : zone choisie par le coach → allure perso + repère ressenti (allure masquée si pas de profil ou option « ressenti seul »)
    zoneCue(zone, feelOnly) { const code = R.ZONE_NAMES[zone] || zone, c = R.cfg(), z = c.zones.find(x => x.code === code); if (!z) return null; const p = feelOnly ? null : R.profile();
      let pace = ''; if (p && z.min) { const v = z.goal ? p.vma * 0.89 : 0, lo = spkOf(v || p.vma * z.max / 100), hi = spkOf(v || p.vma * z.min / 100); pace = (Math.abs(lo - hi) < 3 ? fmtPace(lo) : fmtPace(lo) + '–' + fmtPace(hi)) + ' /km'; }
      return { name: z.name, pace, talk: z.talk, rpe: z.rpe }; },
    zonesTable(c, a) { return c.zones.filter(z => z.code !== 'TEST').map(z => ({ ...z, pace: R.paceFor(c, a, z.code).txt, pct: z.goal ? 'objectif' : z.min === z.max ? z.min + ' %' : z.min + '–' + z.max + ' %' })); },

    // Planning de l'athlète : semaines glissantes de 7 jours depuis la date de début, séances placées sur ses jours.
    schedule(c, a) {
      if (!a || !a.start) return [];
      const wd0 = wdOf(a.start), out = [];
      const days = (a.days || []).slice().sort((x, y) => ((x - wd0 + 7) % 7) - ((y - wd0 + 7) % 7));
      c.weeks.forEach((w, wi) => {
        const list = w.s.filter(s => (s.vis || []).includes(a.perWeek));
        const sl = list.find(s => s.slot === 'SL'), rest = list.filter(s => s !== sl);
        const slDay = days.includes(a.slDay) ? a.slDay : days[days.length - 1];
        const free = days.filter(d => d !== slDay || !sl);
        const place = [];
        rest.forEach((s, i) => { if (free[i] != null) place.push([s, free[i]]); });
        if (sl) place.push([sl, slDay]);
        place.forEach(([s, d]) => { const k = (d - wd0 + 7) % 7, idx = wi * 7 + k, id = 'w' + (wi + 1) + '-' + s.slot;
          out.push({ id, week: wi + 1, idx, date: add(a.start, idx), wd: d, def: (a.replaced || {})[id] || s, orig: s, replaced: !!(a.replaced || {})[id] }); });
      });
      return out.sort((x, y) => x.idx - y.idx);
    },
    status(a, it) { if ((a.done || {})[it.id]) return 'done'; const d = diff(it.date, TODAY); return d === 0 ? 'today' : d < 0 ? 'missed' : 'next'; },
    steps(c, a, it) {
      const L = R.level(c, a.level), def = it.def, single = def.kind === 'ef' || def.kind === 'sl';
      return def.steps.map(([label, reps, amt, unit, zone, rec]) => {
        const warm = /chauffement|retour au calme/i.test(label), z = R.zone(c, zone), p = R.paceFor(c, a, zone, it.week);
        let n = reps, q = amt;
        if (!warm && def.kind !== 'test' && reps > 1 && !/lignes droites/i.test(label)) n = Math.max(2, Math.round(reps * L.repF));
        if (!warm && unit === 'min' && (single || reps === 1) && def.kind !== 'test') q = Math.max(10, Math.round(amt * L.durF / 5) * 5);
        const one = unit === 'min' ? q * 60 : unit === 's' ? q : z.min || z.goal ? q / 1000 * (p.lo + p.hi) / 2 : q / 1000 * spkOf(R.vma(a) * 0.9);
        const dur = n * one + (n > 1 ? (n - 1) * (rec || 0) : 0);
        const amtTxt = unit === 'min' ? q + ' min' : unit === 's' ? q + ' s' : q >= 1000 ? (q / 1000).toString().replace('.', ',') + ' km' : q + ' m';
        const recTxt = rec ? 'récup ' + (rec >= 60 ? Math.floor(rec / 60) + ' min' + (rec % 60 ? ' ' + pad(rec % 60) : '') : rec + ' s') + ' trot' : '';
        return { label, reps: n, amt: q, unit, amtTxt, main: (n > 1 ? n + ' × ' : '') + amtTxt, rec: recTxt, hasRec: !!recTxt, zone, zoneName: z.name, color: z.color, ink: z.color === '#000' ? '#fff' : '#000', pace: p.txt, hasPace: !!p.lo, rpe: z.rpe, talk: z.talk, warm, dur };
      });
    },
    info(c, a, it) {
      const st = R.steps(c, a, it), dur = st.reduce((x, s) => x + s.dur, 0), rpe = Math.max(...st.filter(s => !s.warm).map(s => s.rpe), 3);
      const key = st.filter(s => !s.warm)[0] || st[0];
      return { steps: st, durMin: Math.round(dur / 60), rpe, key, summary: st.filter(s => !s.warm && !/lignes droites/i.test(s.label)).map(s => s.main + ' ' + s.zoneName.toLowerCase()).join(' + ') };
    },
    daySessions(c, a, idx) { return R.schedule(c, a).filter(it => it.idx === idx); },
    next(c, a) { const L = R.schedule(c, a); return L.find(it => R.status(a, it) === 'today') || L.find(it => R.status(a, it) === 'next') || null; },
    counts(c, a) { const L = R.schedule(c, a); return { total: L.length, done: L.filter(it => (a.done || {})[it.id]).length }; },

    newAth(ans, opts) {
      const c = R.cfg(); let v0 = 0, ref = null;
      if (ans.chronoDist && ans.chronoTime) { const tid = ans.chronoDist === 10000 ? 't10k' : 't5k'; v0 = R.vmaFromTest(c, tid, ans.chronoTime); ref = { src: 'questionnaire', label: (ans.chronoDist === 10000 ? '10 km' : '5 km') + ' déclaré · ' + fmtTime(ans.chronoTime), vma: v0, date: TODAY }; }
      const level = opts.level || R.suggestLevel(c, ans, v0), L = R.level(c, level);
      if (!ref) ref = { src: 'niveau', label: 'Estimation niveau ' + L.name, vma: L.vma0, date: TODAY };
      const per = opts.perWeek || L.sessions[L.sessions.length - 1];
      return { ans, level, perWeek: per, days: opts.days, slDay: opts.slDay, start: opts.start, refs: [ref], adj: 0, mark: 0, goal: opts.goal || { type: 'finish' }, done: {}, replaced: {}, events: [], bonus: [], pain: ans.pain || 0 };
    },
    demoAth() {
      const a = { ans: { exp: 2, cont: 2, freq: 2, pain: 0, chronoDist: 10000, chronoTime: 3300 }, level: 'int', perWeek: 4, days: [1, 3, 5, 6], slDay: 6, start: '2026-09-28',
        refs: [{ src: 'questionnaire', label: '10 km déclaré · 55:00', vma: 12.3, date: '2026-09-27' }, { src: 'test', label: 'Test 5 km · 25:00', vma: 12.6, date: '2026-09-29', week: 1 }],
        adj: 0, mark: 0, goal: { type: 'time', time: 3060, status: 'realiste', use: 'goal' }, replaced: {}, events: [], bonus: [{ id: 'mob', date: '2026-10-04' }],
        done: { 'w1-Q1': { date: '2026-09-29', fb: { rpe: 9, fun: 4, feel: 'ok', after: 'good' }, result: 1500 }, 'w1-EF': { date: '2026-10-01', fb: { rpe: 3, fun: 4, feel: 'ok', after: 'good' } }, 'w1-Q2': { date: '2026-10-03', fb: { rpe: 7, fun: 5, feel: 'ok', after: 'tired' } }, 'w1-SL': { date: '2026-10-04', fb: { rpe: 4, fun: 4, feel: 'ok', after: 'good' } }, 'w2-Q1': { date: '2026-10-06', fb: { rpe: 8, fun: 4, feel: 'hard', after: 'tired' } } } };
      return a;
    },

    // Retour après séance → règles d'adaptation (cfg.rules)
    feedback(c, a, it, fb) {
      a = clone(a); fb = { ...fb, target: fb.target || R.info(c, a, it).rpe }; a.done[it.id] = { ...(a.done[it.id] || {}), date: TODAY, fb }; const evs = [], rule = (id) => c.rules.find(r => r.id === id && r.on);
      const qual = R.schedule(c, a).filter(x => a.done[x.id] && (x.def.kind === 'qual' || x.def.kind === 'test')).slice(a.mark || 0);
      const gap = c.rpeGap ?? 2;
      // Ressenti d'une séance qualité : réponse « allures » OU effort ressenti vs effort cible (± écart réglable)
      const cls = (f) => { if (!f) return ''; if (f.feel === 'hard' || f.feel === 'fail' || (f.rpe && f.target && f.rpe >= f.target + gap)) return 'hard'; if (f.feel === 'easy' || (f.rpe && f.target && f.rpe <= f.target - gap)) return 'easy'; return 'ok'; };
      const last2 = qual.slice(-2).map(x => cls(a.done[x.id].fb));
      const cap = c.capVma || 4;
      const vmaRule = (r) => { const before = R.vma(a); a.adj = Math.max(-cap, Math.min(cap, (a.adj || 0) + r.value)); a.mark = (a.mark || 0) + qual.length; if (R.vma(a) !== before) evs.push({ rule: r.id, title: r.title, msg: r.msg, from: 'VMA ' + String(before).replace('.', ',') + ' km/h', to: 'VMA ' + String(R.vma(a)).replace('.', ',') + ' km/h' }); };
      if (last2.length === 2 && last2.every(f => f === 'hard') && rule('hard')) vmaRule(rule('hard'));
      else if (last2.length === 2 && last2.every(f => f === 'easy') && rule('easy')) vmaRule(rule('easy'));
      if (fb.after === 'pain' && rule('pain')) { const r = rule('pain'), nx = R.schedule(c, a).find(x => !a.done[x.id] && x.date > TODAY && x.def.kind !== 'test');
        if (nx) { a.replaced[nx.id] = { slot: nx.orig.slot, kind: 'ef', title: 'Footing très facile', vis: nx.orig.vis, steps: [['Footing', 1, r.value, 'min', 'TROT', 0]] }; evs.push({ rule: r.id, title: r.title, msg: r.msg, from: nx.orig.title, to: 'Footing très facile · ' + r.value + ' min', sid: nx.id, refusable: true }); } }
      if (fb.feel === 'fail' && it.def.steps.some(s => s[4] === 'AS10') && a.goal.type === 'time' && rule('goal')) { const r = rule('goal'); a.goal.status = 'ambitieux'; evs.push({ rule: r.id, title: r.title, msg: r.msg, goalChoice: true }); }
      a.events = (a.events || []).concat(evs.map((e, i) => ({ ...e, id: Date.now() + i, date: TODAY, seen: false })));
      return { a, evs };
    },
    applyTest(c, a, it, val) {
      a = clone(a); const tid = it.def.test || 't5k', t = R.test(c, tid), before = R.vma(a), v = R.vmaFromTest(c, tid, val);
      a.refs.push({ src: 'test', label: t.name + ' · ' + (t.kind === 'time' ? (val / 1000).toString().replace('.', ',') + ' km' : fmtTime(val)), vma: v, date: TODAY, week: it.week });
      a.adj = 0; a.mark = R.schedule(c, a).filter(x => a.done[x.id] && (x.def.kind === 'qual' || x.def.kind === 'test')).length + 1;
      a.done[it.id] = { date: TODAY, result: val };
      if (a.goal.type === 'time') { const f = R.feas(c, a.level, v, a.goal.time); a.goal.status = f.status; a.goal.proposed = f.proposed; }
      return { a, before, after: v };
    }
  };
  window.RUN10K = R;
})();
