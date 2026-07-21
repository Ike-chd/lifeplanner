function RewardsPage({ data, setData }) {
  var earned = (data.rewards && data.rewards.earned) || [];
  var unlocked = (data.rewards && data.rewards.unlocked) || [];
  var points = (data.rewards && data.rewards.points) || 0;

  function claimReward(reward) {
    if (earned.indexOf(reward.id) >= 0) return;
    if (unlocked.indexOf(reward.id) < 0) return;
    if (reward.cost > 0 && points < reward.cost) return;
    var newPoints = reward.cost > 0 ? points - reward.cost : points;
    setData(function(prev) {
      var r = prev.rewards || { points: 0, earned: [], unlocked: [] };
      var newUnlocked = r.unlocked.filter(function(id) { return id !== reward.id; });
      return Object.assign({}, prev, {
        rewards: Object.assign({}, r, {
          points: reward.cost > 0 ? r.points - reward.cost : r.points,
          earned: r.earned.concat([reward.id]),
          unlocked: newUnlocked
        })
      });
    });
  }

  function getStatus(reward) {
    if (earned.indexOf(reward.id) >= 0) return 'earned';
    if (unlocked.indexOf(reward.id) >= 0) return 'unlocked';
    return 'locked';
  }

  function renderCard(reward) {
    var status = getStatus(reward);
    var isFree = reward.cost === 0;
    var canAfford = points >= reward.cost;

    var statusEl;
    if (status === 'earned') {
      statusEl = html`<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">✅ Claimed</span>`;
    } else if (status === 'unlocked') {
      if (isFree || canAfford) {
        statusEl = html`<div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
            ${isFree ? 'FREE' : (reward.cost + ' pts')}
          </span>
          <${Btn} small color="amber" onClick=${function() { claimReward(reward); }}>Claim<//>
        </div>`;
      } else {
        statusEl = html`<div className="flex items-center gap-3">
          <span className="text-xs text-amber-400 font-semibold">Unlocked — Need ${reward.cost - points} more pts</span>
        </div>`;
      }
    } else {
      statusEl = html`<span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
        🔒 ${reward.cost + ' pts'}
      </span>`;
    }

    var borderClass = '';
    if (status === 'earned') borderClass = 'border-emerald-500/30 bg-emerald-500/5';
    else if (status === 'unlocked') borderClass = 'border-amber-500/40 bg-amber-500/5 reward-unlocked';

    return html`<div
      key=${reward.id}
      className=${"glass rounded-2xl p-5 transition-all duration-200 hover:border-accent/30 " + borderClass}
    >
      <div className="flex items-start gap-4">
        <span className=${"text-4xl leading-none shrink-0 mt-0.5 " + (status === 'locked' ? 'opacity-40 grayscale' : '')}>${reward.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className=${"text-sm font-bold " + (status === 'earned' ? 'text-emerald-300' : status === 'unlocked' ? 'text-amber-200' : 'text-gray-500')}>${reward.name}</h3>
          <p className=${"text-xs mt-1 " + (status === 'locked' ? 'text-gray-600' : 'text-gray-400')}>${reward.desc}</p>
          <div className="mt-3">${statusEl}</div>
        </div>
      </div>
    </div>`;
  }

  var sections = [
    { label: 'Ready to Claim', filter: function(r) { return unlocked.indexOf(r.id) >= 0 && earned.indexOf(r.id) < 0; } },
    { label: 'All Rewards', filter: function(r) { return true; } }
  ];

  var readyCount = REWARDS.filter(function(r) { return unlocked.indexOf(r.id) >= 0 && earned.indexOf(r.id) < 0; }).length;
  var earnedCount = earned.length;

  return html`<div className="space-y-6 animate-in pb-6">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span className="text-accent">${Icons.award}</span>
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-amber-400">${Icons.star}</span>
          <span className="text-lg font-bold text-white">${points}</span>
          <span className="text-xs text-gray-400">points</span>
        </div>
        <div className="glass rounded-xl px-3 py-2 text-xs text-gray-400">
          <span className="text-emerald-400 font-semibold">${earnedCount}</span> claimed
        </div>
        ${readyCount > 0 ? html`<div className="glass rounded-xl px-3 py-2 text-xs text-amber-400 font-semibold reward-pulse">
          🎉 ${readyCount} ready!
        </div>` : null}
      </div>
    </div>

    ${readyCount > 0 ? html`
      <div>
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">Ready to Claim (${readyCount})</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          ${REWARDS.filter(function(r) { return unlocked.indexOf(r.id) >= 0 && earned.indexOf(r.id) < 0; }).map(renderCard)}
        </div>
      </div>
    ` : null}

    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">All Rewards (${REWARDS.length})</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        ${REWARDS.map(renderCard)}
      </div>
    </div>
  </div>`;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);

  React.useEffect(function() {
    saveData(data);
  }, [data]);

  return html`<${AppLayout} currentPage="rewards" data=${data} setData=${setData} toast=${toast} setToast=${setToast} pageContent=${html`<${RewardsPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
