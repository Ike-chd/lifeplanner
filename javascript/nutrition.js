function NutritionPage({ data, setData }) {
  const [showMealModal, setShowMealModal] = React.useState(false);
  const [editingTarget, setEditingTarget] = React.useState(false);
  const [tempTarget, setTempTarget] = React.useState(data.nutrition?.waterTarget || 8);

  const nutrition = data.nutrition || { meals: [], waterTarget: 8, waterLog: {} };
  const todayDate = today();
  const todayWater = nutrition.waterLog[todayDate] || 0;
  const waterTarget = nutrition.waterTarget || 8;
  const waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));

  const todayMeals = (nutrition.meals || []).filter(m => m.date === todayDate);
  const totalCalories = todayMeals.reduce((sum, m) => sum + (parseInt(m.calories) || 0), 0);

  function updateWater(delta) {
    const newWater = Math.max(0, todayWater + delta);
    setData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        waterLog: { ...prev.nutrition.waterLog, [todayDate]: newWater }
      }
    }));
  }

  function saveTarget() {
    const val = parseInt(tempTarget);
    if (val > 0) {
      setData(prev => ({
        ...prev,
        nutrition: { ...prev.nutrition, waterTarget: val }
      }));
      setEditingTarget(false);
    }
  }

  function addMeal(type, name, calories, notes) {
    const meal = { id: uid(), date: todayDate, type, name, calories: calories || '', notes: notes || '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, meals: [...(prev.nutrition.meals || []), meal] }
    }));
  }

  function deleteMeal(id) {
    setData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, meals: (prev.nutrition.meals || []).filter(m => m.id !== id) }
    }));
  }

  const mealSuggestions = [
    { time: '7:00 AM', type: 'breakfast', ideas: ['Oatmeal with berries', 'Greek yogurt parfait', 'Whole grain toast', 'Smoothie bowl'] },
    { time: '10:00 AM', type: 'snack', ideas: ['Apple slices', 'Mixed nuts', 'Protein bar', 'Veggie sticks'] },
    { time: '12:30 PM', type: 'lunch', ideas: ['Grilled chicken salad', 'Turkey wrap', 'Quinoa bowl', 'Soup & sandwich'] },
    { time: '3:00 PM', type: 'snack', ideas: ['Hummus & pita', 'Fruit cup', 'Cheese & crackers', 'Trail mix'] },
    { time: '6:30 PM', type: 'dinner', ideas: ['Salmon with veggies', 'Pasta primavera', 'Stir-fry', 'Lean steak'] }
  ];

  const typeColors = { breakfast: '#f59e0b', lunch: '#10b981', dinner: '#3b82f6', snack: '#8b5cf6' };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
        {Icons.apple || '🍎'} Nutrition
      </h1>

      <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>Water Tracker</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Target:</span>
            {editingTarget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  value={tempTarget}
                  onChange={e => setTempTarget(e.target.value)}
                  onBlur={saveTarget}
                  onKeyDown={e => e.key === 'Enter' && saveTarget()}
                  style={{ width: '50px', padding: '4px 8px', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '14px' }}
                  autoFocus
                />
                <span style={{ fontSize: '14px', color: '#4b5563' }}>glasses</span>
              </div>
            ) : (
              <button
                onClick={() => { setTempTarget(waterTarget); setEditingTarget(true); }}
                style={{ background: 'white', border: '1px solid #93c5fd', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1e40af' }}
              >
                {waterTarget}
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', fontWeight: '700', color: '#2563eb' }}>{todayWater}</div>
          <div style={{ fontSize: '16px', color: '#4b5563' }}>of {waterTarget} glasses</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{waterPercent}% complete</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', height: '20px', overflow: 'hidden', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{
            height: '100%',
            width: `${waterPercent}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
            borderRadius: '12px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => updateWater(-1)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            -1
          </button>
          <button onClick={() => updateWater(1)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            +1
          </button>
          <button onClick={() => updateWater(2)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            +2
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{todayMeals.length}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Meals logged</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{totalCalories}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total calories</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💧</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{todayWater}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Glasses of water</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Today's Meals</h2>
        <button onClick={() => setShowMealModal(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          + Log Meal
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        {todayMeals.length === 0 ? (
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍽️</div>
            <div>No meals logged yet today</div>
          </div>
        ) : (
          todayMeals.map(meal => (
            <div key={meal.id} style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: typeColors[meal.type] || '#9ca3af', marginRight: '16px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ background: typeColors[meal.type] + '20', color: typeColors[meal.type], fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{meal.type}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{meal.time}</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{meal.name}</div>
                {meal.calories && <div style={{ fontSize: '13px', color: '#6b7280' }}>{meal.calories} calories</div>}
                {meal.notes && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{meal.notes}</div>}
              </div>
              <button onClick={() => deleteMeal(meal.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
            </div>
          ))
        )}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Meal Plan Suggestions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {mealSuggestions.map((suggestion, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ background: typeColors[suggestion.type] + '20', color: typeColors[suggestion.type], fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{suggestion.type}</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{suggestion.time}</span>
            </div>
            {suggestion.ideas.map((idea, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#4b5563', padding: '6px 0', borderBottom: i < suggestion.ideas.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                • {idea}
              </div>
            ))}
          </div>
        ))}
      </div>

      {showMealModal && (
        <Modal onClose={() => setShowMealModal(false)}>
          <MealForm onSubmit={(type, name, calories, notes) => { addMeal(type, name, calories, notes); setShowMealModal(false); }} onClose={() => setShowMealModal(false)} />
        </Modal>
      )}
    </div>
  );
}

function MealForm({ onSubmit, onClose }) {
  const [type, setType] = React.useState('breakfast');
  const [name, setName] = React.useState('');
  const [calories, setCalories] = React.useState('');
  const [notes, setNotes] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(type, name.trim(), calories, notes.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>Log Meal</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Meal Type</label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Food Name *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Grilled chicken salad" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} required />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Calories (optional)</label>
        <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g., 350" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Cancel</button>
        <button type="submit" style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Log Meal</button>
      </div>
    </form>
  );
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'nutrition',
    data: data,
    toast: toast,
    setToast: setToast,
    pageContent: React.createElement(NutritionPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
