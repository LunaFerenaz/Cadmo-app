import { useState } from 'react'
import {
  useGym,
  getLastSession,
  checkProgression,
  calcDescarga,
} from './useGym.js'
import './Gym.css'

const COLORS = {
  'Push A': 'blue',
  'Pull A': 'green',
  'Push B': 'amber',
  'Pull B': 'red',
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeScreen({ routine, history, onStart, onHistory, onEdit }) {
  return (
    <div className="gym">
      <div className="gym-header">
        <h1 className="gym-title">Gym</h1>
        <div className="gym-header-actions">
          <button className="gym-hist-btn" onClick={onEdit}>✏️ Rutina</button>
          <button className="gym-hist-btn" onClick={onHistory}><HistIcon /> Historial</button>
        </div>
      </div>
      <p className="gym-subtitle">Push / Pull · 4 días · Hipertrofia</p>
      <div className="gym-cards">
        {Object.keys(routine).map(name => {
          const w = routine[name]
          const color = COLORS[name] || 'blue'
          const sessions = history[name] || []
          const lastDate = sessions.length ? sessions[sessions.length - 1].date : null
          const totalSeries = w.exercises.reduce((acc, ex) => acc + ex.sets, 0)
          return (
            <button key={name} className={`gym-card gym-card--${color}`} onClick={() => onStart(name)}>
              <div className="gym-card-top">
                <span className="gym-card-badge">{name}</span>
                <ChevronRight />
              </div>
              <p className="gym-card-day">{w.day}</p>
              <p className="gym-card-meta">{totalSeries} series · {w.exercises.length} ejercicios</p>
              <p className="gym-card-last">{lastDate ? `Última vez: ${lastDate}` : 'Sin sesiones aún'}</p>
            </button>
          )
        })}
      </div>
      <div className="gym-tip">
        <strong>Doble progresión:</strong> progresás en reps primero, en carga después.
        Cuando llegás al máximo en todas las series → subís 2.5 kg la próxima sesión.
      </div>
    </div>
  )
}

// ─── Workout ──────────────────────────────────────────────────────────────────

function WorkoutScreen({ gym }) {
  const { activeWorkout, activeExIdx, sessionData, routine,
          updateSet, goNext, goPrev, exitWorkout,
          startTimer, timerSecs, timerActive, history } = gym

  const w = routine[activeWorkout]
  const ex = w.exercises[activeExIdx]
  const color = COLORS[activeWorkout] || 'blue'
  const setRows = sessionData[ex.id] || []
  const lastSession = getLastSession(history, activeWorkout, ex.id)
  const progression = checkProgression(setRows, ex)
  const descargaWeight = ex.descarga ? calcDescarga(setRows) : null
  const totalEx = w.exercises.length
  const progress = Math.round((activeExIdx / totalEx) * 100)
  const [confirmExit, setConfirmExit] = useState(false)

  function handleExit() {
    const hasSomeData = Object.values(sessionData).some(rows =>
      rows.some(r => r.weight !== '' || r.reps !== '')
    )
    if (hasSomeData) setConfirmExit(true)
    else exitWorkout()
  }

  return (
    <div className="gym">
      <div className="gym-workout-bar">
        <button className="gym-back-btn" onClick={handleExit}><BackIcon /></button>
        <div className="gym-progress-wrap">
          <p className="gym-progress-label">{activeWorkout} · {activeExIdx + 1} / {totalEx}</p>
          <div className="gym-progress-track">
            <div className="gym-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className={`gym-ex-header gym-ex-header--${color}`}>
        <p className="gym-ex-rol">{ex.rol}</p>
        <h2 className="gym-ex-name">{ex.name}</h2>
        <p className="gym-ex-meta">{ex.sets} series · {ex.repsMin}–{ex.repsMax} reps · {ex.rest}s descanso</p>
      </div>

      <div className="gym-sets">
        {setRows.map((row, i) => {
          const last = lastSession?.[i] ?? null
          return (
            <div key={i} className="gym-set-row">
              <span className="gym-set-num">S{i + 1}</span>
              <div className="gym-set-field">
                <label>Peso (kg)</label>
                <input type="number" inputMode="decimal" step="0.5" min="0"
                  placeholder={last ? String(last.weight) : '0'}
                  value={row.weight}
                  onChange={e => updateSet(ex.id, i, 'weight', e.target.value)} />
              </div>
              <div className="gym-set-field">
                <label>Reps ({ex.repsMin}–{ex.repsMax})</label>
                <input type="number" inputMode="numeric" min="0"
                  placeholder={last ? String(last.reps) : String(ex.repsMin)}
                  value={row.reps}
                  onChange={e => updateSet(ex.id, i, 'reps', e.target.value)} />
              </div>
              <div className="gym-set-prev">
                {last && <><span>{last.weight}kg</span><span>{last.reps}r</span></>}
              </div>
            </div>
          )
        })}
      </div>

      {ex.descarga && (
        <div className="gym-descarga">
          <p className="gym-descarga-title">Descarga × {ex.descargareps || 15} reps</p>
          <p className="gym-descarga-val">
            {descargaWeight
              ? <><strong>{descargaWeight} kg</strong> <span>−30% del promedio</span></>
              : 'Completá las series para calcular el peso'}
          </p>
        </div>
      )}

      {progression === 'subir' && <div className="gym-badge gym-badge--green">🏆 ¡Subí 2.5 kg la próxima sesión!</div>}
      {progression === 'bajar' && <div className="gym-badge gym-badge--red">⚠️ Bajá el peso a la carga anterior en esa serie</div>}

      <div className="gym-timer">
        <div className="gym-timer-info">
          {timerActive
            ? <span className="gym-timer-active">{Math.floor(timerSecs / 60)}:{String(timerSecs % 60).padStart(2, '0')}</span>
            : <span className="gym-timer-idle">{timerSecs === 0 ? 'Timer de descanso' : '¡Listo para seguir!'}</span>}
        </div>
        <button className="gym-timer-btn" onClick={() => startTimer(ex.rest)}>▶ {ex.rest}s</button>
      </div>

      <div className="gym-nav-btns">
        {activeExIdx > 0 && <button className="gym-nav-prev" onClick={goPrev}>‹</button>}
        <button className={`gym-nav-next gym-nav-next--${color}`} onClick={goNext}>
          {activeExIdx < totalEx - 1 ? 'Siguiente →' : 'Finalizar ✓'}
        </button>
      </div>

      {confirmExit && (
        <div className="gym-modal-overlay">
          <div className="gym-modal">
            <p>¿Salir del entrenamiento? Se pierde el progreso de esta sesión.</p>
            <div className="gym-modal-btns">
              <button onClick={() => setConfirmExit(false)}>Seguir entrenando</button>
              <button className="gym-modal-exit" onClick={exitWorkout}>Salir igual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Done ─────────────────────────────────────────────────────────────────────

function DoneScreen({ gym, onHistory }) {
  const { activeWorkout, sessionData, exitWorkout, routine } = gym
  const w = routine[activeWorkout]
  const color = COLORS[activeWorkout] || 'blue'
  const date = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="gym">
      <div className="gym-done">
        <div className="gym-done-check">✓</div>
        <h2 className="gym-done-title">{activeWorkout} completado</h2>
        <p className="gym-done-date">{date}</p>
        <div className="gym-done-summary">
          {w.exercises.map(ex => {
            const rows = sessionData[ex.id] || []
            const parts = rows.filter(r => r.weight !== '').map(r => `${r.weight}kg×${r.reps}`)
            return (
              <div key={ex.id} className="gym-done-row">
                <span className="gym-done-exname">{ex.name}</span>
                <span className="gym-done-exdata">{parts.length ? parts.join(' · ') : '—'}</span>
              </div>
            )
          })}
        </div>
        <div className="gym-done-actions">
          <button onClick={onHistory}>Ver historial</button>
          <button className={`gym-done-home gym-done-home--${color}`} onClick={exitWorkout}>Inicio</button>
        </div>
      </div>
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function EditorScreen({ routine, updateExercise, addExercise, removeExercise, resetRoutine, onBack }) {
  const [expandedWorkout, setExpandedWorkout] = useState(Object.keys(routine)[0])
  const [editingEx, setEditingEx] = useState(null) // exId being edited
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="gym">
      <div className="gym-workout-bar">
        <button className="gym-back-btn" onClick={onBack}><BackIcon /></button>
        <h2 className="gym-hist-title">Editar rutina</h2>
        <button className="gym-reset-btn" onClick={() => setConfirmReset(true)}>Resetear</button>
      </div>

      {Object.keys(routine).map(wName => {
        const color = COLORS[wName] || 'blue'
        const isOpen = expandedWorkout === wName
        return (
          <div key={wName} className="gym-editor-section">
            <button
              className={`gym-editor-whead gym-editor-whead--${color}`}
              onClick={() => setExpandedWorkout(isOpen ? null : wName)}
            >
              <span>{wName}</span>
              <span className="gym-editor-whead-meta">{routine[wName].exercises.length} ejercicios</span>
              <span className="gym-editor-chevron">{isOpen ? '▾' : '▸'}</span>
            </button>

            {isOpen && (
              <div className="gym-editor-exlist">
                {routine[wName].exercises.map((ex, idx) => (
                  <div key={ex.id} className="gym-editor-ex">
                    {editingEx === ex.id ? (
                      <div className="gym-editor-form">
                        <div className="gym-editor-field">
                          <label>Nombre</label>
                          <input
                            type="text"
                            value={ex.name}
                            onChange={e => updateExercise(wName, ex.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="gym-editor-field">
                          <label>Rol</label>
                          <input
                            type="text"
                            value={ex.rol}
                            onChange={e => updateExercise(wName, ex.id, 'rol', e.target.value)}
                          />
                        </div>
                        <div className="gym-editor-row3">
                          <div className="gym-editor-field">
                            <label>Series</label>
                            <input type="number" min="1" max="10" value={ex.sets}
                              onChange={e => updateExercise(wName, ex.id, 'sets', Number(e.target.value))} />
                          </div>
                          <div className="gym-editor-field">
                            <label>Reps mín</label>
                            <input type="number" min="1" value={ex.repsMin}
                              onChange={e => updateExercise(wName, ex.id, 'repsMin', Number(e.target.value))} />
                          </div>
                          <div className="gym-editor-field">
                            <label>Reps máx</label>
                            <input type="number" min="1" value={ex.repsMax}
                              onChange={e => updateExercise(wName, ex.id, 'repsMax', Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="gym-editor-row2">
                          <div className="gym-editor-field">
                            <label>Descanso (s)</label>
                            <input type="number" min="30" step="15" value={ex.rest}
                              onChange={e => updateExercise(wName, ex.id, 'rest', Number(e.target.value))} />
                          </div>
                          <div className="gym-editor-field gym-editor-field--toggle">
                            <label>Descarga</label>
                            <button
                              className={`gym-toggle ${ex.descarga ? 'gym-toggle--on' : ''}`}
                              onClick={() => updateExercise(wName, ex.id, 'descarga', !ex.descarga)}
                            >{ex.descarga ? 'Sí' : 'No'}</button>
                          </div>
                        </div>
                        {ex.descarga && (
                          <div className="gym-editor-field">
                            <label>Reps descarga</label>
                            <input type="number" min="1" value={ex.descargareps || 15}
                              onChange={e => updateExercise(wName, ex.id, 'descargareps', Number(e.target.value))} />
                          </div>
                        )}
                        <button className="gym-editor-done-btn" onClick={() => setEditingEx(null)}>Listo ✓</button>
                      </div>
                    ) : (
                      <div className="gym-editor-ex-row">
                        <div className="gym-editor-ex-info">
                          <p className="gym-editor-ex-name">{ex.name}</p>
                          <p className="gym-editor-ex-meta">{ex.sets}×{ex.repsMin}–{ex.repsMax} · {ex.rest}s{ex.descarga ? ' · descarga' : ''}</p>
                        </div>
                        <div className="gym-editor-ex-actions">
                          <button onClick={() => setEditingEx(ex.id)}>✏️</button>
                          <button className="gym-editor-del"
                            onClick={() => removeExercise(wName, ex.id)}>✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button className="gym-editor-add-btn" onClick={() => addExercise(wName)}>
                  + Agregar ejercicio
                </button>
              </div>
            )}
          </div>
        )
      })}

      {confirmReset && (
        <div className="gym-modal-overlay">
          <div className="gym-modal">
            <p>¿Resetear la rutina a los valores originales? No se borra el historial.</p>
            <div className="gym-modal-btns">
              <button onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button className="gym-modal-exit" onClick={() => { resetRoutine(); setConfirmReset(false) }}>Resetear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Historial ────────────────────────────────────────────────────────────────

function HistoryScreen({ history, routine, onBack }) {
  const [view, setView] = useState(null)

  if (view) {
    const { workoutName, exId } = view
    const ex = routine[workoutName]?.exercises.find(e => e.id === exId)
    if (!ex) return <div className="gym"><p className="gym-empty">Ejercicio no encontrado.</p></div>
    const color = COLORS[workoutName] || 'blue'
    const sessions = history[workoutName] || []
    const points = []
    sessions.forEach(sess => {
      const rows = sess.exercises?.[exId]
      if (!rows) return
      const weights = rows.map(r => Number(r.weight)).filter(Boolean)
      if (weights.length) points.push({ date: sess.date, max: Math.max(...weights) })
    })
    const maxW = points.length ? Math.max(...points.map(p => p.max)) : 1
    const minW = points.length ? Math.min(...points.map(p => p.max)) : 0
    const range = maxW - minW || 1
    const W = 300; const H = 110
    const pts = points.map((p, i) => ({
      ...p,
      x: points.length > 1 ? (i / (points.length - 1)) * (W - 32) + 16 : W / 2,
      y: H - 20 - ((p.max - minW) / range) * (H - 32),
    }))
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
      <div className="gym">
        <div className="gym-workout-bar">
          <button className="gym-back-btn" onClick={() => setView(null)}><BackIcon /></button>
          <div>
            <p className="gym-progress-label">{workoutName}</p>
            <p className="gym-hist-exname">{ex.name}</p>
          </div>
        </div>
        {points.length === 0 ? (
          <p className="gym-empty">Sin sesiones registradas aún.</p>
        ) : (
          <>
            <div className={`gym-chart-wrap gym-chart-wrap--${color}`}>
              <p className="gym-chart-label">Peso máximo por sesión (kg)</p>
              <svg viewBox={`0 0 ${W} ${H}`} className="gym-chart-svg">
                {pts.length > 1 && <path d={pathD} fill="none" className={`gym-chart-line gym-chart-line--${color}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" className={`gym-chart-dot gym-chart-dot--${color}`} />
                    <text x={p.x} y={p.y - 8} textAnchor="middle" className="gym-chart-val">{p.max}kg</text>
                    <text x={p.x} y={H - 4} textAnchor="middle" className="gym-chart-date">{p.date}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="gym-hist-stats">
              <div className="gym-hist-stat"><span>Sesiones</span><strong>{points.length}</strong></div>
              <div className="gym-hist-stat"><span>Mejor</span><strong>{maxW} kg</strong></div>
              <div className="gym-hist-stat gym-hist-stat--green"><span>Progreso</span><strong>+{(maxW - minW).toFixed(1)} kg</strong></div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="gym">
      <div className="gym-workout-bar">
        <button className="gym-back-btn" onClick={onBack}><BackIcon /></button>
        <h2 className="gym-hist-title">Historial</h2>
      </div>
      {Object.keys(routine).map(wName => {
        const color = COLORS[wName] || 'blue'
        return (
          <div key={wName} className="gym-hist-section">
            <p className={`gym-hist-section-label gym-hist-section-label--${color}`}>{wName}</p>
            {routine[wName].exercises.map(ex => {
              const last = getLastSession(history, wName, ex.id)
              const lastMax = last
                ? Math.max(...last.filter(r => r.weight !== '').map(r => Number(r.weight)), 0) || null
                : null
              return (
                <button key={ex.id} className="gym-hist-row"
                  onClick={() => setView({ workoutName: wName, exId: ex.id })}>
                  <div>
                    <p className="gym-hist-row-name">{ex.name}</p>
                    <p className="gym-hist-row-meta">{ex.sets}×{ex.repsMin}–{ex.repsMax} reps</p>
                  </div>
                  <div className="gym-hist-row-right">
                    {lastMax
                      ? <><strong>{lastMax} kg</strong><span>último</span></>
                      : <span className="gym-hist-row-empty">Sin datos</span>}
                    <ChevronRight />
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Gym() {
  const gym = useGym()
  const [screen, setScreen] = useState('home') // home | history | editor

  if (screen === 'history') {
    return <HistoryScreen history={gym.history} routine={gym.routine} onBack={() => setScreen('home')} />
  }

  if (screen === 'editor') {
    return (
      <EditorScreen
        routine={gym.routine}
        updateExercise={gym.updateExercise}
        addExercise={gym.addExercise}
        removeExercise={gym.removeExercise}
        resetRoutine={gym.resetRoutine}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (gym.sessionDone) {
    return <DoneScreen gym={gym} onHistory={() => setScreen('history')} />
  }

  if (gym.activeWorkout) {
    return <WorkoutScreen gym={gym} />
  }

  return (
    <HomeScreen
      routine={gym.routine}
      history={gym.history}
      onStart={gym.startWorkout}
      onHistory={() => setScreen('history')}
      onEdit={() => setScreen('editor')}
    />
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 4L7 9l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline points="1,8 1,3 6,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 3A7 7 0 1 1 2.7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="8,5 8,9 11,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
