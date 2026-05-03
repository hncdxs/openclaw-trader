import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function Strategies() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editName, setEditName] = useState('')

  const load = () => {
    setLoading(true)
    api.listStrategies().then(setStrategies).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editName.trim()) return
    await api.saveStrategy({ name: editName, content: editContent })
    setEditing(null)
    load()
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除策略 "${name}"？`)) return
    await api.deleteStrategy(name)
    load()
  }

  const handleNew = () => {
    setEditName('')
    setEditContent(`# 新策略\n\n## 技术指标\n- EMA12/26\n- RSI14\n\n## 交易规则\n...`)
    setEditing('__new__')
  }

  return (
    <div>
      <div className="page-header">
        <h1>📝 策略</h1>
        <button className="btn btn-primary" onClick={handleNew}>+ 新建策略</button>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>{editing === '__new__' ? '新建策略' : '编辑策略'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {editing === '__new__' && (
              <input
                placeholder="策略名称（字母数字，如 btc-scalping）"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '0.5rem 0.75rem', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.85rem',
                }}
              />
            )}
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={16}
              style={{
                background: '#0d0d14', border: '1px solid var(--border)',
                borderRadius: 6, padding: '0.75rem', color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
              <button className="btn" onClick={() => setEditing(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : strategies.length === 0 ? (
        <div className="card empty-state">
          暂无策略。<br />
          策略以 OpenClaw Skill 格式 (Markdown) 编写，存放在 Skills 目录。
        </div>
      ) : (
        <div className="grid-2">
          {strategies.map((s: any) => (
            <div className="card" key={s.id}>
              <div className="card-header">
                <strong>📄 {s.name}</strong>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => { setEditing(s.id); setEditName(s.name); setEditContent(s.content) }}>
                    ✏️ 编辑
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => handleDelete(s.name)}>🗑</button>
                </div>
              </div>
              <div className="log-viewer" style={{ maxHeight: '200px', fontSize: '0.75rem' }}>
                {s.content.substring(0, 1000)}
                {s.content.length > 1000 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
