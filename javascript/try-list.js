var CATEGORIES = [
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'food', label: 'Food', emoji: '🍜' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'wellness', label: 'Wellness', emoji: '🧘' },
  { value: 'skill', label: 'Skill', emoji: '📚' }
];

function getCategoryEmoji(cat) {
  var found = CATEGORIES.find(function(c) { return c.value === cat; });
  return found ? found.emoji : '✨';
}

function getCategoryLabel(cat) {
  var found = CATEGORIES.find(function(c) { return c.value === cat; });
  return found ? found.label : cat;
}

function TryListPage({ data, setData }) {
  var _a = React.useState(false);
  var showModal = _a[0];
  var setShowModal = _a[1];
  var _b = React.useState(null);
  var editingItem = _b[0];
  var setEditingItem = _b[1];
  var _c = React.useState('');
  var filterCat = _c[0];
  var setFilterCat = _c[1];
  var _d = React.useState(true);
  var showCompleted = _d[0];
  var setShowCompleted = _d[1];
  var _e = React.useState('');
  var search = _e[0];
  var setSearch = _e[1];

  var tryList = data.tryList || [];

  function addItem(item) {
    var newItem = {
      id: uid(),
      name: item.name,
      category: item.category,
      notes: item.notes || '',
      cost: parseFloat(item.cost) || 0,
      tried: false,
      createdAt: today(),
      triedAt: null
    };
    setData(function(prev) {
      return Object.assign({}, prev, { tryList: (prev.tryList || []).concat([newItem]) });
    });
  }

  function markTried(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        tryList: (prev.tryList || []).map(function(item) {
          if (item.id === id) {
            return Object.assign({}, item, { tried: true, triedAt: today() });
          }
          return item;
        })
      });
    });
  }

  function deleteItem(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        tryList: (prev.tryList || []).filter(function(item) { return item.id !== id; })
      });
    });
  }

  var untried = tryList.filter(function(item) { return !item.tried; });
  var completed = tryList.filter(function(item) { return item.tried; });

  if (filterCat) {
    untried = untried.filter(function(item) { return item.category === filterCat; });
    completed = completed.filter(function(item) { return item.category === filterCat; });
  }

  if (search) {
    var q = search.toLowerCase();
    untried = untried.filter(function(item) { return item.name.toLowerCase().indexOf(q) !== -1; });
    completed = completed.filter(function(item) { return item.name.toLowerCase().indexOf(q) !== -1; });
  }

  var totalCost = tryList.reduce(function(sum, item) { return sum + (item.cost || 0); }, 0);
  var triedCost = completed.reduce(function(sum, item) { return sum + (item.cost || 0); }, 0);

  return html`
    <div>
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style=${{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#e2e8f0' }}>✨ Try List</h1>
          <p style=${{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>New experiences to try at least once</p>
        </div>
        <${Btn} onClick=${function() { setEditingItem(null); setShowModal(true); }}>+ Add Experience<//>
      </div>
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', fontWeight: 700, color: '#e2e8f0' }}>${untried.length}</div>
          <div style=${{ fontSize: '12px', color: '#94a3b8' }}>To Try</div>
        </div>
        <div style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', fontWeight: 700, color: '#4ade80' }}>${completed.length}</div>
          <div style=${{ fontSize: '12px', color: '#94a3b8' }}>Completed</div>
        </div>
        <div style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>${fmtMoney(totalCost)}</div>
          <div style=${{ fontSize: '12px', color: '#94a3b8' }}>Est. Total</div>
        </div>
        <div style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>${tryList.length > 0 ? Math.round((completed.length / tryList.length) * 100) + '%' : '0%'}</div>
          <div style=${{ fontSize: '12px', color: '#94a3b8' }}>Explored</div>
        </div>
      </div>
      <div style=${{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <${Input} value=${search} onChange=${setSearch} placeholder="Search experiences..." style=${{ flex: '1 1 200px', minWidth: '150px' }} />
        <${Select} value=${filterCat} onChange=${setFilterCat} options=${[{ value: '', label: 'All Categories' }].concat(CATEGORIES.map(function(c) { return { value: c.value, label: c.emoji + ' ' + c.label }; }))} style=${{ flex: '1 1 180px', minWidth: '150px' }} />
      </div>
      ${untried.length === 0 && completed.length === 0 && html`
        <div style=${{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style=${{ fontSize: '48px', marginBottom: '12px' }}>🌍</div>
          <h3 style=${{ margin: '0 0 8px', color: '#94a3b8' }}>No experiences yet</h3>
          <p style=${{ margin: 0, fontSize: '14px' }}>Add your first new experience to try!</p>
        </div>
      `}
      ${untried.length > 0 && html`
        <div>
          <h2 style=${{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>🎯 To Try (${untried.length})</h2>
          <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            ${untried.map(function(item) {
              return html`
                <div key=${item.id} style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'default' }} onMouseEnter=${function(e) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }} onMouseLeave=${function(e) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style=${{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style=${{ fontSize: '28px' }}>${getCategoryEmoji(item.category)}</span>
                      <div>
                        <div style=${{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>${item.name}</div>
                        <span style=${{ display: 'inline-block', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', marginTop: '4px' }}>${getCategoryLabel(item.category)}</span>
                      </div>
                    </div>
                    <div style=${{ display: 'flex', gap: '4px' }}>
                      <button onClick=${function() { deleteItem(item.id); }} style=${{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }} title="Delete">${Icons.trash}</button>
                    </div>
                  </div>
                  ${item.notes && html`<p style=${{ margin: '0 0 10px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>${item.notes}</p>`}
                  <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style=${{ fontSize: '14px', color: '#fbbf24', fontWeight: 500 }}>${item.cost > 0 ? fmtMoney(item.cost) : 'Free'}</span>
                    <${Btn} onClick=${function() { markTried(item.id); }} color="emerald">🎉 Tried it!<//>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      `}
      ${completed.length > 0 && html`
        <div>
          <button onClick=${function() { setShowCompleted(!showCompleted); }} style=${{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '0', marginBottom: '12px', fontWeight: 600 }}>
            <span style=${{ transition: 'transform 0.2s', display: 'inline-block', transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            Experienced (${completed.length})
          </button>
          ${showCompleted && html`
            <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
              ${completed.map(function(item) {
                return html`
                  <div key=${item.id} style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style=${{ fontSize: '20px', flexShrink: 0 }}>${getCategoryEmoji(item.category)}</span>
                      <div style=${{ flex: 1, minWidth: 0 }}>
                        <span style=${{ fontSize: '14px', color: '#64748b', textDecoration: 'line-through' }}>${item.name}</span>
                        ${item.triedAt && html`<span style=${{ fontSize: '11px', color: '#475569', marginLeft: '8px' }}>✓ ${fmt(item.triedAt)}</span>`}
                      </div>
                    </div>
                    <button onClick=${function() { deleteItem(item.id); }} style=${{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }} title="Delete">${Icons.trash}</button>
                  </div>
                `;
              })}
            </div>
          `}
        </div>
      `}
      ${showModal && html`
        <${Modal} onClose=${function() { setShowModal(false); }} title=${editingItem ? 'Edit Experience' : 'Add New Experience'}>
          <${TryListForm}
            initialData=${editingItem}
            onSave=${function(item) {
              if (editingItem) {
                setData(function(prev) {
                  return Object.assign({}, prev, {
                    tryList: (prev.tryList || []).map(function(i) { return i.id === editingItem.id ? Object.assign({}, i, item) : i; })
                  });
                });
              } else {
                addItem(item);
              }
              setShowModal(false);
              setEditingItem(null);
            }}
            onCancel=${function() { setShowModal(false); setEditingItem(null); }}
          />
        <//>
      `}
    </div>
  `;
}

function TryListForm({ initialData, onSave, onCancel }) {
  var _a = React.useState((initialData && initialData.name) || '');
  var name = _a[0];
  var setName = _a[1];
  var _b = React.useState((initialData && initialData.category) || 'adventure');
  var category = _b[0];
  var setCategory = _b[1];
  var _c = React.useState((initialData && initialData.cost) || '');
  var cost = _c[0];
  var setCost = _c[1];
  var _d = React.useState((initialData && initialData.notes) || '');
  var notes = _d[0];
  var setNotes = _d[1];

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), category: category, cost: cost, notes: notes });
  }

  return html`
    <form onSubmit=${handleSubmit} style=${{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <${Input} label="Experience Name" value=${name} onChange=${setName} placeholder="e.g., Try rock climbing" required />
      <${Select} label="Category" value=${category} onChange=${setCategory} options=${CATEGORIES.map(function(c) { return { value: c.value, label: c.emoji + ' ' + c.label }; })} />
      <${Input} label="Estimated Cost" type="number" value=${cost} onChange=${setCost} placeholder="0" min="0" step="0.01" />
      <${Textarea} label="Notes" value=${notes} onChange=${setNotes} placeholder="Any details, links, or ideas..." rows="3" />
      <div style=${{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <${Btn} type="button" onClick=${onCancel} color="ghost">Cancel<//>
        <${Btn} type="submit" color="accent">${initialData ? 'Save Changes' : 'Add Experience'}<//>
      </div>
    </form>
  `;
}

function App() {
  var _a = React.useState(loadData);
  var data = _a[0];
  var setData = _a[1];
  var _b = React.useState(null);
  var toast = _b[0];
  var setToast = _b[1];
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="trylist" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${TryListPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
