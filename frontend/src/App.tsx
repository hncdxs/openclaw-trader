import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Traders from './pages/Traders/Traders'
import ExchangeManager from './pages/ExchangeManager/ExchangeManager'
import Strategies from './pages/Strategies/Strategies'
import InitSetup from './pages/InitSetup/InitSetup'

function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🦞 OpenClaw Trader</div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} end>
            📊 看板
          </NavLink>
          <NavLink to="/traders" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            🤖 交易员
          </NavLink>
          <NavLink to="/strategies" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            📝 策略
          </NavLink>
          <NavLink to="/exchange" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            🔗 交易所
          </NavLink>
          <NavLink to="/setup" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            ⚙️ 初始化
          </NavLink>
        </nav>
        <div style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          引擎: 🦞 OpenClaw
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/traders" element={<Traders />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/exchange" element={<ExchangeManager />} />
          <Route path="/setup" element={<InitSetup />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
