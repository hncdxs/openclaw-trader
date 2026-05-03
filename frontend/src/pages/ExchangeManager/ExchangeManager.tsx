import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function ExchangeManager() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    api_key: '',
    secret_key: '',
    passphrase: '',
  })

  const load = () => {
    setLoading(true)
    api.listAccounts().then(setAccounts).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    await api.saveAccount({ ...form, exchange: 'okx', is_active: true })
    setShowForm(false)
    setForm({ name: '', api_key: '', secret_key: '', passphrase: '' })
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔗 交易所连接</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + 添加账户
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>添加 OKX 账户</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(['name', 'api_key', 'secret_key', 'passphrase'] as const).map(field => (
              <input
                key={field}
                type={field === 'api_key' ? 'text' : 'password'}
                placeholder={{
                  name: '账户名称',
                  api_key: 'OKX API Key',
                  secret_key: 'OKX Secret Key',
                  passphrase: 'OKX Passphrase',
                }[field]}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.85rem',
                }}
              />
            ))}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
              <button className="btn" onClick={() => setShowForm(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            未配置交易所账户。<br />
            添加 OKX API Key 后，OpenClaw 将通过 MCP 协议连接交易所。
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>交易所</th>
                <th>API URL</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id}>
                  <td>{a.model}</td>
                  <td>{a.provider}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.api_url ? '***' : '-'}</td>
                  <td>
                    <span className={`badge ${a.is_active ? 'badge-running' : 'badge-stopped'}`}>
                      {a.is_active ? '已激活' : '未激活'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
