import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { saveSession } from './helpers/apiHelper.js'

const logout = vi.fn()
vi.mock('./features/auth/api/authApi.js', () => ({
  logout: (...a) => logout(...a),
  login: vi.fn(),
  register: vi.fn(),
}))
vi.mock('./features/blog/components/PublicArticleList.jsx', () => ({ default: () => <h1>HOME</h1>, DEFAULT_CATEGORIES: [] }))
vi.mock('./features/blog/components/PublicArticleDetail.jsx', () => ({ default: ({ slug }) => <h1>DETAIL {slug}</h1> }))
vi.mock('./features/blog/components/AuthorDashboard.jsx', () => ({ default: () => <h1>AUTHOR</h1> }))
vi.mock('./features/admin/components/AdminDashboard.jsx', () => ({ default: () => <h1>ADMIN</h1> }))
const App = (await import('./App.jsx')).default
const { guard } = await import('./App.jsx')

const go = (p) => window.history.pushState({}, '', p)

beforeEach(() => {
  window.scrollTo = vi.fn()
  logout.mockReset().mockResolvedValue({})
  go('/')
})

describe('guard', () => {
  it('aturan akses', () => {
    expect(guard({ name: 'home' }, null)).toBeNull()
    expect(guard({ name: 'author' }, null)).toBe('/login')
    expect(guard({ name: 'author' }, { role: 'member' })).toBeNull()
    expect(guard({ name: 'admin' }, null)).toBe('/login')
    expect(guard({ name: 'admin' }, { role: 'member' })).toBe('/author')
    expect(guard({ name: 'admin' }, { role: 'admin' })).toBeNull()
  })
})

describe('App', () => {
  it('merender beranda dengan landmark dan tautan lewati', async () => {
    render(<App />)
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lewati ke konten utama' })).toBeInTheDocument()
  })
  it('/public juga beranda; detail artikel membawa slug', async () => {
    go('/posts/halo')
    render(<App />)
    expect(await screen.findByText('DETAIL halo')).toBeInTheDocument()
    act(() => { go('/public'); window.dispatchEvent(new PopStateEvent('popstate')) })
    expect(await screen.findByText('HOME')).toBeInTheDocument()
  })
  it('halaman tidak dikenal', async () => {
    go('/tidak-ada')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(document.title).toMatch(/Tidak Ditemukan/)
  })
  it('login dan register dapat diakses tamu', async () => {
    go('/login')
    render(<App />)
    expect(await screen.findByLabelText('Username')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('link', { name: 'Daftar' })[0])
    expect(await screen.findByLabelText('Email')).toBeInTheDocument()
  })
  it('/author tanpa sesi dialihkan ke /login', async () => {
    go('/author')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
  it('/admin tanpa sesi dialihkan ke /login', async () => {
    go('/admin')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
  it('member: /author terbuka, /admin dialihkan ke /author', async () => {
    saveSession('t', { role: 'member', username: 'm' })
    go('/author')
    const a = render(<App />)
    expect(await screen.findByText('AUTHOR')).toBeInTheDocument()
    a.unmount()
    go('/admin')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/author'))
  })
  it('admin dapat membuka /admin dan /author (sesi bertahan setelah reload)', async () => {
    saveSession('t', { role: 'admin', username: 'admin' })
    go('/admin')
    const a = render(<App />)
    expect(await screen.findByText('ADMIN')).toBeInTheDocument()
    a.unmount()
    go('/author')
    render(<App />)
    expect(await screen.findByText('AUTHOR')).toBeInTheDocument()
  })
  it('token tanpa data user dianggap belum login', async () => {
    localStorage.setItem('token', 't')
    go('/author')
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
  it('keluar menghapus sesi walau API logout gagal', async () => {
    saveSession('t', { role: 'member' })
    logout.mockRejectedValue(new Error('x'))
    go('/author')
    render(<App />)
    await screen.findByText('AUTHOR')
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(window.location.pathname).toBe('/'))
    expect(localStorage.getItem('token')).toBeNull()
    expect(await screen.findByRole('link', { name: 'Masuk' })).toBeInTheDocument()
  })
  it('keluar sukses', async () => {
    saveSession('t', { role: 'member' })
    go('/author')
    render(<App />)
    await screen.findByText('AUTHOR')
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(logout).toHaveBeenCalled())
  })
  it('sesi kedaluwarsa mengeluarkan pengguna', async () => {
    saveSession('t', { role: 'member' })
    go('/author')
    render(<App />)
    await screen.findByText('AUTHOR')
    act(() => { window.dispatchEvent(new Event('session-expired')) })
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
  it('toggle tema', async () => {
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Ganti ke tema gelap' }))
    expect(document.documentElement).toHaveClass('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Ganti ke tema terang' }))
  })
})
