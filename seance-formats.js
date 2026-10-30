(function () {
  const U = ['reps', 's', 'min', 'm', 'km', 'cal', 'kg'];
  const FIELD = {
    name: ['Exercice', 'minmax(160px,2fr)'], sets: ['Séries', '58px'], reps: ['Reps', '58px'], qty: ['Qté', '60px'], unit: ['Unité', '80px', U],
    dur: ['Durée', '66px'], dist: ['Dist. / durée', '82px'], kg: ['Kg', '62px'], pct: ['% 1RM', '64px'], rpe: ['RPE', '54px'], rir: ['RIR', '52px'],
    tempo: ['Tempo', '68px'], rest: ['Repos (s)', '70px'], side: ['Côté', '86px', ['—', '/ côté', 'alterné']], cal: ['Cal', '56px'], note: ['Note coach', 'minmax(120px,1.2fr)'],
    repsScheme: ['Schéma reps', 'minmax(110px,1fr)'], kgScheme: ['Schéma kg / %', 'minmax(110px,1fr)'], drops: ['Drops', '58px'], dropPct: ['−% / drop', '74px'],
    mini: ['Mini-séries', '78px'], pause: ['Pause (s)', '70px'], clusters: ['Clusters', '66px'], steps: ['Paliers', 'minmax(130px,1fr)'], prog: ['Progression', 'minmax(130px,1fr)'],
    step: ['Étape', '124px', ['Échauffement', 'Gammes', 'Effort', 'Récup', 'Retour au calme']], zone: ['Zone', '116px', ['Libre', 'Z1', 'Z2', 'Seuil', 'Allure 10 km', 'Allure semi', 'VMA']],
    target: ['Cible', 'minmax(90px,1fr)'], rec: ['Récup (s)', '70px']
  };
  const TG = { valid: 'Validation série par série', load: 'Saisie de la charge', score: 'Saisie score / temps', chrono: 'Chrono intégré', restT: 'Timer de repos auto', video: 'Vidéo exercice', feel: 'Ressenti fin de bloc', last: 'Afficher la dernière fois' };
  const P = (k, l, v, u) => [k, l, v, u || ''];
  const F = (layout, cols, opt, params, tg, all, hint, app) => ({ layout, cols, opt, params, tg, all, hint, app });
  const RO = ['pct', 'rpe', 'rir', 'tempo', 'side', 'note'], RT = ['valid', 'load', 'restT', 'video', 'last', 'feel'], MT = ['chrono', 'score', 'video', 'feel', 'last'];
  const ML = ['name', 'qty', 'unit', 'kg'], MO = ['cal', 'side', 'note'];
  const RUN = (params, hint, tg) => F('steps', ['step', 'reps', 'dist', 'unit', 'zone', 'target', 'rec'], ['note'], params, tg || ['chrono', 'feel'], ['chrono', 'score', 'feel', 'last'], hint, 'Étapes guidées l’une après l’autre, chrono et bip à chaque changement.');
  const FAM = {
    warm: { label: 'Warm up', color: '#6b7c8a', fmts: {
      'Général': F('table', ['name', 'qty', 'unit'], ['rest', 'side', 'note'], [P('dur', 'Durée', '10', 'min')], ['video'], ['video', 'feel'], 'Exercices faits une fois, dans l’ordre.', 'Liste à cocher, vidéo au tap.'),
      'Spécifique': F('table', ['name', 'qty', 'unit', 'kg'], ['rest', 'side', 'note'], [P('dur', 'Durée', '8', 'min')], ['video'], ['video', 'feel'], 'Montée progressive vers le premier bloc.', 'Liste à cocher, vidéo au tap.'),
      'Circuit': F('group', ['name', 'qty', 'unit'], ['side', 'note'], [P('rounds', 'Tours', '3'), P('rest', 'Repos après le tour', '60', 's')], ['video'], ['video', 'chrono'], 'Exercices enchaînés, X tours.', 'Compteur de tours, exercice en cours en grand.')
    } },
    renfo: { label: 'Renfo', color: '#000000', fmts: {
      'Séries classiques': F('table', ['name', 'sets', 'reps', 'kg', 'rest'], RO, [P('rpe', 'RPE cible', '8')], ['valid', 'load', 'restT', 'video', 'last'], RT, 'Séries identiques, repos entre chaque série.', 'Une ligne par série à valider · charge à saisir · timer de repos lancé à chaque validation.'),
      'Pyramide': F('table', ['name', 'repsScheme', 'kgScheme', 'rest'], RO, [P('dir', 'Sens', 'Montante')], ['valid', 'load', 'restT', 'video', 'last'], RT, 'Écris le schéma série par série : 12-10-8-6 et 40-45-50-55.', 'Chaque série affiche ses propres reps et sa charge.'),
      'Drop set': F('table', ['name', 'sets', 'reps', 'kg', 'drops', 'dropPct', 'rest'], RO, [], ['valid', 'load', 'restT', 'video'], RT, 'Série à l’échec puis baisse de charge immédiate, X fois.', 'Charges de chaque drop pré-calculées, pas de repos entre drops.'),
      'Rest-pause': F('table', ['name', 'sets', 'reps', 'kg', 'mini', 'pause', 'rest'], RO, [], ['valid', 'load', 'restT', 'video'], RT, 'Série principale puis mini-séries après une courte pause.', 'Mini-timer de pause entre les mini-séries.'),
      'Cluster': F('table', ['name', 'sets', 'clusters', 'reps', 'pause', 'kg', 'rest'], RO, [], ['valid', 'load', 'restT', 'video'], RT, 'Série découpée en paquets de reps avec pause intra-série.', 'Paquets à cocher, pause intra-série chronométrée.'),
      'Tempo': F('table', ['name', 'sets', 'reps', 'tempo', 'kg', 'rest'], ['pct', 'rpe', 'side', 'note'], [], ['valid', 'load', 'restT', 'video'], RT, 'Tempo en 4 chiffres : excentrique · pause · concentrique · pause.', 'Métronome visuel du tempo pendant la série.'),
      'Superset': F('group', ['name', 'reps', 'kg', 'tempo'], RO, [P('rounds', 'Tours', '4'), P('rest', 'Repos après le tour', '90', 's')], ['valid', 'load', 'restT', 'video'], RT, 'Exercices enchaînés sans repos, repos après le dernier.', 'Tour en cours, exercices enchaînés, timer après le tour.'),
      'Triset': F('group', ['name', 'reps', 'kg', 'tempo'], RO, [P('rounds', 'Tours', '3'), P('rest', 'Repos après le tour', '120', 's')], ['valid', 'load', 'restT', 'video'], RT, '3 exercices enchaînés.', 'Tour en cours, exercices enchaînés, timer après le tour.'),
      'Giant set': F('group', ['name', 'reps', 'kg', 'tempo'], RO, [P('rounds', 'Tours', '3'), P('rest', 'Repos après le tour', '150', 's')], ['valid', 'load', 'restT', 'video'], RT, '4 exercices ou plus enchaînés.', 'Tour en cours, exercices enchaînés, timer après le tour.'),
      'Circuit': F('group', ['name', 'qty', 'unit', 'kg'], ['rest', 'side', 'note'], [P('rounds', 'Tours', '3'), P('rest', 'Repos après le tour', '90', 's')], ['restT', 'video'], RT, 'Circuit de renfo, repos entre exercices optionnel.', 'Compteur de tours, exercice en cours en grand.'),
      'Test RM': F('table', ['name', 'steps', 'kg', 'note'], [], [P('rm', 'Objectif', '1RM'), P('tries', 'Tentatives', '3'), P('rest', 'Repos entre tentatives', '180', 's')], ['load', 'video'], ['load', 'video', 'last'], 'Paliers de montée puis tentatives. Le résultat devient la référence des %.', 'Le client saisit la charge réussie : elle met à jour ses % 1RM.'),
      'Max reps': F('table', ['name', 'kg', 'note'], ['side'], [P('cap', 'Durée max', '', 'min')], ['score', 'video'], ['score', 'video', 'last'], 'Un set au maximum de répétitions.', 'Le client saisit son nombre de reps.')
    } },
    metcon: { label: 'Metcon', color: '#c8102e', fmts: {
      'EMOM': F('emom', ML, MO, [P('dur', 'Durée', '12', 'min'), P('int', 'Toutes les', '1', 'min')], ['chrono', 'score'], MT, 'Chaque intervalle, une station. Les lignes tournent.', 'Chrono qui bipe à chaque intervalle · station affichée en grand · le client coche les minutes réussies.'),
      'E2MOM': F('emom', ML, MO, [P('dur', 'Durée', '20', 'min'), P('int', 'Toutes les', '2', 'min')], ['chrono', 'score'], MT, 'Toutes les 2 minutes, une station.', 'Chrono qui bipe toutes les 2 min.'),
      'AMRAP': F('list', ML, MO, [P('dur', 'Durée', '15', 'min')], ['chrono', 'score'], MT, 'Un tour = toutes les lignes. Max de tours.', 'Compte à rebours · le client saisit tours + reps.'),
      'For time': F('list', ML, MO, [P('rounds', 'Tours', '1'), P('cap', 'Time cap', '20', 'min')], ['chrono', 'score'], MT, 'Lignes dans l’ordre, le plus vite possible.', 'Chrono montant avec splits · temps final saisi.'),
      'AFAP': F('list', ML, MO, [P('cap', 'Time cap', '15', 'min')], ['chrono', 'score'], MT, 'As fast as possible : la liste une fois.', 'Chrono montant avec splits.'),
      'Rounds for time': F('list', ML, MO, [P('rounds', 'Tours', '5'), P('cap', 'Time cap', '25', 'min')], ['chrono', 'score'], MT, 'X tours de toutes les lignes, le plus vite possible.', 'Compteur de tours + chrono.'),
      'Tabata': F('interval', ML, MO, [P('rounds', 'Rounds', '8'), P('work', 'Travail', '20', 's'), P('rest', 'Repos', '10', 's')], ['chrono', 'score'], MT, 'Alternance travail / repos, les lignes tournent.', 'Timer travail / repos plein écran.'),
      'Intervalles': F('interval', ML, MO, [P('rounds', 'Blocs', '5'), P('work', 'Travail', '240', 's'), P('rest', 'Repos', '60', 's')], ['chrono', 'score'], MT, 'Les lignes s’enchaînent dans chaque bloc de travail.', 'Timer travail / repos, score par bloc.'),
      'Chipper': F('list', ML, MO, [P('cap', 'Time cap', '35', 'min')], ['chrono', 'score'], MT, 'Longue liste à faire une fois, dans l’ordre.', 'Liste à cocher + chrono.'),
      'Death by': F('list', ML, MO, [P('start', 'Départ', '1', 'rep'), P('inc', 'Ajout / min', '1', 'rep')], ['chrono', 'score'], MT, 'Reps qui augmentent chaque minute jusqu’à l’échec.', 'Bip chaque minute, reps à faire affichées.'),
      'Ladder': F('list', ML, MO, [P('start', 'Départ', '2', 'reps'), P('inc', 'Ajout / tour', '2', 'reps'), P('cap', 'Time cap', '12', 'min')], ['chrono', 'score'], MT, 'Échelle de reps croissante.', 'Palier en cours affiché, chrono.')
    } },
    run: { label: 'Running', color: '#d8c3a5', fmts: {
      'EF': RUN([P('dur', 'Durée totale', '45', 'min')], 'Continu en zone 2, cible = FC.'),
      'Sortie longue': RUN([P('dur', 'Durée totale', '75', 'min'), P('fuel', 'Ravito', 'Toutes les 30 min')], 'Volume en zone 2.'),
      'Fractionné': RUN([P('surface', 'Terrain', 'Piste')], 'Répétitions, cible = allure, récup en trot.'),
      'Seuil': RUN([], 'Blocs à allure seuil.'),
      'VMA': RUN([P('vma', 'VMA', '17', 'km/h')], 'Cible en % VMA, récup = durée effort.'),
      'Tempo': RUN([], 'Bloc continu soutenu.'),
      'Côtes': RUN([P('slope', 'Pente', '6–8 %')], 'Montées, retour en trot.'),
      'Fartlek': RUN([P('dur', 'Durée totale', '40', 'min')], 'Changements d’allure.'),
      'Test': RUN([P('dist', 'Distance', '5', 'km')], 'Test chronométré : devient la référence des allures.', ['chrono', 'score'])
    } },
    cf: { label: 'CrossFit / Skills', color: '#13294b', fmts: {
      'Skill': F('table', ['name', 'sets', 'reps', 'note'], ['dur', 'side'], [P('dur', 'Durée', '12', 'min')], ['video'], ['video', 'feel'], 'Travail technique sans chrono.', 'Consignes + vidéo, validation simple.'),
      'Gymnastique': F('table', ['name', 'sets', 'reps', 'prog', 'note'], ['tempo', 'rest'], [], ['valid', 'video'], ['valid', 'video', 'feel', 'last'], 'Progressions : précise le niveau dans « Progression ».', 'Le client choisit sa progression puis valide.'),
      'Haltéro complex': F('table', ['name', 'sets', 'repsScheme', 'kg', 'rest'], ['pct', 'note'], [], ['valid', 'load', 'restT', 'video'], RT, 'Complexe : 1 + 1 + 2 dans « Schéma reps ».', 'Complexe affiché série par série.'),
      'Strength': F('table', ['name', 'repsScheme', 'kgScheme', 'rest'], ['pct', 'rpe', 'note'], [P('time', 'Fenêtre', '15', 'min')], ['valid', 'load', 'restT', 'last'], RT, 'Montée en charge : 5-5-3-3-1 et 70-75-80-85-90 %.', 'Charges calculées sur le 1RM du client.'),
      'Benchmark': F('list', ML, MO, [P('wod', 'Nom', 'Fran'), P('cap', 'Time cap', '10', 'min')], ['chrono', 'score', 'last'], MT, 'WOD de référence, comparé aux fois précédentes.', 'Chrono + historique du client sur ce benchmark.'),
      'WOD libre': F('text', [], [], [P('cap', 'Time cap', '', 'min')], ['score'], ['score', 'chrono', 'feel'], 'Texte libre, mis en forme tel quel.', 'Texte affiché tel quel, score optionnel.')
    } },
    mob: { label: 'Mobilité / Stretching', color: '#b56bff', fmts: {
      'Flow': F('group', ['name', 'dur', 'note'], ['side'], [P('rounds', 'Tours', '2')], ['video'], ['video', 'chrono'], 'Enchaînement fluide de positions.', 'Positions guidées avec minuteur.'),
      'Stretching statique': F('table', ['name', 'dur', 'side', 'note'], ['sets'], [], ['video', 'chrono'], ['video', 'chrono', 'feel'], 'Maintien de chaque position.', 'Minuteur par position, côté droit puis gauche.'),
      'Stretching actif': F('table', ['name', 'reps', 'side', 'note'], ['sets', 'tempo'], [], ['video'], ['video', 'feel'], 'Mouvements contrôlés en amplitude.', 'Liste à cocher, vidéo au tap.'),
      'Pilates': F('table', ['name', 'reps', 'tempo', 'note'], ['sets', 'side', 'dur'], [], ['video'], ['video', 'chrono', 'feel'], 'Séquence Pilates, focus contrôle et respiration.', 'Exercices guidés, vidéo au tap.'),
      'Respiration': F('table', ['name', 'dur', 'note'], ['reps'], [], ['chrono'], ['chrono', 'feel'], 'Exercice de respiration guidée.', 'Animation de respiration et minuteur.')
    } },
    free: { label: 'Libre', color: '#7a7a7a', fmts: {
      'Texte libre': F('text', [], [], [], [], ['score', 'chrono', 'feel'], 'Bloc texte : consignes, échauffement libre, sport…', 'Texte affiché tel quel.')
    } }
  };
  const LIB = ['Back squat', 'Front squat', 'Soulevé de terre', 'Soulevé de terre roumain', 'Hip thrust', 'Fentes marchées', 'Bulgarian split squat', 'Leg press', 'Bench Press', 'Développé incliné haltères', 'Développé militaire', 'Dumbbell strict press', 'Tractions', 'Tractions lestées', 'Rowing barre', 'Rowing haltère', 'Tirage vertical', 'Dips', 'Ring push up', 'Pompes', 'Élévations latérales', 'Skull crusher', 'Curl biceps', 'Face pull', 'Gainage', 'Hollow hold', 'Wall balls', 'Burpees', 'Box jumps', 'Thrusters', 'Kettlebell swing', 'Double unders', 'Toes to bar', 'Pull ups', 'Muscle up', 'Handstand push up', 'Power clean', 'Squat clean', 'Snatch', 'Clean & jerk', 'Row', 'SkiErg', 'Assault bike', 'Sled push', 'Farmer carry', 'Sandbag lunges', 'Course', 'Rameur', 'Rotations d’épaules', 'Cat cow', 'World’s greatest stretch', 'Pigeon', 'Ischios au sol', 'Hundred', 'Roll up', 'Respiration carrée'];
  const def = b => (FAM[b.fam] && FAM[b.fam].fmts[b.fmt]) || FAM.free.fmts['Texte libre'];
  const blank = layout => layout === 'steps' ? { step: 'Effort', reps: '1', dist: '', unit: 'm', zone: 'Libre', target: '', rec: '' } : { name: '', unit: 'reps', side: '—' };
  let uid = 1;
  const newBlock = (fam, fmt) => { const d = FAM[fam].fmts[fmt]; return { id: 'b' + (uid++) + Date.now().toString(36), fam, fmt, name: '', params: Object.fromEntries(d.params.map(p => [p[0], p[2]])), lines: d.layout === 'text' ? [] : [blank(d.layout)], text: '', extra: [], tg: d.tg.slice(), open: true }; };
  const switchFmt = (b, fam, fmt) => { const d = FAM[fam].fmts[fmt], old = def(b); const params = Object.fromEntries(d.params.map(p => [p[0], b.params[p[0]] != null && old.params.some(q => q[0] === p[0]) ? b.params[p[0]] : p[2]]));
    let lines = b.lines; if (d.layout !== 'text' && !lines.length) lines = [blank(d.layout)]; if ((d.layout === 'steps') !== (old.layout === 'steps')) lines = [blank(d.layout)];
    return { ...b, fam, fmt, params, lines, extra: b.extra.filter(k => d.opt.includes(k)), tg: d.tg.slice() }; };
  const cols = b => { const d = def(b); return d.cols.concat(d.opt.filter(k => b.extra.includes(k))); };
  const codes = blocks => { let i = 0; return blocks.map(b => b.fam === 'warm' ? 'W' : 'ABCDEFGHIJKLMNOP'[i++]); };
  const lum = hex => { const x = String(hex).replace('#', ''); if (x.length < 6) return 0; const [r, g, bb] = [0, 2, 4].map(i => parseInt(x.substr(i, 2), 16)); return (0.299 * r + 0.587 * g + 0.114 * bb) / 255; };
  const ink = hex => lum(hex) > 0.62 ? '#000' : '#fff';
  const presc = (ln, ks) => { const v = k => (ln[k] || '').toString().trim(); const o = [];
    if (v('sets') && v('reps')) o.push(v('sets') + ' × ' + v('reps')); else if (v('reps')) o.push(v('reps') + ' reps'); else if (v('sets')) o.push(v('sets') + ' séries');
    if (v('qty')) o.push(v('qty') + ' ' + (ln.unit || 'reps')); if (v('repsScheme')) o.push(v('repsScheme')); if (v('kgScheme')) o.push(v('kgScheme'));
    if (v('dist')) o.push((v('reps') && v('reps') !== '1' && ln.step ? v('reps') + ' × ' : '') + v('dist') + ' ' + (ln.unit || ''));
    if (v('dur')) o.push(v('dur') + ' s'); if (v('kg')) o.push(v('kg') + ' kg'); if (v('pct')) o.push(v('pct') + ' %'); if (v('rpe')) o.push('RPE ' + v('rpe')); if (v('tempo')) o.push('tempo ' + v('tempo'));
    if (ln.zone && ln.zone !== 'Libre') o.push(ln.zone); if (v('target')) o.push(v('target')); if (v('rec')) o.push('récup ' + v('rec') + ' s'); if (v('rest')) o.push('repos ' + v('rest') + ' s'); if (ln.side && ln.side !== '—') o.push(ln.side);
    return o.join(' · '); };
  const sum = b => { const d = def(b), p = b.params, n = d.layout === 'text' ? 0 : b.lines.length, o = [];
    if (n) o.push(n + (d.layout === 'steps' ? ' étape' : ' exo') + (n > 1 ? 's' : '')); if (p.rounds) o.push(p.rounds + ' tours'); if (p.dur) o.push(p.dur + ' min'); if (p.cap) o.push('cap ' + p.cap + ' min'); if (d.layout === 'text') o.push((b.text || '').split('\n')[0].slice(0, 40) || 'Texte vide');
    return o.join(' · '); };
  const appLines = b => { const d = def(b); if (d.layout === 'text') return (b.text || '').split('\n').filter(Boolean).slice(0, 4); return b.lines.slice(0, 5).map(ln => ((d.layout === 'steps' ? ln.step : ln.name) || '—') + (presc(ln) ? ' — ' + presc(ln) : '')); };
  window.SF = { FAM, FIELD, TG, LIB, def, newBlock, switchFmt, cols, codes, ink, presc, sum, appLines, blank };
})();
