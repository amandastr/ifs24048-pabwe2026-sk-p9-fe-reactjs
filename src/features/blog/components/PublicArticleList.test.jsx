import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const fetchCategories = vi.fn()
const fetchPublicPosts = vi.fn()
vi.mock('../api/blogApi.js', () => ({
  fetchCategories: (...a) => fetchCategories(...a),
  fetchPublicPosts: (...a) => fetchPublicPosts(...a),
}))
const PublicArticleList = (await import('./PublicArticleList.jsx')).default

beforeEach(() => {
  fetchCategories.mockReset().mockResolvedValue(['Teknologi', { name: 'Bisnis' }])
  fetchPublicPosts.mockReset().mockResolvedValue([
    { id: 1, slug: 'a', title: 'Artikel A', excerpt: 'Ringkas', category: 'Teknologi', published_at: '2026-11-01T00:00:00Z', reading_time: 3 },
    { slug: 'b', title: 'Artikel B', excerpt: 'Ringkas B' },
  ])
})

describe('PublicArticleList', () => {
  it('menampilkan artikel dan kategori dari API', async () => {
    render(<PublicArticleList />)
    expect(await screen.findByRole('link', { name: 'Artikel A' })).toHaveAttribute('href', '/posts/a')
    expect(screen.getByText(/3 menit baca/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bisnis' })).toBeInTheDocument()
    expect(screen.getByText('Umum')).toBeInTheDocument()
  })
  it('kategori bawaan dipakai bila API kosong atau gagal', async () => {
    fetchCategories.mockResolvedValue([])
    const r = render(<PublicArticleList />)
    await screen.findByText('Artikel A')
    expect(screen.getByRole('button', { name: 'Opini' })).toBeInTheDocument()
    r.unmount()
    fetchCategories.mockRejectedValue(new Error('x'))
    render(<PublicArticleList />)
    expect(await screen.findByRole('button', { name: 'Pendidikan' })).toBeInTheDocument()
  })
  it('pencarian dan filter kategori memanggil API', async () => {
    render(<PublicArticleList />)
    await screen.findByText('Artikel A')
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    await waitFor(() => expect(fetchPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))
    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(fetchPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Bisnis' }))
    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('keadaan kosong', async () => {
    fetchPublicPosts.mockResolvedValue([])
    render(<PublicArticleList />)
    expect(await screen.findByText('Belum ada artikel yang ditemukan.')).toBeInTheDocument()
  })
  it('keadaan galat', async () => {
    fetchPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati')
  })
  it('hasil basi diabaikan setelah unmount', async () => {
    let resolve
    fetchPublicPosts.mockReturnValue(new Promise((r) => { resolve = r }))
    const { unmount } = render(<PublicArticleList />)
    await waitFor(() => expect(fetchPublicPosts).toHaveBeenCalled())
    unmount()
    resolve([{ slug: 'z', title: 'Z' }])
    await new Promise((r) => setTimeout(r, 10))
    fetchPublicPosts.mockReturnValue(new Promise((_, rej) => { resolve = rej }))
    const r2 = render(<PublicArticleList />)
    await waitFor(() => expect(fetchPublicPosts).toHaveBeenCalledTimes(2))
    r2.unmount()
    resolve(new Error('late'))
    await new Promise((r) => setTimeout(r, 10))
  })
})
