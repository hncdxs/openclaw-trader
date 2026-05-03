import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [decisions, setDecisions] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getOverview(),
      api.getDecisions(20),
      api.getThinkingLogs(10),
    ]).then(([ov, dec, lg]) => {
      setOverview(ov)
      setDecisions(dec)
      setLogs(lg)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <h1>📊 看板</h1>

      {/* 概览统计 */}
      {overview && (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>交易员总数</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{overview.total_traders || 0}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>运行中</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
              {overview.running_traders || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>决策总数</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {overview.recent_decisions?.length || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI 引擎</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>🦞 OpenClaw</div>
          </div>
        </div>
      )}

      {/* 最近决策 */}
      <h2>最近决策</h2>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
        {decisions.length === 0 ? (
          <div className="empty-state">暂无决策数据</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>交易对</th>
                <th>信号</th>
                <th>置信度</th>
                <th>价格</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d: any) => (
                <tr key={d.id}>
                  <td><strong>{d.symbol}</strong></td>
                  <td>
                    <span className={`badge badge-${d.signal}`}>
                      {d.signal === 'long' ? '📈 做多' : d.signal === 'short' ? '📉 做空' : '⏸ 观望'}
                    </span>
                  </td>
                  <td>{(d.confidence * 100).toFixed(0)}%</td>
                  <td>{d.price ? `$${d.price}` : '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {d.time ? new Date(d.time).toLocaleString('zh-CN') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thinking Logs */}
      <h2>AI 推理日志</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {logs.length === 0 ? (
          <div className="empty-state">暂无日志</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>交易员</th>
                <th>Prompt</th>
                <th>回复</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id}>
                  <td>{l.trader_id}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.prompt || '-'}
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.response || '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {l.time ? new Date(l.time).toLocaleString('zh-CN') : '-'}
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
