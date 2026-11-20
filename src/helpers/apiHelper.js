const BASE = import.meta.env.VITE_API_URL || ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export const getToken = () => localStorage.getItem('token')

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export const saveSession = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const asList = (data, key = 'posts') => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data[key])) return data[key]
  if (data && Array.isArray(data.items)) return data.items
  return []
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server', 0)
  }

  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok || (json && json.status && json.status !== 'success')) {
    if (res.status === 401 && auth && token) {
      clearSession()
      window.dispatchEvent(new Event('session-expired'))
    }
    throw new ApiError((json && json.message) || `Permintaan gagal (${res.status})`, res.status)
  }
  return json ? json.data : undefined
}
