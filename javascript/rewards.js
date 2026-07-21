function RewardsPage({ data, setData }) {
  var earned = (data.rewards && data.rewards.earned) || [];
  var points = (data.rewards && data.rewards.points) || 0;

  function claimReward(reward) {
    if (earned.indexOf(reward.id) >= 0) return;
    if (points < reward.cost) return;
    setData(function(prev) {
      var r = prev.rewards || { points: 0, earned: [] };
      return Object.assign({}, prev, {
        rewards: { points: r.points - reward.cost, earned: r.earned.concat([reward.id]) }
      });
    });
  }

  function renderCard(reward) {
    var isEarned = earned.indexOf(reward.id) >= 0;
    var canAfford = points >= reward.cost;

    var statusEl;
    if (isEarned) {
      statusEl = html`<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">✅ Earned</span>`;
    } else if (canAfford) {
      statusEl = html`<div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
          ${Icons.star} ${reward.cost + ' pts'}
        </span>
        <button
          onClick=${function() { claimReward(reward); }}
          className="text-xs font-bold text-accent hover:text-accent-light transition underline underline-offset-2 cursor-pointer"
        >Claim</button>
      </div>`;
    } else {
      statusEl = html`<span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${reward.cost + ' pts'}
      </span>`;
    }

    return html`<div
      key=${reward.id}
      className=${"glass rounded-2xl p-5 transition-all duration-200 hover:border-accent/30 " + (isEarned ? 'border-emerald-500/30 bg-emerald-500/5' : '')}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl leading-none shrink-0 mt-0.5">${reward.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">${reward.name}</h3>
          <p className="text-xs text-gray-400 mt-1">${reward.desc}</p>
          <div className="mt-3">${statusEl}</div>
        </div>
      </div>
    </div>`;
  }

  return html`<div className="space-y-6 animate-in pb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-accent">${Icons.award}</span>
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
      </div>
      <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
        <span className="text-amber-400">${Icons.star}</span>
        <span className="text-lg font-bold text-white">${points}</span>
        <span className="text-xs text-gray-400">points</span>
      </div>
    </div>
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Available Rewards</h2>
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

  return html`<${AppLayout} currentPage="rewards" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${RewardsPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
