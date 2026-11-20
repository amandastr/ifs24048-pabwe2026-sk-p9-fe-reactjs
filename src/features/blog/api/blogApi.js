import { apiRequest } from '../../../helpers/apiHelper.js'

export const fetchCategories = () => apiRequest('/api/public/categories', { auth: false })

export const fetchPublicPosts = ({ q = '', category = '' } = {}) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return apiRequest(`/api/public/posts${qs ? `?${qs}` : ''}`, { auth: false })
}

export const fetchPublicPost = (slug) =>
  apiRequest(`/api/public/posts/${encodeURIComponent(slug)}`, { auth: false })

export const fetchMyPosts = () => apiRequest('/api/posts')
export const fetchStats = () => apiRequest('/api/posts/stats')
export const createPost = (body) => apiRequest('/api/posts', { method: 'POST', body })
export const updatePost = (id, body) => apiRequest(`/api/posts/${id}`, { method: 'PUT', body })
export const deletePost = (id) => apiRequest(`/api/posts/${id}`, { method: 'DELETE' })
export const togglePublish = (id) => apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const aiGenerate = (body) => apiRequest('/api/posts/ai-generate', { method: 'POST', body })
