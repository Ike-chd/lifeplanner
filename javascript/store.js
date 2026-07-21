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
  return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
    budget: { salary: 0, fixedExpenses: [], extraExpenses: [], savingsGoal: 0 },
    goals: [],
    vacations: [],
    sideQuests: [],
    tryList: [],
    rewards: { points: 0, earned: [] },
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
  { id: 'streak3',     name: 'Bronze Warrior',   desc: '3-day streak on any habit',           icon: '🥉', cost: 30,  checkFn: 'streak3' },
  { id: 'streak7',     name: 'Silver Champion',   desc: '7-day streak on any habit',           icon: '🥈', cost: 75,  checkFn: 'streak7' },
  { id: 'streak14',    name: 'Gold Master',       desc: '14-day streak on any habit',          icon: '🥇', cost: 150, checkFn: 'streak14' },
  { id: 'streak30',    name: 'Diamond Legend',    desc: '30-day streak on any habit',          icon: '💎', cost: 300, checkFn: 'streak30' },
  { id: 'allHabits',   name: 'Perfect Day',       desc: 'Complete all habits in a day',        icon: '⭐', cost: 50,  checkFn: 'allHabits' },
  { id: 'firstGoal',   name: 'Goal Getter',       desc: 'Complete your first goal',            icon: '🎯', cost: 100, checkFn: 'firstGoal' },
  { id: 'firstQuest',  name: 'Quest Master',      desc: 'Complete a side quest',               icon: '⚔️', cost: 80,  checkFn: 'firstQuest' },
  { id: 'weekClean',   name: '7-Day Clean',       desc: 'No missed habits for 7 days',         icon: '🔥', cost: 200, checkFn: 'weekClean' },
  { id: 'hydration',   name: 'Hydration Hero',    desc: 'Hit water goal for 5 days',           icon: '💧', cost: 60,  checkFn: 'hydration' },
  { id: 'saver',       name: 'Money Saver',       desc: 'Save $100 toward any goal',           icon: '💰', cost: 40,  checkFn: 'saver' },
];

function checkReward(rewardId, data) {
  var t = today();
  var logs = (data.moodLog && data.moodLog.habits) || {};
  var todayLog = logs[t] || [];

  switch (rewardId) {
    case 'streak3':    return data.habits.some(function(h) { return (h.streak || 0) >= 3; });
    case 'streak7':    return data.habits.some(function(h) { return (h.streak || 0) >= 7; });
    case 'streak14':   return data.habits.some(function(h) { return (h.streak || 0) >= 14; });
    case 'streak30':   return data.habits.some(function(h) { return (h.streak || 0) >= 30; });
    case 'allHabits':  return data.habits.length > 0 && data.habits.every(function(h) { return todayLog.includes(h.id); });
    case 'firstGoal':  return data.goals.some(function(g) { return g.completed; });
    case 'firstQuest': return data.sideQuests.some(function(q) { return q.completed; });
    case 'weekClean': {
      var ws = getWeekDates();
      return data.habits.length > 0 && ws.slice(0, -1).every(function(d) {
        return data.habits.every(function(h) { return (logs[d] || []).includes(h.id); });
      });
    }
    case 'hydration': {
      var w = data.nutrition.waterLog || {};
      var ws = getWeekDates();
      return ws.filter(function(d) { return (w[d] || 0) >= data.nutrition.waterTarget; }).length >= 5;
    }
    case 'saver': return false;
    default: return false;
  }
}

/* ─── Sidebar Navigation Items ─── */

var NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',     iconKey: 'dashboard' },
  { id: 'habits',     label: 'Habits & Tasks', iconKey: 'habits' },
  { id: 'nutrition',  label: 'Nutrition',      iconKey: 'nutrition' },
  { id: 'budget',     label: 'Budget',         iconKey: 'budget' },
  { id: 'goals',      label: 'Goals',          iconKey: 'goals' },
  { id: 'vacations',  label: 'Vacations',      iconKey: 'vacation' },
  { id: 'quests',     label: 'Side Quests',    iconKey: 'quests' },
  { id: 'trylist',    label: 'Try List',       iconKey: 'trylist' },
  { id: 'journal',    label: 'Journal',        iconKey: 'journal' },
  { id: 'reading',    label: 'Reading',        iconKey: 'reading' },
  { id: 'mood',       label: 'Mood',           iconKey: 'mood' },
  { id: 'vision',     label: 'Vision Board',   iconKey: 'vision' },
  { id: 'rewards',    label: 'Rewards',        iconKey: 'rewards' },
  { id: 'settings',   label: 'Settings',       iconKey: 'settings' },
];
