import { useState, useCallback, useRef } from 'react'

const HISTORY_KEY = 'gym_v1'
const ROUTINE_KEY = 'gym_routine_v1'

// ─── Rutina default ───────────────────────────────────────────────────────────

export const DEFAULT_ROUTINE = {
  'Push A': {
    day: 'Lunes',
    exercises: [
      { id: 'pa1', rol: 'Principal 1', name: 'Banco plano',                 sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pa2', rol: 'Principal 2', name: 'Press militar con mancuernas', sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pa3', rol: 'Accesorio 1', name: 'Aperturas',                   sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'pa4', rol: 'Accesorio 2', name: 'Vuelos laterales',            sets: 4, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
      { id: 'pa5', rol: 'Accesorio 3', name: 'Triceps pushdown en polea',   sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: false },
    ],
  },

  'Pull A': {
    day: 'Martes',
    exercises: [
      { id: 'pla1', rol: 'Principal 1', name: 'Despegue',                   sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pla2', rol: 'Principal 2', name: 'Jalón al pecho en polea',    sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pla3', rol: 'Accesorio 1', name: 'Remo alto con pecho apoyado',sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'pla4', rol: 'Accesorio 2', name: 'Curl martillo',              sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'pla5', rol: 'Accesorio 3', name: 'Vuelos laterales',           sets: 4, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
    ],
  },

  'Push B': {
    day: 'Viernes',
    exercises: [
      { id: 'pb1', rol: 'Principal 1', name: 'Sentadilla libre',               sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pb2', rol: 'Principal 2', name: 'Prensa + Gemelos (superserie)',  sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pb3', rol: 'Accesorio 1', name: 'Extensión de cuádriceps',        sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: false },
      { id: 'pb4', rol: 'Accesorio 2', name: 'Press inclinado',                sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'pb5', rol: 'Accesorio 3', name: 'Fondos',                         sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
    ],
  },

  'Pull B': {
    day: 'Sábado',
    exercises: [
      { id: 'plb1', rol: 'Apertura',    name: 'Face pull en polea',          sets: 3, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
      { id: 'plb2', rol: 'Principal 1', name: 'Dominadas',                   sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'plb3', rol: 'Principal 2', name: 'Remo serrucho',               sets: 5, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'plb4', rol: 'Accesorio 1', name: 'Curl barra W / Banco Scott',  sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'plb5', rol: 'Accesorio 2', name: 'Curl banco inclinado',        sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
    ],
  },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}') } catch { return {} }
}

function saveHistory(data) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(data))
}

function loadRoutine() {
  try {
    const saved = localStorage.getItem(ROUTINE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_ROUTINE
  } catch { return DEFAULT_ROUTINE }
}

function saveRoutine(routine) {
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine))
}

function uid() {
  return Math.random().toString(36).slice(2, 8)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLastSession(history, workoutName, exId) {
  const sessions = history[workoutName] || []
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i]?.exercises?.[exId]) return sessions[i].exercises[exId]
  }
  return null
}

export function checkProgression(setRows, ex) {
  const filled = setRows.filter(s => s.weight !== '' && s.reps !== '')
  if (filled.length < ex.sets) return null
  if (filled.every(s => Number(s.reps) >= ex.repsMax)) return 'subir'
  if (filled.some(s => Number(s.reps) < ex.repsMin)) return 'bajar'
  return null
}

