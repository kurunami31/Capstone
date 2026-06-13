import { useState, useEffect } from 'react'

const CARD = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--track-bg)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

const INPUT = {
  background: 'var(--track-bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--text-input)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const STEPS = ['welcome', 'strand', 'holland', 'interest', 'skills']

export default function QuestionsManager() {
  const [questions, setQuestions] = useState([])
  const [filterStep, setFilterStep] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ step: 'holland', questionKey: '', questionText: '', questionType: 'text', options: '', sortOrder: 0 })

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions', { credentials: 'include' })
      const data = await res.json()
      setQuestions(data)
    } catch (e) { console.error('Fetch questions error:', e) }
  }

  useEffect(() => { fetchQuestions() }, [])

  const filtered = filterStep === 'all' ? questions : questions.filter(q => q.step === filterStep)

  const save = async () => {
    const body = {
      step: form.step,
      questionKey: form.questionKey,
      questionText: form.questionText,
      questionType: form.questionType,
      options: form.options ? form.options.split('\n').map(s => s.trim()).filter(Boolean) : [],
      sortOrder: parseInt(form.sortOrder) || 0,
    }
    try {
      if (editId) {
        await fetch(`/api/admin/questions/${editId}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/admin/questions', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      setShowForm(false)
      setEditId(null)
      setForm({ step: 'holland', questionKey: '', questionText: '', questionType: 'text', options: '', sortOrder: 0 })
      await fetchQuestions()
    } catch (e) { console.error('Save question error:', e) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this question? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/questions/${id}`, { method: 'DELETE', credentials: 'include' })
      await fetchQuestions()
    } catch (e) { console.error('Delete question error:', e) }
  }

  return (
    <div style={{ ...CARD, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Assessment Questions</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={filterStep}
            onChange={e => setFilterStep(e.target.value)}
            style={{ ...INPUT, width: 'auto', padding: '5px 10px', fontSize: 12 }}
          >
            <option value="all">All Steps</option>
            {STEPS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ step: 'holland', questionKey: '', questionText: '', questionType: 'text', options: '', sortOrder: 0 }) }} style={{
            background: '#2563eb', border: 'none', color: '#fff',
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            + Add Question
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{
          marginBottom: 16, padding: 16, borderRadius: 10,
          background: 'var(--row-bg)', border: '1px solid var(--card-border)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Step</label>
              <select value={form.step} onChange={e => setForm(f => ({ ...f, step: e.target.value }))} style={{ ...INPUT, width: '100%' }}>
                {STEPS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Question Key</label>
              <input value={form.questionKey} onChange={e => setForm(f => ({ ...f, questionKey: e.target.value }))} placeholder="e.g. interest_1" style={INPUT} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Question Text</label>
              <input value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} placeholder="What is your interest area?" style={INPUT} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Type</label>
              <select value={form.questionType} onChange={e => setForm(f => ({ ...f, questionType: e.target.value }))} style={{ ...INPUT, width: '100%' }}>
                <option value="text">Text</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-Select</option>
                <option value="rating">Rating</option>
                <option value="likert">Likert Scale</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={INPUT} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3 }}>Options (one per line, for select/multiselect/rating)</label>
              <textarea value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} rows={3} placeholder="Option 1&#10;Option 2&#10;Option 3" style={{ ...INPUT, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-strong)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button onClick={save} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {editId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ color: '#475569', fontSize: 13, padding: 20, textAlign: 'center' }}>No questions found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(q => (
            <div key={q.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', borderRadius: 8,
              background: q.active ? 'rgba(255,255,255,0.02)' : 'rgba(248,113,113,0.05)',
              border: '1px solid var(--card-bg)',
            }}>
              <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-input)', fontSize: 13, fontWeight: 600 }}>{q.question_text}</span>
                  {!q.active && <span style={{ fontSize: 10, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '1px 6px', borderRadius: 4 }}>Inactive</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Key: {q.question_key}</span>
                  <span>Step: {q.step}</span>
                  <span>Type: {q.question_type}</span>
                  <span>Order: {q.sort_order}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button onClick={async () => {
                  await fetch(`/api/admin/questions/${q.id}`, {
                    method: 'PUT', credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ active: !q.active }),
                  })
                  await fetchQuestions()
                }} style={{
                  padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-strong)',
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                }}>
                  {q.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => remove(q.id)} style={{
                  padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: 11, cursor: 'pointer',
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
