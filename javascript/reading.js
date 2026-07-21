function ReadingPage({ data, setData }) {
  var readings = data.readings || [];
  var [filter, setFilter] = React.useState('all');
  var [showModal, setShowModal] = React.useState(false);
  var [newItem, setNewItem] = React.useState({ title: '', author: '', type: 'book' });

  var types = [
    { key: 'all', label: 'All' },
    { key: 'book', label: '📖 Book' },
    { key: 'article', label: '📰 Article' },
    { key: 'podcast', label: '🎧 Podcast' },
    { key: 'video', label: '🎬 Video' }
  ];

  var typeEmoji = { book: '📖', article: '📰', podcast: '🎧', video: '🎬' };

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
      var updated = Object.assign({}, prev, { readings: (prev.readings || []).concat(item) });
      return updated;
    });
    setNewItem({ title: '', author: '', type: 'book' });
    setShowModal(false);
  }

  function deleteReading(id) {
    setData(function(prev) {
      var updated = Object.assign({}, prev, { readings: (prev.readings || []).filter(function(r) { return r.id !== id; }) });
      return updated;
    });
  }

  function updateProgress(id, value) {
    setData(function(prev) {
      var updated = Object.assign({}, prev, {
        readings: (prev.readings || []).map(function(r) {
          if (r.id === id) return Object.assign({}, r, { progress: parseInt(value) });
          return r;
        })
      });
      return updated;
    });
  }

  return React.createElement('div', { className: 'reading-page' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('div', { className: 'page-header-left' },
        React.createElement('span', { className: 'page-icon' }, Icons.reading),
        React.createElement('h2', null, 'Reading List')
      ),
      React.createElement(Btn, { onClick: function() { setShowModal(true); }, variant: 'primary' }, '+ Add')
    ),
    React.createElement('div', { className: 'filter-row' },
      types.map(function(t) {
        return React.createElement(Btn, {
          key: t.key,
          onClick: function() { setFilter(t.key); },
          variant: filter === t.key ? 'primary' : 'ghost',
          className: 'filter-btn'
        }, t.label);
      })
    ),
    filtered.length === 0
      ? React.createElement('div', { className: 'empty-state' },
          React.createElement('div', { className: 'empty-icon' }, '📚'),
          React.createElement('p', null, 'No reading items yet.'),
          React.createElement('p', { className: 'empty-sub' }, 'Add a book, article, podcast, or video to start tracking.')
        )
      : React.createElement('div', { className: 'card-list' },
          filtered.map(function(item) {
            return React.createElement('div', { key: item.id, className: 'glass-card reading-card' },
              React.createElement('div', { className: 'reading-card-top' },
                React.createElement('div', { className: 'reading-card-info' },
                  React.createElement('span', { className: 'reading-type-emoji' }, typeEmoji[item.type] || ''),
                  React.createElement('div', { className: 'reading-details' },
                    React.createElement('div', { className: 'reading-title' }, item.title),
                    item.author ? React.createElement('div', { className: 'reading-author' }, item.author) : null
                  )
                ),
                React.createElement(Btn, {
                  onClick: function() { deleteReading(item.id); },
                  variant: 'ghost',
                  className: 'delete-btn',
                  title: 'Delete'
                }, '✕')
              ),
              React.createElement('div', { className: 'reading-progress-row' },
                React.createElement('span', { className: 'progress-label' }, item.progress + '%'),
                React.createElement('input', {
                  type: 'range',
                  min: 0,
                  max: 100,
                  value: item.progress,
                  onChange: function(e) { updateProgress(item.id, e.target.value); },
                  className: 'progress-slider'
                })
              )
            );
          })
        ),
    showModal ? React.createElement(Modal, {
      onClose: function() { setShowModal(false); },
      title: 'Add Reading Item'
    },
      React.createElement('div', { className: 'modal-form' },
        React.createElement(Input, {
          label: 'Title',
          value: newItem.title,
          onChange: function(e) { setNewItem(function(s) { return Object.assign({}, s, { title: e.target.value }); }); },
          placeholder: 'Enter title...'
        }),
        React.createElement(Input, {
          label: 'Author',
          value: newItem.author,
          onChange: function(e) { setNewItem(function(s) { return Object.assign({}, s, { author: e.target.value }); }); },
          placeholder: 'Enter author (optional)...'
        }),
        React.createElement(Select, {
          label: 'Type',
          value: newItem.type,
          onChange: function(e) { setNewItem(function(s) { return Object.assign({}, s, { type: e.target.value }); }); },
          options: [
            { value: 'book', label: '📖 Book' },
            { value: 'article', label: '📰 Article' },
            { value: 'podcast', label: '🎧 Podcast' },
            { value: 'video', label: '🎬 Video' }
          ]
        }),
        React.createElement('div', { className: 'modal-actions' },
          React.createElement(Btn, { onClick: function() { setShowModal(false); }, variant: 'ghost' }, 'Cancel'),
          React.createElement(Btn, { onClick: addReading, variant: 'primary' }, 'Add')
        )
      )
    ) : null
  );
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'reading', data: data, toast: toast, setToast: setToast,
    pageContent: React.createElement(ReadingPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
