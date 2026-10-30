// Vidéos vérifiées (titre + ID trouvés en source) · clé = nom FR · source entre crochets
window.TCMV_EX_VIDEO = {
  'Tractions': 'https://www.youtube.com/watch?v=aAggnpPyR6E', // [CrossFit] The Pull-up
  'Curl haltères': 'https://www.youtube.com/watch?v=l1tXK8CzxB4', // [OPEX] Dumbbell Curl
  'Curl élastique': 'https://www.youtube.com/watch?v=0hZboUNuogA', // [OPEX] Banded Bicep Curl
  'Pec deck': 'https://www.youtube.com/watch?v=X3Nj2ZPwW04', // [OPEX] Chest Fly Machine
  'Inverted row': 'https://www.youtube.com/watch?v=B90sF7dbP04', // [OPEX] Ring Row
  'Dumbbell strict press': 'https://www.youtube.com/watch?v=OM23fjJB3-0', // [OPEX] Standing Dumbbell Press
  'Landmine press': 'https://www.youtube.com/watch?v=y5RxyrjwKFk', // [OPEX] Landmine Standing Press
  'Élévations latérales poulie': 'https://www.youtube.com/watch?v=dQPTeeqgJqA', // [OPEX] Cable Lateral Raise
  'Marche latérale élastique': 'https://www.youtube.com/watch?v=pzQ2M_iY0D8', // [OPEX] Banded Lateral Walks
  'Skull crusher': 'https://www.youtube.com/watch?v=eluOhtYkm-0', // [OPEX] EZ Bar Skull Crusher
  'Crunch poulie': 'https://www.youtube.com/watch?v=2ndlUfl5JPo', // [OPEX] Kneeling Cable Crunch
  'Oiseau poulie': 'https://www.youtube.com/watch?v=qDnwFycUW0I', // [OPEX] Cable Reverse Fly
  'Soulevé de terre': 'https://www.youtube.com/watch?v=TN3DHmd1Fe8', // [OPEX] Conventional Deadlift
  'Arnold press': 'https://www.youtube.com/watch?v=hHmFzFaSn7U', // [OPEX] Standing Arnold Dumbbell Press
  'Bear crawl': 'https://www.youtube.com/watch?v=w089AXf1f_g', // [OPEX] Crawl
  'Fentes marchées': 'https://www.youtube.com/watch?v=bdbJ_aRjw-4', // [OPEX] Barbell Walking Lunge
  'Épaulé suspendu': 'https://www.youtube.com/watch?v=0u97BVlVib0', // [OPEX] Hang Clean
  'Bûcheron poulie': 'https://www.youtube.com/watch?v=KnbgKcvOG_c' // [OPEX] High to Low Cable Oblique Rotation
};
window.TCMV_EX_DB = (window.TCMV_EX_DB || []).concat([
  ['Curl haltères', 'Musculation', 'Pull', 'Biceps', 'Haltères', 'Isolation', 'reps', 'Coudes fixes le long du corps\nMonte sans balancier, descends lentement', 0],
  ['Curl élastique', 'Musculation', 'Pull', 'Biceps', 'Élastique', 'Isolation', 'reps', 'Pieds sur l’élastique\nCoudes fixes', 0],
  ['Élévations latérales poulie', 'Musculation', 'Push', 'Épaules', 'Poulie', 'Isolation', 'reps', 'Bras légèrement fléchi\nMonte à hauteur d’épaule', 0],
  ['Marche latérale élastique', 'Musculation|Stretching & Mobilité', 'Legs', 'Fessiers', 'Élastique', 'Isolation', 'reps|m', 'Genoux fléchis, élastique tendu\nPetits pas sans rapprocher les pieds', 0],
  ['Crunch poulie', 'Musculation', 'Core', 'Core', 'Poulie', 'Isolation', 'reps', 'À genoux, corde derrière la tête\nEnroule le buste, hanches fixes', 0],
  ['Bûcheron poulie', 'Musculation|Functional Training', 'Core', 'Core', 'Poulie', 'Polyarticulaire', 'reps', 'De côté à la poulie\nRotation du haut vers le bas, bras tendus', 0],
  ['Oiseau poulie', 'Musculation', 'Pull', 'Épaules, trapèzes', 'Poulie', 'Isolation', 'reps', 'Bras quasi tendus\nOuvre en serrant les omoplates', 0]
]);
window.TCMV_EX_EN = Object.assign(window.TCMV_EX_EN || {}, {
  'Curl haltères': ['Dumbbell curl', 'DB curl, biceps curl'], 'Curl élastique': ['Banded biceps curl', 'band curl'], 'Élévations latérales poulie': ['Cable lateral raise', ''],
  'Marche latérale élastique': ['Banded lateral walk', 'monster walk'], 'Crunch poulie': ['Kneeling cable crunch', ''], 'Oiseau poulie': ['Cable reverse fly', 'rear delt fly'], 'Bûcheron poulie': ['Cable woodchop', 'high to low chop']
});
