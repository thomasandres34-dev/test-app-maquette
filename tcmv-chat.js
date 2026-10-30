// Chat coach ↔ client — partagé entre App Plateforme (client) et Espace Coach (coach).
// Démo : localStorage 'tcmv.chat.v1' + événements. Lovable : table messages (client_id, from, kind, text, media_url, duration, reply_to, reaction_client, reaction_coach, read_at, created_at).
(function () {
  if (window.TCMVChat) return;
  const K = 'tcmv.chat.v1', subs = new Set();
  const seed = () => { const y = new Date(); y.setDate(y.getDate() - 1); y.setHours(18, 4, 0, 0); const t = y.getTime();
    return { 'Julien Risterucci': [
      { id: 'j1', from: 'coach', kind: 'text', t: 'Salut, j’ai regardé ta semaine. On garde le volume, on monte un peu le squat.', ts: t, read: true },
      { id: 'j2', from: 'client', kind: 'text', t: 'Top, je me sentais bien sur le dernier bloc.', ts: t + 3 * 6e4, read: true },
      { id: 'j3', from: 'coach', kind: 'text', t: 'Parfait. Appel jeudi 14h pour faire le point.', ts: t + 46 * 6e4, read: true },
      { id: 'j4', from: 'client', kind: 'text', t: 'Petite douleur au genou droit sur les fentes hier, rien de grave mais je préfère te le dire.', ts: Date.now() - 50 * 6e4, read: false }] }; };
  let D; try { D = JSON.parse(localStorage.getItem(K) || 'null'); } catch (x) {} if (!D) { D = seed(); try { localStorage.setItem(K, JSON.stringify(D)); } catch (x) {} }
  const save = () => { try { localStorage.setItem(K, JSON.stringify(D)); } catch (x) {} subs.forEach(f => { try { f(); } catch (x) {} }); };
  window.addEventListener('storage', e => { if (e.key === K) { try { D = JSON.parse(e.newValue || '{}') || {}; } catch (x) {} subs.forEach(f => f()); } });
  const toData = (u, img) => new Promise(res => { fetch(u).then(r => r.blob()).then(b => { if (!img) { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(u); fr.readAsDataURL(b); return; }
    const im = new Image(); im.onload = () => { const m = 900, sc = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.8)); }; im.onerror = () => res(u); im.src = URL.createObjectURL(b); }).catch(() => res(u)); });
  const C = {
    list(n) { return (D[n] || []).slice(); },
    threads() { return Object.keys(D); },
    send(n, m) { const msg = { id: Math.random().toString(36).slice(2, 9), ts: Date.now(), read: false, ...m }; D[n] = [...(D[n] || []), msg]; save();
      ['src', 'url'].forEach(k => { if (msg[k] && /^blob:/.test(msg[k])) toData(msg[k], msg.kind === 'img').then(v => { const L = D[n] || [], x = L.find(y => y.id === msg.id); if (x) { x[k] = v; save(); } }); });
      return msg; },
    react(n, id, side, e) { const x = (D[n] || []).find(y => y.id === id); if (!x) return; const k = side === 'coach' ? 'rk' : 'rc'; x[k] = x[k] === e ? null : e; save(); },
    edit(n, id, t) { const x = (D[n] || []).find(y => y.id === id); if (x) { x.t = t; x.edited = true; save(); } },
    remove(n, id) { D[n] = (D[n] || []).filter(y => y.id !== id); save(); },
    markRead(n, reader) { let ch = false; (D[n] || []).forEach(x => { if (x.from !== reader && !x.read) { x.read = true; ch = true; } }); if (ch) save(); },
    unread(n, reader) { return (D[n] || []).filter(x => x.from !== reader && !x.read).length; },
    last(n) { const L = D[n] || []; return L[L.length - 1] || null; },
    on(f) { subs.add(f); return () => subs.delete(f); }
  };
  window.TCMVChat = C;
})();
