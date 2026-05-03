import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function InitSetup() {
  const [health, setHealth] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'error' }))
      .finally(() => setChecking(false))
  }, [])

  return (
    <div>
      <h1>⚙️ 系统状态</h1>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">🦞 OpenClaw 引擎</div>
          {checking ? (
            <div className="loading">检测中...</div>
          ) : (
            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                状态: <span className={`badge ${health?.status === 'ok' ? 'badge-running' : 'badge-error'}`}>
                  {health?.status === 'ok' ? '● 正常' : '✕ 异常'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                API: POST /api/chat (OpenClaw agent)<br />
                MCP: OKX AI Trade Kit<br />
                数据库: PostgreSQL (traders/decisions/logs)
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">🔑 环境变量</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            MINIMAX_API_KEY: {health?.status === 'ok' ? '✅ 已配置' : '❓ 待确认'}<br />
            OKX_API_KEY: 需在「交易所」页面配置<br />
            OKX_SECRET_KEY: 需在「交易所」页面配置<br />
            OKX_PASSPHRASE: 需在「交易所」页面配置
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">🦞 关于 OpenClaw</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <strong>OpenClaw</strong> 是一个个人 AI 助手框架，运行在 Node.js 上。<br />
          本系统使用 OpenClaw 作为交易决策引擎，通过 MCP 协议与 OKX AI Trade Kit 通信。<br /><br />
          架构: <br />
          Web UI (React) → Backend API (FastAPI) → OpenClaw Agent → OKX MCP Server
        </div>
      </div>
    </div>
  )
}
