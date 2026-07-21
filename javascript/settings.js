function SettingsPage({ data, setData }) {
  var [toast, setToast] = React.useState(null);

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

  return React.createElement('div', { className: 'max-w-2xl mx-auto space-y-6 pb-10' },
    React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
      React.createElement('div', {
        className: 'w-10 h-10 rounded-xl flex items-center justify-center',
        style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
      }, React.createElement(Icons.Settings, { size: 20 })),
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Settings')
    ),
    React.createElement('div', { className: 'glass-card p-6' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4 flex items-center gap-2' },
        React.createElement(Icons.User, { size: 18 }),
        'Profile'
      ),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-400 mb-1' }, 'Your Name'),
          React.createElement(Input, {
            type: 'text',
            placeholder: 'Enter your name',
            value: data.profile.name,
            onChange: function(e) {
              setData(function(prev) {
                return Object.assign({}, prev, {
                  profile: Object.assign({}, prev.profile, { name: e.target.value })
                });
              });
            }
          })
        )
      )
    ),
    React.createElement('div', { className: 'glass-card p-6' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4 flex items-center gap-2' },
        React.createElement(Icons.Database, { size: 18 }),
        'Data Management'
      ),
      React.createElement('div', { className: 'space-y-3' },
        React.createElement(Btn, { onClick: handleExport, variant: 'primary', className: 'w-full' },
          React.createElement(Icons.Download, { size: 16, className: 'mr-2' }),
          'Export All Data'
        ),
        React.createElement('label', { className: 'block' },
          React.createElement('input', {
            type: 'file',
            accept: '.json',
            onChange: handleImport,
            className: 'hidden',
            id: 'import-input'
          }),
          React.createElement(Btn, { variant: 'secondary', className: 'w-full', onClick: function() { document.getElementById('import-input').click(); } },
            React.createElement(Icons.Upload, { size: 16, className: 'mr-2' }),
            'Import Data'
          )
        ),
        React.createElement(Btn, { onClick: handleReset, variant: 'danger', className: 'w-full' },
          React.createElement(Icons.Trash, { size: 16, className: 'mr-2' }),
          'Reset Everything'
        )
      )
    ),
    React.createElement('div', { className: 'glass-card p-6' },
      React.createElement('h2', { className: 'text-lg font-semibold mb-4 flex items-center gap-2' },
        React.createElement(Icons.Info, { size: 18 }),
        'About'
      ),
      React.createElement('div', { className: 'space-y-2 text-gray-400 text-sm' },
        React.createElement('p', null, 'Life OS v1.0 \u2014 Your complete life planning system.'),
        React.createElement('p', null, 'All data is stored locally in your browser. No data is sent to any server.')
      )
    )
  );
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'settings',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(SettingsPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
