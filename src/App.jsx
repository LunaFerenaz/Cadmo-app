import { useState } from 'react'
import Oficina from './modules/oficina/Oficina.jsx'
import './App.css'

const MODULES = [
  { id: 'oficina', label: 'Oficina', icon: '🏢' },
  // Próximamente:
  // { id: 'gym', label: 'Gym', icon: '💪' },
  // { id: 'habitos', label: 'Hábitos', icon: '✅' },
]

export default function App() {
  const [activeModule, setActiveModule] = useState('oficina')

  return (
    <div className="app-shell">
      <main className="app-content">
        {activeModule === 'oficina' && <Oficina />}
      </main>

      {MODULES.length > 1 && (
        <nav className="bottom-nav">
          {MODULES.map(m => (
            <button
              key={m.id}
              className={`nav-item ${activeModule === m.id ? 'active' : ''}`}
              onClick={() => setActiveModule(m.id)}
            >
              <span className="nav-icon">{m.icon}</span>
              <span className="nav-label">{m.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
