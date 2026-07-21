function DashboardPage({ data }) {
  var t = today();
  var weekDates = getWeekDates();
  var profile = data.profile || {};
  var habits = data.habits || [];
  var tasks = data.tasks || [];
  var goals = data.goals || [];
  var nutrition = data.nutrition || {};
  var budget = data.budget || {};
  var rewards = data.rewards || { points: 0, earned: [] };
  var moodLog = data.moodLog || {};

  var habitLogs = moodLog.habits || {};
  var todayLog = habitLogs[t] || [];
  var completedToday = habits.filter(function(h) { return todayLog.includes(h.id); }).length;
  var habitPct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  var bestStreak = habits.reduce(function(max, h) { return Math.max(max, h.streak || 0); }, 0);

  var waterToday = (nutrition.waterLog || {})[t] || 0;
  var waterTarget = nutrition.waterTarget || 8;
  var waterPct = Math.min(100, Math.round((waterToday / waterTarget) * 100));

  var totalSaved = budget.fixedExpenses ? budget.salary - budget.fixedExpenses.reduce(function(s, e) { return s + (e.amount || 0); }, 0) : 0;
  if (budget.extraExpenses) {
    totalSaved -= budget.extraExpenses.reduce(function(s, e) { return s + (e.amount || 0); }, 0);
  }
  totalSaved = Math.max(0, totalSaved);

  var nextUp = null;
  var upcomingTasks = tasks.filter(function(tk) { return !tk.completed && tk.dueDate >= t; })
    .sort(function(a, b) { return (a.dueDate || '').localeCompare(b.dueDate || ''); });

  var incompleteHabits = habits.filter(function(h) { return !todayLog.includes(h.id); });

  if (incompleteHabits.length > 0) {
    nextUp = { type: 'habit', name: incompleteHabits[0].name, time: incompleteHabits[0].time || 'Anytime', icon: '🔥' };
  } else if (upcomingTasks.length > 0) {
    var tk = upcomingTasks[0];
    nextUp = { type: 'task', name: tk.name, time: fmt(tk.dueDate), icon: '📋' };
  }

  var weeklyPcts = weekDates.map(function(d) {
    var log = habitLogs[d] || [];
    return habits.length > 0 ? Math.round((habits.filter(function(h) { return log.includes(h.id); }).length / habits.length) * 100) : 0;
  });

  var activeGoals = goals.filter(function(g) { return !g.completed; }).slice(0, 4);

  var daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  var greeting = 'Good evening';
  var hr = new Date().getHours();
  if (hr < 12) greeting = 'Good morning';
  else if (hr < 17) greeting = 'Good afternoon';

  var greetingEmoji = hr < 12 ? '🌅' : hr < 17 ? '☀️' : '🌙';

  var statCardStyle = "glass rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden group hover:border-accent/30 transition-all duration-300";

  return (
    <div className="space-y-5 animate-in pb-6">
      <div className="glass rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
              <span>{greetingEmoji}</span> {fmt(t)}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {greeting}{profile.name ? ', ' + profile.name : ''}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {habits.length === 0 && tasks.length === 0
                ? "Let's get started — add some habits or tasks!"
                : completedToday === habits.length && habits.length > 0
                  ? 'All habits done! Crushing it today! 💪'
                  : habits.length - completedToday + ' habit' + (habits.length - completedToday !== 1 ? 's' : '') + ' remaining today'}
            </p>
          </div>
          <div className="hidden sm:block text-right shrink-0">
            <div className="relative inline-flex items-center justify-center">
              <ProgressRing progress={habitPct} size={72} stroke={5} color="#818cf8" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white leading-none">{habitPct}%</span>
                <span className="text-[9px] text-gray-400">done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nextUp && (
        <div className="glass rounded-2xl p-4 border-l-4 border-accent flex items-center gap-4">
          <div className="text-2xl w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            {nextUp.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">Next Up</p>
            <p className="text-sm font-semibold text-white truncate">{nextUp.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
              {Icons.clock}
              <span>{nextUp.time}</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={statCardStyle}>
          <div className="relative inline-flex items-center justify-center">
            <ProgressRing progress={habitPct} size={56} stroke={4} color="#818cf8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-white">{completedToday}/{habits.length}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Habits Today</p>
        </div>

        <div className={statCardStyle}>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white leading-none">{bestStreak}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Best Streak</p>
          </div>
        </div>

        <div className={statCardStyle}>
          <div className="w-full px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm">💧</span>
              <span className="text-xs font-bold text-white">{waterToday}/{waterTarget}</span>
            </div>
            <div className="w-full h-2.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: waterPct + '%',
                  background: waterPct >= 100
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : 'linear-gradient(90deg, #60a5fa, #3b82f6)'
                }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Water Intake</p>
        </div>

        <div className={statCardStyle}>
          <div className="text-center">
            <p className="text-xl font-bold text-white leading-none">{fmtMoney(totalSaved)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[10px]">⭐</span>
              <span className="text-xs text-amber-400 font-semibold">{rewards.points || 0} pts</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Saved + Rewards</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            📊 Weekly Habit Completion
          </h2>
          <span className="text-[10px] text-gray-500">
            Week of {fmt(weekDates[0])}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {weeklyPcts.map(function(pct, i) {
            var isToday = weekDates[i] === t;
            return (
              <div key={weekDates[i]} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium" style={{ color: pct > 0 ? '#818cf8' : '#475569' }}>
                  {pct}%
                </span>
                <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: Math.max(4, (pct / 100) * 90) + 'px' }}>
                  <div
                    className="absolute inset-0 rounded-t-lg transition-all duration-500"
                    style={{
                      background: isToday
                        ? 'linear-gradient(180deg, #818cf8, #6366f1)'
                        : pct > 0
                          ? 'linear-gradient(180deg, rgba(129,140,248,0.6), rgba(99,102,241,0.4))'
                          : 'rgba(30,41,59,0.8)'
                    }}
                  />
                  {isToday && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                  )}
                </div>
                <span className={"text-[10px] font-medium " + (isToday ? 'text-accent' : 'text-gray-500')}>
                  {daysOfWeek[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {activeGoals.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              🎯 Active Goals
            </h2>
            <span className="text-[10px] text-gray-500">{activeGoals.length} active</span>
          </div>
          <div className="space-y-3">
            {activeGoals.map(function(goal) {
              var pct = goal.target > 0 ? Math.min(100, Math.round(((goal.current || 0) / goal.target) * 100)) : 0;
              var daysLeft = goal.deadline ? daysBetween(t, goal.deadline) : null;
              var urgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
              return (
                <div key={goal.id} className="bg-dark-700/50 rounded-xl p-3 hover:bg-dark-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{goal.icon || '🎯'}</span>
                      <span className="text-sm font-semibold text-white truncate">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {daysLeft !== null && (
                        <span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " +
                          (daysLeft < 0 ? 'bg-rose-500/15 text-rose-400' :
                           urgent ? 'bg-amber-500/15 text-amber-400' :
                           'bg-dark-600 text-gray-400')
                        }>
                          {daysLeft < 0 ? Math.abs(daysLeft) + 'd overdue' : daysLeft + 'd left'}
                        </span>
                      )}
                      <span className="text-xs font-bold text-accent">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: pct + '%',
                        background: pct >= 100
                          ? 'linear-gradient(90deg, #34d399, #10b981)'
                          : pct >= 60
                            ? 'linear-gradient(90deg, #818cf8, #6366f1)'
                            : 'linear-gradient(90deg, #f59e0b, #f97316)'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-gray-500">{fmtMoney(goal.current || 0)} / {fmtMoney(goal.target)}</span>
                    {goal.category && (
                      <span className="text-[10px] text-gray-500 bg-dark-600 px-1.5 py-0.5 rounded">{goal.category}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcomingTasks.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              📋 Upcoming Tasks
            </h2>
            <span className="text-[10px] text-gray-500">{upcomingTasks.length} remaining</span>
          </div>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 5).map(function(task) {
              var isOverdue = task.dueDate < t;
              var isDueToday = task.dueDate === t;
              var priorityColors = {
                high: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
                medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
                low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
              };
              return (
                <div key={task.id} className={"flex items-center gap-3 p-3 rounded-xl transition " + (isOverdue ? 'bg-rose-500/5 border border-rose-500/10' : 'bg-dark-700/50 hover:bg-dark-700')}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{
                    background: isOverdue ? '#f43f5e' : isDueToday ? '#818cf8' : '#475569'
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={"text-[10px] font-medium " + (isOverdue ? 'text-rose-400' : isDueToday ? 'text-accent' : 'text-gray-500')}>
                        {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : fmt(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  {task.priority && (
                    <span className={"text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 " + (priorityColors[task.priority] || priorityColors.low)}>
                      {task.priority}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              🏆 Goal Progress Overview
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {goals.slice(0, 6).map(function(goal) {
              var pct = goal.target > 0 ? Math.min(100, Math.round(((goal.current || 0) / goal.target) * 100)) : 0;
              var ringColor = goal.completed ? '#10b981' : pct >= 75 ? '#818cf8' : pct >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={goal.id} className="flex flex-col items-center gap-2 w-28">
                  <div className="relative inline-flex items-center justify-center">
                    <ProgressRing progress={goal.completed ? 100 : pct} size={80} stroke={5} color={ringColor} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-white leading-none">
                        {goal.completed ? '✓' : pct + '%'}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white truncate w-full">{goal.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{fmtMoney(goal.current || 0)} / {fmtMoney(goal.target)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {habits.length === 0 && tasks.length === 0 && goals.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-bold text-white mb-2">Welcome to Life OS!</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Start by adding habits, tasks, or goals from their respective pages. Your dashboard will come alive with data!
          </p>
        </div>
      )}
    </div>
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
    currentPage: 'dashboard',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(DashboardPage, { data: data })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));