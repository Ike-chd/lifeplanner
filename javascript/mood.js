var moods = [
  { val:'amazing', emoji:'🤩', label:'Amazing', color:'#34d399' },
  { val:'good', emoji:'😊', label:'Good', color:'#60a5fa' },
  { val:'neutral', emoji:'😐', label:'Okay', color:'#fbbf24' },
  { val:'meh', emoji:'😔', label:'Meh', color:'#fb923c' },
  { val:'bad', emoji:'😤', label:'Bad', color:'#fb7185' }
];

function getMoodColor(val) {
  var m = moods.find(function(m) { return m.val === val; });
  return m ? m.color : '#555';
}

function getMoodEmoji(val) {
  var m = moods.find(function(m) { return m.val === val; });
  return m ? m.emoji : '';
}

function MoodPage({ data, setData }) {
  var moodLog = (data.moodLog && data.moodLog.mood) || {};
  var todaysMood = moodLog[today()] || null;

  function logMood(val) {
    setData(function(prev) {
      var updated = Object.assign({}, prev);
      if (!updated.moodLog) updated.moodLog = { habits: {}, mood: {} };
      if (!updated.moodLog.mood) updated.moodLog.mood = {};
      updated.moodLog.mood[today()] = val;
      return updated;
    });
  }

  function getLast30Days() {
    var days = [];
    var now = new Date();
    for (var i = 29; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var display = (d.getMonth() + 1) + '/' + d.getDate();
      var moodVal = moodLog[key] || null;
      days.push({ key: key, display: display, moodVal: moodVal });
    }
    return days;
  }

  var last30 = getLast30Days();

  return html`
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style=${{ background: 'rgba(251,191,36,0.15)' }}
        >
          ${Icons.mood}
        </div>
        <h1 className="text-2xl font-bold text-white">Mood Tracker</h1>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">How are you feeling today?</h2>
        <div className="grid grid-cols-5 gap-3">
          ${moods.map(function(m) {
            var isSelected = todaysMood === m.val;
            return html`
              <button
                key=${m.val}
                onClick=${function() { logMood(m.val); }}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all duration-200 cursor-pointer"
                style=${{
                  background: isSelected ? m.color + '30' : 'rgba(255,255,255,0.05)',
                  border: isSelected ? '2px solid ' + m.color : '2px solid transparent',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? '0 0 20px ' + m.color + '40' : 'none'
                }}
              >
                <span className="text-3xl sm:text-4xl" style=${{ filter: isSelected ? 'none' : 'saturate(0.6)' }}>${m.emoji}</span>
                <span
                  className="text-xs sm:text-sm font-medium"
                  style=${{ color: isSelected ? m.color : '#9ca3af' }}
                >${m.label}</span>
              </button>
            `;
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Last 30 Days</h2>
        <div className="grid grid-cols-10 gap-2">
          ${last30.map(function(day) {
            var bg = day.moodVal ? getMoodColor(day.moodVal) + '30' : 'rgba(255,255,255,0.05)';
            var emoji = day.moodVal ? getMoodEmoji(day.moodVal) : null;
            var title = day.display + (day.moodVal ? ' - ' + day.moodVal.charAt(0).toUpperCase() + day.moodVal.slice(1) : ' - No mood');
            return html`
              <div
                key=${day.key}
                title=${title}
                className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-default transition-transform hover:scale-110"
                style=${{ background: bg }}
              >
                ${emoji ? html`<span className="text-sm sm:text-base">${emoji}</span>` :
                  html`<span style=${{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'block' }} />`}
              </div>
            `;
          })}
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
      currentPage="mood"
      data=${data}
      toast=${toast}
      setToast=${setToast}
      pageContent=${html`<${MoodPage} data=${data} setData=${setData} />`}
    />
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
