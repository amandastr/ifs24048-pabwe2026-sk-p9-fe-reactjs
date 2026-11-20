import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiRequest = vi.fn(async () => 'ok')
vi.mock('../helpers/apiHelper.js', () => ({ apiRequest: (...a) => apiRequest(...a) }))

const auth = await import('./auth/api/authApi.js')
const blog = await import('./blog/api/blogApi.js')
const admin = await import('./admin/api/adminApi.js')

beforeEach(() => { apiRequest.mockClear() })

describe('API modules', () => {
  it('authApi', async () => {
    await auth.login('u', 'p')
    await auth.register('u', 'e', 'p')
    await auth.logout()
    await auth.getProfile()
    expect(apiRequest.mock.calls.map((c) => c[0])).toEqual(['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/profile'])
  })
  it('blogApi publik', async () => {
    await blog.fetchCategories()
    await blog.fetchPublicPosts()
    await blog.fetchPublicPosts({ q: 'go', category: 'Bisnis' })
    await blog.fetchPublicPost('a b')
    expect(apiRequest.mock.calls.map((c) => c[0])).toEqual([
      '/api/public/categories', '/api/public/posts', '/api/public/posts?q=go&category=Bisnis', '/api/public/posts/a%20b',
    ])
  })
  it('blogApi penulis', async () => {
    await blog.fetchMyPosts()
    await blog.fetchStats()
    await blog.createPost({})
    await blog.updatePost(1, {})
    await blog.deletePost(1)
    await blog.togglePublish(1)
    await blog.aiGenerate({})
    expect(apiRequest).toHaveBeenCalledTimes(7)
  })
  it('adminApi', async () => {
    await admin.fetchUsers()
    await admin.fetchAllPosts()
    expect(apiRequest).toHaveBeenCalledTimes(2)
  })
})
