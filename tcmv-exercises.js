// Exercices TCMV — résolution unique d'un exercice, partagée par la séance client, Profil › Records et l'Espace Coach.
// Une ligne de séance ou un record pointe vers UN exercice de la bibliothèque coach :
//   1) par id (exId) quand il correspond bien au nom · 2) nom actuel / EN / FR / alias · 3) anciens noms (exercice renommé) · 4) exercices archivés (supprimés).
// L'étoile ★ Records (exercises.pr) est toujours lue ici, en direct : jamais recopiée sur les lignes.
// Démo : localStorage 'tcmv.coach.lib.v1' (+ 'tcmv.coach.lib.gone'). Lovable : table exercises (id, name, name_en, aliases[], prev_names[], pr, archived_at).
(function () {
  if (window.TCMVEX) return;
  const N = v => String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // Anciens noms génériques encore présents dans d'anciennes données → nom de la bibliothèque
  const XA = { 'squat': 'Back squat', 'bench': 'Développé couché', 'bench press': 'Développé couché', 'deadlift': 'Soulevé de terre', 'power clean': 'Épaulé debout', 'squat clean': 'Épaulé', 'clean': 'Épaulé', 'strict press': 'Développé militaire', 'snatch': 'Arraché' };
  // Utilisé seulement si la bibliothèque coach n'a encore jamais été chargée sur l'appareil
  const BASE_STAR = ['Back squat', 'Développé couché', 'Soulevé de terre', 'Développé militaire', 'Tractions lestées', 'Hip thrust'];
  let LIB = null, T = 0;
  const lib = () => { if (!LIB || Date.now() - T > 3000) { let L = null, G = []; try { L = JSON.parse(localStorage.getItem('tcmv.coach.lib.v1') || 'null'); G = JSON.parse(localStorage.getItem('tcmv.coach.lib.gone') || '[]') || []; } catch (e) {} LIB = Array.isArray(L) ? L.concat(G.map(x => ({ ...x, archived: true }))) : null; T = Date.now(); } return LIB; };
  const row = name => { const k = N(name), L = window.TCMV_EX_COACH || []; return L.find(x => N(x[0]) === k) || L.find(x => N(x[1]) === k) || null; };
  const canon = name => { const r = row(name); return r ? r[0] : XA[N(name)] || name; };
  const names = x => [x.name, x.en, x.fr, ...(x.prevNames || []), ...String(x.alias || '').split(',')].filter(v => v && String(v).trim());
  const item = (name, exId) => { const L = lib(); if (!L) return null; const r = row(canon(name)), ks = [N(name), N(canon(name)), r ? N(r[1]) : ''].filter(Boolean), hit = x => names(x).some(v => ks.includes(N(v)));
    if (exId != null) { const x = L.find(y => y.id === exId); if (x && hit(x)) return x; }
    return L.find(x => !x.archived && hit(x)) || L.find(hit) || null; };
  const E = window.TCMVEX = {
    N, canon, item, lib,
    loaded: () => !!lib(),
    // ★ : true / false si l'exercice est connu, null sinon
    star: (name, exId) => { const x = item(name, exId); return x ? !!x.pr : null; },
    // ★ avec repli sur la liste de base (bibliothèque jamais chargée)
    isStar: (name, exId) => { const s = E.star(name, exId); return s != null ? s : BASE_STAR.includes(canon(name)); },
    // Toutes les écritures d'un exercice (pour relier séries, records et séances)
    keys: (name, extra) => { const c = canon(name), r = row(c), x = item(name); return [...new Set([name, c, r && r[1], ...(x ? names(x) : []), ...(extra || [])].filter(Boolean).map(N))]; },
    slug: v => N(v).replace(/ /g, '-')
  };
})();
