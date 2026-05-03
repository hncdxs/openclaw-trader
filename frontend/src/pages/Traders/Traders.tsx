import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function Traders() {
  const [traders, setTraders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSymbols, setNewSymbols] = useState('BTC-USDT')
  const [newPrompt, setNewPrompt] = useState('')

  const load = () => {
    setLoading(true)
    api.listTraders().then(setTraders).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    await api.createTrader({
      name: newName,
      symbols: newSymbols.split(',').map(s => s.trim()),
      strategy_prompt: newPrompt || '使用EMA12/26和RSI14进行趋势分析',
    })
    setShowCreate(false)
    setNewName('')
    setNewSymbols('BTC-USDT')
    setNewPrompt('')
    load()
  }

  const handleStart = async (id: string) => {
    await api.startTrader(id)
    load()
  }

  const handleStop = async (id: string) => {
    await api.stopTrader(id)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此交易员？')) return
    await api.deleteTrader(id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>🤖 交易员</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          + 新建交易员
        </button>
      </div>

      {/* 新建表单 */}
      {showCreate && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>新建交易员</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              placeholder="交易员名称"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.85rem',
              }}
            />
            <input
              placeholder="交易对 (逗号分隔, 如 BTC-USDT,ETH-USDT)"
              value={newSymbols}
              onChange={e => setNewSymbols(e.target.value)}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.85rem',
              }}
            />
            <textarea
              placeholder="策略描述 (可选, 默认使用 EMA12/26 + RSI14)"
              value={newPrompt}
              onChange={e => setNewPrompt(e.target.value)}
              rows={4}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreate}>创建</button>
              <button className="btn" onClick={() => setShowCreate(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="loading">加载中...</div>
      ) : traders.length === 0 ? (
        <div className="card empty-state">暂无交易员，点击上方按钮创建</div>
      ) : (
        <div className="grid-2">
          {traders.map((t: any) => (
            <div className="card" key={t.id}>
              <div className="card-header">
                <div>
                  <strong>{t.name}</strong>
                  <span className={`badge badge-${t.status}`} style={{ marginLeft: '0.5rem' }}>
                    {t.status === 'running' ? '● 运行中' : t.status === 'stopped' ? '○ 已停止' : '✕ 错误'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {t.status === 'stopped' ? (
                    <button className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleStart(t.id)}>▶ 启动</button>
                  ) : (
                    <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleStop(t.id)}>⏹ 停止</button>
                  )}
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => handleDelete(t.id)}>🗑</button>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>交易对: <strong>{t.symbols || '-'}</strong></div>
                <div>交易所: {t.exchange || 'okx'}</div>
                <div>策略: {(t.strategy_prompt || '').substring(0, 80)}</div>
                {t.last_decision && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>最近决策: </span>
                    <span className={`badge badge-${t.last_decision.signal}`}>
                      {t.last_decision.signal === 'long' ? '📈 做多' : t.last_decision.signal === 'short' ? '📉 做空' : '⏸ 观望'}
                    </span>
                    {t.last_decision.confidence && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                        置信度: {(t.last_decision.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
