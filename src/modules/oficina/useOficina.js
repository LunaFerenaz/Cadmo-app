import { useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

const STORAGE_KEY = 'oficina_v2'
const HOLIDAYS_KEY = 'feriados_ar'
const TARGET_PCT = 0.4

function getPeriodStart() {
  const now = dayjs()
  const thisYearStart = dayjs(`${now.year()}-05-01`)
  return now.isBefore(thisYearStart, 'day')
    ? dayjs(`${now.year() - 1}-05-01`)
    : thisYearStart
}

function getPeriodEnd() {
  return getPeriodStart().add(1, 'year').subtract(1, 'day')
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { attended: Array.isArray(d.attended) ? d.attended : [] }
  } catch {
    return { attended: [] }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadHolidays() {
  try {
    const d = JSON.parse(localStorage.getItem(HOLIDAYS_KEY) || '{}')
    // guardamos por año: { 2025: ['2025-01-01', ...], 2026: [...] }
    return d
  } catch {
    return {}
  }
}

function saveHolidays(holidays) {
  localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays))
}

async function fetchHolidays(year) {
  const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`)
  const data = await res.json()
  return data.map(f => f.fecha) // array de strings 'YYYY-MM-DD'
}

export function isWeekend(date) {
  return date.day() === 0 || date.day() === 6
}

export function isFuture(date) {
  return date.isAfter(dayjs(), 'day')
}

export function isHoliday(date, holidays) {
  const key = date.format('YYYY-MM-DD')
  const year = date.year()
  return (holidays[year] || []).includes(key)
}

function isWorkday(date, holidays) {
  return !isWeekend(date) && !isHoliday(date, holidays)
}

function workdaysBetween(start, end, holidays) {
  let count = 0
  let d = start
  while (d.isBefore(end, 'day') || d.isSame(end, 'day')) {
    if (isWorkday(d, holidays)) count++
    d = d.add(1, 'day')
  }
  return count
}

function buildMonths(attended, holidays) {
  const start = getPeriodStart()
  const today = dayjs()
  const months = []

  for (let i = 0; i < 12; i++) {
    const monthStart = start.add(i, 'month')
    const monthEnd = monthStart.endOf('month')
    const isPast = monthEnd.isBefore(today, 'day')
    const isCurrent = monthStart.month() === today.month() && monthStart.year() === today.year()

    if (!isPast && !isCurrent) break

    const countTo = isCurrent ? today : monthEnd
    const workdays = workdaysBetween(monthStart, countTo, holidays)
    const expected = Math.round(workdays * TARGET_PCT)

    const went = attended.filter(d => {
      const date = dayjs(d)
      return (date.isSame(monthStart, 'day') || date.isAfter(monthStart, 'day')) &&
             (date.isSame(monthEnd, 'day') || date.isBefore(monthEnd, 'day'))
    }).length

    months.push({
      key: monthStart.format('YYYY-MM'),
      label: monthStart.format('MMMM YYYY'),
      went,
      expected,
      workdays,
      isCurrent,
    })
  }

  return months
}

export function useOficina() {
  const [data, setData] = useState(load)
  const [holidays, setHolidays] = useState(loadHolidays)
  const [currentDate, setCurrentDate] = useState(dayjs())

  // Fetch feriados de los años del período si no los tenemos
  useEffect(() => {
    const start = getPeriodStart()
    const end = getPeriodEnd()
    const years = []
    if (!holidays[start.year()]) years.push(start.year())
    if (!holidays[end.year()] && end.year() !== start.year()) years.push(end.year())

    if (years.length === 0) return

    Promise.all(years.map(y => fetchHolidays(y).then(dates => ({ year: y, dates }))))
      .then(results => {
        const updated = { ...holidays }
        results.forEach(({ year, dates }) => { updated[year] = dates })
        saveHolidays(updated)
        setHolidays(updated)
      })
      .catch(() => {}) // si no hay internet, usa lo que tiene
  }, [])

  const toggleDay = useCallback((dateStr) => {
    setData(prev => {
      const attended = prev.attended.includes(dateStr)
        ? prev.attended.filter(d => d !== dateStr)
        : [...prev.attended, dateStr]
      const next = { attended }
      save(next)
      return next
    })
  }, [])

  const prevMonth = () => setCurrentDate(d => d.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate(d => d.add(1, 'month'))

  const today = dayjs()
  const periodStart = getPeriodStart()
  const periodEnd = getPeriodEnd()

  const workdaysToDate = workdaysBetween(periodStart, today, holidays)
  const attendedToDate = data.attended.filter(d => {
    const date = dayjs(d)
    return (date.isSame(periodStart, 'day') || date.isAfter(periodStart, 'day')) &&
           (date.isSame(today, 'day') || date.isBefore(today, 'day'))
  }).length

  const currentPct = workdaysToDate > 0 ? attendedToDate / workdaysToDate : 0
  const needed = Math.max(0, Math.ceil(workdaysToDate * TARGET_PCT) - attendedToDate)
  const months = buildMonths(data.attended, holidays)

  return {
    data,
    holidays,
    currentDate,
    prevMonth,
    nextMonth,
    toggleDay,
    stats: {
      currentPct,
      targetPct: TARGET_PCT,
      attendedToDate,
      workdaysToDate,
      needed,
    },
    months,
    periodStart,
    periodEnd,
  }
}
