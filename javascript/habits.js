var HABIT_CATEGORIES = [
  { value: 'health', label: 'Health', color: '#34d399' },
  { value: 'fitness', label: 'Fitness', color: '#f97316' },
  { value: 'mind', label: 'Mind', color: '#818cf8' },
  { value: 'productivity', label: 'Productivity', color: '#fbbf24' },
  { value: 'social', label: 'Social', color: '#f472b6' },
  { value: 'finance', label: 'Finance', color: '#2dd4bf' },
  { value: 'self-care', label: 'Self-Care', color: '#a78bfa' }
];

var HABIT_COLORS = ['#818cf8','#34d399','#f97316','#fbbf24','#f472b6','#fb7185','#2dd4bf','#a78bfa','#60a5fa','#e879f9'];

var HABIT_EMOJIS = ['🏋️','🏃','🧘','📖','✍️','💊','🥗','🚶','🧠','🎯','💰','🧹','😴','💧','🌅','🎵','📝','💊','🫁','🪥','🚿','🧠','❤️','🌱'];

var CATEGORY_ICONS = {
  health: '💚', fitness: '🔥', mind: '🧠', productivity: '⚡', social: '👥', finance: '💰', 'self-care': '✨'
};

function calcStreak(habitId, habitLogs, t) {
  var streak = 0;
  var d = new Date(t + 'T00:00:00');
  while (true) {
    var key = d.toISOString().slice(0, 10);
    var log = habitLogs[key] || [];
    if (log.includes(habitId)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calcBestStreak(habitId, habitLogs) {
  var best = 0;
  var current = 0;
  var d = new Date();
  d.setDate(d.getDate() + 1);
  for (var i = 0; i < 365; i++) {
    d.setDate(d.getDate() - 1);
    var key = d.toISOString().slice(0, 10);
    var log = habitLogs[key] || [];
    if (log.includes(habitId)) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

function HabitsPage(props) {
  var data = props.data;
  var setData = props.setData;

  var _showHabitModal = React.useState(false);
  var showHabitModal = _showHabitModal[0];
  var setShowHabitModal = _showHabitModal[1];

  var _showTaskModal = React.useState(false);
  var showTaskModal = _showTaskModal[0];
  var setShowTaskModal = _showTaskModal[1];

  var _editHabit = React.useState(null);
  var editHabit = _editHabit[0];
  var setEditHabit = _editHabit[1];

  var _showCompleted = React.useState(false);
  var showCompleted = _showCompleted[0];
  var setShowCompleted = _showCompleted[1];

  var _habitForm = React.useState({ name: '', emoji: '🎯', time: '', category: 'health', color: '#818cf8' });
  var habitForm = _habitForm[0];
  var setHabitForm = _habitForm[1];

  var _taskForm = React.useState({ name: '', dueDate: today(), time: '', priority: 'medium' });
  var taskForm = _taskForm[0];
  var setTaskForm = _taskForm[1];

  var t = today();
  var habits = data.habits || [];
  var tasks = data.tasks || [];
  var moodLog = data.moodLog || {};
  var habitLogs = moodLog.habits || {};
  var todayLog = habitLogs[t] || [];

  React.useEffect(function() {
    var updated = habits.map(function(h) {
      var streak = calcStreak(h.id, habitLogs, t);
      var bestStreak = calcBestStreak(h.id, habitLogs);
      return Object.assign({}, h, { streak: streak, bestStreak: Math.max(bestStreak, h.bestStreak || 0, streak) });
    });
    var changed = updated.some(function(h, i) { return h.streak !== habits[i].streak || h.bestStreak !== habits[i].bestStreak; });
    if (changed && habits.length > 0) {
      setData(function(prev) { return Object.assign({}, prev, { habits: updated }); });
    }
  }, []);

  function openAddHabit() {
    setEditHabit(null);
    setHabitForm({ name: '', emoji: '🎯', time: '', category: 'health', color: '#818cf8' });
    setShowHabitModal(true);
  }

  function openEditHabit(h) {
    setEditHabit(h);
    setHabitForm({ name: h.name, emoji: h.emoji || '🎯', time: h.time || '', category: h.category || 'health', color: h.color || '#818cf8' });
    setShowHabitModal(true);
  }

  function saveHabit() {
    if (!habitForm.name.trim()) return;
    setData(function(prev) {
      var habits = prev.habits || [];
      if (editHabit) {
        return Object.assign({}, prev, {
          habits: habits.map(function(h) {
            return h.id === editHabit.id ? Object.assign({}, h, habitForm) : h;
          })
        });
      } else {
        return Object.assign({}, prev, {
          habits: habits.concat([Object.assign({ id: uid(), streak: 0, bestStreak: 0 }, habitForm)])
        });
      }
    });
    setShowHabitModal(false);
  }

  function deleteHabit(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        habits: prev.habits.filter(function(h) { return h.id !== id; })
      });
    });
  }

  function toggleHabitToday(id) {
    setData(function(prev) {
      var moodLog = Object.assign({}, prev.moodLog || {});
      var habitLogs = Object.assign({}, moodLog.habits || {});
      var log = (habitLogs[t] || []).slice();
      var idx = log.indexOf(id);
      if (idx >= 0) {
        log.splice(idx, 1);
      } else {
        log.push(id);
      }
      habitLogs[t] = log;
      moodLog.habits = habitLogs;
      return Object.assign({}, prev, { moodLog: moodLog });
    });
  }

  function openAddTask() {
    setTaskForm({ name: '', dueDate: today(), time: '', priority: 'medium' });
    setShowTaskModal(true);
  }

  function saveTask() {
    if (!taskForm.name.trim()) return;
    setData(function(prev) {
      return Object.assign({}, prev, {
        tasks: (prev.tasks || []).concat([Object.assign({ id: uid(), completed: false }, taskForm)])
      });
    });
    setShowTaskModal(false);
  }

  function toggleTask(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        tasks: prev.tasks.map(function(tk) {
          return tk.id === id ? Object.assign({}, tk, { completed: !tk.completed }) : tk;
        })
      });
    });
  }

  function deleteTask(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        tasks: prev.tasks.filter(function(tk) { return tk.id !== id; })
      });
    });
  }

  var pendingTasks = tasks.filter(function(tk) { return !tk.completed; })
    .sort(function(a, b) {
      var da = a.dueDate || '9999-12-31';
      var db = b.dueDate || '9999-12-31';
      if (da !== db) return da.localeCompare(db);
      var po = { high: 0, medium: 1, low: 2 };
      return (po[a.priority] || 1) - (po[b.priority] || 1);
    });

  var doneTasks = tasks.filter(function(tk) { return tk.completed; });

  var grouped = {};
  HABIT_CATEGORIES.forEach(function(c) { grouped[c.value] = []; });
  habits.forEach(function(h) {
    var cat = h.category || 'health';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(h);
  });

  var completedCount = habits.filter(function(h) { return todayLog.includes(h.id); }).length;
  var habitPct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  var priorityStyles = {
    high: 'bg-rose-500/15 text-rose-400',
    medium: 'bg-amber-500/15 text-amber-400',
    low: 'bg-emerald-500/15 text-emerald-400'
  };

  function renderHabitModal() {
    return React.createElement(Modal, {
      open: showHabitModal,
      onClose: function() { setShowHabitModal(false); },
      title: editHabit ? 'Edit Habit' : 'Add Habit',
      wide: true
    },
      React.createElement('div', { className: "space-y-1" },
        React.createElement(Input, { label: 'Habit Name', value: habitForm.name, onChange: function(v) { setHabitForm(Object.assign({}, habitForm, { name: v })); }, placeholder: 'e.g. Morning Run' }),

        React.createElement('label', { className: "block mb-3" },
          React.createElement('span', { className: "text-xs font-medium text-gray-400 mb-1 block" }, 'Icon'),
          React.createElement('div', { className: "flex flex-wrap gap-2" },
            HABIT_EMOJIS.map(function(e) {
              return React.createElement('button', {
                key: e,
                type: 'button',
                onClick: function() { setHabitForm(Object.assign({}, habitForm, { emoji: e })); },
                className: "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition " +
                  (habitForm.emoji === e ? 'bg-accent/20 ring-2 ring-accent scale-110' : 'bg-dark-700 hover:bg-dark-600')
              }, e);
            })
          )
        ),

        React.createElement(Input, { label: 'Time (optional)', value: habitForm.time, onChange: function(v) { setHabitForm(Object.assign({}, habitForm, { time: v })); }, placeholder: 'e.g. 07:00' }),

        React.createElement(Select, {
          label: 'Category',
          value: habitForm.category,
          onChange: function(v) {
            var cat = HABIT_CATEGORIES.find(function(c) { return c.value === v; });
            setHabitForm(Object.assign({}, habitForm, { category: v, color: cat ? cat.color : habitForm.color }));
          },
          options: HABIT_CATEGORIES.map(function(c) { return { value: c.value, label: c.label }; })
        }),

        React.createElement('label', { className: "block mb-4" },
          React.createElement('span', { className: "text-xs font-medium text-gray-400 mb-1 block" }, 'Color'),
          React.createElement('div', { className: "flex flex-wrap gap-2" },
            HABIT_COLORS.map(function(c) {
              return React.createElement('button', {
                key: c,
                type: 'button',
                onClick: function() { setHabitForm(Object.assign({}, habitForm, { color: c })); },
                className: "w-8 h-8 rounded-full transition " +
                  (habitForm.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800 scale-110' : 'hover:scale-110'),
                style: { background: c }
              });
            })
          )
        ),

        React.createElement('div', { className: "flex gap-2 pt-2" },
          React.createElement(Btn, { onClick: function() { setShowHabitModal(false); }, color: 'ghost', className: 'flex-1' }, 'Cancel'),
          React.createElement(Btn, { onClick: saveHabit, color: 'accent', className: 'flex-1' }, editHabit ? 'Save Changes' : 'Add Habit')
        )
      )
    );
  }

  function renderTaskModal() {
    return React.createElement(Modal, {
      open: showTaskModal,
      onClose: function() { setShowTaskModal(false); },
      title: 'Add Task'
    },
      React.createElement('div', { className: "space-y-1" },
        React.createElement(Input, { label: 'Task Title', value: taskForm.name, onChange: function(v) { setTaskForm(Object.assign({}, taskForm, { name: v })); }, placeholder: 'e.g. Buy groceries' }),
        React.createElement(Input, { label: 'Due Date', value: taskForm.dueDate, onChange: function(v) { setTaskForm(Object.assign({}, taskForm, { dueDate: v })); }, type: 'date' }),
        React.createElement(Input, { label: 'Time (optional)', value: taskForm.time, onChange: function(v) { setTaskForm(Object.assign({}, taskForm, { time: v })); }, placeholder: 'e.g. 14:00' }),
        React.createElement(Select, {
          label: 'Priority',
          value: taskForm.priority,
          onChange: function(v) { setTaskForm(Object.assign({}, taskForm, { priority: v })); },
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]
        }),
        React.createElement('div', { className: "flex gap-2 pt-2" },
          React.createElement(Btn, { onClick: function() { setShowTaskModal(false); }, color: 'ghost', className: 'flex-1' }, 'Cancel'),
          React.createElement(Btn, { onClick: saveTask, color: 'accent', className: 'flex-1' }, 'Add Task')
        )
      )
    );
  }

  function renderHabitGrid() {
    if (habits.length === 0) return null;
    return React.createElement('div', { className: "glass rounded-2xl p-5" },
      React.createElement('div', { className: "flex items-center justify-between mb-4" },
        React.createElement('h2', { className: "text-sm font-bold text-white flex items-center gap-2" },
          '⚡ Today\'s Habits'
        ),
        React.createElement('div', { className: "flex items-center gap-2" },
          React.createElement('span', { className: "text-xs text-gray-400" }, completedCount + '/' + habits.length),
          React.createElement('div', { className: "relative inline-flex items-center justify-center" },
            React.createElement(ProgressRing, { progress: habitPct, size: 40, stroke: 4, color: habitPct === 100 ? '#34d399' : '#818cf8' }),
            React.createElement('div', { className: "absolute inset-0 flex items-center justify-center" },
              React.createElement('span', { className: "text-[10px] font-bold text-white" }, habitPct + '%')
            )
          )
        )
      ),
      React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" },
        habits.map(function(h) {
          var done = todayLog.includes(h.id);
          return React.createElement('button', {
            key: h.id,
            onClick: function() { toggleHabitToday(h.id); },
            className: "relative rounded-xl p-3 text-left transition-all duration-200 group " +
              (done
                ? 'ring-2 scale-[1.02]'
                : 'bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-dark-500'),
            style: done ? { background: h.color + '18', borderColor: h.color + '60', boxShadow: '0 0 20px ' + h.color + '15' } : {}
          },
            React.createElement('div', { className: "flex items-start justify-between" },
              React.createElement('span', { className: "text-xl" }, h.emoji || '🎯'),
              done ? React.createElement('span', {
                className: "w-5 h-5 rounded-full flex items-center justify-center",
                style: { background: h.color }
              }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement('polyline', { points: "20 6 9 17 4 12" })
              )) : null
            ),
            React.createElement('p', { className: "text-xs font-semibold text-white mt-2 truncate" }, h.name),
            React.createElement('div', { className: "flex items-center gap-2 mt-1.5" },
              h.time ? React.createElement('span', { className: "text-[10px] text-gray-400 flex items-center gap-0.5" },
                React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                  React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
                  React.createElement('polyline', { points: "12 6 12 12 16 14" })
                ),
                h.time
              ) : null,
              React.createElement('span', { className: "text-[10px] flex items-center gap-0.5 " + ((h.streak || 0) > 0 ? 'text-amber-400' : 'text-gray-500') },
                '🔥 ' + (h.streak || 0)
              )
            )
          );
        })
      )
    );
  }

  function renderHabitList() {
    var hasHabits = HABIT_CATEGORIES.some(function(c) { return grouped[c.value] && grouped[c.value].length > 0; });
    if (!hasHabits) return null;
    return React.createElement('div', { className: "space-y-4" },
      HABIT_CATEGORIES.map(function(cat) {
        var catHabits = grouped[cat.value] || [];
        if (catHabits.length === 0) return null;
        return React.createElement('div', { key: cat.value, className: "glass rounded-2xl p-5" },
          React.createElement('div', { className: "flex items-center gap-2 mb-3" },
            React.createElement('span', { className: "text-sm" }, CATEGORY_ICONS[cat.value]),
            React.createElement('h3', { className: "text-sm font-bold text-white" }, cat.label),
            React.createElement('span', { className: "text-[10px] text-gray-500 bg-dark-600 px-1.5 py-0.5 rounded-full" }, catHabits.length)
          ),
          React.createElement('div', { className: "space-y-2" },
            catHabits.map(function(h) {
              var done = todayLog.includes(h.id);
              return React.createElement('div', {
                key: h.id,
                className: "flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition group"
              },
                React.createElement('div', { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { background: h.color || '#818cf8' } }),
                React.createElement('span', { className: "text-base shrink-0" }, h.emoji || '🎯'),
                React.createElement('div', { className: "flex-1 min-w-0" },
                  React.createElement('p', { className: "text-sm font-medium text-white truncate" }, h.name),
                  React.createElement('div', { className: "flex items-center gap-3 mt-0.5" },
                    h.time ? React.createElement('span', { className: "text-[10px] text-gray-400 flex items-center gap-0.5" },
                      React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                        React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
                        React.createElement('polyline', { points: "12 6 12 12 16 14" })
                      ),
                      h.time
                    ) : null,
                    React.createElement('span', { className: "text-[10px] text-gray-400" }, 'Streak: ' + (h.streak || 0)),
                    React.createElement('span', { className: "text-[10px] text-gray-500" }, 'Best: ' + (h.bestStreak || 0))
                  )
                ),
                React.createElement('div', { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" },
                  React.createElement('button', {
                    onClick: function() { openEditHabit(h); },
                    className: "p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition"
                  }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                    React.createElement('path', { d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" }),
                    React.createElement('path', { d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" })
                  )),
                  React.createElement('button', {
                    onClick: function() { deleteHabit(h.id); },
                    className: "p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition"
                  }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                    React.createElement('polyline', { points: "3 6 5 6 21 6" }),
                    React.createElement('path', { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
                  ))
                )
              );
            })
          )
        );
      })
    );
  }

  function renderTaskList() {
    return React.createElement('div', { className: "glass rounded-2xl p-5" },
      React.createElement('div', { className: "flex items-center justify-between mb-4" },
        React.createElement('h2', { className: "text-sm font-bold text-white flex items-center gap-2" },
          '📋 Tasks',
          pendingTasks.length > 0 ? React.createElement('span', { className: "text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium" }, pendingTasks.length) : null
        ),
        React.createElement(Btn, { onClick: openAddTask, color: 'accent', small: true },
          React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
            React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
          ),
          ' Add Task'
        )
      ),
      pendingTasks.length === 0 && doneTasks.length === 0
        ? React.createElement('p', { className: "text-sm text-gray-500 text-center py-6" }, 'No tasks yet. Add one to get started!')
        : null,
      React.createElement('div', { className: "space-y-2" },
        pendingTasks.map(function(tk) {
          var isOverdue = tk.dueDate && tk.dueDate < t;
          var isToday = tk.dueDate === t;
          return React.createElement('div', {
            key: tk.id,
            className: "flex items-center gap-3 p-3 rounded-xl transition " +
              (isOverdue ? 'bg-rose-500/5 border border-rose-500/10' : 'bg-dark-700/50 hover:bg-dark-700')
          },
            React.createElement('button', {
              onClick: function() { toggleTask(tk.id); },
              className: "w-5 h-5 rounded-md border-2 border-dark-500 hover:border-accent shrink-0 flex items-center justify-center transition"
            }),
            React.createElement('div', { className: "flex-1 min-w-0" },
              React.createElement('p', { className: "text-sm font-medium text-white truncate" }, tk.name),
              React.createElement('div', { className: "flex items-center gap-2 mt-0.5" },
                tk.dueDate ? React.createElement('span', { className: "text-[10px] flex items-center gap-0.5 " + (isOverdue ? 'text-rose-400' : isToday ? 'text-accent' : 'text-gray-400') },
                  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                    React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }),
                    React.createElement('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
                    React.createElement('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
                    React.createElement('line', { x1: 3, y1: 10, x2: 21, y2: 10 })
                  ),
                  isOverdue ? 'Overdue' : isToday ? 'Today' : fmt(tk.dueDate)
                ) : null,
                tk.time ? React.createElement('span', { className: "text-[10px] text-gray-400 flex items-center gap-0.5" },
                  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
                    React.createElement('polyline', { points: "12 6 12 12 16 14" })
                  ),
                  tk.time
                ) : null
              )
            ),
            tk.priority ? React.createElement('span', { className: "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 " + (priorityStyles[tk.priority] || priorityStyles.medium) }, tk.priority) : null,
            React.createElement('button', {
              onClick: function() { deleteTask(tk.id); },
              className: "p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition shrink-0 opacity-0 group-hover:opacity-100"
            }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
              React.createElement('polyline', { points: "3 6 5 6 21 6" }),
              React.createElement('path', { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
            ))
          );
        })
      ),
      doneTasks.length > 0 ? React.createElement('div', { className: "mt-3" },
        React.createElement('button', {
          onClick: function() { setShowCompleted(!showCompleted); },
          className: "flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition py-2 w-full"
        },
          React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
            className: "transition " + (showCompleted ? 'rotate-90' : '')
          },
            React.createElement('polyline', { points: "9 18 15 12 9 6" })
          ),
          'Completed (' + doneTasks.length + ')'
        ),
        showCompleted ? React.createElement('div', { className: "space-y-2 mt-2" },
          doneTasks.map(function(tk) {
            return React.createElement('div', {
              key: tk.id,
              className: "flex items-center gap-3 p-3 rounded-xl bg-dark-700/30 opacity-60"
            },
              React.createElement('button', {
                onClick: function() { toggleTask(tk.id); },
                className: "w-5 h-5 rounded-md bg-emerald-500/20 border-2 border-emerald-500 shrink-0 flex items-center justify-center transition"
              }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "#34d399", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement('polyline', { points: "20 6 9 17 4 12" })
              )),
              React.createElement('div', { className: "flex-1 min-w-0" },
                React.createElement('p', { className: "text-sm font-medium text-gray-400 truncate line-through" }, tk.name)
              ),
              React.createElement('button', {
                onClick: function() { deleteTask(tk.id); },
                className: "p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-500 hover:text-rose-400 transition shrink-0"
              }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement('polyline', { points: "3 6 5 6 21 6" }),
                React.createElement('path', { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
              ))
            );
          })
        ) : null
      ) : null
    );
  }

  return React.createElement('div', { className: "space-y-5 animate-in pb-6" },
    React.createElement('div', { className: "flex items-center justify-between" },
      React.createElement('div', null,
        React.createElement('h1', { className: "text-2xl font-bold text-white" }, 'Habits & Tasks'),
        React.createElement('p', { className: "text-sm text-gray-400 mt-1" }, fmt(t))
      ),
      React.createElement(Btn, { onClick: openAddHabit, color: 'accent' },
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
          React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
        ),
        ' Add Habit'
      )
    ),

    renderHabitGrid(),
    renderHabitList(),
    renderTaskList(),
    renderHabitModal(),
    renderTaskModal()
  );
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

  return React.createElement(AppLayout, {
    currentPage: 'habits',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(HabitsPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
