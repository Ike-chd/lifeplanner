function NutritionPage({ data, setData }) {
  var [showMealModal, setShowMealModal] = React.useState(false);
  var [editingTarget, setEditingTarget] = React.useState(false);
  var [tempTarget, setTempTarget] = React.useState(data.nutrition?.waterTarget || 8);

  var nutrition = data.nutrition || { meals: [], waterTarget: 8, waterLog: {} };
  var todayDate = today();
  var todayWater = nutrition.waterLog[todayDate] || 0;
  var waterTarget = nutrition.waterTarget || 8;
  var waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));

  var todayMeals = (nutrition.meals || []).filter(function(m) { return m.date === todayDate; });
  var totalCalories = todayMeals.reduce(function(sum, m) { return sum + (parseInt(m.calories) || 0); }, 0);

  function updateWater(delta) {
    var newWater = Math.max(0, todayWater + delta);
    setData(function(prev) {
      return Object.assign({}, prev, {
        nutrition: Object.assign({}, prev.nutrition, {
          waterLog: Object.assign({}, prev.nutrition.waterLog, { [todayDate]: newWater })
        })
      });
    });
  }

  function saveTarget() {
    var val = parseInt(tempTarget);
    if (val > 0) {
      setData(function(prev) {
        return Object.assign({}, prev, {
          nutrition: Object.assign({}, prev.nutrition, { waterTarget: val })
        });
      });
      setEditingTarget(false);
    }
  }

  function addMeal(type, name, calories, notes) {
    var meal = { id: uid(), date: todayDate, type: type, name: name, calories: calories || '', notes: notes || '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setData(function(prev) {
      return Object.assign({}, prev, {
        nutrition: Object.assign({}, prev.nutrition, { meals: (prev.nutrition.meals || []).concat([meal]) })
      });
    });
  }

  function deleteMeal(id) {
    setData(function(prev) {
      return Object.assign({}, prev, {
        nutrition: Object.assign({}, prev.nutrition, { meals: (prev.nutrition.meals || []).filter(function(m) { return m.id !== id; }) })
      });
    });
  }

  var mealSuggestions = [
    { time: '7:00 AM', type: 'breakfast', ideas: ['Oatmeal with berries', 'Greek yogurt parfait', 'Whole grain toast', 'Smoothie bowl'] },
    { time: '10:00 AM', type: 'snack', ideas: ['Apple slices', 'Mixed nuts', 'Protein bar', 'Veggie sticks'] },
    { time: '12:30 PM', type: 'lunch', ideas: ['Grilled chicken salad', 'Turkey wrap', 'Quinoa bowl', 'Soup & sandwich'] },
    { time: '3:00 PM', type: 'snack', ideas: ['Hummus & pita', 'Fruit cup', 'Cheese & crackers', 'Trail mix'] },
    { time: '6:30 PM', type: 'dinner', ideas: ['Salmon with veggies', 'Pasta primavera', 'Stir-fry', 'Lean steak'] }
  ];

  var typeColors = { breakfast: '#f59e0b', lunch: '#10b981', dinner: '#818cf8', snack: '#8b5cf6' };

  return html`
    <div style=${{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style=${{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#e2e8f0' }}>
        ${Icons.nutrition} Nutrition
      </h1>

      <div className="glass" style=${{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style=${{ fontSize: '18px', fontWeight: '600', color: '#818cf8' }}>Water Tracker</h2>
          <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style=${{ fontSize: '14px', color: '#9ca3af' }}>Target:</span>
            ${editingTarget ? html`
              <div style=${{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  value=${tempTarget}
                  onInput=${function(e) { setTempTarget(e.target.value); }}
                  onBlur=${saveTarget}
                  onKeyDown=${function(e) { if (e.key === 'Enter') saveTarget(); }}
                  style=${{ width: '50px', padding: '4px 8px', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}
                  autoFocus
                />
                <span style=${{ fontSize: '14px', color: '#9ca3af' }}>glasses</span>
              </div>
            ` : html`
              <button
                onClick=${function() { setTempTarget(waterTarget); setEditingTarget(true); }}
                style=${{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#818cf8' }}
              >
                ${waterTarget}
              </button>
            `}
          </div>
        </div>

        <div style=${{ textAlign: 'center', marginBottom: '20px' }}>
          <div style=${{ fontSize: '48px', fontWeight: '700', color: '#818cf8' }}>${todayWater}</div>
          <div style=${{ fontSize: '16px', color: '#9ca3af' }}>of ${waterTarget} glasses</div>
          <div style=${{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>${waterPercent}% complete</div>
        </div>

        <div style=${{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', height: '20px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style=${{
            height: '100%',
            width: waterPercent + '%',
            background: 'linear-gradient(90deg, #818cf8 0%, #06b6d4 100%)',
            borderRadius: '12px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style=${{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick=${function() { updateWater(-1); }} style=${{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            -1
          </button>
          <button onClick=${function() { updateWater(1); }} style=${{ background: '#818cf8', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            +1
          </button>
          <button onClick=${function() { updateWater(2); }} style=${{ background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'transform 0.1s' }}>
            +2
          </button>
        </div>
      </div>

      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass" style=${{ borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
          <div style=${{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>${todayMeals.length}</div>
          <div style=${{ fontSize: '14px', color: '#6b7280' }}>Meals logged</div>
        </div>
        <div className="glass" style=${{ borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
          <div style=${{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>${totalCalories}</div>
          <div style=${{ fontSize: '14px', color: '#6b7280' }}>Total calories</div>
        </div>
        <div className="glass" style=${{ borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style=${{ fontSize: '24px', marginBottom: '8px' }}>💧</div>
          <div style=${{ fontSize: '28px', fontWeight: '700', color: '#e2e8f0' }}>${todayWater}</div>
          <div style=${{ fontSize: '14px', color: '#6b7280' }}>Glasses of water</div>
        </div>
      </div>

      <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style=${{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0' }}>Today's Meals</h2>
        <button onClick=${function() { setShowMealModal(true); }} style=${{ background: '#818cf8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          + Log Meal
        </button>
      </div>

      <div style=${{ marginBottom: '32px' }}>
        ${todayMeals.length === 0 ? html`
          <div className="glass" style=${{ borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style=${{ fontSize: '32px', marginBottom: '8px' }}>🍽️</div>
            <div>No meals logged yet today</div>
          </div>
        ` : html`
          ${todayMeals.map(function(meal) {
            return html`
              <div key=${meal.id} className="glass" style=${{ display: 'flex', alignItems: 'center', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                <div style=${{ width: '4px', height: '40px', borderRadius: '2px', background: typeColors[meal.type] || '#9ca3af', marginRight: '16px' }} />
                <div style=${{ flex: 1 }}>
                  <div style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style=${{ background: (typeColors[meal.type] || '#9ca3af') + '20', color: typeColors[meal.type] || '#9ca3af', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>${meal.type}</span>
                    <span style=${{ fontSize: '12px', color: '#9ca3af' }}>${meal.time}</span>
                  </div>
                  <div style=${{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>${meal.name}</div>
                  ${meal.calories && html`<div style=${{ fontSize: '13px', color: '#6b7280' }}>${meal.calories} calories</div>`}
                  ${meal.notes && html`<div style=${{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>${meal.notes}</div>`}
                </div>
                <button onClick=${function() { deleteMeal(meal.id); }} style=${{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
              </div>
            `;
          })}
        `}
      </div>

      <h2 style=${{ fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px' }}>Meal Plan Suggestions</h2>
      <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        ${mealSuggestions.map(function(suggestion, idx) {
          return html`
            <div key=${idx} className="glass" style=${{ borderRadius: '12px', padding: '16px' }}>
              <div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style=${{ background: (typeColors[suggestion.type] || '#9ca3af') + '20', color: typeColors[suggestion.type] || '#9ca3af', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>${suggestion.type}</span>
                <span style=${{ fontSize: '12px', color: '#6b7280' }}>${suggestion.time}</span>
              </div>
              ${suggestion.ideas.map(function(idea, i) {
                return html`
                  <div key=${i} style=${{ fontSize: '13px', color: '#d1d5db', padding: '6px 0', borderBottom: i < suggestion.ideas.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                    • ${idea}
                  </div>
                `;
              })}
            </div>
          `;
        })}
      </div>

      ${showMealModal && html`
        <${Modal} onClose=${function() { setShowMealModal(false); }}>
          <${MealForm} onSubmit=${function(type, name, calories, notes) { addMeal(type, name, calories, notes); setShowMealModal(false); }} onClose=${function() { setShowMealModal(false); }} />
        <//>
      `}
    </div>
  `;
}

function MealForm({ onSubmit, onClose }) {
  var [type, setType] = React.useState('breakfast');
  var [name, setName] = React.useState('');
  var [calories, setCalories] = React.useState('');
  var [notes, setNotes] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(type, name.trim(), calories, notes.trim());
  }

  return html`
    <form onSubmit=${handleSubmit} style=${{ padding: '24px' }}>
      <h3 style=${{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#e2e8f0' }}>Log Meal</h3>
      <div style=${{ marginBottom: '16px' }}>
        <label style=${{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>Meal Type</label>
        <select value=${type} onChange=${function(e) { setType(e.target.value); }} style=${{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div style=${{ marginBottom: '16px' }}>
        <label style=${{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>Food Name *</label>
        <input type="text" value=${name} onInput=${function(e) { setName(e.target.value); }} placeholder="e.g., Grilled chicken salad" style=${{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} required />
      </div>
      <div style=${{ marginBottom: '16px' }}>
        <label style=${{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>Calories (optional)</label>
        <input type="number" value=${calories} onInput=${function(e) { setCalories(e.target.value); }} placeholder="e.g., 350" style=${{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
      </div>
      <div style=${{ marginBottom: '20px' }}>
        <label style=${{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '6px' }}>Notes (optional)</label>
        <textarea value=${notes} onInput=${function(e) { setNotes(e.target.value); }} placeholder="Any additional details..." rows=${3} style=${{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '14px', resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
      </div>
      <div style=${{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick=${onClose} style=${{ flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#d1d5db' }}>Cancel</button>
        <button type="submit" style=${{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#818cf8', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Log Meal</button>
      </div>
    </form>
  `;
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return html`<${AppLayout} currentPage="nutrition" data=${data} toast=${toast} setToast=${setToast} pageContent=${html`<${NutritionPage} data=${data} setData=${setData} />`} />`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
