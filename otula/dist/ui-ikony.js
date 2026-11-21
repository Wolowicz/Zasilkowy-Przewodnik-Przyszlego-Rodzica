'use strict';
/* Własne, zaokrąglone ikony i kolory spraw (Biblioteka, Plan, Start). Ładowany po icons.js i catalog.js. */
Object.assign(iconPaths, {
  baby: '<circle cx="12" cy="9" r="5.5"/><path d="M9.6 9.4h.01M14.4 9.4h.01M10.2 11.6c.9.8 2.7.8 3.6 0M12 3.5c.8-1 2-1.3 3-.8M5.5 21c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5"/>',
  passport: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><circle cx="12" cy="10" r="3.2"/><path d="M8.5 17h7"/>',
  idcard: '<rect x="2.5" y="5" width="19" height="14" rx="3.5"/><circle cx="8.5" cy="10.8" r="2"/><path d="M5.5 16c.6-1.6 2-2.2 3-2.2s2.4.6 3 2.2M14 10h4.5M14 13.5h3"/>',
  medical: '<rect x="3" y="3" width="18" height="18" rx="6"/><path d="M12 7.5v9M7.5 12h9"/>',
  heartbeat: '<path d="M2.5 12.5h4l2-5.5 4 11 2.5-7.5 1.4 2H21.5"/>',
  doccheck: '<path d="M6.5 2.5h7.5l5 5.2V19a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4 19V5a2.5 2.5 0 0 1 2.5-2.5Z"/><path d="m8.6 14.2 2.4 2.4 4.4-4.9"/>',
  family: '<circle cx="8" cy="7.5" r="3"/><circle cx="16.8" cy="9.2" r="2.3"/><path d="M2.5 20c.4-3.7 2.7-5.6 5.5-5.6s5.1 1.9 5.5 5.6M14.8 14.8c2.8-.6 5.5.8 6.4 4.4"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="3"/><path d="M3 9h18M12 9v11.5M12 9C10.5 5 7 4.5 7 6.5S9.5 9 12 9Zm0 0c1.5-4 5-4.5 5-2.5S14.5 9 12 9Z"/>',
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3.2 3 3.2 16.5 0 19M12 2.5c-3.2 3-3.2 16.5 0 19"/>',
  clinic: '<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5"/><path d="M12 12.2v4M10 14.2h4"/>',
  coin: '<circle cx="12" cy="12" r="9.5"/><path d="M15 9.2a3.4 3.4 0 1 0 0 5.6M8 11h5.5M8 13.2h5.5"/>'
});
(function () {
  const map = {
    'chorobowe': ['heartbeat', 'sky'], 'becikowe-przygotowanie': ['gift', 'gold'], 'profil': ['key', 'lilac'], 'praca-ciaza': ['briefcase', 'sage'],
    'urodzenie': ['baby', 'rose'], 'ubezpieczenie-dziecka': ['shield', 'sky'], 'macierzynski': ['coin', 'peach'], 'urlop-ojcowski': ['calendar', 'sage'],
    'urlop-rodzicielski': ['sun', 'sage'], '800-plus': ['coin', 'gold'], 'rodzicielskie': ['heart', 'rose'], 'becikowe': ['gift', 'peach'],
    'paszport-dziecka': ['passport', 'sky'], 'dowod-dziecka': ['idcard', 'lilac'], 'odpis-urodzenia': ['doccheck', 'rose'], 'ekuz-rodziny': ['globe', 'sky'],
    'ikp-dziecka': ['medical', 'lilac'], 'polozna-poz': ['clinic', 'lilac'], 'lekarz-poz-dziecka': ['medical', 'sky'], 'uznanie-ojcostwa': ['family', 'rose'],
    'karta-duzej-rodziny': ['family', 'sage']
  };
  for (const c of GUIDE.cases) if (map[c.id]) [c.icon, c.color] = map[c.id];
})();
