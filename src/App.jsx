import { useState } from 'react'
import Oficina from './modules/oficina/Oficina.jsx'
import Gym from './modules/gym/Gym.jsx'
import './App.css'

const MODULES = [
  { id: 'oficina', label: 'Oficina', icon: '🏢' },
  { id: 'gym',     label: 'Gym',     icon: '💪' },
]

export default function App() {
  const [activeModule, setActiveModule] = useState('oficina')

  return (
    <div className="app-shell">
      <main className="app-content">
        {activeModule === 'oficina' && <Oficina />}
        {activeModule === 'gym'     && <Gym />}
      </main>

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
    </div>
  )
}
