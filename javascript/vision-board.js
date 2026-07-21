var VISION_CATEGORIES = [
  { value: 'life', label: 'Life' },
  { value: 'career', label: 'Career' },
  { value: 'travel', label: 'Travel' },
  { value: 'health', label: 'Health' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' }
];

var VISION_COLORS = ['#818cf8','#34d399','#fbbf24','#fb7185','#60a5fa','#a78bfa','#f472b6','#2dd4bf'];

function VisionBoardPage({ data, setData }) {
  var visions = data.visionBoard || [];

  var [showModal, setShowModal] = React.useState(false);
  var [formText, setFormText] = React.useState('');
  var [formCategory, setFormCategory] = React.useState('life');
  var [formColor, setFormColor] = React.useState(VISION_COLORS[0]);

  function openAdd() {
    setFormText('');
    setFormCategory('life');
    setFormColor(VISION_COLORS[0]);
    setShowModal(true);
  }

  function handleSave() {
    if (!formText.trim()) return;
    setData(function(prev) {
      return Object.assign({}, prev, {
        visionBoard: (prev.visionBoard || []).concat([{
          id: uid(),
          text: formText.trim(),
          category: formCategory,
          color: formColor,
          createdAt: today()
        }])
      });
    });
    setShowModal(false);
  }

  function handleDelete(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        visionBoard: prev.visionBoard.filter(function(v) { return v.id !== id; })
      });
    });
  }

  function getCategoryLabel(cat) {
    var found = VISION_CATEGORIES.find(function(c) { return c.value === cat; });
    return found ? found.label : cat;
  }

  return html`<div className="space-y-5 animate-in pb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          ${Icons.vision}
          Vision Board
        </h1>
        <p className="text-sm text-gray-400 mt-1">Visualize your dream life</p>
      </div>
      <${Btn} onClick=${openAdd} color="accent">
        ${Icons.plus}
        Add Vision
      <//>
    </div>

    ${visions.length === 0
      ? html`<div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-base font-bold text-white mb-1">No visions yet</h3>
          <p className="text-sm text-gray-400">Start adding your dreams and aspirations!</p>
        </div>`
      : html`<div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          ${visions.map(function(v) {
            return html`<div
              key=${v.id}
              className="break-inside-avoid relative group rounded-xl overflow-hidden"
              style=${{ background: v.color + '15', borderLeft: '4px solid ' + v.color }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style=${{ background: v.color + '25', color: v.color }}
                  >${getCategoryLabel(v.category)}</span>
                  <button
                    onClick=${function() { handleDelete(v.id); }}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-dark-700/50 text-gray-400 hover:text-rose-400"
                  >${Icons.trash}</button>
                </div>
                <p className="text-sm font-medium text-white mt-2 leading-relaxed">${v.text}</p>
              </div>
            </div>`;
          })}
        </div>`}

    ${showModal ? html`<${Modal}
      open=${showModal}
      onClose=${function() { setShowModal(false); }}
      title="Add Vision"
    >
      <div>
        <${Input}
          label="Your Vision"
          value=${formText}
          onChange=${setFormText}
          placeholder="e.g. Travel the world"
        />
        <${Select}
          label="Category"
          value=${formCategory}
          onChange=${setFormCategory}
          options=${VISION_CATEGORIES.map(function(c) { return { value: c.value, label: c.label }; })}
        />
        <label className="block mb-3">
          <span className="text-xs font-medium text-gray-400 mb-1 block">Color</span>
          <div className="flex gap-2 flex-wrap">
            ${VISION_COLORS.map(function(color) {
              return html`<button
                key=${color}
                onClick=${function() { setFormColor(color); }}
                className=${"w-8 h-8 rounded-full transition " + (formColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : 'hover:scale-110')}
                style=${{ background: color }}
              />`;
            })}
          </div>
        </label>
        <div className="flex gap-2 pt-2">
          <${Btn} onClick=${function() { setShowModal(false); }} color="ghost" className="flex-1">Cancel<//>
          <${Btn} onClick=${handleSave} color="accent" className="flex-1">Add Vision<//>
        </div>
      </div>
    <//>` : null}
  </div>`;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="vision" data=${data} setData=${setData} toast=${toast} setToast=${setToast} pageContent=${html`<${VisionBoardPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
