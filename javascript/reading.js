function ReadingPage({ data, setData }) {
  var readings = data.readings || [];
  var [filter, setFilter] = React.useState('all');
  var [showModal, setShowModal] = React.useState(false);
  var [newItem, setNewItem] = React.useState({ title: '', author: '', type: 'book' });

  var filters = [
    { key: 'all', label: 'All' },
    { key: 'book', label: '\u{1F4D6} Book' },
    { key: 'article', label: '\u{1F4F0} Article' },
    { key: 'podcast', label: '\u{1F3A7} Podcast' },
    { key: 'video', label: '\u{1F3AC} Video' }
  ];

  var typeEmoji = { book: '\u{1F4D6}', article: '\u{1F4F0}', podcast: '\u{1F3A7}', video: '\u{1F3AC}' };

  var filtered = filter === 'all' ? readings : readings.filter(function(r) { return r.type === filter; });

  function addReading() {
    if (!newItem.title.trim()) return;
    var item = {
      id: uid(),
      title: newItem.title.trim(),
      author: newItem.author.trim(),
      type: newItem.type,
      progress: 0,
      notes: '',
      rating: 0,
      startedAt: today()
    };
    setData(function(prev) {
      return Object.assign({}, prev, { readings: (prev.readings || []).concat(item) });
    });
    setNewItem({ title: '', author: '', type: 'book' });
    setShowModal(false);
  }

  function deleteReading(id) {
    setData(function(prev) {
      return Object.assign({}, prev, { readings: (prev.readings || []).filter(function(r) { return r.id !== id; }) });
    });
  }

  function updateProgress(id, value) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        readings: (prev.readings || []).map(function(r) {
          if (r.id === id) return Object.assign({}, r, { progress: parseInt(value) });
          return r;
        })
      });
    });
  }

  return html`
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-accent">${Icons.reading}</span>
          <h2 className="text-xl font-bold text-white">Reading List</h2>
        </div>
        <${Btn} onClick=${function() { setShowModal(true); }} color="accent">+ Add</${Btn}>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        ${filters.map(function(f) {
          return html`
            <${Btn}
              key=${f.key}
              onClick=${function() { setFilter(f.key); }}
              color=${filter === f.key ? 'accent' : 'ghost'}
              small
            >${f.label}</${Btn}>
          `;
        })}
      </div>

      ${filtered.length === 0
        ? html`
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">\u{1F4DA}</div>
              <p className="text-gray-300 font-medium mb-1">No reading items yet.</p>
              <p className="text-gray-500 text-sm">Add a book, article, podcast, or video to start tracking.</p>
            </div>
          `
        : html`
            <div className="flex flex-col gap-3">
              ${filtered.map(function(item) {
                return html`
                  <div key=${item.id} className="glass rounded-2xl p-4 animate-in">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">${typeEmoji[item.type] || ''}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">${item.title}</div>
                          ${item.author && html`<div className="text-xs text-gray-400 truncate">${item.author}</div>`}
                        </div>
                      </div>
                      <${Btn} onClick=${function() { deleteReading(item.id); }} color="ghost" small className="flex-shrink-0 ml-2 text-gray-500 hover:text-rose-400" title="Delete">\u2715</${Btn}>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 w-10 text-right">${item.progress}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value=${item.progress}
                        onInput=${function(e) { updateProgress(item.id, e.target.value); }}
                        className="flex-1 h-2 cursor-pointer"
                      />
                    </div>
                  </div>
                `;
              })}
            </div>
          `
      }

      ${showModal && html`
        <${Modal} onClose=${function() { setShowModal(false); }} title="Add Reading Item">
          <${Input} label="Title" value=${newItem.title} onChange=${function(val) { setNewItem(function(s) { return Object.assign({}, s, { title: val }); }); }} placeholder="Enter title..." />
          <${Input} label="Author" value=${newItem.author} onChange=${function(val) { setNewItem(function(s) { return Object.assign({}, s, { author: val }); }); }} placeholder="Enter author (optional)..." />
          <${Select} label="Type" value=${newItem.type} onChange=${function(val) { setNewItem(function(s) { return Object.assign({}, s, { type: val }); }); }} options=${[
            { value: 'book', label: '\u{1F4D6} Book' },
            { value: 'article', label: '\u{1F4F0} Article' },
            { value: 'podcast', label: '\u{1F3A7} Podcast' },
            { value: 'video', label: '\u{1F3AC} Video' }
          ]} />
          <div className="flex justify-end gap-2 mt-4">
            <${Btn} onClick=${function() { setShowModal(false); }} color="ghost">Cancel</${Btn}>
            <${Btn} onClick=${addReading} color="accent">Add</${Btn}>
          </div>
        </${Modal}>
      `}
    </div>
  `;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="reading" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${ReadingPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
