import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const fetchUsers = vi.fn()
const fetchAllPosts = vi.fn()
vi.mock('../api/adminApi.js', () => ({ fetchUsers: (...a) => fetchUsers(...a), fetchAllPosts: (...a) => fetchAllPosts(...a) }))
const AdminDashboard = (await import('./AdminDashboard.jsx')).default

beforeEach(() => { fetchUsers.mockReset(); fetchAllPosts.mockReset() })

describe('AdminDashboard', () => {
  it('menampilkan pengguna dan artikel', async () => {
    fetchUsers.mockResolvedValue([
      { id: 1, username: 'admin', email: 'a@x', role: 'admin', total_posts: 3, total_published: 2 },
      { id: 2, username: 'member', email: 'm@x', role: 'member' },
    ])
    fetchAllPosts.mockResolvedValue([
      { id: 1, title: 'P1', author: { username: 'admin' }, category: 'Bisnis', is_published: true, created_at: '2026-11-01T00:00:00Z' },
      { id: 2, title: 'P2', user: { username: 'member' }, category: 'Umum', is_published: false },
      { id: 3, title: 'P3', category: 'Umum' },
    ])
    render(<AdminDashboard />)
    expect(await screen.findByText('P1')).toBeInTheDocument()
    expect(screen.getAllByRole('table')).toHaveLength(2)
    expect(screen.getAllByText('member').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Terbit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Draf').length).toBe(2)
  })
  it('galat', async () => {
    fetchUsers.mockRejectedValue(new Error('akses ditolak'))
    fetchAllPosts.mockResolvedValue([])
    render(<AdminDashboard />)
    expect(await screen.findByRole('alert')).toHaveTextContent('akses ditolak')
  })
})
