import { useState, useCallback, useRef } from 'react'

const HISTORY_KEY = 'gym_v1'
const ROUTINE_KEY = 'gym_routine_v1'

// ─── Rutina default ───────────────────────────────────────────────────────────

export const DEFAULT_ROUTINE = {
  'Upper A': {
    day: 'Lunes',
    exercises: [
      { id: 'ua1', rol: 'Principal',  name: 'Press banca',                               sets: 4, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'ua2', rol: 'Secundario', name: 'Press inclinado en máquina (A)',            sets: 4, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ua3', rol: 'Espalda',    name: 'Remo pecho apoyado agarre neutro/cerrado', sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ua4', rol: 'Pecho',      name: 'Aperturas / Peck Deck',                     sets: 3, repsMin: 10, repsMax: 15, rest: 60,  descarga: false },
      { id: 'ua5', rol: 'Bíceps',     name: 'Curl W',                                    sets: 2, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ua6', rol: 'Bíceps',     name: 'Curl martillo',                             sets: 2, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ua7', rol: 'Comodín',    name: 'Elevaciones laterales',                     sets: 3, repsMin: 10, repsMax: 20, rest: 60,  descarga: false },
    ],
  },

  'Lower B': {
    day: 'Martes',
    exercises: [
      { id: 'lb1', rol: 'Principal',  name: 'Peso muerto convencional',  sets: 4, repsMin: 3,  repsMax: 6,  rest: 180, descarga: false },
      { id: 'lb2', rol: 'Secundario', name: 'Hip thrust',                sets: 4, repsMin: 8,  repsMax: 12, rest: 120, descarga: false },
      { id: 'lb3', rol: 'Cuádriceps', name: 'Extensión de cuádriceps',   sets: 3, repsMin: 10, repsMax: 15, rest: 60,  descarga: false },
      { id: 'lb4', rol: 'Isquios',    name: 'Curl femoral',              sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'lb5', rol: 'Gemelos',    name: 'Gemelo de pie',             sets: 4, repsMin: 8,  repsMax: 15, rest: 60,  descarga: false },
      { id: 'lb6', rol: 'Comodín',    name: 'Abdominales',               sets: 3, repsMin: 10, repsMax: 20, rest: 60,  descarga: false },
    ],
  },

  'Upper B': {
    day: 'Jueves',
    exercises: [
      { id: 'ub1', rol: 'Principal',  name: 'Dominadas lastradas',                  sets: 4, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'ub2', rol: 'Secundario', name: 'Remo pecho apoyado agarre ancho',      sets: 4, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ub3', rol: 'Pecho',      name: 'Press inclinado en máquina (B)',        sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'ub4', rol: 'Dorsal',     name: 'Pullover en polea',                     sets: 3, repsMin: 10, repsMax: 15, rest: 60,  descarga: false },
      { id: 'ub5', rol: 'Tríceps',    name: 'Fondos',                                sets: 2, repsMin: 5,  repsMax: 8,  rest: 120, descarga: false },
      { id: 'ub6', rol: 'Tríceps',    name: 'Extensión de tríceps en polea',         sets: 2, repsMin: 10, repsMax: 15, rest: 60,  descarga: false },
      { id: 'ub7', rol: 'Comodín',    name: 'Elevaciones laterales',                 sets: 3, repsMin: 10, repsMax: 20, rest: 60,  descarga: false },
    ],
  },

  'Lower A': {
    day: 'Sabado',
    exercises: [
      { id: 'la1', rol: 'Principal',  name: 'Sentadilla',                           sets: 4, repsMin: 5,  repsMax: 8,  rest: 180, descarga: false },
      { id: 'la2', rol: 'Secundario', name: 'Prensa',                               sets: 4, repsMin: 8,  repsMax: 12, rest: 120, descarga: false },
      { id: 'la3', rol: 'Isquios',    name: 'Curl femoral',                         sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'la4', rol: 'Aductores',  name: 'Abductores + Aductores (superserie)',  sets: 3, repsMin: 12, repsMax: 20, rest: 60,  descarga: false },
      { id: 'la5', rol: 'Gemelos',    name: 'Gemelo en prensa',                     sets: 4, repsMin: 8,  repsMax: 15, rest: 60,  descarga: false },
      { id: 'la6', rol: 'Comodín',    name: 'Curl inclinado / Abdominales',         sets: 3, repsMin: 8,  repsMax: 12, rest: 60,  descarga: false },
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
