function getMonthDays(year, month) {
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var daysInPrev = new Date(year, month, 0).getDate();
  var cells = [];
  var startPad = (firstDay + 6) % 7;
  for (var i = startPad - 1; i >= 0; i--) {
    var d = daysInPrev - i;
    cells.push((year - (month === 0 ? 1 : 0)) + '-' + String(month === 0 ? 12 : month).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  }
  for (var i = 1; i <= daysInMonth; i++) {
    cells.push(year + '-' + String(month + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0'));
  }
  var remaining = 42 - cells.length;
  var nextMonth = month === 11 ? 0 : month + 1;
  var nextYear = month === 11 ? year + 1 : year;
  for (var i = 1; i <= remaining; i++) {
    cells.push(nextYear + '-' + String(nextMonth + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0'));
  }
  return cells;
}

function getDateIndicators(dateStr, data) {
  var dots = [];
  if (!data) return dots;

  var habitLogs = (data.moodLog && data.moodLog.habits) || {};
  if (habitLogs[dateStr]) {
    var count = habitLogs[dateStr].length;
    if (count > 0) dots.push({ color: '#818cf8', type: 'habits', count: count });
  }

  var tasks = data.tasks || [];
  var dayTasks = tasks.filter(function(t) { return t.dueDate === dateStr; });
  if (dayTasks.length > 0) dots.push({ color: '#fbbf24', type: 'tasks', count: dayTasks.length });

  var meals = (data.nutrition && data.nutrition.meals) || [];
  var dayMeals = meals.filter(function(m) { return m.date === dateStr; });
  if (dayMeals.length > 0) dots.push({ color: '#34d399', type: 'meals', count: dayMeals.length });

  var moodLog = (data.moodLog && data.moodLog.mood) || {};
  if (moodLog[dateStr]) dots.push({ color: '#fb7185', type: 'mood', count: 1 });

  var journal = data.journal || [];
  var dayJournal = journal.filter(function(j) { return j.date === dateStr; });
  if (dayJournal.length > 0) dots.push({ color: '#a78bfa', type: 'journal', count: dayJournal.length });

  var goals = data.goals || [];
  var dayGoals = goals.filter(function(g) { return g.deadline === dateStr; });
  if (dayGoals.length > 0) dots.push({ color: '#3b82f6', type: 'goals', count: dayGoals.length });

  return dots;
}

function getItemsForDate(dateStr, data) {
  if (!data) return {};
  var habitLogs = (data.moodLog && data.moodLog.habits) || {};
  var allHabits = data.habits || [];
  var doneIds = habitLogs[dateStr] || [];
  var habits = allHabits.map(function(h) {
    return Object.assign({}, h, { done: doneIds.indexOf(h.id) >= 0 });
  });

  return {
    habits: habits,
    tasks: (data.tasks || []).filter(function(t) { return t.dueDate === dateStr; }),
    meals: ((data.nutrition && data.nutrition.meals) || []).filter(function(m) { return m.date === dateStr; }),
    water: (data.nutrition && data.nutrition.waterLog && data.nutrition.waterLog[dateStr]) || 0,
    waterTarget: (data.nutrition && data.nutrition.waterTarget) || 8,
    mood: (data.moodLog && data.moodLog.mood && data.moodLog.mood[dateStr]) || null,
    journal: (data.journal || []).filter(function(j) { return j.date === dateStr; }),
    goals: (data.goals || []).filter(function(g) { return g.deadline === dateStr; }),
    vacations: (data.vacations || []).filter(function(v) {
      return v.startDate <= dateStr && v.endDate >= dateStr;
    })
  };
}

var MOOD_EMOJIS = {
  amazing: '🤩',
  good: '😊',
  neutral: '😐',
  meh: '😔',
  bad: '😤'
};

function CalendarPage(props) {
  var data = props.data;

  var _viewMode = React.useState('month');
  var viewMode = _viewMode[0];
  var setViewMode = _viewMode[1];

  var _currentDate = React.useState(new Date());
  var currentDate = _currentDate[0];
  var setCurrentDate = _currentDate[1];

  var _selectedDate = React.useState(null);
  var selectedDate = _selectedDate[0];
  var setSelectedDate = _selectedDate[1];

  var t = today();
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();

  function goPrev() {
    var d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'year') {
      d.setFullYear(d.getFullYear() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  }

  function goNext() {
    var d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'year') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
    if (viewMode === 'year') setViewMode('month');
  }

  function selectDate(dateStr) {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  }

  function getWeekStart(date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  }

  function getWeekDays(date) {
    var start = getWeekStart(date);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  function formatHeader() {
    if (viewMode === 'week') {
      var weekStart = getWeekStart(currentDate);
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      var opt = { month: 'short', day: 'numeric' };
      var s = weekStart.toLocaleDateString('en-US', opt);
      var e = weekEnd.toLocaleDateString('en-US', opt);
      return s + ' - ' + e + ', ' + weekEnd.getFullYear();
    }
    if (viewMode === 'year') {
      return String(year);
    }
    return months[month] + ' ' + year;
  }

  function renderViewSwitcher() {
    return html`
      <div className="flex bg-dark-700/60 rounded-lg p-0.5">
        ${['week', 'month', 'year'].map(function(m) {
          return html`<button
            key=${m}
            onClick=${function() { setViewMode(m); }}
            className=${"px-3 py-1.5 text-xs font-medium rounded-md capitalize transition " +
              (viewMode === m
                ? 'bg-accent/20 text-accent shadow-sm'
                : 'text-gray-400 hover:text-white')}
          >${m}</button>`;
        })}
      </div>
    `;
  }

  function renderNavigation() {
    return html`
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick=${goPrev} className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-white min-w-[180px] text-center select-none">${formatHeader()}</h2>
          <button onClick=${goNext} className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick=${goToday} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white transition">Today</button>
          ${renderViewSwitcher()}
        </div>
      </div>
    `;
  }

  function renderDayCell(dateStr, isCurrentMonth) {
    var dt = new Date(dateStr + 'T00:00:00');
    var dayNum = dt.getDate();
    var isToday = dateStr === t;
    var isSelected = dateStr === selectedDate;
    var dots = getDateIndicators(dateStr, data);

    return html`
      <button
        key=${dateStr}
        onClick=${function() { selectDate(dateStr); }}
        className=${"relative flex flex-col items-center rounded-xl py-2 px-1 transition-all duration-150 min-h-[56px] " +
          (isToday
            ? 'ring-2 ring-accent bg-accent/5'
            : isSelected
              ? 'bg-accent/10'
              : isCurrentMonth
                ? 'hover:bg-dark-700'
                : 'hover:bg-dark-700/30')}
      >
        <span className=${"text-xs font-semibold leading-none " +
          (isToday
            ? 'text-accent'
            : isCurrentMonth
              ? 'text-white'
              : 'text-gray-600')}
        >${dayNum}</span>
        ${dots.length > 0 ? html`
          <div className="flex flex-wrap justify-center gap-0.5 mt-1.5 max-w-[40px]">
            ${dots.slice(0, 4).map(function(d) {
              return html`<span key=${d.type} className="w-1.5 h-1.5 rounded-full inline-block" style=${{ background: d.color }} />`;
            })}
            ${dots.length > 4 ? html`<span className="text-[8px] text-gray-500 leading-none">+${dots.length - 4}</span>` : null}
          </div>
        ` : null}
      </button>
    `;
  }

  function renderWeekView() {
    var weekDays = getWeekDays(currentDate);
    return html`
      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          ${dayNames.slice(1).concat(dayNames.slice(0, 1)).map(function(n) {
            return html`<div key=${n} className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1">${n}</div>`;
          })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          ${weekDays.map(function(d) {
            return renderDayCell(d, true);
          })}
        </div>
      </div>
    `;
  }

  function renderMonthView() {
    var days = getMonthDays(year, month);
    var currentMonthStr = year + '-' + String(month + 1).padStart(2, '0');

    return html`
      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          ${dayNames.slice(1).concat(dayNames.slice(0, 1)).map(function(n) {
            return html`<div key=${n} className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1">${n}</div>`;
          })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          ${days.map(function(d) {
            var isCurrent = d.startsWith(currentMonthStr);
            return renderDayCell(d, isCurrent);
          })}
        </div>
      </div>
    `;
  }

  function renderYearView() {
    var monthCards = [];
    for (var m = 0; m < 12; m++) {
      var days = getMonthDays(year, m);
      var hasItems = days.some(function(d) { return getDateIndicators(d, data).length > 0; });
      monthCards.push({ month: m, days: days, hasItems: hasItems });
    }

    return html`
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        ${monthCards.map(function(mc) {
          var mDate = new Date(year, mc.month, 1);
          var mLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
          var firstDayCells = getMonthDays(year, mc.month).slice(0, 7);
          return html`
            <div
              key=${mc.month}
              className="glass rounded-2xl p-3 hover:border-accent/30 transition cursor-pointer"
              onClick=${function() {
                var d = new Date(year, mc.month, 1);
                setCurrentDate(d);
                setViewMode('month');
              }}
            >
              <h4 className="text-sm font-bold text-white mb-2">${mLabel}</h4>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                ${firstDayCells.slice(0, 7).map(function(d) {
                  var dt = new Date(d + 'T00:00:00');
                  var dayNum = dt.getDate();
                  var isToday = d === t;
                  var dots = getDateIndicators(d, data);
                  return html`<div
                    key=${d}
                    onClick=${function(e) { e.stopPropagation(); selectDate(d); }}
                    className=${"flex items-center justify-center py-0.5 rounded cursor-pointer " + (isToday ? 'bg-accent/20' : 'hover:bg-dark-700')}
                  >
                    <span className=${"text-[10px] " + (isToday ? 'text-accent font-bold' : 'text-gray-400')}>${dayNum}</span>
                  </div>`;
                })}
              </div>
              ${mc.hasItems ? html`
                <div className="flex flex-wrap gap-0.5 mt-1">
                  ${days.slice(0, 21).reduce(function(acc, d) {
                    var dots = getDateIndicators(d, data);
                    if (acc.length >= 5) return acc;
                    return acc.concat(dots.slice(0, 5 - acc.length));
                  }, []).map(function(dot, i) {
                    return html`<span key=${i} className="w-1 h-1 rounded-full inline-block" style=${{ background: dot.color }} />`;
                  })}
                </div>
              ` : null}
            </div>
          `;
        })}
      </div>
    `;
  }

  function renderDetailPanel() {
    if (!selectedDate) return null;
    var items = getItemsForDate(selectedDate, data);
    var dt = new Date(selectedDate + 'T00:00:00');
    var dayLabel = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    var isToday = selectedDate === t;

    function closePanel() {
      setSelectedDate(null);
    }

    return html`
      <div className="fixed inset-0 z-40 lg:static lg:z-auto" onClick=${function(e) { if (e.target === e.currentTarget) closePanel(); }}>
        <div className="lg:hidden fixed inset-0 bg-black/50" onClick=${closePanel} />
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 lg:relative lg:z-auto lg:w-full lg:max-w-none lg:top-auto lg:right-auto lg:bottom-auto lg:block">
          <div className="glass h-full lg:h-auto lg:rounded-2xl lg:max-h-[calc(100vh-8rem)] overflow-y-auto p-5 animate-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">${dayLabel}</h3>
                ${isToday ? html`<span className="text-[10px] text-accent font-medium">Today</span>` : null}
              </div>
              <button onClick=${closePanel} className="lg:hidden p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition">${Icons.close}</button>
            </div>

            <div className="space-y-4">
              ${renderHabitsSection(items)}
              ${renderTasksSection(items)}
              ${renderMealsSection(items)}
              ${renderWaterSection(items)}
              ${renderMoodSection(items)}
              ${renderJournalSection(items)}
              ${renderGoalsSection(items)}
              ${renderVacationsSection(items)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderHabitsSection(items) {
    var habits = items.habits || [];
    var doneCount = habits.filter(function(h) { return h.done; }).length;
    if (habits.length === 0) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style=${{ background: '#818cf8' }} />
            Habits
          </h4>
          <span className="text-[10px] text-gray-400">${doneCount}/${habits.length}</span>
        </div>
        <div className="space-y-1.5">
          ${habits.map(function(h) {
            return html`<div key=${h.id} className="flex items-center gap-2">
              <span className=${"w-4 h-4 rounded flex items-center justify-center text-[10px] " + (h.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-600 text-gray-500')}>
                ${h.done ? '✓' : '·'}
              </span>
              <span className="text-xs text-gray-300 truncate">${h.emoji || ''} ${h.name}</span>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  function renderTasksSection(items) {
    var tasks = items.tasks || [];
    if (tasks.length === 0) return null;
    var todayStr = today();
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#fbbf24' }} />
          Tasks (${tasks.length})
        </h4>
        <div className="space-y-1.5">
          ${tasks.map(function(tk) {
            var isOverdue = !tk.completed && selectedDate < todayStr;
            return html`<div key=${tk.id} className={"flex items-center gap-2 " + (tk.completed ? 'opacity-50' : '')}>
              <span className={"text-xs " + (tk.completed ? 'text-emerald-400' : isOverdue ? 'text-rose-400' : tk.completed ? 'text-emerald-400' : 'text-gray-400')}>
                ${tk.completed ? '✓' : '○'}
              </span>
              <span className={"text-xs truncate flex-1 " + (tk.completed ? 'text-gray-500 line-through' : 'text-gray-300')}>${tk.name}</span>
              ${tk.priority ? html`<span className="text-[9px] text-gray-500 capitalize">${tk.priority}</span>` : null}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  function renderMealsSection(items) {
    var meals = items.meals || [];
    if (meals.length === 0) return null;
    var mealLabels = { breakfast: '🍳', lunch: '🥗', dinner: '🍝', snack: '🍿' };
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#34d399' }} />
          Meals (${meals.length})
        </h4>
        <div className="space-y-1.5">
          ${meals.map(function(m, i) {
            return html`<div key=${m.id || i} className="flex items-center gap-2">
              <span className="text-xs">${mealLabels[m.type] || '🍽'}</span>
              <span className="text-xs text-gray-300 truncate flex-1">${m.name}</span>
              <span className="text-[10px] text-gray-500">${m.calories || 0} cal</span>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  function renderWaterSection(items) {
    if (!items.water) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#60a5fa' }} />
          Water
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm">💧</span>
          <span className="text-xs text-gray-300">${items.water} / ${items.waterTarget} glasses</span>
        </div>
      </div>
    `;
  }

  function renderMoodSection(items) {
    if (!items.mood) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#fb7185' }} />
          Mood
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-lg">${MOOD_EMOJIS[items.mood] || '😐'}</span>
          <span className="text-xs text-gray-300 capitalize">${items.mood}</span>
        </div>
      </div>
    `;
  }

  function renderJournalSection(items) {
    var journal = items.journal || [];
    if (journal.length === 0) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#a78bfa' }} />
          Journal (${journal.length})
        </h4>
        <div className="space-y-2">
          ${journal.map(function(j) {
            return html`<div key=${j.id} className="text-xs text-gray-300">
              <p className="font-semibold text-white">${j.title}</p>
              ${j.content ? html`<p className="text-gray-400 mt-0.5 line-clamp-2">${j.content}</p>` : null}
              ${j.mood ? html`<span className="text-[10px] text-gray-500 mt-0.5 block">Mood: ${MOOD_EMOJIS[j.mood] || j.mood}</span>` : null}
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  function renderGoalsSection(items) {
    var goals = items.goals || [];
    if (goals.length === 0) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#3b82f6' }} />
          Goals Due (${goals.length})
        </h4>
        <div className="space-y-1.5">
          ${goals.map(function(g) {
            var pct = g.target > 0 ? Math.min(100, Math.round(((g.saved || 0) / g.target) * 100)) : 0;
            return html`<div key=${g.id} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">${g.name}</span>
                <span className="text-gray-500">${pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full" style=${{ width: pct + '%', background: pct >= 100 ? '#34d399' : '#3b82f6' }} />
              </div>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  function renderVacationsSection(items) {
    var vacations = items.vacations || [];
    if (vacations.length === 0) return null;
    return html`
      <div className="bg-dark-700/50 rounded-xl p-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style=${{ background: '#f472b6' }} />
          Vacations
        </h4>
        <div className="space-y-1.5">
          ${vacations.map(function(v) {
            var pct = v.totalCost > 0 ? Math.min(100, Math.round(((v.saved || 0) / v.totalCost) * 100)) : 0;
            return html`<div key=${v.id} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">${v.name}</span>
                <span className="text-gray-500">${pct}% saved</span>
              </div>
            </div>`;
          })}
        </div>
      </div>
    `;
  }

  return html`
    <div className="space-y-5 animate-in pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style=${{ background: 'rgba(129,140,248,0.15)' }}>
          ${Icons.calendarIcon}
        </div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
      </div>

      ${renderNavigation()}

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          ${viewMode === 'week' ? renderWeekView() : null}
          ${viewMode === 'month' ? renderMonthView() : null}
          ${viewMode === 'year' ? renderYearView() : null}
        </div>
        ${selectedDate ? html`<div className="lg:w-80 xl:w-96 shrink-0">${renderDetailPanel()}</div>` : null}
      </div>
    </div>
  `;
}

function App() {
  var _s = React.useState(loadData);
  var data = _s[0];
  var setData = _s[1];
  var _t = React.useState(null);
  var toast = _t[0];
  var setToast = _t[1];

  React.useEffect(function() {
    saveData(data);
  }, [data]);

  return html`<${AppLayout}
    currentPage="calendar"
    data=${data}
    setData=${setData}
    toast=${toast}
    setToast=${setToast}
    pageContent=${html`<${CalendarPage} data=${data} />`}
  />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
