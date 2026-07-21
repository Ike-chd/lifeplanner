var GOAL_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: '#818cf8', icon: '🌟' },
  { value: 'career', label: 'Career', color: '#f97316', icon: '💼' },
  { value: 'health', label: 'Health', color: '#34d399', icon: '💚' },
  { value: 'finance', label: 'Finance', color: '#fbbf24', icon: '💰' },
  { value: 'education', label: 'Education', color: '#60a5fa', icon: '📚' },
  { value: 'creative', label: 'Creative', color: '#f472b6', icon: '🎨' },
  { value: 'relationship', label: 'Relationship', color: '#a78bfa', icon: '❤️' }
];

var STEP_TYPES = [
  { value: 'savings', label: 'Savings Milestone', icon: '💰', color: '#fbbf24' },
  { value: 'habit', label: 'Habit', icon: '🔄', color: '#34d399' },
  { value: 'task', label: 'Task', icon: '✅', color: '#60a5fa' },
  { value: 'custom', label: 'Custom', icon: '📝', color: '#a78bfa' }
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

  var _steps = React.useState([]);
  var steps = _steps[0];
  var setSteps = _steps[1];

  var _depositGoal = React.useState(null);
  var depositGoal = _depositGoal[0];
  var setDepositGoal = _depositGoal[1];

  var _depositAmount = React.useState('');
  var depositAmount = _depositAmount[0];
  var setDepositAmount = _depositAmount[1];

  var _showCompleted = React.useState(true);
  var showCompleted = _showCompleted[0];
  var setShowCompleted = _showCompleted[1];

  var _showStepsCard = React.useState({});
  var showStepsCard = _showStepsCard[0];
  var setShowStepsCard = _showStepsCard[1];

  var _stepForm = React.useState(false);
  var showStepForm = _stepForm[0];
  var setShowStepForm = _stepForm[1];

  var _stepFormEdit = React.useState(null);
  var stepFormEdit = _stepFormEdit[0];
  var setStepFormEdit = _stepFormEdit[1];

  var _stepText = React.useState('');
  var stepText = _stepText[0];
  var setStepText = _stepText[1];

  var _stepType = React.useState('custom');
  var stepType = _stepType[0];
  var setStepType = _stepType[1];

  var _stepDueDate = React.useState('');
  var stepDueDate = _stepDueDate[0];
  var setStepDueDate = _stepDueDate[1];

  var _stepAmount = React.useState('');
  var stepAmount = _stepAmount[0];
  var setStepAmount = _stepAmount[1];

  var activeGoals = goals.filter(function(g) { return !g.completed; });
  var completedGoals = goals.filter(function(g) { return g.completed; });

  function getStepTypeInfo(typeValue) {
    var st = STEP_TYPES.find(function(s) { return s.value === typeValue; });
    return st || STEP_TYPES[3];
  }

  function getStepProgress(goal) {
    var gs = goal.steps || [];
    if (gs.length === 0) return { done: 0, total: 0, pct: 0 };
    var done = gs.filter(function(s) { return s.completed; }).length;
    return { done: done, total: gs.length, pct: Math.round((done / gs.length) * 100) };
  }

  function openAddGoal() {
    setEditGoal(null);
    setForm({ name: '', target: '', saved: '', deadline: '', category: 'personal', notes: '' });
    setSteps([]);
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
    setSteps((g.steps || []).map(function(s) { return Object.assign({}, s); }));
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
              completed: numSaved >= numTarget,
              steps: steps
            });
            return updated;
          })
        });
      } else {
        var result = Object.assign({}, prev, {
          goals: goals.concat([{
            id: uid(),
            name: form.name.trim(),
            target: numTarget,
            saved: numSaved,
            deadline: form.deadline,
            category: form.category,
            notes: form.notes,
            completed: numSaved >= numTarget,
            createdAt: t,
            steps: steps
          }])
        });
        return awardPoints(result, 5);
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
      var result = Object.assign({}, prev, {
        goals: prev.goals.map(function(g) {
          if (g.id !== depositGoal.id) return g;
          var newSaved = Math.min(g.target, (g.saved || 0) + amount);
          return Object.assign({}, g, {
            saved: newSaved,
            completed: newSaved >= g.target
          });
        })
      });
      return awardPoints(result, 5);
    });
    setDepositGoal(null);
    setDepositAmount('');
  }

  function toggleStepCompletedOnCard(goalId, stepId) {
    setData(function(prev) {
      var wasCompleted = (prev.goals || []).some(function(g) {
        return g.id === goalId && (g.steps || []).some(function(s) { return s.id === stepId && s.completed; });
      });
      var result = Object.assign({}, prev, {
        goals: (prev.goals || []).map(function(g) {
          if (g.id !== goalId) return g;
          var newSteps = (g.steps || []).map(function(s) {
            if (s.id !== stepId) return s;
            return Object.assign({}, s, { completed: !s.completed });
          });
          return Object.assign({}, g, { steps: newSteps });
        })
      });
      return wasCompleted ? result : awardPoints(result, 5);
    });
  }

  function toggleShowSteps(goalId) {
    setShowStepsCard(function(prev) {
      var next = Object.assign({}, prev);
      next[goalId] = !next[goalId];
      return next;
    });
  }

  function addStepToForm() {
    if (!stepText.trim()) return;
    var newStep = { id: uid(), text: stepText.trim(), type: stepType, completed: false };
    if (stepDueDate) newStep.dueDate = stepDueDate;
    if (stepType === 'savings' && stepAmount) newStep.targetAmount = parseFloat(stepAmount) || 0;
    if (stepFormEdit) {
      setSteps(steps.map(function(s) {
        if (s.id !== stepFormEdit.id) return s;
        return Object.assign({}, newStep, { id: s.id });
      }));
    } else {
      setSteps(steps.concat([newStep]));
    }
    resetStepForm();
  }

  function resetStepForm() {
    setShowStepForm(false);
    setStepFormEdit(null);
    setStepText('');
    setStepType('custom');
    setStepDueDate('');
    setStepAmount('');
  }

  function editStep(step) {
    setShowStepForm(true);
    setStepFormEdit(step);
    setStepText(step.text);
    setStepType(step.type || 'custom');
    setStepDueDate(step.dueDate || '');
    setStepAmount(step.targetAmount ? String(step.targetAmount) : '');
  }

  function removeStep(stepId) {
    setSteps(steps.filter(function(s) { return s.id !== stepId; }));
  }

  function moveStep(stepId, direction) {
    var idx = steps.findIndex(function(s) { return s.id === stepId; });
    if (idx < 0) return;
    var swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    var arr = steps.slice();
    var tmp = arr[idx];
    arr[idx] = arr[swapIdx];
    arr[swapIdx] = tmp;
    setSteps(arr);
  }

  function getCategoryInfo(catValue) {
    var cat = GOAL_CATEGORIES.find(function(c) { return c.value === catValue; });
    return cat || GOAL_CATEGORIES[0];
  }

  function getOverdueSteps(goal) {
    return (goal.steps || []).filter(function(s) {
      return !s.completed && s.type === 'savings' && s.dueDate && s.dueDate <= t;
    });
  }

  function renderGoalCard(g) {
    var cat = getCategoryInfo(g.category);
    var pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    var daysLeft = g.deadline ? daysBetween(t, g.deadline) : null;
    var isOverdue = daysLeft !== null && daysLeft < 0;
    var isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
    var sp = getStepProgress(g);
    var goalSteps = g.steps || [];
    var stepsVisible = !!showStepsCard[g.id];

    return html`<div key=${g.id} className="glass rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style=${{ background: cat.color + '20', color: cat.color }}>
          ${cat.icon} ${cat.label}
        </span>
        <span className="text-[10px] text-gray-500">${fmtMoney(g.target)}</span>
      </div>
      <h3 className="text-base font-bold text-white mb-2 truncate">${g.name}</h3>
      ${g.deadline ? html`<div className=${"flex items-center gap-1.5 mb-3 text-xs " + (isOverdue ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-gray-400')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        ${isOverdue ? Math.abs(daysLeft) + ' day' + (Math.abs(daysLeft) !== 1 ? 's' : '') + ' overdue' : daysLeft === 0 ? 'Due today' : daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' left'}
      </div>` : html`<div className="mb-3" />`}
      <div className="flex items-center justify-center mb-3">
        <div className="relative inline-flex items-center justify-center">
          <${ProgressRing} progress=${pct} size=${90} stroke=${7} color=${pct === 100 ? '#34d399' : cat.color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">${pct}%</span>
            <span className="text-[9px] text-gray-400">progress</span>
          </div>
        </div>
      </div>
      <div className="text-center mb-3">
        <p className="text-sm font-semibold text-white">${fmtMoney(g.saved)} / ${fmtMoney(g.target)}</p>
        <p className="text-[10px] text-gray-500">${fmtMoney(g.target - g.saved)} remaining</p>
      </div>
      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500"
          style=${{ width: pct + '%', background: pct === 100 ? '#34d399' : 'linear-gradient(90deg, ' + cat.color + ', ' + cat.color + 'cc)' }} />
      </div>
      ${sp.total > 0 ? html`
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">Steps: ${sp.done}/${sp.total} done</span>
            <span className="text-[10px] text-gray-500">${sp.pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style=${{ width: sp.pct + '%', background: sp.pct === 100 ? '#34d399' : 'linear-gradient(90deg, #a78bfa, #a78bfa)' }} />
          </div>
        </div>
      ` : null}
      ${sp.total > 0 ? html`
        <button onClick=${function() { toggleShowSteps(g.id); }}
          className="w-full text-left text-[11px] text-gray-400 hover:text-white transition mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className=${"transition " + (stepsVisible ? 'rotate-90' : '')}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
          ${stepsVisible ? 'Hide steps' : 'Show ' + sp.total + ' step' + (sp.total !== 1 ? 's' : '')}
        </button>
        ${stepsVisible ? html`<div className="space-y-1.5 mb-3">
          ${goalSteps.map(function(step) {
            var stInfo = getStepTypeInfo(step.type);
            return html`<div key=${step.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-dark-800/50">
              <button onClick=${function() { toggleStepCompletedOnCard(g.id, step.id); }}
                className=${"w-4 h-4 rounded border shrink-0 flex items-center justify-center transition " +
                  (step.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-gray-300')}>
                ${step.completed ? html`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : null}
              </button>
              <span className=${"text-[11px] flex-1 " + (step.completed ? 'text-gray-500 line-through' : 'text-gray-300')}>${step.text}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style=${{ background: stInfo.color + '20', color: stInfo.color }}>${stInfo.icon} ${stInfo.label}</span>
              ${step.dueDate ? html`<span className="text-[9px] text-gray-500 shrink-0">${step.dueDate}</span>` : null}
            </div>`;
          })}
        </div>` : null}
      ` : null}
      ${g.notes ? html`<p className="text-[11px] text-gray-400 mb-3 line-clamp-2 italic">${g.notes}</p>` : null}
      <div className="flex gap-2">
        <${Btn} onClick=${function() { openDeposit(g); }} color="emerald" small className="flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Deposit
        <//>
        <${Btn} onClick=${function() { openEditGoal(g); }} color="ghost" small>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        <//>
        <button onClick=${function() { deleteGoal(g.id); }}
          className="p-2 rounded-lg bg-dark-700 hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>`;
  }

  function renderStepForm() {
    if (!showStepForm) return null;
    return html`<div className="glass rounded-xl p-4 space-y-3 border border-accent/30">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white">${stepFormEdit ? 'Edit Step' : 'Add Step'}</h4>
        <button onClick=${resetStepForm} className="text-gray-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <${Input} label="Step Description" value=${stepText}
        onChange=${function(v) { setStepText(v); }}
        placeholder="e.g. Research insurance quotes" />
      <${Select} label="Type" value=${stepType}
        onChange=${function(v) { setStepType(v); }}
        options=${STEP_TYPES.map(function(st) { return { value: st.value, label: st.icon + ' ' + st.label }; })} />
      ${stepType === 'savings' ? html`<${Input} label="Target Amount (R)" value=${stepAmount}
        onChange=${function(v) { setStepAmount(v); }}
        type="number" placeholder="5000" />` : null}
      <${Input} label="Due Date (optional)" value=${stepDueDate}
        onChange=${function(v) { setStepDueDate(v); }}
        type="date" />
      <div className="flex gap-2">
        <${Btn} onClick=${resetStepForm} color="ghost" className="flex-1">Cancel<//>
        <${Btn} onClick=${addStepToForm} color="accent" className="flex-1">${stepFormEdit ? 'Update Step' : 'Add Step'}<//>
      </div>
    </div>`;
  }

  function renderGoalModal() {
    return html`<${Modal} open=${showModal} onClose=${function() { setShowModal(false); setEditGoal(null); resetStepForm(); }}
      title=${editGoal ? 'Edit Goal' : 'New Goal'} wide>
      <div className="space-y-1">
        <${Input} label="Goal Name" value=${form.name}
          onChange=${function(v) { setForm(Object.assign({}, form, { name: v })); }}
          placeholder="e.g. Save for vacation" />
        <div className="grid grid-cols-2 gap-3">
          <${Input} label="Target Amount" value=${form.target}
            onChange=${function(v) { setForm(Object.assign({}, form, { target: v })); }}
            type="number" placeholder="5000" />
          <${Input} label="Already Saved" value=${form.saved}
            onChange=${function(v) { setForm(Object.assign({}, form, { saved: v })); }}
            type="number" placeholder="0" />
        </div>
        <${Input} label="Deadline" value=${form.deadline}
          onChange=${function(v) { setForm(Object.assign({}, form, { deadline: v })); }}
          type="date" />
        <${Select} label="Category" value=${form.category}
          onChange=${function(v) { setForm(Object.assign({}, form, { category: v })); }}
          options=${GOAL_CATEGORIES.map(function(c) { return { value: c.value, label: c.icon + ' ' + c.label }; })} />
        <${Textarea} label="Notes" value=${form.notes}
          onChange=${function(v) { setForm(Object.assign({}, form, { notes: v })); }}
          placeholder="Optional notes about this goal..." />

        <div className="border-t border-dark-600 pt-3 mt-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Action Plan</h4>
              <p className="text-[10px] text-gray-500">${steps.length} step${steps.length !== 1 ? 's' : ''} defined</p>
            </div>
            ${!showStepForm ? html`<${Btn} onClick=${function() { setShowStepForm(true); setStepFormEdit(null); setStepText(''); setStepType('custom'); setStepDueDate(''); setStepAmount(''); }} color="accent" small>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Step
            <//>` : null}
          </div>
          ${renderStepForm()}
          ${steps.length > 0 ? html`<div className="space-y-2 mt-3">
            ${steps.map(function(step, idx) {
              var stInfo = getStepTypeInfo(step.type);
              return html`<div key=${step.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-800/60 border border-dark-600">
                <span className="text-[10px] text-gray-500 w-4 text-center shrink-0">${idx + 1}</span>
                <span className="flex-1 text-xs text-white truncate">${step.text}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style=${{ background: stInfo.color + '20', color: stInfo.color }}>${stInfo.icon} ${stInfo.label}</span>
                ${step.type === 'savings' && step.targetAmount ? html`<span className="text-[10px] text-amber-400 shrink-0">${fmtMoney(step.targetAmount)}</span>` : null}
                ${step.dueDate ? html`<span className="text-[10px] text-gray-500 shrink-0">${step.dueDate}</span>` : null}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick=${function() { moveStep(step.id, -1); }} disabled=${idx === 0}
                    className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button onClick=${function() { moveStep(step.id, 1); }} disabled=${idx === steps.length - 1}
                    className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button onClick=${function() { editStep(step); }}
                    className="p-1 rounded text-gray-500 hover:text-blue-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick=${function() { removeStep(step.id); }}
                    className="p-1 rounded text-gray-500 hover:text-rose-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>`;
            })}
          </div>` : html`<p className="text-[11px] text-gray-500 text-center py-2">No steps yet. Add an action plan to break this goal down!</p>`}
        </div>

        <div className="flex gap-2 pt-2">
          <${Btn} onClick=${function() { setShowModal(false); setEditGoal(null); resetStepForm(); }} color="ghost" className="flex-1">Cancel<//>
          <${Btn} onClick=${saveGoal} color="accent" className="flex-1">${editGoal ? 'Save Changes' : 'Add Goal'}<//>
        </div>
      </div>
    <//>`;
  }

  function renderDepositModal() {
    var overdueSteps = depositGoal ? getOverdueSteps(depositGoal) : [];
    var dueSoonSteps = depositGoal ? (depositGoal.steps || []).filter(function(s) {
      return !s.completed && s.type === 'savings' && s.dueDate && s.dueDate > t && daysBetween(t, s.dueDate) <= 7;
    }) : [];

    return html`<${Modal} open=${!!depositGoal}
      onClose=${function() { setDepositGoal(null); setDepositAmount(''); }}
      title=${'Deposit to ' + (depositGoal ? depositGoal.name : '')}>
      ${depositGoal ? html`<div className="space-y-1">
        <div className="glass rounded-xl p-3 mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Current</span>
            <span>${fmtMoney(depositGoal.saved)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Target</span>
            <span>${fmtMoney(depositGoal.target)}</span>
          </div>
          <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all"
              style=${{ width: Math.min(100, Math.round((depositGoal.saved / depositGoal.target) * 100)) + '%' }} />
          </div>
        </div>
        ${overdueSteps.length > 0 ? html`
          <div className="rounded-xl p-3 mb-3 bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs font-semibold text-rose-400 mb-2">Overdue Savings Steps</p>
            ${overdueSteps.map(function(s) {
              var overdueDays = Math.abs(daysBetween(t, s.dueDate));
              return html`<div key=${s.id} className="flex items-center gap-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-[11px] text-gray-300 flex-1">${s.text}</span>
                <span className="text-[10px] text-rose-400 shrink-0">${overdueDays}d overdue</span>
                ${s.targetAmount ? html`<span className="text-[10px] text-gray-500 shrink-0">${fmtMoney(s.targetAmount)}</span>` : null}
              </div>`;
            })}
          </div>
        ` : null}
        ${dueSoonSteps.length > 0 ? html`
          <div className="rounded-xl p-3 mb-3 bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-400 mb-2">Due Soon (within 7 days)</p>
            ${dueSoonSteps.map(function(s) {
              var daysUntil = daysBetween(t, s.dueDate);
              return html`<div key=${s.id} className="flex items-center gap-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-[11px] text-gray-300 flex-1">${s.text}</span>
                <span className="text-[10px] text-amber-400 shrink-0">${daysUntil === 0 ? 'Today' : daysUntil + 'd left'}</span>
                ${s.targetAmount ? html`<span className="text-[10px] text-gray-500 shrink-0">${fmtMoney(s.targetAmount)}</span>` : null}
              </div>`;
            })}
          </div>
        ` : null}
        <${Input} label="Deposit Amount" value=${depositAmount}
          onChange=${function(v) { setDepositAmount(v); }}
          type="number" placeholder="Enter amount" />
        ${parseFloat(depositAmount) > 0 ? html`<p className="text-xs text-gray-400">
          New total: <span className="text-white font-medium">${fmtMoney(Math.min(depositGoal.target, (depositGoal.saved || 0) + (parseFloat(depositAmount) || 0)))}</span>
        </p>` : null}
        <div className="flex gap-2 pt-2">
          <${Btn} onClick=${function() { setDepositGoal(null); setDepositAmount(''); }} color="ghost" className="flex-1">Cancel<//>
          <${Btn} onClick=${confirmDeposit} color="emerald" className="flex-1">Deposit<//>
        </div>
      </div>` : null}
    <//>`;
  }

  var totalSaved = activeGoals.reduce(function(s, g) { return s + (g.saved || 0); }, 0);
  var totalTarget = activeGoals.reduce(function(s, g) { return s + (g.target || 0); }, 0);

  return html`<div className="space-y-5 animate-in pb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Goals</h1>
        <p className="text-sm text-gray-400 mt-1">${activeGoals.length + ' active goal' + (activeGoals.length !== 1 ? 's' : '') + (totalTarget > 0 ? ' \u2022 ' + fmtMoney(totalSaved) + ' / ' + fmtMoney(totalTarget) + ' saved' : '')}</p>
      </div>
      <${Btn} onClick=${openAddGoal} color="accent">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Goal
      <//>
    </div>

    ${activeGoals.length === 0 && completedGoals.length === 0
      ? html`<div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-base font-bold text-white mb-1">No goals yet</h3>
          <p className="text-sm text-gray-400">Set your first goal and start saving toward it!</p>
        </div>`
      : null}

    ${activeGoals.length > 0
      ? html`<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${activeGoals.map(renderGoalCard)}
        </div>`
      : null}

    ${completedGoals.length > 0
      ? html`<div>
          <button onClick=${function() { setShowCompleted(!showCompleted); }}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className=${"transition " + (showCompleted ? 'rotate-90' : '')}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Completed Goals (${completedGoals.length})
          </button>
          ${showCompleted ? html`<div className="space-y-2 mt-2">
            ${completedGoals.map(function(g) {
              var cat = getCategoryInfo(g.category);
              var sp = getStepProgress(g);
              return html`<div key=${g.id} className="glass rounded-xl p-4 flex items-center gap-3 opacity-60">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                  style=${{ background: cat.color + '20' }}>${cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-400 line-through truncate">${g.name}</p>
                  <span className="text-[10px] text-gray-500">${fmtMoney(g.target)} \u2022 ${cat.label}${sp.total > 0 ? ' \u2022 ' + sp.done + '/' + sp.total + ' steps' : ''}</span>
                </div>
                <span className="text-emerald-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <button onClick=${function() { deleteGoal(g.id); }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-500 hover:text-rose-400 transition shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>`;
            })}
          </div>` : null}
        </div>`
      : null}

    ${renderGoalModal()}
    ${renderDepositModal()}
  </div>`;
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

  return html`<${AppLayout} currentPage="goals" data=${data} setData=${setData} toast=${toast} setToast=${setToast}
    pageContent=${html`<${GoalsPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