export function calcDescarga(setRows) {
  const weights = setRows.map(s => Number(s.weight)).filter(Boolean)
  if (!weights.length) return null
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length
  return Math.round(avg * 0.7 * 2) / 2
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGym() {
  const [history, setHistory]       = useState(loadHistory)
  const [routine, setRoutine]       = useState(loadRoutine)

  // ── Session ──
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [activeExIdx, setActiveExIdx]     = useState(0)
  const [sessionData, setSessionData]     = useState({})
  const [sessionDone, setSessionDone]     = useState(false)

  // ── Timer ──
  const [timerSecs, setTimerSecs]     = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // ── Vistas ──
  const [showHistory, setShowHistory] = useState(false)
  const [showEditor, setShowEditor]   = useState(false)

  // ── Start workout ──
  const startWorkout = useCallback((name) => {
    const exs = routine[name].exercises
    const initial = {}
    exs.forEach(ex => {
      initial[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: '', reps: '' }))
    })
    setActiveWorkout(name)
    setActiveExIdx(0)
    setSessionData(initial)
    setSessionDone(false)
    stopTimer()
  }, [routine])

  const exitWorkout = useCallback(() => {
    setActiveWorkout(null)
    setSessionDone(false)
    stopTimer()
  }, [])

  // ── Set data ──
  const updateSet = useCallback((exId, setIdx, field, value) => {
    setSessionData(prev => {
      const rows = [...(prev[exId] || [])]
      rows[setIdx] = { ...rows[setIdx], [field]: value }
      return { ...prev, [exId]: rows }
    })
  }, [])

  // ── Navigation ──
  const goNext = useCallback(() => {
    const exs = routine[activeWorkout].exercises
    if (activeExIdx < exs.length - 1) {
      setActiveExIdx(i => i + 1)
      stopTimer()
    } else {
      const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      setHistory(prev => {
        const updated = {
          ...prev,
          [activeWorkout]: [...(prev[activeWorkout] || []), { date, exercises: sessionData }],
        }
        saveHistory(updated)
        return updated
      })
      setSessionDone(true)
      stopTimer()
    }
  }, [activeWorkout, activeExIdx, sessionData, routine])

  const goPrev = useCallback(() => {
    if (activeExIdx > 0) {
      setActiveExIdx(i => i - 1)
      stopTimer()
    }
  }, [activeExIdx])

  // ── Timer ──
  function startTimer(secs) {
    stopTimer()
    setTimerSecs(secs)
    setTimerActive(true)
    const end = Date.now() + secs * 1000
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000))
      setTimerSecs(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setTimerActive(false)
      }
    }, 500)
  }

  function stopTimer() {
    clearInterval(timerRef.current)
    setTimerActive(false)
    setTimerSecs(0)
  }

  // ── Editor de rutina ──
  const updateExercise = useCallback((workoutName, exId, field, value) => {
    setRoutine(prev => {
      const updated = {
        ...prev,
        [workoutName]: {
          ...prev[workoutName],
          exercises: prev[workoutName].exercises.map(ex =>
            ex.id === exId ? { ...ex, [field]: value } : ex
          ),
        },
      }
      saveRoutine(updated)
      return updated
    })
  }, [])

  const addExercise = useCallback((workoutName) => {
    setRoutine(prev => {
      const newEx = {
        id: uid(),
        rol: 'Accesorio',
        name: 'Nuevo ejercicio',
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        rest: 90,
        descarga: false,
      }
      const updated = {
        ...prev,
        [workoutName]: {
          ...prev[workoutName],
          exercises: [...prev[workoutName].exercises, newEx],
        },
      }
      saveRoutine(updated)
      return updated
    })
  }, [])

  const removeExercise = useCallback((workoutName, exId) => {
    setRoutine(prev => {
      const updated = {
        ...prev,
        [workoutName]: {
          ...prev[workoutName],
          exercises: prev[workoutName].exercises.filter(ex => ex.id !== exId),
        },
      }
      saveRoutine(updated)
      return updated
    })
  }, [])

  const resetRoutine = useCallback(() => {
    saveRoutine(DEFAULT_ROUTINE)
    setRoutine(DEFAULT_ROUTINE)
  }, [])

  return {
    history,
    routine,
    activeWorkout,
    activeExIdx,
    sessionData,
    sessionDone,
    timerSecs,
    timerActive,
    showHistory,
    setShowHistory,
    showEditor,
    setShowEditor,
    startWorkout,
    exitWorkout,
    updateSet,
    goNext,
    goPrev,
    startTimer,
    updateExercise,
    addExercise,
    removeExercise,
    resetRoutine,
  }
}
