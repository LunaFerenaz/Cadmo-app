import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

const STORAGE_KEY = 'oficina_v2'
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

export function isWeekend(date) {
  return date.day() === 0 || date.day() === 6
}

export function isFuture(date) {
  return date.isAfter(dayjs(), 'day')
}

// Días hábiles entre dos fechas (inclusive)
function workdaysBetween(start, end) {
  let count = 0
  let d = start
  while (d.isBefore(end, 'day') || d.isSame(end, 'day')) {
    if (!isWeekend(d)) count++
    d = d.add(1, 'day')
  }
  return count
}

// Meses del período con sus stats
function buildMonths(attended) {
  const start = getPeriodStart()
  const today = dayjs()
  const months = []

  for (let i = 0; i < 12; i++) {
    const monthStart = start.add(i, 'month')
    const monthEnd = monthStart.endOf('month')
    const isPast = monthEnd.isBefore(today, 'day')
    const isCurrent = monthStart.month() === today.month() && monthStart.year() === today.year()

    if (!isPast && !isCurrent) break // no mostrar meses futuros

    const countTo = isCurrent ? today : monthEnd
    const workdays = workdaysBetween(monthStart, countTo)
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
  const [currentDate, setCurrentDate] = useState(dayjs())

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

  // % acumulado desde inicio del período hasta hoy
  const workdaysToDate = workdaysBetween(periodStart, today)
  const attendedToDate = data.attended.filter(d => {
    const date = dayjs(d)
    return (date.isSame(periodStart, 'day') || date.isAfter(periodStart, 'day')) &&
           (date.isSame(today, 'day') || date.isBefore(today, 'day'))
  }).length

  const currentPct = workdaysToDate > 0 ? attendedToDate / workdaysToDate : 0

  // Cuántos días faltan para llegar al 40% de los días transcurridos
  const needed = Math.max(0, Math.ceil(workdaysToDate * TARGET_PCT) - attendedToDate)

  const months = buildMonths(data.attended)

  return {
    data,
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
