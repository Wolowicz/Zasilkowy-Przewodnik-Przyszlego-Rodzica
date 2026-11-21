const iconPaths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.8"/>',
  plan: '<path d="M9 5H6a2 2 0 0 0-2 2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2h-3"/><rect x="9" y="3" width="6" height="4" rx="1.5"/><path d="m8 12 1.3 1.3L12 10.7M14 12h3M8 17h9"/>',
  book: '<path d="M12 6C9 4 6 3.5 2.5 4.5v14c3.4-1 6.4-.5 9.5 1.5 3.1-2 6.1-2.5 9.5-1.5v-14C18 3.5 15 4 12 6Zm0 0v14"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  heart: '<path d="M20.4 5.6a5.2 5.2 0 0 0-7.4 0L12 6.7l-1.1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 21l8.4-8a5.2 5.2 0 0 0 0-7.4Z"/>',
  flower: '<path d="M12 7c-2-8-8-4-5 1-7-2-8 5-2 6-5 5 1 9 5 4 1 7 8 5 7-1 6 2 9-5 2-7 4-6-3-9-7-3Z"/><circle cx="12" cy="12" r="2.6"/>',
  sprout: '<path d="M12 21v-9M12 16c0-5-4-8-10-8 0 5 4 9 10 8Zm0-4c0-6 4-9 10-10 0 6-3 10-10 10Z"/>',
  leaf: '<path d="M20 3C11 2 3 7 4 14s9 8 13 2 3-13 3-13ZM4 21 15 9"/>',
  shield: '<path d="M12 2.5c3.4 2.3 6 3 9 3v6c0 5-3.7 8.2-9 10.5-5.3-2.3-9-5.5-9-10.5v-6c3 0 5.6-.7 9-3Z"/><path d="m8 12 2.7 2.7 5.5-6"/>',
  file: '<path d="M6 2.5h8l5.5 5.8V20A1.5 1.5 0 0 1 18 21.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5Z"/><path d="M14 3v6h5M8 13h8M8 17h6"/>',
  files: '<path d="M7.5 6h12v15h-12zM5 17H3.5V2.5H16V4M10.5 11h6M10.5 15h6"/>',
  key: '<circle cx="8.5" cy="8.5" r="5.5"/><path d="m12.6 12.6 8.5 8.5M16 16l3-3M18.8 18.8l2.2-2.2"/>',
  wallet: '<path d="M20.5 8h-15a2 2 0 0 1 0-4H18v4M3.5 6v12a2 2 0 0 0 2 2h15V8M20.5 12h-5v4h5"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.3c5.5 2.5 12.5 2.5 18 0M12 12v4"/>',
  right: '<path d="m9 5 7 7-7 7"/>', arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m-1-6-9 9M11 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
  check: '<path d="m4.5 12.5 5 5L20 6.5"/>', lock: '<rect x="4.5" y="10" width="15" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  person: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2.5v5M17 2.5v5M3 10h18"/>',
  drop: '<path d="M12 2.5C10.5 6 5 11.3 5 15a7 7 0 0 0 14 0c0-3.7-5.5-9-7-12.5Z"/><path d="M8.5 15a3.5 3.5 0 0 0 3.5 3.5"/>',
  moon: '<path d="M20.7 14.2A8.8 8.8 0 0 1 9.8 3.3 9 9 0 1 0 20.7 14.2Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2m0-16-2 2M6 18l-2 2"/>',
  adjust: '<path d="M4 7h6m5 0h5M4 17h10m4 0h2"/><circle cx="12.5" cy="7" r="2.5"/><circle cx="16" cy="17" r="2.5"/>',
  help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9a3 3 0 0 1 5.9.4c0 2.5-3 2.7-3 5m0 2.5h.01"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>', close:'<path d="m5 5 14 14m0-14L5 19"/>',
  search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>', copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 6V3H3v13h3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', chevron:'<path d="m6 9 6 6 6-6"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  home:'<path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  share:'<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
  chat:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5Z"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
  edit:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'
};
function icon(name, size = 20) {
  return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + (iconPaths[name] || '') + '</svg>';
}

function bloom() {
  return '<img class="bloom" src="./assets/otula-kwiat.svg" alt="" width="42" height="42">';
}
