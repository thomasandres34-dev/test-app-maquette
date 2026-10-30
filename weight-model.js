// Pesées client · table `weigh_ins` (client_id, date, kg, moment) + `weight_goals` (client_id, kg, height_cm)
(function () {
  if (window.TCMVW) return;
  const K = 'tcmv.weight.v1', subs = new Set();
  const SEED = { julien: { goal: 75, height: 180, list: [['2026-05-04', 83.1, 'Matin'], ['2026-05-25', 82.4, 'Matin'], ['2026-06-15', 81.6, 'Matin'], ['2026-07-06', 81.0, 'Matin'], ['2026-07-27', 80.7, 'Soir'], ['2026-08-17', 80.2, 'Matin'], ['2026-09-07', 79.5, 'Matin'], ['2026-09-28', 79.0, 'Matin'], ['2026-10-21', 78.4, 'Matin']] } };
  const read = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
  const write = d => { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} subs.forEach(f => f()); };
  const get = cid => { const d = read(); if (!d[cid]) { const s = SEED[cid] || { goal: 0, height: 0, list: [] }; d[cid] = { goal: s.goal, height: s.height, list: s.list.map(([date, kg, moment], i) => ({ id: 'w' + i, date, kg, moment })) }; write(d); } return d[cid]; };
  const put = (cid, fn) => { const d = read(); d[cid] = get(cid); fn(d[cid]); d[cid].list.sort((a, b) => a.date.localeCompare(b.date)); write(d); };
  window.TCMVW = {
    data: get,
    add: (cid, w) => put(cid, c => c.list.push({ id: 'w' + Date.now().toString(36), ...w })),
    set: (cid, id, p) => put(cid, c => { c.list = c.list.map(x => x.id === id ? { ...x, ...p } : x); }),
    del: (cid, id) => put(cid, c => { c.list = c.list.filter(x => x.id !== id); }),
    setGoal: (cid, kg) => put(cid, c => { c.goal = kg; }),
    setHeight: (cid, cm) => put(cid, c => { c.height = cm; }),
    subscribe: f => { subs.add(f); return () => subs.delete(f); }
  };
})();
