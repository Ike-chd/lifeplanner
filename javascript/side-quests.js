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
    return React.createElement('div', { key: quest.id, className: 'bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all' },
      React.createElement('div', { className: 'flex items-start justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'text-3xl' }, diff.icon),
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-white font-semibold text-lg' }, quest.title),
            React.createElement('span', { className: 'text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300' }, diff.label + ' · ' + diff.xp + ' XP')
          )
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Btn, {
            onClick: function() { completeQuest(quest.id); },
            className: 'bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-lg',
            children: '✓ Complete'
          }),
          React.createElement(Btn, {
            onClick: function() { deleteQuest(quest.id); },
            className: 'bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm px-3 py-1.5 rounded-lg',
            children: '✕'
          })
        )
      ),
      quest.description ? React.createElement('p', { className: 'text-gray-400 text-sm mb-3 ml-12' }, quest.description) : null,
      React.createElement('div', { className: 'flex items-center gap-4 ml-12 text-xs text-gray-500' },
        quest.reward ? React.createElement('span', { className: 'text-yellow-400' }, '🎁 ' + quest.reward) : null,
        React.createElement('span', { className: isOverdue ? 'text-red-400' : '' }, '📅 ' + deadlineStr)
      )
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'mb-8' },
      React.createElement('div', { className: 'flex items-center justify-between mb-2' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-3xl font-bold text-white' }, '⚔️ Side Quests'),
          React.createElement('p', { className: 'text-gray-400 mt-1' }, 'Complete challenges to earn XP and unlock your self-rewards.')
        ),
        React.createElement(Btn, {
          onClick: function() { setShowModal(true); },
          className: 'bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium',
          children: '+ New Quest'
        })
      )
    ),
    activeQuests.length === 0 && completedQuests.length === 0
      ? React.createElement('div', { className: 'text-center py-16 text-gray-500' },
          React.createElement('div', { className: 'text-5xl mb-4' }, '🗺️'),
          React.createElement('p', { className: 'text-lg' }, 'No quests yet. Create your first side quest!'),
          React.createElement('p', { className: 'text-sm mt-1' }, 'Set challenges and reward yourself when you complete them.')
        )
      : null,
    activeQuests.length > 0
      ? React.createElement('div', { className: 'mb-8' },
          React.createElement('h2', { className: 'text-xl font-semibold text-white mb-4' }, 'Active Quests (' + activeQuests.length + ')'),
          React.createElement('div', { className: 'space-y-4' },
            activeQuests.map(renderQuestCard)
          )
        )
      : null,
    completedQuests.length > 0
      ? React.createElement('div', { className: 'mb-8' },
          React.createElement('button', {
            onClick: function() { setCompletedOpen(!completedOpen); },
            className: 'flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-lg font-semibold w-full'
          },
            React.createElement('span', { className: 'transition-transform', style: { transform: completedOpen ? 'rotate(90deg)' : 'rotate(0deg)' } }, '▶'),
            React.createElement('span', null, 'Completed (' + completedQuests.length + ')')
          ),
          completedOpen
            ? React.createElement('div', { className: 'space-y-3' },
                completedQuests.map(function(q) {
                  var diff = getDiffInfo(q.difficulty);
                  return React.createElement('div', { key: q.id, className: 'bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 opacity-70' },
                    React.createElement('div', { className: 'flex items-center gap-3' },
                      React.createElement('span', { className: 'text-emerald-500 text-xl' }, '✅'),
                      React.createElement('span', { className: 'text-2xl' }, diff.icon),
                      React.createElement('div', { className: 'flex-1' },
                        React.createElement('h3', { className: 'text-gray-300 font-medium line-through' }, q.title),
                        React.createElement('span', { className: 'text-xs text-gray-500' }, diff.label + ' · Completed ' + (q.completedAt || ''))
                      )
                    )
                  );
                })
              )
            : null
        )
      : null,
    showModal
      ? React.createElement(Modal, {
          onClose: function() { setShowModal(false); },
          title: 'New Side Quest',
          children: React.createElement('div', { className: 'space-y-4' },
            React.createElement(Input, {
              label: 'Title',
              value: newQuest.title,
              onChange: function(v) { setNewQuest(Object.assign({}, newQuest, { title: v })); },
              placeholder: 'Slay the procrastination dragon...'
            }),
            React.createElement(Textarea, {
              label: 'Description',
              value: newQuest.description,
              onChange: function(v) { setNewQuest(Object.assign({}, newQuest, { description: v })); },
              placeholder: 'What does this quest involve?'
            }),
            React.createElement(Select, {
              label: 'Difficulty',
              value: newQuest.difficulty,
              onChange: function(v) { setNewQuest(Object.assign({}, newQuest, { difficulty: v })); },
              options: difficulties.map(function(d) { return { value: d.value, label: d.icon + ' ' + d.label + ' (' + d.xp + ' XP)' }; })
            }),
            React.createElement(Input, {
              label: 'Self-Reward',
              value: newQuest.reward,
              onChange: function(v) { setNewQuest(Object.assign({}, newQuest, { reward: v })); },
              placeholder: 'Treat yourself to...'
            }),
            React.createElement(Input, {
              label: 'Deadline (optional)',
              type: 'date',
              value: newQuest.deadline,
              onChange: function(v) { setNewQuest(Object.assign({}, newQuest, { deadline: v })); }
            }),
            React.createElement('div', { className: 'flex justify-end gap-3 pt-2' },
              React.createElement(Btn, {
                onClick: function() { setShowModal(false); },
                className: 'bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg',
                children: 'Cancel'
              }),
              React.createElement(Btn, {
                onClick: addQuest,
                className: 'bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium',
                children: 'Create Quest'
              })
            )
          )
        })
      : null
  );
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'quests',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(SideQuestsPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
