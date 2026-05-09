const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  dashboard: { get: () => request('GET', '/dashboard') },
  ingredients: {
    list: () => request('GET', '/ingredients'),
    create: (data) => request('POST', '/ingredients', data),
    update: (id, data) => request('PUT', `/ingredients/${id}`, data),
    remove: (id) => request('DELETE', `/ingredients/${id}`)
  },
  recipes: {
    list: () => request('GET', '/recipes'),
    get: (id) => request('GET', `/recipes/${id}`),
    create: (data) => request('POST', '/recipes', data),
    update: (id, data) => request('PUT', `/recipes/${id}`, data),
    remove: (id) => request('DELETE', `/recipes/${id}`)
  },
  cookLog: {
    list: () => request('GET', '/cook-log'),
    create: (data) => request('POST', '/cook-log', data),
    remove: (id) => request('DELETE', `/cook-log/${id}`)
  }
}
