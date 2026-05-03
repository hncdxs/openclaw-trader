const API_BASE = '/api'

async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // 看板
  getOverview: () => fetchAPI('/dashboard/overview'),
  getTraders: () => fetchAPI('/dashboard/traders'),
  getDecisions: (limit = 50) => fetchAPI(`/dashboard/decisions?limit=${limit}`),
  getThinkingLogs: (limit = 20) => fetchAPI(`/dashboard/thinking-logs?limit=${limit}`),

  // 交易员
  listTraders: () => fetchAPI('/traders/'),
  createTrader: (data: any) => fetchAPI('/traders/', {
    method: 'POST', body: JSON.stringify(data),
  }),
  getTrader: (id: string) => fetchAPI(`/traders/${id}`),
  deleteTrader: (id: string) => fetchAPI(`/traders/${id}`, { method: 'DELETE' }),
  startTrader: (id: string) => fetchAPI(`/traders/${id}/start`, { method: 'POST' }),
  stopTrader: (id: string) => fetchAPI(`/traders/${id}/stop`, { method: 'POST' }),

  // 策略
  listStrategies: () => fetchAPI('/strategies/'),
  saveStrategy: (data: any) => fetchAPI('/strategies/', {
    method: 'POST', body: JSON.stringify(data),
  }),
  deleteStrategy: (name: string) => fetchAPI(`/strategies/${name}`, { method: 'DELETE' }),

  // 交易所
  listAccounts: () => fetchAPI('/exchange/accounts'),
  saveAccount: (data: any) => fetchAPI('/exchange/accounts', {
    method: 'POST', body: JSON.stringify(data),
  }),
}
