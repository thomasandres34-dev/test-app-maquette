// Valeurs par défaut du moteur running « Objectif 10 km ». Tout est éditable dans Espace Coach → Moteur running.
// Lovable : chaque tableau = une table (run_levels, pace_zones, test_formulas, intake_questions, adapt_rules, program_weeks/program_sessions/session_steps, bundle_items).
(function () {
  const W = ['Échauffement', 1, 15, 'min', 'EF', 0], C = ['Retour au calme', 1, 10, 'min', 'EF', 0], LD = (n) => ['Lignes droites', n || 4, 80, 'm', 'V95', 45];
  const Q = (title, steps, o) => Object.assign({ slot: 'Q1', kind: 'qual', title, vis: [3, 4, 5], steps: [W].concat(steps, [C]) }, o || {});
  const Q2 = (title, steps, o) => Object.assign(Q(title, steps, o), { slot: 'Q2', vis: [4, 5] });
  const EF = (min, ld) => ({ slot: 'EF', kind: 'ef', title: 'Endurance fondamentale', vis: [3, 4, 5], steps: [['Footing', 1, min, 'min', 'EF', 0]].concat(ld ? [LD(ld)] : []) });
  const SL = (min, extra) => ({ slot: 'SL', kind: 'sl', title: 'Sortie longue', vis: [3, 4, 5], steps: [['Course continue', 1, min, 'min', 'EF', 0]].concat(extra || []) });
  const X = () => ({ slot: 'X', kind: 'ef', title: 'Footing court', vis: [5], steps: [['Footing', 1, 35, 'min', 'EF', 0], LD(6)] });
  const T5 = (title) => ({ slot: 'Q1', kind: 'test', test: 't5k', title, vis: [3, 4, 5], steps: [W, LD(3), ['Test 5 km', 1, 5000, 'm', 'TEST', 0], C] });
  const weeks = [
    { phase: 'Fondation', tag: 'Test d’entrée', s: [T5('Test 5 km'), EF(40, 4), Q2('Fartlek', [['Accélération', 8, 1, 'min', 'SEUIL', 60]]), SL(60), X()] },
    { phase: 'Fondation', tag: '', s: [Q('VMA courte · 30/30', [['30 s vite', 10, 30, 's', 'VMA', 30]]), EF(40), Q2('Seuil', [['Bloc seuil', 3, 6, 'min', 'SEUIL', 120]]), SL(65), X()] },
    { phase: 'Fondation', tag: '', s: [Q('VMA courte · 2 × 8 × 30/30', [['30 s vite', 8, 30, 's', 'VMA', 30], ['Récup entre séries', 1, 3, 'min', 'TROT', 0], ['30 s vite', 8, 30, 's', 'VMA', 30]]), EF(45), Q2('Seuil', [['Bloc seuil', 3, 8, 'min', 'SEUIL', 120]]), SL(70), X()] },
    { phase: 'Allégée', tag: '−25 %', s: [Q('VMA · 400 m', [['400 m', 6, 400, 'm', 'VMA', 75]]), EF(35), Q2('Seuil', [['Bloc seuil', 2, 8, 'min', 'SEUIL', 120]]), SL(55), X()] },
    { phase: 'Développement', tag: '', s: [Q('VMA longue · 800 m', [['800 m', 6, 800, 'm', 'V95', 90]]), EF(45), Q2('Seuil', [['Bloc seuil', 2, 12, 'min', 'SEUIL', 180]]), SL(75), X()] },
    { phase: 'Développement', tag: '', s: [Q('Côtes', [['Montée', 10, 45, 's', 'VMA', 90]]), EF(45, 4), Q2('Seuil', [['Bloc seuil', 3, 10, 'min', 'SEUIL', 120]]), SL(80), X()] },
    { phase: 'Développement', tag: '', s: [Q('VMA longue · 1000 m', [['1000 m', 5, 1000, 'm', 'V95', 120]]), EF(50), Q2('Tempo', [['Tempo continu', 1, 25, 'min', 'SEUIL', 0]]), SL(75, [['Fin à allure 10 km', 1, 10, 'min', 'AS10', 0]]), X()] },
    { phase: 'Allégée', tag: 'Test de contrôle', s: [T5('Test 5 km · contrôle'), EF(35), Q2('Footing + lignes droites', [['Footing', 1, 15, 'min', 'EF', 0], LD(6)]), SL(60), X()] },
    { phase: 'Spécifique', tag: '', s: [Q('Allure 10 km · 1000 m', [['1000 m', 6, 1000, 'm', 'AS10', 90]]), EF(45), Q2('Mixte seuil + AS10', [['Bloc seuil', 1, 15, 'min', 'SEUIL', 180], ['1000 m', 3, 1000, 'm', 'AS10', 90]]), SL(80), X()] },
    { phase: 'Spécifique', tag: '', s: [Q('Allure 10 km · 2000 m', [['2000 m', 3, 2000, 'm', 'AS10', 120]]), EF(50), Q2('Rappel VMA · 30/30', [['30 s vite', 12, 30, 's', 'VMA', 30]]), SL(65, [['Bloc allure 10 km', 2, 10, 'min', 'AS10', 180]]), X()] },
    { phase: 'Spécifique', tag: 'Séance-test', s: [Q('Séance-test · 4 × 2000 m', [['2000 m', 4, 2000, 'm', 'AS10', 120]], { isKey: true }), EF(45), Q2('Seuil', [['Bloc seuil', 2, 12, 'min', 'SEUIL', 180]]), SL(75), X()] },
    { phase: 'Affûtage', tag: 'Course', s: [Q('Rappel allure 10 km', [['1000 m', 3, 1000, 'm', 'AS10', 120]]), EF(30, 4), Q2('Activation', [['Footing', 1, 20, 'min', 'EF', 0], LD(4)]),
      { slot: 'SL', kind: 'test', test: 't10k', final: true, title: 'Test final · 10 km', vis: [3, 4, 5], steps: [['Échauffement', 1, 12, 'min', 'EF', 0], LD(3), ['10 km', 1, 10000, 'm', 'AS10', 0], C] }, X()] }
  ];
  window.RUN10K_DEFAULT = {
    version: 3,
    program: { key: 'Objectif 10 km', title: 'Objectif 10 km', by: 'Léa', price: 119, weeks: 12, cover: 'assets/running-cover.jpg', sessImg: 'assets/running-cover.jpg' },
    levels: [
      { id: 'dec', name: 'Découverte', who: 'Tu ne cours pas encore 30 min sans t’arrêter.', sessions: [3], repF: 0.6, durF: 0.6, maxGain: 0, vma0: 9, test: 't20', note: 'Alterne course et marche sur les footings si besoin.' },
      { id: 'deb', name: 'Débutant', who: '30 min en continu, 10 km en plus de 60 min ou jamais couru.', sessions: [3], repF: 0.7, durF: 0.8, maxGain: 8, vma0: 11, test: 't5k', note: '' },
      { id: 'int', name: 'Intermédiaire', who: '10 km entre 45 et 60 min.', sessions: [3, 4], repF: 1, durF: 1, maxGain: 5, vma0: 13, test: 't5k', note: '' },
      { id: 'av', name: 'Avancé', who: '10 km en moins de 45 min, 3 sorties ou plus par semaine.', sessions: [4, 5], repF: 1.25, durF: 1.15, maxGain: 3, vma0: 15.5, test: 't5k', note: '' }
    ],
    zones: [
      { code: 'TROT', name: 'Récup trot', min: 55, max: 65, rpe: 2, talk: 'Très facile, tu récupères', color: '#e6e6e6' },
      { code: 'EF', name: 'Endurance', min: 65, max: 75, rpe: 3, talk: 'Tu peux tenir une conversation', color: '#d4e4cf' },
      { code: 'SEUIL', name: 'Seuil', min: 85, max: 88, rpe: 7, talk: 'Quelques mots, pas une phrase', color: '#f0dca8' },
      { code: 'AS10', name: 'Allure 10 km', min: 89, max: 89, rpe: 8, talk: 'Dur mais tenu, pas de parole', color: '#f2b8a0', goal: true },
      { code: 'V95', name: 'VMA longue', min: 95, max: 95, rpe: 8, talk: 'Allure 5 km, respiration forte', color: '#000' },
      { code: 'VMA', name: 'VMA courte', min: 100, max: 105, rpe: 9, talk: 'Impossible de parler', color: '#000' },
      { code: 'TEST', name: 'Test', min: 0, max: 0, rpe: 9, talk: 'À fond, mais régulier du début à la fin', color: '#000' }
    ],
    tests: [
      { id: 't5k', name: 'Test 5 km', kind: 'dist', dist: 5000, factor: 0.95, help: 'Cours 5 km le plus vite possible, en restant régulier. Note ton chrono.' },
      { id: 't20', name: 'Test 20 min', kind: 'time', dur: 1200, factor: 0.85, help: 'Cours 20 min, marche si besoin. Note la distance parcourue.' },
      { id: 't10k', name: '10 km chrono', kind: 'dist', dist: 10000, factor: 0.89, help: 'Ta course ou un 10 km en solo. Note ton chrono.' }
    ],
    intake: [
      { id: 'exp', type: 'choice', label: 'Tu cours depuis…', options: ['Jamais ou reprise', 'Moins de 6 mois', '6 mois à 2 ans', 'Plus de 2 ans'] },
      { id: 'cont', type: 'choice', label: 'Combien de temps tu cours sans t’arrêter ?', options: ['Moins de 10 min', '10 à 30 min', '30 à 60 min', 'Plus d’une heure'] },
      { id: 'freq', type: 'choice', label: 'Combien de sorties par semaine en ce moment ?', options: ['Aucune', '1 à 2', '3', '4 ou plus'] },
      { id: 'chrono', type: 'chrono', label: 'Un chrono récent, de moins de 3 mois ?', help: 'Il sert à estimer tes allures avant le test de la semaine 1.', options: ['5 km', '10 km', 'Je n’en ai pas'] },
      { id: 'goal', type: 'goal', label: 'Ton objectif sur 10 km', options: ['Finir mon 10 km', 'Viser un chrono'] },
      { id: 'days', type: 'days', label: 'Quels jours tu peux courir ?', help: 'Laisse si possible un jour de repos entre deux sorties.' },
      { id: 'pain', type: 'choice', label: 'Une douleur ou une blessure récente ?', options: ['Non', 'Oui, légère gêne', 'Oui, je reprends après blessure'] }
    ],
    rules: [
      { id: 'hard', on: true, label: 'Séances trop dures', when: '2 séances qualité de suite « Trop dur » / « Pas tenues », ou effort ressenti ≥ cible + écart', action: 'vma', value: -2, title: 'On lève le pied', msg: 'Tes deux dernières séances étaient dures. Tes allures baissent légèrement pour que tu progresses sans t’épuiser.', notify: true },
      { id: 'easy', on: true, label: 'Séances trop faciles', when: '2 séances qualité de suite « Trop facile », ou effort ressenti ≤ cible − écart', action: 'vma', value: 2, title: 'Tu as de la marge', msg: 'Tes deux dernières séances étaient faciles. Tes allures montent légèrement.', notify: false },
      { id: 'pain', on: true, label: 'Douleur signalée', when: 'Retour « Douleur »', action: 'replace', value: 20, title: 'On protège ton corps', msg: 'Tu as signalé une douleur. Ta prochaine séance est remplacée par un footing très facile.', notify: true },
      { id: 'goal', on: true, label: 'Allure 10 km non tenue', when: '« Pas tenues » sur une séance allure 10 km', action: 'goal', value: 0, title: 'Ton objectif est ambitieux', msg: 'L’allure visée n’a pas tenu. Tu peux garder ton objectif ou passer à l’objectif proposé.', notify: true }
    ],
    capVma: 4,
    rpeGap: 2,
    bonus: [
      { id: 'ppg', name: 'PPG Running', sub: 'Abdos, force, explosivité', dur: 35, img: 'assets/seance-cover.jpg', ex: [['Gainage ventral', '3 × 45 s'], ['Squat sauté', '3 × 10'], ['Fente marchée', '3 × 12 / jambe'], ['Pont fessier une jambe', '3 × 10 / jambe'], ['Montées de genoux', '3 × 20 s'], ['Dead bug', '3 × 10']] },
      { id: 'mob', name: 'Stretching & mobilité', sub: 'Hanches, mollets, ischios', dur: 25, img: 'assets/pilates-cover.png', ex: [['Fente basse psoas', '2 × 45 s / côté'], ['Pigeon', '2 × 45 s / côté'], ['Étirement mollet au mur', '2 × 30 s / côté'], ['Ischios allongé', '2 × 45 s / côté'], ['Rotation thoracique', '10 / côté']] },
      { id: 'hip', name: 'Anti-blessure hanche', sub: 'Moyen fessier, rotateurs', dur: 20, img: 'assets/seance-cover-2.jpg', ex: [['Abduction allongé', '3 × 15 / côté'], ['Monster walk élastique', '3 × 12 pas'], ['Gainage latéral', '3 × 30 s / côté'], ['Clamshell', '3 × 15 / côté']] },
      { id: 'ank', name: 'Anti-blessure cheville', sub: 'Proprioception, mollets, pieds', dur: 15, img: 'assets/seance-cover.jpg', ex: [['Équilibre une jambe yeux fermés', '3 × 30 s / côté'], ['Montées sur pointes', '3 × 15'], ['Montées excentriques une jambe', '3 × 8 / côté'], ['Marche sur talons', '3 × 20 m']] },
      { id: 'knee', name: 'Anti-blessure genou', sub: 'Excentrique, contrôle du genou', dur: 20, img: 'assets/seance-cover-2.jpg', ex: [['Squat excentrique 4 s', '3 × 8'], ['Step down', '3 × 10 / côté'], ['Chaise au mur', '3 × 40 s'], ['Fente arrière contrôlée', '3 × 8 / côté']] }
    ],
    weeks
  };
})();
