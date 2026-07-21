/* ═══════════════════════════════════════
   Life OS — Data Store & Utilities
   ═══════════════════════════════════════ */

var LIFEOS_KEY = 'lifeos_data';

var months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtMoney(n) {
  return 'R' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function daysBetween(a, b) {
  return Math.ceil((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

function getWeekDates() {
  var d = new Date();
  var day = d.getDay();
  var mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, function(_, i) {
    var dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return dt.toISOString().slice(0, 10);
  });
}

function defaultData() {
  return {
    profile: { name: '', salary: 0, payday: 1 },
    habits: [],
    tasks: [],
    nutrition: { meals: [], waterTarget: 8, waterLog: {} },
    budget: { salary: 0, fixedExpenses: [], extraExpenses: [], savingsGoal: 0, savings: { balance: 0, log: [] } },
    goals: [],
    vacations: [],
    sideQuests: [],
    tryList: [],
    rewards: { points: 0, earned: [], unlocked: [] },
    journal: [],
    readings: [],
    moodLog: {},
    visionBoard: [],
    weeklyReview: []
  };
}

function loadData() {
  try {
    var d = localStorage.getItem(LIFEOS_KEY);
    if (d) {
      var parsed = JSON.parse(d);
      var base = defaultData();
      for (var key in base) {
        if (!(key in parsed)) parsed[key] = base[key];
      }
      return parsed;
    }
    return defaultData();
  } catch (e) {
    return defaultData();
  }
}

function saveData(d) {
  localStorage.setItem(LIFEOS_KEY, JSON.stringify(d));
}

/* ─── Reward Definitions ─── */

var REWARDS = [
  // ═══════════════ STREAKS ═══════════════
  { id: 'streak3',        name: 'Bronze Warrior',      desc: '3-day streak on any habit',              icon: '🥉', cost: 30,   checkFn: 'streak3' },
  { id: 'streak7',        name: 'Silver Champion',      desc: '7-day streak on any habit',              icon: '🥈', cost: 75,   checkFn: 'streak7' },
  { id: 'streak14',       name: 'Gold Master',          desc: '14-day streak on any habit',             icon: '🥇', cost: 150,  checkFn: 'streak14' },
  { id: 'streak30',       name: 'Diamond Legend',       desc: '30-day streak on any habit',             icon: '💎', cost: 300,  checkFn: 'streak30' },
  { id: 'streak60',       name: 'Obsidian Titan',       desc: '60-day streak on any habit',             icon: '🪨', cost: 500,  checkFn: 'streak60' },
  { id: 'streak90',       name: 'Mythic Overlord',      desc: '90-day streak on any habit',             icon: '🐉', cost: 750,  checkFn: 'streak90' },
  { id: 'streak180',      name: 'Eternal Flame',        desc: '180-day streak on any habit',            icon: '🌋', cost: 1200, checkFn: 'streak180' },
  { id: 'streak365',      name: 'Immortal Phoenix',     desc: '365-day streak on any habit',            icon: '🔥', cost: 2000, checkFn: 'streak365' },

  // ═══════════════ PERFECT DAYS ═══════════════
  { id: 'allHabits',      name: 'Perfect Day',          desc: 'Complete all habits in a day',           icon: '⭐', cost: 50,   checkFn: 'allHabits' },
  { id: 'perfectWeek',    name: 'Flawless Week',        desc: 'Complete all habits for 7 days straight', icon: '🌟', cost: 250,  checkFn: 'perfectWeek' },
  { id: 'perfectMonth',   name: 'Perfect Month',        desc: 'Complete all habits for 30 days straight', icon: '✨', cost: 800,  checkFn: 'perfectMonth' },
  { id: 'doublePerfect',  name: 'Double Dip',           desc: 'Complete all habits twice in one week',  icon: '👯', cost: 120,  checkFn: 'doublePerfect' },

  // ═══════════════ TASKS ═══════════════
  { id: 'firstTask',      name: 'First Blood',          desc: 'Complete your first task',               icon: '🎯', cost: 20,   checkFn: 'firstTask' },
  { id: 'taskSlayer',     name: 'Task Slayer',          desc: 'Complete 10 tasks',                      icon: '⚔️', cost: 60,   checkFn: 'taskSlayer' },
  { id: 'taskDestroyer',  name: 'Task Destroyer',       desc: 'Complete 50 tasks',                      icon: '🗡️', cost: 150,  checkFn: 'taskDestroyer' },
  { id: 'taskAnnihilator',name: 'Task Annihilator',     desc: 'Complete 100 tasks',                     icon: '💀', cost: 350,  checkFn: 'taskAnnihilator' },
  { id: 'taskGod',        name: 'Task God',             desc: 'Complete 500 tasks',                     icon: '👑', cost: 1000, checkFn: 'taskGod' },
  { id: 'zeroInbox',      name: 'Zero Inbox',           desc: 'Complete all tasks in a day',            icon: '✅', cost: 80,   checkFn: 'zeroInbox' },
  { id: 'highPriority',   name: 'Priority Master',      desc: 'Complete 10 high-priority tasks',        icon: '🔴', cost: 100,  checkFn: 'highPriority' },

  // ═══════════════ HYDRATION ═══════════════
  { id: 'hydration5',     name: 'Hydration Hero',       desc: 'Hit water goal for 5 days',              icon: '💧', cost: 60,   checkFn: 'hydration5' },
  { id: 'hydration10',    name: 'Water Elemental',      desc: 'Hit water goal for 10 days',             icon: '🌊', cost: 120,  checkFn: 'hydration10' },
  { id: 'hydration30',    name: 'Ocean Master',         desc: 'Hit water goal for 30 days',             icon: '🐋', cost: 300,  checkFn: 'hydration30' },
  { id: 'hydration60',    name: 'Tsunami Lord',         desc: 'Hit water goal for 60 days',             icon: '🌀', cost: 600,  checkFn: 'hydration60' },
  { id: 'megaWater',      name: 'Mega Splash',          desc: 'Drink 15+ glasses in one day',           icon: '💦', cost: 40,   checkFn: 'megaWater' },

  // ═══════════════ NUTRITION ═══════════════
  { id: 'firstMeal',      name: 'Food Logger',          desc: 'Log your first meal',                    icon: '🍽️', cost: 20,  checkFn: 'firstMeal' },
  { id: 'mealTracker',    name: 'Meal Tracker',         desc: 'Log 10 meals',                           icon: '📋', cost: 50,   checkFn: 'mealTracker' },
  { id: 'mealMaster',     name: 'Meal Master',          desc: 'Log 50 meals',                           icon: '👨‍🍳', cost: 150, checkFn: 'mealMaster' },
  { id: 'mealLegend',     name: 'Meal Legend',          desc: 'Log 100 meals',                          icon: '🏆', cost: 350,  checkFn: 'mealLegend' },
  { id: 'threeMeals',     name: 'Full House',           desc: 'Log 3 meals in one day',                 icon: '🥪', cost: 30,   checkFn: 'threeMeals' },
  { id: 'calorieAware',   name: 'Calorie Conscious',    desc: 'Log calorie counts for 10 meals',        icon: '🔢', cost: 60,   checkFn: 'calorieAware' },

  // ═══════════════ BUDGET & SAVINGS ═══════════════
  { id: 'saver100',       name: 'Money Saver',          desc: 'Save R100 toward any goal',              icon: '💰', cost: 40,   checkFn: 'saver100' },
  { id: 'saver500',       name: 'Savings Starter',      desc: 'Save R500 toward any goal',              icon: '🏦', cost: 80,   checkFn: 'saver500' },
  { id: 'saver1000',      name: 'Savings Pro',          desc: 'Save R1,000 toward any goal',            icon: '📈', cost: 150,  checkFn: 'saver1000' },
  { id: 'saver5000',      name: 'Savings Legend',       desc: 'Save R5,000 toward any goal',            icon: '🤑', cost: 350,  checkFn: 'saver5000' },
  { id: 'saver10000',     name: 'Wealth Builder',       desc: 'Save R10,000 toward any goal',           icon: '🏠', cost: 600,  checkFn: 'saver10000' },
  { id: 'saver50000',     name: 'Financial Titan',      desc: 'Save R50,000 toward any goal',           icon: '🚀', cost: 1500, checkFn: 'saver50000' },
  { id: 'firstExpense',   name: 'Expense Tracker',      desc: 'Log your first expense',                 icon: '🧾', cost: 20,   checkFn: 'firstExpense' },
  { id: 'expense10',      name: 'Receipt Collector',    desc: 'Log 10 expenses',                        icon: '📝', cost: 50,   checkFn: 'expense10' },
  { id: 'budgetWeek',     name: 'Budget Boss',          desc: 'Stay under budget for a full week',      icon: '🎩', cost: 200,  checkFn: 'budgetWeek' },
  { id: 'firstDeposit',   name: 'First Deposit',        desc: 'Make your first goal deposit',           icon: '🪙', cost: 30,   checkFn: 'firstDeposit' },
  { id: 'deposit10',      name: 'Regular Saver',        desc: 'Make 10 deposits toward goals',          icon: '🏧', cost: 100,  checkFn: 'deposit10' },

  // ═══════════════ GOALS ═══════════════
  { id: 'firstGoal',      name: 'Goal Getter',          desc: 'Complete your first goal',               icon: '🎯', cost: 100,  checkFn: 'firstGoal' },
  { id: 'goalCollector',  name: 'Goal Collector',       desc: 'Complete 3 goals',                       icon: '🎪', cost: 200,  checkFn: 'goalCollector' },
  { id: 'goalCrusher',    name: 'Goal Crusher',         desc: 'Complete 5 goals',                       icon: '💪', cost: 400,  checkFn: 'goalCrusher' },
  { id: 'goalLegend',     name: 'Goal Legend',          desc: 'Complete 10 goals',                      icon: '🏔️', cost: 800,  checkFn: 'goalLegend' },
  { id: 'goalOverlord',   name: 'Goal Overlord',        desc: 'Complete 25 goals',                      icon: '🔱', cost: 2000, checkFn: 'goalOverlord' },
  { id: 'firstStep',      name: 'Step Forward',         desc: 'Complete your first goal step',          icon: '👣', cost: 30,   checkFn: 'firstStep' },
  { id: 'stepMaster',     name: 'Step Master',          desc: 'Complete all steps on a goal',           icon: '🗺️', cost: 120,  checkFn: 'stepMaster' },
  { id: 'stepLegend',     name: 'Step Legend',          desc: 'Complete 20 goal steps total',           icon: '🧭', cost: 300,  checkFn: 'stepLegend' },
  { id: 'goalPlanner',    name: 'Goal Planner',         desc: 'Create 5 goals',                         icon: '📋', cost: 40,   checkFn: 'goalPlanner' },
  { id: 'goalOrganizer',  name: 'Goal Organizer',       desc: 'Create 10 goals',                        icon: '🗂️', cost: 80,   checkFn: 'goalOrganizer' },
  { id: 'savingsGoal',    name: 'Savings Champion',     desc: 'Complete a finance goal',                icon: '🤑', cost: 150,  checkFn: 'savingsGoal' },

  // ═══════════════ VACATIONS ═══════════════
  { id: 'wanderlust',     name: 'Wanderlust',           desc: 'Plan your first vacation',               icon: '🗺️', cost: 50,   checkFn: 'wanderlust' },
  { id: 'planner',        name: 'Trip Planner',         desc: 'Plan 3 vacations',                       icon: '✈️', cost: 120,  checkFn: 'planner' },
  { id: 'vacationSave',   name: 'Holiday Fund',         desc: 'Save toward a vacation',                 icon: '🏖️', cost: 60,   checkFn: 'vacationSave' },
  { id: 'vacationReady',  name: 'Packing Ready',        desc: 'Fully save for a vacation',              icon: '🧳', cost: 200,  checkFn: 'vacationReady' },
  { id: 'vacationGo',     name: 'Globe Trotter',        desc: 'Go on a vacation (completed)',           icon: '🌍', cost: 400,  checkFn: 'vacationGo' },
  { id: 'jetSetter',      name: 'Jet Setter',           desc: 'Complete 3 vacations',                   icon: '🛫', cost: 800,  checkFn: 'jetSetter' },

  // ═══════════════ SIDE QUESTS ═══════════════
  { id: 'firstQuest',     name: 'Quest Master',         desc: 'Complete a side quest',                  icon: '⚔️', cost: 80,   checkFn: 'firstQuest' },
  { id: 'questHero',      name: 'Quest Hero',           desc: 'Complete 5 side quests',                 icon: '🦸', cost: 200,  checkFn: 'questHero' },
  { id: 'questLegend',    name: 'Quest Legend',          desc: 'Complete 10 side quests',                icon: '🏆', cost: 500,  checkFn: 'questLegend' },
  { id: 'questHunter',    name: 'Quest Hunter',         desc: 'Complete 25 side quests',                icon: '🏹', cost: 1000, checkFn: 'questHunter' },
  { id: 'firstXp',        name: 'XP Gainer',            desc: 'Earn your first XP from a quest',        icon: '⬆️', cost: 30,   checkFn: 'firstXp' },
  { id: 'xp1000',         name: 'XP Accumulator',       desc: 'Earn 1,000 XP total from quests',        icon: '⚡', cost: 150,  checkFn: 'xp1000' },
  { id: 'xp5000',         name: 'XP Master',            desc: 'Earn 5,000 XP total from quests',        icon: '🔮', cost: 500,  checkFn: 'xp5000' },
  { id: 'difficultyHard', name: 'Hardcore Hero',        desc: 'Complete a hard-difficulty quest',        icon: '😈', cost: 100,  checkFn: 'difficultyHard' },
  { id: 'difficultyEpic', name: 'Epic Conqueror',       desc: 'Complete an epic-difficulty quest',       icon: '👹', cost: 200,  checkFn: 'difficultyEpic' },

  // ═══════════════ TRY LIST ═══════════════
  { id: 'braveSoul',      name: 'Brave Soul',           desc: 'Try your first experience',              icon: '🦁', cost: 30,   checkFn: 'braveSoul' },
  { id: 'adventureSeeker',name: 'Adventure Seeker',     desc: 'Try 5 experiences',                      icon: '🗺️', cost: 80,   checkFn: 'adventureSeeker' },
  { id: 'experienceMaster',name: 'Experience Master',   desc: 'Try 10 experiences',                     icon: '🎖️', cost: 180,  checkFn: 'experienceMaster' },
  { id: 'experienceGod',  name: 'Experience God',       desc: 'Try 25 experiences',                     icon: '🏅', cost: 400,  checkFn: 'experienceGod' },
  { id: 'firstFree',      name: 'Free Spirit',          desc: 'Try a free experience',                  icon: '🆓', cost: 25,   checkFn: 'firstFree' },
  { id: 'bigSpender',     name: 'Big Spender',          desc: 'Try an experience over R500',            icon: '💸', cost: 60,   checkFn: 'bigSpender' },
  { id: 'variety',        name: 'Jack of All Trades',   desc: 'Try experiences in 5 different categories', icon: '🎲', cost: 150, checkFn: 'variety' },

  // ═══════════════ JOURNAL ═══════════════
  { id: 'firstJournal',   name: 'First Words',          desc: 'Write your first journal entry',         icon: '📖', cost: 25,   checkFn: 'firstJournal' },
  { id: 'journal7',       name: 'Storyteller',          desc: 'Write 7 journal entries',                icon: '✍️', cost: 60,   checkFn: 'journal7' },
  { id: 'journal30',      name: 'Chronicle Keeper',     desc: 'Write 30 journal entries',               icon: '📚', cost: 200,  checkFn: 'journal30' },
  { id: 'journal100',     name: 'Novelist',             desc: 'Write 100 journal entries',              icon: '🎓', cost: 500,  checkFn: 'journal100' },
  { id: 'tagMaster',      name: 'Tag Master',           desc: 'Use tags on 10 journal entries',         icon: '🏷️', cost: 50,  checkFn: 'tagMaster' },
  { id: 'longEntry',      name: 'Deep Thinker',         desc: 'Write a journal entry over 500 characters', icon: '🧠', cost: 40, checkFn: 'longEntry' },
  { id: 'titledEntry',    name: 'Headline Writer',      desc: 'Write 5 titled journal entries',         icon: '📰', cost: 40,   checkFn: 'titledEntry' },
  { id: 'moodJourney',    name: 'Mood Historian',       desc: 'Journal about all 5 mood types',         icon: '🎭', cost: 100,  checkFn: 'moodJourney' },

  // ═══════════════ READING ═══════════════
  { id: 'firstRead',      name: 'Bookworm',             desc: 'Add your first reading item',            icon: '🐛', cost: 25,   checkFn: 'firstRead' },
  { id: 'reader5',        name: 'Scholar',              desc: 'Add 5 reading items',                    icon: '🎓', cost: 60,   checkFn: 'reader5' },
  { id: 'reader10',       name: 'Library Legend',        desc: 'Add 10 reading items',                   icon: '🏛️', cost: 150,  checkFn: 'reader10' },
  { id: 'reader25',       name: 'Knowledge Seeker',     desc: 'Add 25 reading items',                   icon: '🧠', cost: 400,  checkFn: 'reader25' },
  { id: 'pageTurner',     name: 'Page Turner',          desc: 'Finish a book (100% progress)',           icon: '📕', cost: 80,   checkFn: 'pageTurner' },
  { id: 'bookworm10',     name: 'Voracious Reader',     desc: 'Finish 10 reading items',                icon: '📚', cost: 300,  checkFn: 'bookworm10' },
  { id: 'diverseReader',  name: 'Renaissance Reader',   desc: 'Read all 4 types (book/article/podcast/video)', icon: '🌈', cost: 100, checkFn: 'diverseReader' },
  { id: 'ratedReader',    name: 'Critic',               desc: 'Rate 5 reading items',                   icon: '⭐', cost: 50,   checkFn: 'ratedReader' },

  // ═══════════════ MOOD ═══════════════
  { id: 'moodFirst',      name: 'Mood Tracker',         desc: 'Log your mood for the first time',       icon: '😊', cost: 20,   checkFn: 'moodFirst' },
  { id: 'mood7',          name: 'Emotional Intel',      desc: 'Log mood for 7 different days',          icon: '🧠', cost: 60,   checkFn: 'mood7' },
  { id: 'mood30',         name: 'Zen Master',           desc: 'Log mood for 30 different days',         icon: '🧘', cost: 200,  checkFn: 'mood30' },
  { id: 'mood90',         name: 'Enlightened',          desc: 'Log mood for 90 different days',         icon: '☀️', cost: 500,  checkFn: 'mood90' },
  { id: 'allMoods',       name: 'Full Spectrum',        desc: 'Log all 5 mood types',                   icon: '🌈', cost: 80,   checkFn: 'allMoods' },
  { id: 'amazingDay',     name: 'Cloud Nine',           desc: 'Log an "Amazing" mood',                  icon: '🤩', cost: 30,   checkFn: 'amazingDay' },
  { id: 'honestMood',     name: 'Honest Soul',          desc: 'Log a "Bad" mood (honesty matters)',      icon: '💪', cost: 40,   checkFn: 'honestMood' },
  { id: 'moodStreak',     name: 'Consistency King',     desc: 'Log mood 7 days in a row',               icon: '👑', cost: 100,  checkFn: 'moodStreak' },

  // ═══════════════ VISION BOARD ═══════════════
  { id: 'firstVision',    name: 'Dreamer',              desc: 'Add your first vision board item',       icon: '💭', cost: 25,   checkFn: 'firstVision' },
  { id: 'vision5',        name: 'Visionary',            desc: 'Add 5 vision board items',               icon: '🔮', cost: 60,   checkFn: 'vision5' },
  { id: 'vision10',       name: 'Master Planner',       desc: 'Add 10 vision board items',              icon: '🏆', cost: 150,  checkFn: 'vision10' },
  { id: 'vision25',       name: 'Dream Architect',      desc: 'Add 25 vision board items',              icon: '🏗️', cost: 400,  checkFn: 'vision25' },
  { id: 'visionCats',     name: 'Well Rounded',         desc: 'Add items in 3 different categories',    icon: '🎨', cost: 50,   checkFn: 'visionCats' },

  // ═══════════════ GENERAL / META ═══════════════
  { id: 'firstPoints',    name: 'Point Collector',      desc: 'Earn your first reward point',           icon: '🪙', cost: 0,    checkFn: 'firstPoints' },
  { id: 'points100',      name: 'Point Hoarder',        desc: 'Earn 100 points total',                  icon: '💰', cost: 0,    checkFn: 'points100' },
  { id: 'points500',      name: 'Point Baron',          desc: 'Earn 500 points total',                  icon: '💎', cost: 0,    checkFn: 'points500' },
  { id: 'points1000',     name: 'Point Tycoon',         desc: 'Earn 1,000 points total',                icon: '🏆', cost: 0,    checkFn: 'points1000' },
  { id: 'firstClaim',     name: 'Reward Hunter',        desc: 'Claim your first reward',                icon: '🎁', cost: 0,    checkFn: 'firstClaim' },
  { id: 'fiveClaims',     name: 'Prize Winner',         desc: 'Claim 5 rewards',                        icon: '🎊', cost: 0,    checkFn: 'fiveClaims' },
  { id: 'tenClaims',      name: 'Reward Addict',        desc: 'Claim 10 rewards',                       icon: '🎰', cost: 0,    checkFn: 'tenClaims' },
  { id: 'profileSet',     name: 'Identity',             desc: 'Set your name in profile',               icon: '🪪', cost: 15,   checkFn: 'profileSet' },
  { id: 'habitBuilder',   name: 'Habit Builder',        desc: 'Create 5 habits',                        icon: '🏗️', cost: 40,  checkFn: 'habitBuilder' },
  { id: 'habitMaster',    name: 'Habit Architect',      desc: 'Create 10 habits',                       icon: '🏛️', cost: 80,  checkFn: 'habitMaster' },
  { id: 'varietyPacker',  name: 'Renaissance Soul',     desc: 'Use 5 different app sections',           icon: '🎪', cost: 60,   checkFn: 'varietyPacker' },
  { id: 'dataDriven',     name: 'Data Driven',          desc: 'Have data in 8 different sections',       icon: '📊', cost: 120,  checkFn: 'dataDriven' },
  { id: 'hundredClub',    name: 'Hundred Club',         desc: 'Have 100+ total items across all sections', icon: '💯', cost: 200, checkFn: 'hundredClub' },
  { id: 'exporter',       name: 'Backup Master',        desc: 'Export your data from settings',         icon: '💾', cost: 30,   checkFn: 'exporter' },
];

function checkReward(rewardId, data) {
  var t = today();
  var logs = (data.moodLog && data.moodLog.habits) || {};
  var todayLog = logs[t] || [];

  switch (rewardId) {
    // ═══════════════ STREAKS ═══════════════
    case 'streak3':     return data.habits.some(function(h) { return (h.streak || 0) >= 3; });
    case 'streak7':     return data.habits.some(function(h) { return (h.streak || 0) >= 7; });
    case 'streak14':    return data.habits.some(function(h) { return (h.streak || 0) >= 14; });
    case 'streak30':    return data.habits.some(function(h) { return (h.streak || 0) >= 30; });
    case 'streak60':    return data.habits.some(function(h) { return (h.streak || 0) >= 60; });
    case 'streak90':    return data.habits.some(function(h) { return (h.streak || 0) >= 90; });
    case 'streak180':   return data.habits.some(function(h) { return (h.streak || 0) >= 180; });
    case 'streak365':   return data.habits.some(function(h) { return (h.streak || 0) >= 365; });

    // ═══════════════ PERFECT DAYS ═══════════════
    case 'allHabits':   return data.habits.length > 0 && data.habits.every(function(h) { return todayLog.includes(h.id); });
    case 'doublePerfect': {
      var ws = getWeekDates();
      var perfectDays = 0;
      ws.forEach(function(d) {
        var dayLog = logs[d] || [];
        if (data.habits.length > 0 && data.habits.every(function(h) { return dayLog.includes(h.id); })) perfectDays++;
      });
      return perfectDays >= 2;
    }
    case 'perfectWeek': {
      var ws = getWeekDates();
      return data.habits.length > 0 && ws.every(function(d) {
        var dayLog = logs[d] || [];
        return data.habits.every(function(h) { return dayLog.includes(h.id); });
      });
    }
    case 'perfectMonth': {
      var count = 0;
      for (var i = 0; i < 30; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        var dayLog = logs[key] || [];
        if (data.habits.length > 0 && data.habits.every(function(h) { return dayLog.includes(h.id); })) count++;
      }
      return count >= 30;
    }

    // ═══════════════ TASKS ═══════════════
    case 'firstTask':       return (data.tasks || []).some(function(t) { return t.completed; });
    case 'taskSlayer':      return (data.tasks || []).filter(function(t) { return t.completed; }).length >= 10;
    case 'taskDestroyer':   return (data.tasks || []).filter(function(t) { return t.completed; }).length >= 50;
    case 'taskAnnihilator': return (data.tasks || []).filter(function(t) { return t.completed; }).length >= 100;
    case 'taskGod':         return (data.tasks || []).filter(function(t) { return t.completed; }).length >= 500;
    case 'zeroInbox': {
      var pending = (data.tasks || []).filter(function(t) { return !t.completed && t.dueDate === t; });
      return pending.length === 0 && (data.tasks || []).some(function(t) { return t.completed; });
    }
    case 'highPriority': return (data.tasks || []).filter(function(t) { return t.completed && t.priority === 'high'; }).length >= 10;

    // ═══════════════ HYDRATION ═══════════════
    case 'hydration5': {
      var w = data.nutrition.waterLog || {};
      var count = 0;
      for (var i = 0; i < 30; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        if ((w[key] || 0) >= (data.nutrition.waterTarget || 8)) count++;
      }
      return count >= 5;
    }
    case 'hydration10': {
      var w = data.nutrition.waterLog || {};
      var count = 0;
      for (var i = 0; i < 60; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        if ((w[key] || 0) >= (data.nutrition.waterTarget || 8)) count++;
      }
      return count >= 10;
    }
    case 'hydration30': {
      var w = data.nutrition.waterLog || {};
      var count = 0;
      for (var i = 0; i < 90; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        if ((w[key] || 0) >= (data.nutrition.waterTarget || 8)) count++;
      }
      return count >= 30;
    }
    case 'hydration60': {
      var w = data.nutrition.waterLog || {};
      var count = 0;
      for (var i = 0; i < 180; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        if ((w[key] || 0) >= (data.nutrition.waterTarget || 8)) count++;
      }
      return count >= 60;
    }
    case 'megaWater': return ((data.nutrition.waterLog || {})[t] || 0) >= 15;

    // ═══════════════ NUTRITION ═══════════════
    case 'firstMeal':     return ((data.nutrition || {}).meals || []).length >= 1;
    case 'mealTracker':   return ((data.nutrition || {}).meals || []).length >= 10;
    case 'mealMaster':    return ((data.nutrition || {}).meals || []).length >= 50;
    case 'mealLegend':    return ((data.nutrition || {}).meals || []).length >= 100;
    case 'threeMeals':    return ((data.nutrition || {}).meals || []).filter(function(m) { return m.date === t; }).length >= 3;
    case 'calorieAware':  return ((data.nutrition || {}).meals || []).filter(function(m) { return m.calories; }).length >= 10;

    // ═══════════════ BUDGET & SAVINGS ═══════════════
    case 'firstExpense':  return ((data.budget || {}).fixedExpenses || []).length + ((data.budget || {}).extraExpenses || []).length >= 1;
    case 'expense10':     return ((data.budget || {}).fixedExpenses || []).length + ((data.budget || {}).extraExpenses || []).length >= 10;
    case 'saver100':  return (data.goals || []).some(function(g) { return (g.saved || 0) >= 100; });
    case 'saver500':  return (data.goals || []).some(function(g) { return (g.saved || 0) >= 500; });
    case 'saver1000': return (data.goals || []).some(function(g) { return (g.saved || 0) >= 1000; });
    case 'saver5000': return (data.goals || []).some(function(g) { return (g.saved || 0) >= 5000; });
    case 'saver10000': return (data.goals || []).some(function(g) { return (g.saved || 0) >= 10000; });
    case 'saver50000': return (data.goals || []).some(function(g) { return (g.saved || 0) >= 50000; });
    case 'firstDeposit': return (data.goals || []).some(function(g) { return (g.saved || 0) > 0; });
    case 'deposit10': return (data.goals || []).reduce(function(sum, g) { return sum + (g.depositCount || 0); }, 0) >= 10;
    case 'budgetWeek': return (data.budget || {}).salary > 0 && ((data.budget || {}).fixedExpenses || []).length > 0;

    // ═══════════════ GOALS ═══════════════
    case 'firstGoal':     return (data.goals || []).some(function(g) { return g.completed; });
    case 'goalCollector': return (data.goals || []).filter(function(g) { return g.completed; }).length >= 3;
    case 'goalCrusher':   return (data.goals || []).filter(function(g) { return g.completed; }).length >= 5;
    case 'goalLegend':    return (data.goals || []).filter(function(g) { return g.completed; }).length >= 10;
    case 'goalOverlord':  return (data.goals || []).filter(function(g) { return g.completed; }).length >= 25;
    case 'goalPlanner':   return (data.goals || []).length >= 5;
    case 'goalOrganizer': return (data.goals || []).length >= 10;
    case 'savingsGoal':   return (data.goals || []).some(function(g) { return g.completed && g.category === 'finance'; });
    case 'firstStep':     return (data.goals || []).some(function(g) { return (g.steps || []).some(function(s) { return s.completed; }); });
    case 'stepMaster':    return (data.goals || []).some(function(g) { var steps = g.steps || []; return steps.length > 0 && steps.every(function(s) { return s.completed; }); });
    case 'stepLegend': {
      var total = 0;
      (data.goals || []).forEach(function(g) { (g.steps || []).forEach(function(s) { if (s.completed) total++; }); });
      return total >= 20;
    }

    // ═══════════════ VACATIONS ═══════════════
    case 'wanderlust':    return (data.vacations || []).length >= 1;
    case 'planner':       return (data.vacations || []).length >= 3;
    case 'vacationSave':  return (data.vacations || []).some(function(v) { return (v.saved || 0) > 0; });
    case 'vacationReady': return (data.vacations || []).some(function(v) { return (v.saved || 0) >= (v.totalCost || 0) && (v.totalCost || 0) > 0; });
    case 'vacationGo':    return (data.vacations || []).some(function(v) { return v.status === 'completed'; });
    case 'jetSetter':     return (data.vacations || []).filter(function(v) { return v.status === 'completed'; }).length >= 3;

    // ═══════════════ SIDE QUESTS ═══════════════
    case 'firstQuest':      return (data.sideQuests || []).some(function(q) { return q.completed; });
    case 'questHero':       return (data.sideQuests || []).filter(function(q) { return q.completed; }).length >= 5;
    case 'questLegend':     return (data.sideQuests || []).filter(function(q) { return q.completed; }).length >= 10;
    case 'questHunter':     return (data.sideQuests || []).filter(function(q) { return q.completed; }).length >= 25;
    case 'firstXp':         return (data.sideQuests || []).some(function(q) { return (q.xp || 0) > 0; });
    case 'xp1000':          return (data.sideQuests || []).reduce(function(s, q) { return s + (q.completed ? (q.xp || 0) : 0); }, 0) >= 1000;
    case 'xp5000':          return (data.sideQuests || []).reduce(function(s, q) { return s + (q.completed ? (q.xp || 0) : 0); }, 0) >= 5000;
    case 'difficultyHard':  return (data.sideQuests || []).some(function(q) { return q.completed && q.difficulty === 'hard'; });
    case 'difficultyEpic':  return (data.sideQuests || []).some(function(q) { return q.completed && q.difficulty === 'epic'; });

    // ═══════════════ TRY LIST ═══════════════
    case 'braveSoul':       return (data.tryList || []).some(function(i) { return i.tried; });
    case 'adventureSeeker': return (data.tryList || []).filter(function(i) { return i.tried; }).length >= 5;
    case 'experienceMaster':return (data.tryList || []).filter(function(i) { return i.tried; }).length >= 10;
    case 'experienceGod':   return (data.tryList || []).filter(function(i) { return i.tried; }).length >= 25;
    case 'firstFree':       return (data.tryList || []).some(function(i) { return i.tried && (i.cost || 0) === 0; });
    case 'bigSpender':      return (data.tryList || []).some(function(i) { return i.tried && (i.cost || 0) >= 500; });
    case 'variety': {
      var cats = {};
      (data.tryList || []).filter(function(i) { return i.tried; }).forEach(function(i) { cats[i.category] = true; });
      return Object.keys(cats).length >= 5;
    }

    // ═══════════════ JOURNAL ═══════════════
    case 'firstJournal':  return (data.journal || []).length >= 1;
    case 'journal7':      return (data.journal || []).length >= 7;
    case 'journal30':     return (data.journal || []).length >= 30;
    case 'journal100':    return (data.journal || []).length >= 100;
    case 'tagMaster':     return (data.journal || []).filter(function(e) { return (e.tags || []).length > 0; }).length >= 10;
    case 'longEntry':     return (data.journal || []).some(function(e) { return (e.content || '').length >= 500; });
    case 'titledEntry':   return (data.journal || []).filter(function(e) { return e.title && e.title.trim(); }).length >= 5;
    case 'moodJourney': {
      var moodSet = {};
      (data.journal || []).forEach(function(e) { if (e.mood) moodSet[e.mood] = true; });
      return Object.keys(moodSet).length >= 5;
    }

    // ═══════════════ READING ═══════════════
    case 'firstRead':     return (data.readings || []).length >= 1;
    case 'reader5':       return (data.readings || []).length >= 5;
    case 'reader10':      return (data.readings || []).length >= 10;
    case 'reader25':      return (data.readings || []).length >= 25;
    case 'pageTurner':    return (data.readings || []).some(function(r) { return (r.progress || 0) >= 100; });
    case 'bookworm10':    return (data.readings || []).filter(function(r) { return (r.progress || 0) >= 100; }).length >= 10;
    case 'diverseReader': {
      var types = {};
      (data.readings || []).forEach(function(r) { types[r.type] = true; });
      return ['book', 'article', 'podcast', 'video'].every(function(t) { return types[t]; });
    }
    case 'ratedReader':   return (data.readings || []).filter(function(r) { return (r.rating || 0) > 0; }).length >= 5;

    // ═══════════════ MOOD ═══════════════
    case 'moodFirst':     return Object.keys((data.moodLog && data.moodLog.mood) || {}).length >= 1;
    case 'mood7':         return Object.keys((data.moodLog && data.moodLog.mood) || {}).length >= 7;
    case 'mood30':        return Object.keys((data.moodLog && data.moodLog.mood) || {}).length >= 30;
    case 'mood90':        return Object.keys((data.moodLog && data.moodLog.mood) || {}).length >= 90;
    case 'allMoods': {
      var moodSet = {};
      var ml = (data.moodLog && data.moodLog.mood) || {};
      for (var k in ml) moodSet[ml[k]] = true;
      return ['amazing', 'good', 'neutral', 'meh', 'bad'].every(function(m) { return moodSet[m]; });
    }
    case 'amazingDay':    return ((data.moodLog && data.moodLog.mood) || {})[t] === 'amazing';
    case 'honestMood':    return Object.values((data.moodLog && data.moodLog.mood) || {}).indexOf('bad') >= 0;
    case 'moodStreak': {
      for (var i = 0; i < 7; i++) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        if (!(data.moodLog && data.moodLog.mood && data.moodLog.mood[key])) return false;
      }
      return true;
    }

    // ═══════════════ VISION BOARD ═══════════════
    case 'firstVision':   return (data.visionBoard || []).length >= 1;
    case 'vision5':       return (data.visionBoard || []).length >= 5;
    case 'vision10':      return (data.visionBoard || []).length >= 10;
    case 'vision25':      return (data.visionBoard || []).length >= 25;
    case 'visionCats': {
      var cats = {};
      (data.visionBoard || []).forEach(function(v) { if (v.category) cats[v.category] = true; });
      return Object.keys(cats).length >= 3;
    }

    // ═══════════════ GENERAL / META ═══════════════
    case 'firstPoints':  return ((data.rewards || {}).points || 0) >= 1;
    case 'points100':    return ((data.rewards || {}).points || 0) >= 100;
    case 'points500':    return ((data.rewards || {}).points || 0) >= 500;
    case 'points1000':   return ((data.rewards || {}).points || 0) >= 1000;
    case 'firstClaim':   return ((data.rewards || {}).earned || []).length >= 1;
    case 'fiveClaims':   return ((data.rewards || {}).earned || []).length >= 5;
    case 'tenClaims':    return ((data.rewards || {}).earned || []).length >= 10;
    case 'profileSet':   return !!(data.profile && data.profile.name && data.profile.name.trim());
    case 'habitBuilder': return (data.habits || []).length >= 5;
    case 'habitMaster':  return (data.habits || []).length >= 10;
    case 'varietyPacker': {
      var used = 0;
      if ((data.habits || []).length > 0) used++;
      if ((data.tasks || []).length > 0) used++;
      if (((data.nutrition || {}).meals || []).length > 0) used++;
      if ((data.budget || {}).salary > 0) used++;
      if ((data.goals || []).length > 0) used++;
      if ((data.vacations || []).length > 0) used++;
      if ((data.sideQuests || []).length > 0) used++;
      if ((data.tryList || []).length > 0) used++;
      if ((data.journal || []).length > 0) used++;
      if ((data.readings || []).length > 0) used++;
      if (Object.keys((data.moodLog && data.moodLog.mood) || {}).length > 0) used++;
      if ((data.visionBoard || []).length > 0) used++;
      return used >= 5;
    }
    case 'dataDriven': {
      var used = 0;
      if ((data.habits || []).length > 0) used++;
      if ((data.tasks || []).length > 0) used++;
      if (((data.nutrition || {}).meals || []).length > 0) used++;
      if ((data.budget || {}).salary > 0) used++;
      if ((data.goals || []).length > 0) used++;
      if ((data.vacations || []).length > 0) used++;
      if ((data.sideQuests || []).length > 0) used++;
      if ((data.tryList || []).length > 0) used++;
      if ((data.journal || []).length > 0) used++;
      if ((data.readings || []).length > 0) used++;
      if (Object.keys((data.moodLog && data.moodLog.mood) || {}).length > 0) used++;
      if ((data.visionBoard || []).length > 0) used++;
      return used >= 8;
    }
    case 'hundredClub': {
      var total = (data.habits || []).length + (data.tasks || []).length + (data.goals || []).length
        + (data.vacations || []).length + (data.sideQuests || []).length + (data.tryList || []).length
        + (data.journal || []).length + (data.readings || []).length + (data.visionBoard || []).length;
      return total >= 100;
    }
    case 'exporter': return false;
    default: return false;
  }
}

/* ─── Award Points ─── */
function awardPoints(data, amount) {
  if (!amount || amount <= 0) return data;
  var rewards = data.rewards || { points: 0, earned: [], unlocked: [] };
  return Object.assign({}, data, {
    rewards: Object.assign({}, rewards, {
      points: (rewards.points || 0) + amount
    })
  });
}

/* ─── Check All Rewards & Return Newly Unlocked ─── */
function checkAllRewards(data) {
  var rewards = data.rewards || { points: 0, earned: [], unlocked: [] };
  var earned = rewards.earned || [];
  var unlocked = rewards.unlocked || [];
  var newlyUnlocked = [];

  REWARDS.forEach(function(r) {
    if (earned.indexOf(r.id) >= 0) return;
    if (unlocked.indexOf(r.id) >= 0) return;
    try {
      if (checkReward(r.id, data)) {
        newlyUnlocked.push(r);
      }
    } catch (e) {}
  });

  if (newlyUnlocked.length > 0) {
    var updatedUnlocked = unlocked.concat(newlyUnlocked.map(function(r) { return r.id; }));
    return {
      data: Object.assign({}, data, {
        rewards: Object.assign({}, rewards, { unlocked: updatedUnlocked })
      }),
      newlyUnlocked: newlyUnlocked
    };
  }

  return { data: data, newlyUnlocked: [] };
}

/* ─── Sidebar Navigation Items ─── */

var NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',     iconKey: 'dashboard' },
  { id: 'calendar',   label: 'Calendar',      iconKey: 'calendarIcon' },
  { id: 'habits',     label: 'Habits & Tasks', iconKey: 'habits' },
  { id: 'nutrition',  label: 'Nutrition',      iconKey: 'nutrition' },
  { id: 'budget',     label: 'Budget',         iconKey: 'budget' },
  { id: 'goals',      label: 'Goals',          iconKey: 'goals' },
  { id: 'vacations',  label: 'Vacations',      iconKey: 'vacation' },
  { id: 'side-quests', label: 'Side Quests',    iconKey: 'quests' },
  { id: 'trylist',    label: 'Try List',       iconKey: 'trylist' },
  { id: 'journal',    label: 'Journal',        iconKey: 'journal' },
  { id: 'reading',    label: 'Reading',        iconKey: 'reading' },
  { id: 'mood',       label: 'Mood',           iconKey: 'mood' },
  { id: 'vision',     label: 'Vision Board',   iconKey: 'vision' },
  { id: 'rewards',    label: 'Rewards',        iconKey: 'rewards' },
  { id: 'settings',   label: 'Settings',       iconKey: 'settings' },
];
