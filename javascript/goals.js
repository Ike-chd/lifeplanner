var GOAL_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: '#818cf8', icon: '🌟' },
  { value: 'career', label: 'Career', color: '#f97316', icon: '💼' },
  { value: 'health', label: 'Health', color: '#34d399', icon: '💚' },
  { value: 'finance', label: 'Finance', color: '#fbbf24', icon: '💰' },
  { value: 'education', label: 'Education', color: '#60a5fa', icon: '📚' },
  { value: 'creative', label: 'Creative', color: '#f472b6', icon: '🎨' },
  { value: 'relationship', label: 'Relationship', color: '#a78bfa', icon: '❤️' }
];

function GoalsPage({ data, setData }) {
  var t = today();
  var goals = data.goals || [];

  var _showModal = React.useState(false);
  var showModal = _showModal[0];
  var setShowModal = _showModal[1];

  var _editGoal = React.useState(null);
  var editGoal = _editGoal[0];
  var setEditGoal = _editGoal[1];

  var _form = React.useState({ name: '', target: '', saved: '', deadline: '', category: 'personal', notes: '' });
  var form = _form[0];
  var setForm = _form[1];

  var _depositGoal = React.useState(null);
  var depositGoal = _depositGoal[0];
  var setDepositGoal = _depositGoal[1];

  var _depositAmount = React.useState('');
  var depositAmount = _depositAmount[0];
  var setDepositAmount = _depositAmount[1];

  var _showCompleted = React.useState(true);
  var showCompleted = _showCompleted[0];
  var setShowCompleted = _showCompleted[1];

  var activeGoals = goals.filter(function(g) { return !g.completed; });
  var completedGoals = goals.filter(function(g) { return g.completed; });

  function openAddGoal() {
    setEditGoal(null);
    setForm({ name: '', target: '', saved: '', deadline: '', category: 'personal', notes: '' });
    setShowModal(true);
  }

  function openEditGoal(g) {
    setEditGoal(g);
    setForm({
      name: g.name,
      target: String(g.target || 0),
      saved: String(g.saved || 0),
      deadline: g.deadline || '',
      category: g.category || 'personal',
      notes: g.notes || ''
    });
    setShowModal(true);
  }

  function saveGoal() {
    if (!form.name.trim() || !form.target) return;
    var numTarget = parseFloat(form.target) || 0;
    var numSaved = parseFloat(form.saved) || 0;
    if (numSaved > numTarget) numSaved = numTarget;
    if (numTarget <= 0) return;

    setData(function(prev) {
      var goals = prev.goals || [];
      if (editGoal) {
        return Object.assign({}, prev, {
          goals: goals.map(function(g) {
            if (g.id !== editGoal.id) return g;
            var updated = Object.assign({}, g, {
              name: form.name.trim(),
              target: numTarget,
              saved: numSaved,
              deadline: form.deadline,
              category: form.category,
              notes: form.notes,
              completed: numSaved >= numTarget
            });
            return updated;
          })
        });
      } else {
        return Object.assign({}, prev, {
          goals: goals.concat([{
            id: uid(),
            name: form.name.trim(),
            target: numTarget,
            saved: numSaved,
            deadline: form.deadline,
            category: form.category,
            notes: form.notes,
            completed: numSaved >= numTarget,
            createdAt: t
          }])
        });
      }
    });
    setShowModal(false);
    setEditGoal(null);
  }

  function deleteGoal(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        goals: prev.goals.filter(function(g) { return g.id !== id; })
      });
    });
  }

  function openDeposit(g) {
    setDepositGoal(g);
    setDepositAmount('');
  }

  function confirmDeposit() {
    var amount = parseFloat(depositAmount) || 0;
    if (amount <= 0 || !depositGoal) return;

    setData(function(prev) {
      return Object.assign({}, prev, {
        goals: prev.goals.map(function(g) {
          if (g.id !== depositGoal.id) return g;
          var newSaved = Math.min(g.target, (g.saved || 0) + amount);
          return Object.assign({}, g, {
            saved: newSaved,
            completed: newSaved >= g.target
          });
        })
      });
    });
    setDepositGoal(null);
    setDepositAmount('');
  }

  function getCategoryInfo(catValue) {
    var cat = GOAL_CATEGORIES.find(function(c) { return c.value === catValue; });
    return cat || GOAL_CATEGORIES[0];
  }

  function renderGoalCard(g) {
    var cat = getCategoryInfo(g.category);
    var pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    var daysLeft = g.deadline ? daysBetween(t, g.deadline) : null;
    var isOverdue = daysLeft !== null && daysLeft < 0;
    var isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

    return React.createElement('div', {
      key: g.id,
      className: "glass rounded-2xl p-5 relative overflow-hidden group"
    },
      React.createElement('div', { className: "flex items-start justify-between mb-3" },
        React.createElement('span', {
          className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full",
          style: { background: cat.color + '20', color: cat.color }
        }, cat.icon + ' ' + cat.label),
        React.createElement('span', { className: "text-[10px] text-gray-500" }, fmtMoney(g.target))
      ),
      React.createElement('h3', { className: "text-base font-bold text-white mb-2 truncate" }, g.name),
      g.deadline ? React.createElement('div', {
        className: "flex items-center gap-1.5 mb-3 text-xs " +
          (isOverdue ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-gray-400')
      },
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
          React.createElement('polyline', { points: "12 6 12 12 16 14" })
        ),
        isOverdue ? Math.abs(daysLeft) + ' day' + (Math.abs(daysLeft) !== 1 ? 's' : '') + ' overdue' :
        daysLeft === 0 ? 'Due today' :
        daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' left'
      ) : React.createElement('div', { className: "mb-3" }),
      React.createElement('div', { className: "flex items-center justify-center mb-3" },
        React.createElement('div', { className: "relative inline-flex items-center justify-center" },
          React.createElement(ProgressRing, {
            progress: pct,
            size: 90,
            stroke: 7,
            color: pct === 100 ? '#34d399' : cat.color
          }),
          React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center" },
            React.createElement('span', { className: "text-lg font-bold text-white" }, pct + '%'),
            React.createElement('span', { className: "text-[9px] text-gray-400" }, 'progress')
          )
        )
      ),
      React.createElement('div', { className: "text-center mb-3" },
        React.createElement('p', { className: "text-sm font-semibold text-white" }, fmtMoney(g.saved) + ' / ' + fmtMoney(g.target)),
        React.createElement('p', { className: "text-[10px] text-gray-500" }, fmtMoney(g.target - g.saved) + ' remaining')
      ),
      React.createElement('div', { className: "w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-4" },
        React.createElement('div', {
          className: "h-full rounded-full transition-all duration-500",
          style: { width: pct + '%', background: pct === 100 ? '#34d399' : 'linear-gradient(90deg, ' + cat.color + ', ' + cat.color + 'cc)' }
        })
      ),
      g.notes ? React.createElement('p', { className: "text-[11px] text-gray-400 mb-3 line-clamp-2 italic" }, g.notes) : null,
      React.createElement('div', { className: "flex gap-2" },
        React.createElement(Btn, { onClick: function() { openDeposit(g); }, color: 'emerald', small: true, className: 'flex-1' },
          React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
            React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
          ),
          ' Deposit'
        ),
        React.createElement(Btn, { onClick: function() { openEditGoal(g); }, color: 'ghost', small: true },
          React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            React.createElement('path', { d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" }),
            React.createElement('path', { d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" })
          )
        ),
        React.createElement('button', {
          onClick: function() { deleteGoal(g.id); },
          className: "p-2 rounded-lg bg-dark-700 hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition"
        }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement('polyline', { points: "3 6 5 6 21 6" }),
          React.createElement('path', { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
        ))
      )
    );
  }

  function renderGoalModal() {
    return React.createElement(Modal, {
      open: showModal,
      onClose: function() { setShowModal(false); setEditGoal(null); },
      title: editGoal ? 'Edit Goal' : 'New Goal',
      wide: true
    },
      React.createElement('div', { className: "space-y-1" },
        React.createElement(Input, {
          label: 'Goal Name',
          value: form.name,
          onChange: function(v) { setForm(Object.assign({}, form, { name: v })); },
          placeholder: 'e.g. Save for vacation'
        }),
        React.createElement('div', { className: "grid grid-cols-2 gap-3" },
          React.createElement(Input, {
            label: 'Target Amount',
            value: form.target,
            onChange: function(v) { setForm(Object.assign({}, form, { target: v })); },
            type: 'number',
            placeholder: '5000'
          }),
          React.createElement(Input, {
            label: 'Already Saved',
            value: form.saved,
            onChange: function(v) { setForm(Object.assign({}, form, { saved: v })); },
            type: 'number',
            placeholder: '0'
          })
        ),
        React.createElement(Input, {
          label: 'Deadline',
          value: form.deadline,
          onChange: function(v) { setForm(Object.assign({}, form, { deadline: v })); },
          type: 'date'
        }),
        React.createElement(Select, {
          label: 'Category',
          value: form.category,
          onChange: function(v) { setForm(Object.assign({}, form, { category: v })); },
          options: GOAL_CATEGORIES.map(function(c) { return { value: c.value, label: c.icon + ' ' + c.label }; })
        }),
        React.createElement(Textarea, {
          label: 'Notes',
          value: form.notes,
          onChange: function(v) { setForm(Object.assign({}, form, { notes: v })); },
          placeholder: 'Optional notes about this goal...'
        }),
        React.createElement('div', { className: "flex gap-2 pt-2" },
          React.createElement(Btn, { onClick: function() { setShowModal(false); setEditGoal(null); }, color: 'ghost', className: 'flex-1' }, 'Cancel'),
          React.createElement(Btn, { onClick: saveGoal, color: 'accent', className: 'flex-1' }, editGoal ? 'Save Changes' : 'Add Goal')
        )
      )
    );
  }

  function renderDepositModal() {
    return React.createElement(Modal, {
      open: !!depositGoal,
      onClose: function() { setDepositGoal(null); setDepositAmount(''); },
      title: 'Deposit to ' + (depositGoal ? depositGoal.name : '')
    },
      depositGoal ? React.createElement('div', { className: "space-y-1" },
        React.createElement('div', { className: "glass rounded-xl p-3 mb-3" },
          React.createElement('div', { className: "flex justify-between text-xs text-gray-400 mb-1" },
            React.createElement('span', null, 'Current'),
            React.createElement('span', null, fmtMoney(depositGoal.saved))
          ),
          React.createElement('div', { className: "flex justify-between text-xs text-gray-400 mb-2" },
            React.createElement('span', null, 'Target'),
            React.createElement('span', null, fmtMoney(depositGoal.target))
          ),
          React.createElement('div', { className: "w-full h-1.5 bg-dark-700 rounded-full overflow-hidden" },
            React.createElement('div', {
              className: "h-full rounded-full bg-accent transition-all",
              style: { width: Math.min(100, Math.round((depositGoal.saved / depositGoal.target) * 100)) + '%' }
            })
          )
        ),
        React.createElement(Input, {
          label: 'Deposit Amount',
          value: depositAmount,
          onChange: function(v) { setDepositAmount(v); },
          type: 'number',
          placeholder: 'Enter amount'
        }),
        parseFloat(depositAmount) > 0 ? React.createElement('p', { className: "text-xs text-gray-400" },
          'New total: ', React.createElement('span', { className: "text-white font-medium" },
            fmtMoney(Math.min(depositGoal.target, (depositGoal.saved || 0) + (parseFloat(depositAmount) || 0)))
          )
        ) : null,
        React.createElement('div', { className: "flex gap-2 pt-2" },
          React.createElement(Btn, { onClick: function() { setDepositGoal(null); setDepositAmount(''); }, color: 'ghost', className: 'flex-1' }, 'Cancel'),
          React.createElement(Btn, { onClick: confirmDeposit, color: 'emerald', className: 'flex-1' }, 'Deposit')
        )
      ) : null
    );
  }

  var totalSaved = activeGoals.reduce(function(s, g) { return s + (g.saved || 0); }, 0);
  var totalTarget = activeGoals.reduce(function(s, g) { return s + (g.target || 0); }, 0);

  return React.createElement('div', { className: "space-y-5 animate-in pb-6" },
    React.createElement('div', { className: "flex items-center justify-between" },
      React.createElement('div', null,
        React.createElement('h1', { className: "text-2xl font-bold text-white" }, 'Goals'),
        React.createElement('p', { className: "text-sm text-gray-400 mt-1" }, activeGoals.length + ' active goal' + (activeGoals.length !== 1 ? 's' : '') + (totalTarget > 0 ? ' \u2022 ' + fmtMoney(totalSaved) + ' / ' + fmtMoney(totalTarget) + ' saved' : ''))
      ),
      React.createElement(Btn, { onClick: openAddGoal, color: 'accent' },
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
          React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
        ),
        ' Add Goal'
      )
    ),

    activeGoals.length === 0 && completedGoals.length === 0
      ? React.createElement('div', { className: "glass rounded-2xl p-12 text-center" },
          React.createElement('div', { className: "text-4xl mb-3" }, '🎯'),
          React.createElement('h3', { className: "text-base font-bold text-white mb-1" }, 'No goals yet'),
          React.createElement('p', { className: "text-sm text-gray-400" }, 'Set your first goal and start saving toward it!')
        )
      : null,

    activeGoals.length > 0
      ? React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          activeGoals.map(renderGoalCard)
        )
      : null,

    completedGoals.length > 0
      ? React.createElement('div', null,
          React.createElement('button', {
            onClick: function() { setShowCompleted(!showCompleted); },
            className: "flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition py-2"
          },
            React.createElement('svg', {
              xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
              className: "transition " + (showCompleted ? 'rotate-90' : '')
            },
              React.createElement('polyline', { points: "9 18 15 12 9 6" })
            ),
            'Completed Goals (' + completedGoals.length + ')'
          ),
          showCompleted ? React.createElement('div', { className: "space-y-2 mt-2" },
            completedGoals.map(function(g) {
              var cat = getCategoryInfo(g.category);
              return React.createElement('div', {
                key: g.id,
                className: "glass rounded-xl p-4 flex items-center gap-3 opacity-60"
              },
                React.createElement('span', {
                  className: "w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0",
                  style: { background: cat.color + '20' }
                }, cat.icon),
                React.createElement('div', { className: "flex-1 min-w-0" },
                  React.createElement('p', { className: "text-sm font-medium text-gray-400 line-through truncate" }, g.name),
                  React.createElement('span', { className: "text-[10px] text-gray-500" }, fmtMoney(g.target) + ' \u2022 ' + cat.label)
                ),
                React.createElement('span', { className: "text-emerald-400 shrink-0" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement('path', { d: "M22 11.08V12a10 10 0 11-5.93-9.14" }),
                  React.createElement('polyline', { points: "22 4 12 14.01 9 11.01" })
                )),
                React.createElement('button', {
                  onClick: function() { deleteGoal(g.id); },
                  className: "p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-500 hover:text-rose-400 transition shrink-0"
                }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement('polyline', { points: "3 6 5 6 21 6" }),
                  React.createElement('path', { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
                ))
              );
            })
          ) : null
        )
      : null,

    renderGoalModal(),
    renderDepositModal()
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
    currentPage: 'goals',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(GoalsPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
