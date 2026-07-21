/* ═══════════════════════════════════════
   Life OS — Shared React Components (htm)
   ═══════════════════════════════════════ */

var html = htm.bind(React.createElement);

/* ───────── SVG Icons (return htm templates) ───────── */
var Icons = {
  dashboard: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  habits: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  tasks: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  nutrition: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  budget: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  goals: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  vacation: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.2 3 .8.5-1.6 1.6-.8-.5-2.5-1.5c-.4-.2-.9-.1-1.1.3l-.2.4c-.2.4-.1.9.3 1.1l3 1.8c.4.2.5.7.3 1.1"/></svg>`,
  quests: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  trylist: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  journal: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  reading: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
  mood: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  vision: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  rewards: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  settings: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  plus: html`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
  check: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  flame: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
  star: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  water: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
  clock: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  calendar: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  award: html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  close: html`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  edit: html`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  menu: html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
};

/* ───────── Modal ───────── */
function Modal(props) {
  if (props.open === false) return null;
  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick=${props.onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className=${"relative glass rounded-2xl p-6 animate-in max-h-[85vh] overflow-y-auto " + (props.wide ? 'w-full max-w-2xl' : 'w-full max-w-md')} onClick=${function(e){e.stopPropagation();}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">${props.title}</h3>
          <button onClick=${props.onClose} className="text-gray-400 hover:text-white transition">${Icons.close}</button>
        </div>
        ${props.children}
      </div>
    </div>
  `;
}

/* ───────── Input ───────── */
function Input(props) {
  return html`
    <label className="block mb-3">
      ${props.label && html`<span className="text-xs font-medium text-gray-400 mb-1 block">${props.label}</span>`}
      <input type=${props.type || 'text'} value=${props.value} onChange=${function(e){props.onChange(e.target.value);}} placeholder=${props.placeholder || ''} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition" />
    </label>
  `;
}

/* ───────── Select ───────── */
function Select(props) {
  return html`
    <label className="block mb-3">
      <span className="text-xs font-medium text-gray-400 mb-1 block">${props.label}</span>
      <select value=${props.value} onChange=${function(e){props.onChange(e.target.value);}} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition">
        ${props.options.map(function(o){ return html`<option key=${o.value} value=${o.value}>${o.label}</option>`; })}
      </select>
    </label>
  `;
}

/* ───────── Textarea ───────── */
function Textarea(props) {
  return html`
    <label className="block mb-3">
      ${props.label && html`<span className="text-xs font-medium text-gray-400 mb-1 block">${props.label}</span>`}
      <textarea value=${props.value} onChange=${function(e){props.onChange(e.target.value);}} placeholder=${props.placeholder || ''} rows=${props.rows || 3} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition resize-none" />
    </label>
  `;
}

/* ───────── Button ───────── */
function Btn(props) {
  var color = props.color || 'accent';
  var colors = {
    accent: 'bg-accent hover:bg-accent-dark text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    amber: 'bg-amber-500 hover:bg-amber-600 text-dark-900',
    rose: 'bg-rose-500 hover:bg-rose-600 text-white',
    ghost: 'bg-dark-700 hover:bg-dark-600 text-gray-300',
  };
  var sizeClass = props.small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  return html`
    <button type=${props.type || 'button'} onClick=${props.onClick} className=${"rounded-lg font-medium transition active:scale-95 inline-flex items-center gap-1.5 " + sizeClass + " " + (colors[color] || colors.accent) + " " + (props.className || '')}>
      ${props.children}
    </button>
  `;
}

