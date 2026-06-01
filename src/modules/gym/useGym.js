import { useState, useCallback, useRef } from 'react'

const STORAGE_KEY = 'gym_v1'

export const ROUTINE = {
  'Push A': {
    day: 'Lunes',
    duration: '~1h 05min',
    totalSeries: 18,
    exercises: [
      { id: 'pa1', rol: 'Apertura',    name: 'Vuelos laterales',          sets: 3, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
      { id: 'pa2', rol: 'Principal 1', name: 'Banco plano',               sets: 4, repsMin: 8,  repsMax: 12, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'pa3', rol: 'Principal 2', name: 'Press inclinado',           sets: 3, repsMin: 8,  repsMax: 12, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'pa4', rol: 'Accesorio 1', name: 'Fondos',                   sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: false },
      { id: 'pa5', rol: 'Accesorio 2', name: 'Triceps pushdown en polea', sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: false },
    ],
  },
  'Pull A': {
    day: 'Martes',
    duration: '~1h 05min',
    totalSeries: 18,
    exercises: [
      { id: 'pla1', rol: 'Apertura',    name: 'Face pull en polea',          sets: 3, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
      { id: 'pla2', rol: 'Principal 1', name: 'Dominadas',                   sets: 4, repsMin: 6,  repsMax: 10, rest: 120, descarga: true,  descargareps: 10, descarganote: 'asist.' },
      { id: 'pla3', rol: 'Principal 2', name: 'Remo serrucho',               sets: 3, repsMin: 8,  repsMax: 12, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'pla4', rol: 'Accesorio 1', name: 'Curl barra W / Banco Scott',  sets: 3, repsMin: 8,  repsMax: 12, rest: 90,  descarga: true,  descargareps: 15 },
      { id: 'pla5', rol: 'Accesorio 2', name: 'Curl martillo',               sets: 3, repsMin: 10, repsMax: 12, rest: 90,  descarga: false },
    ],
  },
  'Push B': {
    day: 'Jueves',
    duration: '~1h 15min',
    totalSeries: 22,
    exercises: [
      { id: 'pb1', rol: 'Principal 1', name: 'Sentadilla libre',              sets: 4, repsMin: 6,  repsMax: 10, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'pb2', rol: 'Principal 2', name: 'Prensa + Gemelos (superserie)', sets: 3, repsMin: 8,  repsMax: 12, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'pb3', rol: 'Accesorio 1', name: 'Extensión de cuadriceps',       sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: true,  descargareps: 15 },
      { id: 'pb4', rol: 'Accesorio 2', name: 'Press militar con mancuernas',  sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: false },
      { id: 'pb5', rol: 'Accesorio 3', name: 'Triceps tras nuca en polea',    sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: false },
    ],
  },
  'Pull B': {
    day: 'Viernes',
    duration: '~1h 05min',
    totalSeries: 18,
    exercises: [
      { id: 'plb1', rol: 'Apertura',    name: 'Aperturas en polea / Peck deck', sets: 3, repsMin: 12, repsMax: 15, rest: 90,  descarga: false },
      { id: 'plb2', rol: 'Principal 1', name: 'Despegue',                       sets: 4, repsMin: 5,  repsMax: 8,  rest: 120, descarga: true,  descargareps: 12 },
      { id: 'plb3', rol: 'Principal 2', name: 'Jalón al pecho en polea',        sets: 3, repsMin: 8,  repsMax: 12, rest: 120, descarga: true,  descargareps: 15 },
      { id: 'plb4', rol: 'Accesorio 1', name: 'Curl femoral sentado',           sets: 3, repsMin: 10, repsMax: 15, rest: 90,  descarga: true,  descargareps: 15 },
      { id: 'plb5', rol: 'Accesorio 2', name: 'Curl bíceps en polea',           sets: 3, repsMin: 10, repsMax: 12, rest: 90,  descarga: false },
    ],
  },
}

// ─── Storage ────────────────────────────────────────────────────────────────

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGym() {
  const [history, setHistory] = useState(load)

  // ── Session state ──
  const [activeWorkout, setActiveWorkout] = useState(null) // null | workoutName
  const [activeExIdx, setActiveExIdx]     = useState(0)
  // sessionData: { [exId]: [{ weight, reps }, ...] }
  const [sessionData, setSessionData]     = useState({})
  const [sessionDone, setSessionDone]     = useState(false)

  // ── Timer state ──
  const [timerSecs, setTimerSecs]   = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // ── Historial view ──
  const [histView, setHistView]         = useState(null) // null | { workoutName, exId }

  // ── Start workout ──
  const startWorkout = useCallback((name) => {
    const exs = ROUTINE[name].exercises
    const initial = {}
    exs.forEach(ex => {
      initial[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: '', reps: '' }))
    })
    setActiveWorkout(name)
    setActiveExIdx(0)
    setSessionData(initial)
    setSessionDone(false)
    stopTimer()
  }, [])

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
    const exs = ROUTINE[activeWorkout].exercises
    if (activeExIdx < exs.length - 1) {
      setActiveExIdx(i => i + 1)
      stopTimer()
    } else {
      // finalizar sesión
      const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      setHistory(prev => {
        const updated = {
          ...prev,
          [activeWorkout]: [...(prev[activeWorkout] || []), { date, exercises: sessionData }],
        }
        save(updated)
        return updated
      })
      setSessionDone(true)
      stopTimer()
    }
  }, [activeWorkout, activeExIdx, sessionData])

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

  return {
    history,
    activeWorkout,
    activeExIdx,
    sessionData,
    sessionDone,
    timerSecs,
    timerActive,
    histView,
    setHistView,
    startWorkout,
    exitWorkout,
    updateSet,
    goNext,
    goPrev,
    startTimer,
  }
}
