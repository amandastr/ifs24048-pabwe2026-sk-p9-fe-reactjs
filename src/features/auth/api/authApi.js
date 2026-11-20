import { apiRequest } from '../../../helpers/apiHelper.js'

export const login = (username, password) =>
  apiRequest('/api/auth/login', { method: 'POST', body: { username, password }, auth: false })

export const register = (username, email, password) =>
  apiRequest('/api/auth/register', { method: 'POST', body: { username, email, password }, auth: false })

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' })

export const getProfile = () => apiRequest('/api/auth/profile')
