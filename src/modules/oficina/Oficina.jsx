import { useOficina, isWeekend, isFuture, isHoliday } from './useOficina.js'
import './Oficina.css'
import dayjs from 'dayjs'

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export default function Oficina() {
  const { data, holidays, currentDate, prevMonth, nextMonth, toggleDay, stats, months } = useOficina()

  const year = currentDate.year()
  const month = currentDate.month()
  const monthStart = currentDate.startOf('month')
  const daysInMonth = currentDate.daysInMonth()
  const today = dayjs()

  const firstDayOffset = (monthStart.day() + 6) % 7
  const cells = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function handleDayPress(d) {
    const date = dayjs(new Date(year, month, d))
    if (isWeekend(date) || isFuture(date)) return
    toggleDay(date.format('YYYY-MM-DD'))
  }

  function getDayState(d) {
    if (!d) return 'empty'
    const date = dayjs(new Date(year, month, d))
    if (isWeekend(date)) return 'weekend'
    if (isHoliday(date, holidays)) return 'holiday'
    if (isFuture(date)) return 'future'
    return data.attended.includes(date.format('YYYY-MM-DD')) ? 'went' : 'missed'
  }

  function isToday(d) {
    return d && year === today.year() && month === today.month() && d === today.date()
  }

  const pct = Math.round(stats.currentPct * 100)
  const targetPct = Math.round(stats.targetPct * 100)
  const canGoNext = currentDate.isBefore(today, 'month') || currentDate.isSame(today, 'month')
  const monthName = currentDate.format('MMMM YYYY')

  return (
    <div className="oficina">
      {/* Header */}
      <div className="of-header">
        <h1 className="of-title">Oficina</h1>
      </div>

      {/* Big percentage */}
      <div className="of-pct-section">
        <div className="of-pct-ring-wrap">
          <svg viewBox="0 0 120 120" className="of-ring">
            <circle cx="60" cy="60" r="50" className="of-ring-bg" />
            <circle
              cx="60" cy="60" r="50"
              className="of-ring-target"
              strokeDasharray={`${targetPct * 3.14} 314`}
              strokeDashoffset="0"
            />
            <circle
              cx="60" cy="60" r="50"
              className={`of-ring-fill ${pct >= targetPct ? 'ok' : 'low'}`}
              strokeDasharray={`${Math.min(pct, 100) * 3.14} 314`}
              strokeDashoffset="0"
            />
            <text x="60" y="55" className="of-ring-pct">{pct}%</text>
            <text x="60" y="73" className="of-ring-label">meta {targetPct}%</text>
          </svg>
        </div>
        <div className="of-pct-detail">
          <span className="of-pct-info">Fuiste <strong>{stats.attendedToDate}</strong> de <strong>{stats.workdaysToDate}</strong> días hábiles</span>
          {stats.needed > 0
            ? <span className="of-pct-need red">Necesitás ir {stats.needed} día{stats.needed !== 1 ? 's' : ''} más para llegar al {targetPct}%</span>
            : <span className="of-pct-need green">¡Estás al día! 🎉</span>
          }
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="of-months">
        {months.map(m => {
          const mPct = m.workdays > 0 ? Math.round((m.went / m.workdays) * 100) : 0
          const barPct = Math.min(100, Math.round((m.went / Math.max(m.expected, 1)) * 100))
          return (
            <div key={m.key} className={`of-month-row ${m.isCurrent ? 'current' : ''}`}>
              <span className="of-month-name">{m.label}</span>
              <div className="of-month-bar-wrap">
                <div className="of-month-bar">
                  <div
                    className={`of-month-bar-fill ${m.went >= m.expected ? 'ok' : 'low'}`}
                    style={{ width: `${barPct}%` }}
                  />
                  <div className="of-month-bar-target" style={{ left: '100%' }} />
                </div>
              </div>
              <span className={`of-month-nums ${m.went >= m.expected ? 'green' : 'red'}`}>
                {m.went}/{m.expected}
              </span>
            </div>
          )
        })}
      </div>

      {/* Calendar nav */}
      <div className="of-cal-nav">
        <button className="of-nav-btn" onClick={prevMonth}>‹</button>
        <span className="of-month-title">{monthName}</span>
        <button className="of-nav-btn" onClick={nextMonth} disabled={!canGoNext}>›</button>
      </div>

      {/* Calendar */}
      <div className="of-calendar">
        <div className="of-day-headers">
          {DAYS.map(d => <span key={d} className="of-day-hdr">{d}</span>)}
        </div>
        <div className="of-days">
          {cells.map((d, i) => {
            const state = getDayState(d)
            return (
              <button
                key={i}
                className={`of-day of-day--${state} ${isToday(d) ? 'of-day--today' : ''}`}
                onClick={() => d && handleDayPress(d)}
                disabled={!d || state === 'weekend' || state === 'holiday' || state === 'future' || state === 'empty'}
              >
                {d && (
                  <>
                    <span className="of-day-num">{d}</span>
                    {state === 'went' && <span className="of-day-check">✓</span>}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
