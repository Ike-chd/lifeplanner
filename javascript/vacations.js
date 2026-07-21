function VacationsPage({ data, setData }) {
  var [showModal, setShowModal] = React.useState(false);
  const [editVacation, setEditVacation] = React.useState(null);
  const [showDepositModal, setShowDepositModal] = React.useState(false);
  const [depositVacationId, setDepositVacationId] = React.useState(null);
  const [depositAmount, setDepositAmount] = React.useState('');

  const [formName, setFormName] = React.useState('');
  const [formDestination, setFormDestination] = React.useState('');
  const [formStartDate, setFormStartDate] = React.useState('');
  const [formEndDate, setFormEndDate] = React.useState('');
  const [formTotalCost, setFormTotalCost] = React.useState('');
  const [formSaved, setFormSaved] = React.useState('');
  const [formNotes, setFormNotes] = React.useState('');

  const vacations = data.vacations || [];

  React.useEffect(() => {
    if (editVacation) {
      setFormName(editVacation.name);
      setFormDestination(editVacation.destination);
      setFormStartDate(editVacation.startDate);
      setFormEndDate(editVacation.endDate);
      setFormTotalCost(String(editVacation.totalCost));
      setFormSaved(String(editVacation.saved));
      setFormNotes(editVacation.notes || '');
      setShowModal(true);
    }
  }, [editVacation]);

  function resetForm() {
    setFormName('');
    setFormDestination('');
    setFormStartDate('');
    setFormEndDate('');
    setFormTotalCost('');
    setFormSaved('');
    setFormNotes('');
    setEditVacation(null);
  }

  function openNewModal() {
    resetForm();
    setShowModal(true);
  }

  function handleSave() {
    const totalCost = parseFloat(formTotalCost) || 0;
    const saved = Math.min(parseFloat(formSaved) || 0, totalCost);
    const vacation = {
      id: editVacation ? editVacation.id : uid(),
      name: formName || 'Untitled Vacation',
      destination: formDestination,
      startDate: formStartDate,
      endDate: formEndDate,
      totalCost: totalCost,
      saved: saved,
      notes: formNotes,
      completed: false,
      createdAt: editVacation ? editVacation.createdAt : new Date().toISOString()
    };

    if (editVacation) {
      setData(prev => ({
        ...prev,
        vacations: (prev.vacations || []).map(v => v.id === editVacation.id ? vacation : v)
      }));
    } else {
      setData(prev => ({
        ...prev,
        vacations: [...(prev.vacations || []), vacation]
      }));
    }
    setShowModal(false);
    resetForm();
  }

  function handleDelete(id) {
    setData(prev => ({
      ...prev,
      vacations: (prev.vacations || []).filter(v => v.id !== id)
    }));
  }

  function handleDeposit() {
    const amount = parseFloat(depositAmount) || 0;
    if (amount <= 0) return;
    setData(prev => ({
      ...prev,
      vacations: (prev.vacations || []).map(v => {
        if (v.id === depositVacationId) {
          return { ...v, saved: Math.min(v.saved + amount, v.totalCost) };
        }
        return v;
      })
    }));
    setShowDepositModal(false);
    setDepositAmount('');
    setDepositVacationId(null);
  }

  function openDeposit(id) {
    setDepositVacationId(id);
    setDepositAmount('');
    setShowDepositModal(true);
  }

  function toggleCompleted(id) {
    setData(prev => ({
      ...prev,
      vacations: (prev.vacations || []).map(v => {
        if (v.id === id) {
          return { ...v, completed: !v.completed };
        }
        return v;
      })
    }));
  }

  function renderVacationCard(vacation) {
    const daysAway = daysBetween(today(), vacation.startDate);
    const totalDays = vacation.endDate && vacation.startDate ? daysBetween(vacation.startDate, vacation.endDate) : 1;
    const remaining = vacation.totalCost - vacation.saved;
    const daysUntilStart = Math.max(1, daysBetween(today(), vacation.startDate));
    const perDay = daysAway > 0 ? remaining / daysUntilStart : remaining;
    const perMonth = perDay * 30;
    const progress = vacation.totalCost > 0 ? Math.min(100, (vacation.saved / vacation.totalCost) * 100) : 0;
    const isFuture = daysAway > 0;

    return (
      <div key={vacation.id} style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: vacation.completed ? 0.6 : 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
              {vacation.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: '#94a3b8', fontSize: '14px' }}>
              <span>{Icons.mapPin}</span>
              <span>{vacation.destination || 'No destination set'}</span>
            </div>
            <div style={{ marginTop: '8px', color: '#64748b', fontSize: '13px' }}>
              {vacation.startDate && vacation.endDate
                ? `${fmt(vacation.startDate)} — ${fmt(vacation.endDate)}`
                : vacation.startDate
                  ? fmt(vacation.startDate)
                  : 'No dates set'}
              {isFuture && (
                <span style={{
                  marginLeft: '8px',
                  background: 'rgba(20,184,166,0.15)',
                  color: '#2dd4bf',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {daysAway} days away
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => toggleCompleted(vacation.id)}
              title={vacation.completed ? 'Mark incomplete' : 'Mark complete'}
              style={{
                background: vacation.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: vacation.completed ? '#34d399' : '#64748b',
                fontSize: '16px'
              }}
            >
              {Icons.checkCircle}
            </button>
            <button
              onClick={() => handleDelete(vacation.id)}
              title="Delete"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '16px'
              }}
            >
              {Icons.trash}
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Cost</div>
            <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700 }}>{fmtMoney(vacation.totalCost)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Saved</div>
            <div style={{ color: '#34d399', fontSize: '16px', fontWeight: 700 }}>{fmtMoney(vacation.saved)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Per Day</div>
            <div style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 700 }}>{fmtMoney(perDay)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Per Month</div>
            <div style={{ color: '#f97316', fontSize: '16px', fontWeight: 700 }}>{fmtMoney(perMonth)}</div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>
            <span>Savings Progress</span>
            <span>{Math.round(progress)}% funded</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
            {fmtMoney(vacation.saved)} of {fmtMoney(vacation.totalCost)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            {totalDays} day{totalDays !== 1 ? 's' : ''} duration
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => openDeposit(vacation.id)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {Icons.plus} Add Savings
            </button>
            <button
              onClick={() => setEditVacation(vacation)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {Icons.edit} Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#f1f5f9' }}>Vacation Planner</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Plan and save for your dream trips</p>
        </div>
        <button
          onClick={openNewModal}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
          }}
        >
          {Icons.plus} Plan Vacation
        </button>
      </div>

      {vacations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{Icons.umbrella}</div>
          <h3 style={{ margin: '0 0 8px', color: '#f1f5f9', fontSize: '18px' }}>No vacations planned yet</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Click "Plan Vacation" to start saving for your next adventure</p>
        </div>
      ) : (
        <div>
          {vacations.filter(v => !v.completed).map(renderVacationCard)}
          {vacations.some(v => v.completed) && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Completed
              </h3>
              {vacations.filter(v => v.completed).map(renderVacationCard)}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal
          title={editVacation ? 'Edit Vacation' : 'Plan New Vacation'}
          onClose={() => { setShowModal(false); resetForm(); }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Vacation Name" value={formName} onChange={setFormName} placeholder="Summer Trip 2025" />
            <Input label="Destination" value={formDestination} onChange={setFormDestination} placeholder="Paris, France" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Start Date" type="date" value={formStartDate} onChange={setFormStartDate} />
              <Input label="End Date" type="date" value={formEndDate} onChange={setFormEndDate} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Total Cost" type="number" value={formTotalCost} onChange={setFormTotalCost} placeholder="0.00" />
              <Input label="Already Saved" type="number" value={formSaved} onChange={setFormSaved} placeholder="0.00" />
            </div>
            <Textarea label="Notes" value={formNotes} onChange={setFormNotes} placeholder="Trip details, accommodations, etc." />
            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              {editVacation ? 'Save Changes' : 'Create Vacation'}
            </button>
          </div>
        </Modal>
      )}

      {showDepositModal && (
        <Modal
          title="Add Savings"
          onClose={() => { setShowDepositModal(false); setDepositAmount(''); }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Amount to Deposit"
              type="number"
              value={depositAmount}
              onChange={setDepositAmount}
              placeholder="0.00"
            />
            <button
              onClick={handleDeposit}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Add Savings
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function App() {
  var [data, setData] = React.useState(loadData);
  var [toast, setToast] = React.useState(null);
  React.useEffect(function() { saveData(data); }, [data]);
  return React.createElement(AppLayout, {
    currentPage: 'vacations', data: data, toast: toast, setToast: setToast,
    pageContent: React.createElement(VacationsPage, { data: data, setData: setData })
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
