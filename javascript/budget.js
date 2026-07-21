function BudgetPage({ data, setData }) {
  var [showFixedModal, setShowFixedModal] = React.useState(false);
  var [showExtraModal, setShowExtraModal] = React.useState(false);
  var [fixedForm, setFixedForm] = React.useState({ name: '', amount: '' });
  var [extraForm, setExtraForm] = React.useState({ name: '', amount: '', date: today() });
  var [editingSalary, setEditingSalary] = React.useState(false);
  var [tempSalary, setTempSalary] = React.useState('');
  var [editingGoal, setEditingGoal] = React.useState(false);
  var [tempGoal, setTempGoal] = React.useState('');

  var budget = data.budget || { salary: 0, fixedExpenses: [], extraExpenses: [], savingsGoal: 0 };
  var profile = data.profile || { name: '', salary: 0 };
  var salary = budget.salary || profile.salary || 0;
  var fixedExpenses = budget.fixedExpenses || [];
  var extraExpenses = budget.extraExpenses || [];
  var savingsGoal = budget.savingsGoal || 0;

  var t = today();
  var currentMonth = t.slice(0, 7);
  var monthExtras = extraExpenses.filter(function(e) { return e.date && e.date.slice(0, 7) === currentMonth; });

  var totalFixed = fixedExpenses.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);
  var totalExtras = monthExtras.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);
  var totalSpent = totalFixed + totalExtras;
  var remaining = salary - totalSpent;
  var savingsRate = salary > 0 ? Math.round((Math.max(0, remaining) / salary) * 100) : 0;
  var savingsColor = savingsRate >= 20 ? '#34d399' : savingsRate >= 10 ? '#fbbf24' : '#fb7185';
  var savingsLabel = savingsRate >= 20 ? 'Healthy' : savingsRate >= 10 ? 'Moderate' : 'Low';

  function updateBudget(patch) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        budget: Object.assign({}, prev.budget || { salary: 0, fixedExpenses: [], extraExpenses: [], savingsGoal: 0 }, patch)
      });
    });
  }

  function startEditSalary() {
    setTempSalary(String(salary));
    setEditingSalary(true);
  }

  function saveSalary() {
    var val = parseFloat(tempSalary) || 0;
    updateBudget({ salary: val });
    setData(function(prev) {
      return Object.assign({}, prev, {
        profile: Object.assign({}, prev.profile || {}, { salary: val })
      });
    });
    setEditingSalary(false);
  }

  function startEditGoal() {
    setTempGoal(String(savingsGoal));
    setEditingGoal(true);
  }

  function saveGoal() {
    updateBudget({ savingsGoal: parseFloat(tempGoal) || 0 });
    setEditingGoal(false);
  }

  function addFixedExpense() {
    if (!fixedForm.name.trim() || !fixedForm.amount) return;
    updateBudget({
      fixedExpenses: fixedExpenses.concat([{ id: uid(), name: fixedForm.name.trim(), amount: parseFloat(fixedForm.amount) || 0 }])
    });
    setFixedForm({ name: '', amount: '' });
    setShowFixedModal(false);
  }

  function deleteFixedExpense(id) {
    updateBudget({
      fixedExpenses: fixedExpenses.filter(function(e) { return e.id !== id; })
    });
  }

  function addExtraExpense() {
    if (!extraForm.name.trim() || !extraForm.amount) return;
    updateBudget({
      extraExpenses: extraExpenses.concat([{ id: uid(), name: extraForm.name.trim(), amount: parseFloat(extraForm.amount) || 0, date: extraForm.date || today() }])
    });
    setExtraForm({ name: '', amount: '', date: today() });
    setShowExtraModal(false);
  }

  function deleteExtraExpense(id) {
    updateBudget({
      extraExpenses: extraExpenses.filter(function(e) { return e.id !== id; })
    });
  }

  function goalProgressPct() {
    if (savingsGoal <= 0) return 0;
    return Math.min(100, Math.round((Math.max(0, remaining) / savingsGoal) * 100));
  }

  var overviewItems = [
    { label: 'Salary', value: salary, color: '#34d399', icon: '💰' },
    { label: 'Fixed Expenses', value: totalFixed, color: '#fb7185', icon: '📋' },
    { label: 'Extra Expenses', value: totalExtras, color: '#fbbf24', icon: '🛍️' },
    { label: 'Remaining', value: remaining, color: remaining >= 0 ? '#34d399' : '#fb7185', icon: remaining >= 0 ? '✅' : '⚠️' }
  ];

  var currentMonthName = new Date(currentMonth + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return html`
    <div className="space-y-5 animate-in pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget & Salary</h1>
          <p className="text-sm text-gray-400 mt-1">${currentMonthName}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Monthly Salary</h2>
        ${editingSalary ? html`
          <div className="flex items-center gap-3">
            <input
              type="number"
              value=${tempSalary}
              onInput=${function(e) { setTempSalary(e.target.value); }}
              onKeyDown=${function(e) { if (e.key === 'Enter') saveSalary(); }}
              autoFocus
              className="flex-1 bg-dark-700 border border-accent rounded-lg px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-accent transition"
            />
            <${Btn} onClick=${saveSalary} color="emerald">Save<//>
            <${Btn} onClick=${function() { setEditingSalary(false); }} color="ghost">Cancel<//>
          </div>
        ` : html`
          <button onClick=${startEditSalary} className="flex items-center gap-3 group w-full text-left">
            <span className="text-3xl font-bold text-emerald-400">${fmtMoney(salary)}</span>
            <span className="text-xs text-gray-500 group-hover:text-accent transition flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              edit
            </span>
          </button>
        `}
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          ${overviewItems.map(function(item) {
            return html`
              <div key=${item.label} className="bg-dark-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">${item.icon}</span>
                  <span className="text-xs text-gray-400">${item.label}</span>
                </div>
                <p className="text-lg font-bold" style=${{ color: item.color }}>
                  ${fmtMoney(item.value)}
                </p>
              </div>
            `;
          })}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Savings Rate</span>
            <span className="text-xs font-bold" style=${{ color: savingsColor }}>${savingsRate}% &middot; ${savingsLabel}</span>
          </div>
          <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style=${{ width: Math.min(100, savingsRate) + '%', background: savingsColor }}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Fixed Expenses</h2>
          <${Btn} onClick=${function() { setFixedForm({ name: '', amount: '' }); setShowFixedModal(true); }} color="accent" small>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ${' '}Add
          <//>
        </div>
        ${fixedExpenses.length === 0 ? html`
          <p className="text-sm text-gray-500 text-center py-4">No fixed expenses yet. Add one to get started!</p>
        ` : html`
          <div className="space-y-2">
            ${fixedExpenses.map(function(exp) {
              return html`
                <div key=${exp.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="text-sm font-medium text-white">${exp.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-rose-400">${fmtMoney(exp.amount)}</span>
                    <button
                      onClick=${function() { deleteFixedExpense(exp.id); }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              `;
            })}
            <div className="flex items-center justify-between pt-2 border-t border-dark-600">
              <span className="text-xs font-medium text-gray-400">Total Fixed</span>
              <span className="text-sm font-bold text-rose-400">${fmtMoney(totalFixed)}</span>
            </div>
          </div>
        `}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Extra Expenses <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-medium ml-2">${currentMonthName}</span>
          </h2>
          <${Btn} onClick=${function() { setExtraForm({ name: '', amount: '', date: today() }); setShowExtraModal(true); }} color="amber" small>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ${' '}Add
          <//>
        </div>
        ${monthExtras.length === 0 ? html`
          <p className="text-sm text-gray-500 text-center py-4">No extra expenses this month.</p>
        ` : html`
          <div className="space-y-2">
            ${monthExtras.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); }).map(function(exp) {
              return html`
                <div key=${exp.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-white">${exp.name}</span>
                      <span className="text-[10px] text-gray-500 ml-2">${exp.date ? fmt(exp.date) : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-400">${fmtMoney(exp.amount)}</span>
                    <button
                      onClick=${function() { deleteExtraExpense(exp.id); }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              `;
            })}
            <div className="flex items-center justify-between pt-2 border-t border-dark-600">
              <span className="text-xs font-medium text-gray-400">Total Extra</span>
              <span className="text-sm font-bold text-amber-400">${fmtMoney(totalExtras)}</span>
            </div>
          </div>
        `}
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Monthly Savings Goal</h2>
        <div className="flex items-center justify-between mb-3">
          ${editingGoal ? html`
            <div className="flex items-center gap-2">
              <input
                type="number"
                value=${tempGoal}
                onInput=${function(e) { setTempGoal(e.target.value); }}
                onKeyDown=${function(e) { if (e.key === 'Enter') saveGoal(); }}
                autoFocus
                className="bg-dark-700 border border-accent rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none w-32"
              />
              <${Btn} onClick=${saveGoal} color="emerald" small>Save<//>
              <${Btn} onClick=${function() { setEditingGoal(false); }} color="ghost" small>Cancel<//>
            </div>
          ` : html`
            <button onClick=${startEditGoal} className="flex items-center gap-2 group">
              <span className="text-lg font-bold text-accent">${fmtMoney(savingsGoal)}</span>
              <span className="text-[10px] text-gray-500 group-hover:text-accent transition flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                edit
              </span>
            </button>
          `}
        </div>
        ${savingsGoal > 0 ? html`
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Saved: ${fmtMoney(Math.max(0, remaining))}</span>
              <span className="text-xs text-gray-400">Goal: ${fmtMoney(savingsGoal)}</span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style=${{
                  width: Math.min(100, goalProgressPct()) + '%',
                  background: remaining >= savingsGoal ? '#34d399' : remaining >= savingsGoal * 0.5 ? '#fbbf24' : '#818cf8'
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-500">${goalProgressPct()}% reached</span>
              ${remaining < savingsGoal ? html`
                <span className="text-[10px] text-amber-400">Need ${fmtMoney(savingsGoal - Math.max(0, remaining))} more to reach goal</span>
              ` : html`
                <span className="text-[10px] text-emerald-400">Goal reached!</span>
              `}
            </div>
          </div>
        ` : html`
          <p className="text-xs text-gray-500 text-center py-2">Set a savings goal to track your progress</p>
        `}
      </div>

      <${Modal}
        open=${showFixedModal}
        onClose=${function() { setShowFixedModal(false); }}
        title="Add Fixed Expense"
      >
        <div className="space-y-1">
          <${Input}
            label="Expense Name"
            value=${fixedForm.name}
            onChange=${function(v) { setFixedForm(Object.assign({}, fixedForm, { name: v })); }}
            placeholder="e.g. Rent, Utilities"
          />
          <${Input}
            label="Amount"
            type="number"
            value=${fixedForm.amount}
            onChange=${function(v) { setFixedForm(Object.assign({}, fixedForm, { amount: v })); }}
            placeholder="e.g. 500"
          />
          <div className="flex gap-2 pt-2">
            <${Btn} onClick=${function() { setShowFixedModal(false); }} color="ghost" className="flex-1">Cancel<//>
            <${Btn} onClick=${addFixedExpense} color="rose" className="flex-1">Add Expense<//>
          </div>
        </div>
      <//>

      <${Modal}
        open=${showExtraModal}
        onClose=${function() { setShowExtraModal(false); }}
        title="Add Extra Expense"
      >
        <div className="space-y-1">
          <${Input}
            label="Expense Name"
            value=${extraForm.name}
            onChange=${function(v) { setExtraForm(Object.assign({}, extraForm, { name: v })); }}
            placeholder="e.g. Coffee, Lunch out"
          />
          <${Input}
            label="Amount"
            type="number"
            value=${extraForm.amount}
            onChange=${function(v) { setExtraForm(Object.assign({}, extraForm, { amount: v })); }}
            placeholder="e.g. 15"
          />
          <${Input}
            label="Date"
            type="date"
            value=${extraForm.date}
            onChange=${function(v) { setExtraForm(Object.assign({}, extraForm, { date: v })); }}
          />
          <div className="flex gap-2 pt-2">
            <${Btn} onClick=${function() { setShowExtraModal(false); }} color="ghost" className="flex-1">Cancel<//>
            <${Btn} onClick=${addExtraExpense} color="amber" className="flex-1">Add Expense<//>
          </div>
        </div>
      <//>
    </div>
  `;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="budget" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${BudgetPage} data=${data} setData=${setData} />`} />`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
