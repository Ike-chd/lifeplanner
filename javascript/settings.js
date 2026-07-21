function SettingsPage({ data, setData }) {
  function handleExport() {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'lifeos-backup-' + today() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      try {
        var imported = JSON.parse(evt.target.result);
        setData(imported);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data. Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (!confirm('Are you sure you want to reset everything? This cannot be undone.')) return;
    localStorage.removeItem(LIFEOS_KEY);
    location.reload();
  }

  return html`
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style=${{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <${Icons.settings} />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
            <${Input}
              type="text"
              placeholder="Enter your name"
              value=${data.profile.name}
              onChange=${function(val) {
                setData(function(prev) {
                  return Object.assign({}, prev, {
                    profile: Object.assign({}, prev.profile, { name: val })
                  });
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Data Management
        </h2>
        <div className="space-y-3">
          <${Btn} onClick=${handleExport} color="accent" className="w-full">
            Export All Data
          <//>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange=${handleImport}
              className="hidden"
              id="import-input"
            />
            <${Btn}
              color="ghost"
              className="w-full"
              onClick=${function() { document.getElementById('import-input').click(); }}
            >
              Import Data
            <//>
          </label>
          <${Btn} onClick=${handleReset} color="rose" className="w-full">
            Reset Everything
          <//>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          About
        </h2>
        <div className="space-y-2 text-gray-400 text-sm">
          <p>Life OS v1.0 \u2014 Your complete life planning system.</p>
          <p>All data is stored locally in your browser. No data is sent to any server.</p>
        </div>
      </div>
    </div>
  `;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`
    <${AppLayout}
      currentPage="settings"
      data=${data}
      toast=${toast}
      setToast=${setToast}
      pageContent=${html`<${SettingsPage} data=${data} setData=${setData} />`}
    />
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
