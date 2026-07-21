var MOODS = [
  { key: 'amazing', emoji: '🤩', label: 'Amazing' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'meh', emoji: '😔', label: 'Meh' },
  { key: 'bad', emoji: '😤', label: 'Bad' }
];

function JournalPage(props) {
  var data = props.data;
  var setData = props.setData;
  var entries = data.journal || [];
  var _a = React.useState(false);
  var showModal = _a[0];
  var setShowModal = _a[1];
  var _b = React.useState('');
  var titleVal = _b[0];
  var setTitleVal = _b[1];
  var _c = React.useState('neutral');
  var moodVal = _c[0];
  var setMoodVal = _c[1];
  var _d = React.useState('');
  var contentVal = _d[0];
  var setContentVal = _d[1];
  var _e = React.useState('');
  var tagsVal = _e[0];
  var setTagsVal = _e[1];

  function resetForm() {
    setTitleVal('');
    setMoodVal('neutral');
    setContentVal('');
    setTagsVal('');
  }

  function handleSave() {
    if (!contentVal.trim()) return;
    var now = new Date();
    var entry = {
      id: uid(),
      title: titleVal.trim(),
      content: contentVal.trim(),
      mood: moodVal,
      tags: tagsVal.split(',').map(function(t) { return t.trim(); }).filter(Boolean),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5)
    };
    setData(function(prev) {
      return Object.assign({}, prev, { journal: [entry].concat(prev.journal || []) });
    });
    resetForm();
    setShowModal(false);
  }

  function handleDelete(id) {
    setData(function(prev) {
      return Object.assign({}, prev, { journal: (prev.journal || []).filter(function(e) { return e.id !== id; }) });
    });
  }

  var sorted = entries.slice().sort(function(a, b) {
    return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
  });

  function getMoodEmoji(key) {
    var m = MOODS.find(function(m) { return m.key === key; });
    return m ? m.emoji : '😐';
  }

  function renderEntry(entry) {
    var tagBadges = (entry.tags || []).map(function(tag) {
      return React.createElement('span', {
        key: tag,
        style: {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.12)',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }, tag);
    });

    return React.createElement('div', {
      key: entry.id,
      style: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '12px',
        position: 'relative'
      }
    },
      React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }
      },
        React.createElement('div', { style: { flex: 1 } },
          entry.title ? React.createElement('h3', {
            style: { margin: '0 0 4px 0', color: '#fff', fontSize: '1.05rem', fontWeight: 600 }
          }, entry.title) : null,
          React.createElement('div', {
            style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }
          },
            React.createElement('span', null, entry.date),
            React.createElement('span', null, entry.time),
            React.createElement('span', { style: { fontSize: '1.1rem' } }, getMoodEmoji(entry.mood))
          )
        ),
        React.createElement('button', {
          onClick: function() { handleDelete(entry.id); },
          style: {
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '1rem',
            lineHeight: 1
          },
          onMouseEnter: function(e) { e.target.style.color = '#ff6b6b'; },
          onMouseLeave: function(e) { e.target.style.color = 'rgba(255,255,255,0.3)'; }
        }, Icons.trash || '×')
      ),
      React.createElement('p', {
        style: {
          margin: '8px 0',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }
      }, entry.content),
      tagBadges.length > 0 ? React.createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }
      }, tagBadges) : null
    );
  }

  var moodButtons = MOODS.map(function(m) {
    var selected = moodVal === m.key;
    return React.createElement('button', {
      key: m.key,
      onClick: function() { setMoodVal(m.key); },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '10px 12px',
        borderRadius: '12px',
        border: selected ? '2px solid #7c5cfc' : '2px solid rgba(255,255,255,0.1)',
        background: selected ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '60px'
      }
    },
      React.createElement('span', { style: { fontSize: '1.5rem' } }, m.emoji),
      React.createElement('span', {
        style: { fontSize: '0.65rem', color: selected ? '#b8a4ff' : 'rgba(255,255,255,0.5)' }
      }, m.label)
    );
  });

  return React.createElement('div', null,
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }
    },
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' }
      },
        React.createElement('span', { style: { fontSize: '1.5rem' } }, Icons.journal || '📖'),
        React.createElement('h1', {
          style: { margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700 }
        }, 'Journal')
      ),
      React.createElement(Btn, {
        onClick: function() { resetForm(); setShowModal(true); },
        variant: 'primary'
      }, '+ New Entry')
    ),
    sorted.length === 0
      ? React.createElement('div', {
          style: {
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.4)'
          }
        },
          React.createElement('div', { style: { fontSize: '3rem', marginBottom: '16px' } }, '📖'),
          React.createElement('p', { style: { fontSize: '1rem', margin: '0 0 4px' } }, 'No journal entries yet'),
          React.createElement('p', { style: { fontSize: '0.85rem', margin: 0 } }, 'Start writing to capture your thoughts and reflections.')
        )
      : React.createElement('div', null, sorted.map(renderEntry)),
    showModal ? React.createElement(Modal, {
      onClose: function() { setShowModal(false); },
      title: 'New Journal Entry'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        React.createElement(Input, {
          label: 'Title (optional)',
          value: titleVal,
          onChange: function(e) { setTitleVal(e.target ? e.target.value : e); },
          placeholder: 'Entry title...'
        }),
        React.createElement('div', null,
          React.createElement('label', {
            style: { display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }
          }, 'Mood'),
          React.createElement('div', {
            style: { display: 'flex', gap: '8px', justifyContent: 'space-between' }
          }, moodButtons)
        ),
        React.createElement(Textarea, {
          label: 'Content',
          value: contentVal,
          onChange: function(e) { setContentVal(e.target ? e.target.value : e); },
          rows: 6,
          placeholder: 'Write your thoughts...'
        }),
        React.createElement(Input, {
          label: 'Tags (comma separated)',
          value: tagsVal,
          onChange: function(e) { setTagsVal(e.target ? e.target.value : e); },
          placeholder: 'reflection, goals, gratitude...'
        }),
        React.createElement('div', {
          style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }
        },
          React.createElement(Btn, {
            onClick: function() { setShowModal(false); },
            variant: 'secondary'
          }, 'Cancel'),
          React.createElement(Btn, {
            onClick: handleSave,
            variant: 'primary'
          }, 'Save Entry')
        )
      )
    ) : null
  );
}

function App() {
  var _a = React.useState(loadData);
  var data = _a[0];
  var setData = _a[1];
  var _b = React.useState(null);
  var toast = _b[0];
  var setToast = _b[1];
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'journal',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(JournalPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