/* ───────── Progress Ring ───────── */
function ProgressRing(props) {
  var progress = props.progress || 0;
  var size = props.size || 80;
  var stroke = props.stroke || 6;
  var color = props.color || '#818cf8';
  var r = (size - stroke) / 2;
  var circ = 2 * Math.PI * r;
  var offset = circ - (Math.min(progress, 100) / 100) * circ;
  return html`
    <svg width=${size} height=${size} className="transform -rotate-90">
      <circle cx=${size/2} cy=${size/2} r=${r} fill="none" stroke="#1e293b" strokeWidth=${stroke} />
      <circle cx=${size/2} cy=${size/2} r=${r} fill="none" stroke=${color} strokeWidth=${stroke} strokeDasharray=${circ} strokeDashoffset=${offset} strokeLinecap="round" className="progress-ring" />
    </svg>
  `;
}

/* ───────── Toast ───────── */
function Toast(props) {
  React.useEffect(function() {
    var t = setTimeout(props.onClose, 3000);
    return function() { clearTimeout(t); };
  }, []);
  return html`
    <div className="fixed top-4 right-4 z-[100] glass rounded-xl px-4 py-3 animate-in flex items-center gap-3 glow">
      <span className="text-2xl">🎉</span>
      <span className="text-sm font-medium text-white">${props.message}</span>
    </div>
  `;
}

/* ───────── Sidebar Component ───────── */
function Sidebar(props) {
  var currentPage = props.currentPage;
  var data = props.data;
  var navigate = props.navigate;
  var sidebarOpen = props.sidebarOpen;
  var setSidebarOpen = props.setSidebarOpen;

  return html`
    <aside className=${"sidebar glass border-r border-dark-600 flex flex-col " + (sidebarOpen ? 'open' : '')}>
      <div className="p-4 border-b border-dark-600">
        <h1 className="text-lg font-bold text-accent flex items-center gap-2">
          <span className="text-xl">⚡</span> Life OS
        </h1>
        <p className="text-[10px] text-gray-500 mt-0.5">Your Life, Planned</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        ${NAV_ITEMS.map(function(n) {
          var isActive = currentPage === n.id;
          return html`
            <button key=${n.id} onClick=${function(){navigate(n.id); setSidebarOpen(false);}} className=${"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 " + (isActive ? 'bg-accent/15 text-accent' : 'text-gray-400 hover:text-white hover:bg-dark-700')}>
              <span className="flex-shrink-0">${Icons[n.iconKey]}</span>
              <span className="truncate">${n.label}</span>
              ${n.id === 'rewards' && data.rewards && data.rewards.points > 0 ? html`<span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">${data.rewards.points}</span>` : null}
            </button>
          `;
        })}
      </nav>
      <div className="p-3 border-t border-dark-600">
        <p className="text-[10px] text-gray-600 text-center">Life OS v1.0</p>
      </div>
    </aside>
  `;
}

/* ───────── App Layout (wraps sidebar + page) ───────── */
function AppLayout(props) {
  var currentPage = props.currentPage;
  var data = props.data;
  var pageContent = props.pageContent;
  var toast = props.toast;
  var setToast = props.setToast;

  var _open = React.useState(false);
  var sidebarOpen = _open[0];
  var setSidebarOpen = _open[1];

  var navigate = function(pageId) {
    window.location.href = pageId === 'dashboard' ? 'index.html' : pageId + '.html';
  };

  return html`
    <div className="flex h-screen bg-dark-900 text-white overflow-hidden">
      ${toast ? html`<${Toast} message=${toast} onClose=${function(){setToast(null);}} />` : null}
      <div className="mobile-header glass px-4 py-3 items-center justify-between">
        <button onClick=${function(){setSidebarOpen(!sidebarOpen);}} className="text-gray-300 hover:text-white">${Icons.menu}</button>
        <span className="font-bold text-accent">Life OS</span>
        <span className="text-xs text-gray-400">${(data.rewards && data.rewards.points || 0) + ' pts'}</span>
      </div>
      ${sidebarOpen ? html`<div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick=${function(){setSidebarOpen(false);}} />` : null}
      <${Sidebar} currentPage=${currentPage} data=${data} navigate=${navigate} sidebarOpen=${sidebarOpen} setSidebarOpen=${setSidebarOpen} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 main-content">
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          ${pageContent}
        </div>
      </main>
    </div>
  `;
}
