function SideQuestsPage({ data, setData }) {
  var [showModal, setShowModal] = React.useState(false);
  var [newQuest, setNewQuest] = React.useState({ title: '', description: '', difficulty: 'easy', reward: '', deadline: '' });
  var [completedOpen, setCompletedOpen] = React.useState(false);

  var difficulties = [
    { value: 'easy', label: 'Easy', xp: 10, icon: '🛡️' },
    { value: 'medium', label: 'Medium', xp: 25, icon: '🗡️' },
    { value: 'hard', label: 'Hard', xp: 50, icon: '⚔️' },
    { value: 'legendary', label: 'Legendary', xp: 100, icon: '👑' }
  ];

  var questList = (data && data.sideQuests) || [];
  var activeQuests = questList.filter(function(q) { return !q.completed; });
  var completedQuests = questList.filter(function(q) { return q.completed; });

  function getDiffInfo(val) {
    for (var i = 0; i < difficulties.length; i++) {
      if (difficulties[i].value === val) return difficulties[i];
    }
    return difficulties[0];
  }

  function addQuest() {
    if (!newQuest.title.trim()) return;
    var quest = {
      id: uid(),
      title: newQuest.title.trim(),
      description: newQuest.description.trim(),
      difficulty: newQuest.difficulty,
      reward: newQuest.reward.trim(),
      deadline: newQuest.deadline || null,
      completed: false,
      createdAt: today(),
      completedAt: null
    };
    var updated = Object.assign({}, data, { sideQuests: questList.concat([quest]) });
    setData(updated);
    setNewQuest({ title: '', description: '', difficulty: 'easy', reward: '', deadline: '' });
    setShowModal(false);
  }

  function completeQuest(id) {
    var xp = 0;
    var updatedList = questList.map(function(q) {
      if (q.id === id) {
        var diff = getDiffInfo(q.difficulty);
        xp = diff.xp;
        return Object.assign({}, q, { completed: true, completedAt: today() });
      }
      return q;
    });
    var rewards = (data && data.rewards) || { points: 0, earned: [] };
    var updatedRewards = {
      points: (rewards.points || 0) + xp,
      earned: (rewards.earned || []).concat(['Quest: ' + id])
    };
    setData(Object.assign({}, data, { sideQuests: updatedList, rewards: updatedRewards }));
  }

  function deleteQuest(id) {
    var updatedList = questList.filter(function(q) { return q.id !== id; });
    setData(Object.assign({}, data, { sideQuests: updatedList }));
  }

  function renderQuestCard(quest) {
    var diff = getDiffInfo(quest.difficulty);
    var deadlineStr = quest.deadline ? quest.deadline : 'No deadline';
    var isOverdue = quest.deadline && !quest.completed && quest.deadline < today();
    return html`
      <div key=${quest.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">${diff.icon}</span>
            <div>
              <h3 className="text-white font-semibold text-lg">${quest.title}</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">${diff.label} · ${diff.xp} XP</span>
            </div>
          </div>
          <div className="flex gap-2">
            <${Btn}
              onClick=${function() { completeQuest(quest.id); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-lg"
            >✓ Complete<//>
            <${Btn}
              onClick=${function() { deleteQuest(quest.id); }}
              className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm px-3 py-1.5 rounded-lg"
            >✕<//>
          </div>
        </div>
        ${quest.description && html`<p className="text-gray-400 text-sm mb-3 ml-12">${quest.description}</p>`}
        <div className="flex items-center gap-4 ml-12 text-xs text-gray-500">
          ${quest.reward && html`<span className="text-yellow-400">🎁 ${quest.reward}</span>`}
          <span className=${isOverdue ? 'text-red-400' : ''}>📅 ${deadlineStr}</span>
        </div>
      </div>
    `;
  }

  return html`
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">⚔️ Side Quests</h1>
            <p className="text-gray-400 mt-1">Complete challenges to earn XP and unlock your self-rewards.</p>
          </div>
          <${Btn}
            onClick=${function() { setShowModal(true); }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium"
          >+ New Quest<//>
        </div>
      </div>
      ${activeQuests.length === 0 && completedQuests.length === 0 && html`
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-lg">No quests yet. Create your first side quest!</p>
          <p className="text-sm mt-1">Set challenges and reward yourself when you complete them.</p>
        </div>
      `}
      ${activeQuests.length > 0 && html`
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Active Quests (${activeQuests.length})</h2>
          <div className="space-y-4">
            ${activeQuests.map(renderQuestCard)}
          </div>
        </div>
      `}
      ${completedQuests.length > 0 && html`
        <div className="mb-8">
          <button
            onClick=${function() { setCompletedOpen(!completedOpen); }}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-lg font-semibold w-full"
          >
            <span className="transition-transform" style=${{ transform: completedOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            <span>Completed (${completedQuests.length})</span>
          </button>
          ${completedOpen && html`
            <div className="space-y-3">
              ${completedQuests.map(function(q) {
                var diff = getDiffInfo(q.difficulty);
                return html`
                  <div key=${q.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500 text-xl">✅</span>
                      <span className="text-2xl">${diff.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-gray-300 font-medium line-through">${q.title}</h3>
                        <span className="text-xs text-gray-500">${diff.label} · Completed ${q.completedAt || ''}</span>
                      </div>
                    </div>
                  </div>
                `;
              })}
            </div>
          `}
        </div>
      `}
      ${showModal && html`
        <${Modal}
          onClose=${function() { setShowModal(false); }}
          title="New Side Quest"
        >
          <div className="space-y-4">
            <${Input}
              label="Title"
              value=${newQuest.title}
              onChange=${function(v) { setNewQuest(Object.assign({}, newQuest, { title: v })); }}
              placeholder="Slay the procrastination dragon..."
            />
            <${Textarea}
              label="Description"
              value=${newQuest.description}
              onChange=${function(v) { setNewQuest(Object.assign({}, newQuest, { description: v })); }}
              placeholder="What does this quest involve?"
            />
            <${Select}
              label="Difficulty"
              value=${newQuest.difficulty}
              onChange=${function(v) { setNewQuest(Object.assign({}, newQuest, { difficulty: v })); }}
              options=${difficulties.map(function(d) { return { value: d.value, label: d.icon + ' ' + d.label + ' (' + d.xp + ' XP)' }; })}
            />
            <${Input}
              label="Self-Reward"
              value=${newQuest.reward}
              onChange=${function(v) { setNewQuest(Object.assign({}, newQuest, { reward: v })); }}
              placeholder="Treat yourself to..."
            />
            <${Input}
              label="Deadline (optional)"
              type="date"
              value=${newQuest.deadline}
              onChange=${function(v) { setNewQuest(Object.assign({}, newQuest, { deadline: v })); }}
            />
            <div className="flex justify-end gap-3 pt-2">
              <${Btn}
                onClick=${function() { setShowModal(false); }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg"
              >Cancel<//>
              <${Btn}
                onClick=${addQuest}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium"
              >Create Quest<//>
            </div>
          </div>
        <//>
      `}
    </div>
  `;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="side-quests" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${SideQuestsPage} data=${data} setData=${setData} />`} />`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
