import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const fetchPublicPost = vi.fn()
vi.mock('../api/blogApi.js', () => ({ fetchPublicPost: (...a) => fetchPublicPost(...a) }))
vi.mock('../../../components/MarkdownViewer.jsx', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))
const PublicArticleDetail = (await import('./PublicArticleDetail.jsx')).default

beforeEach(() => { fetchPublicPost.mockReset() })

describe('PublicArticleDetail', () => {
  it('menampilkan artikel dengan penulis dari author.username', async () => {
    fetchPublicPost.mockResolvedValue({ title: 'Judul', excerpt: 'e', category: 'Bisnis', content: '# isi', author: { username: 'ani' }, published_at: '2026-11-01T00:00:00Z', reading_time: 2 })
    render(<PublicArticleDetail slug="judul" />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Judul' })).toBeInTheDocument()
    expect(await screen.findByTestId('viewer')).toHaveTextContent('# isi')
    expect(screen.getByText(/Oleh ani/)).toBeInTheDocument()
    expect(screen.getByText(/2 menit baca/)).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Judul - Delcom Blog'))
  })
  it('penulis dari user.username, author_name, atau kosong; kategori bawaan', async () => {
    fetchPublicPost.mockResolvedValue({ title: 'A', user: { username: 'budi' } })
    const a = render(<PublicArticleDetail slug="a" />)
    expect(await screen.findByText(/Oleh budi/)).toBeInTheDocument()
    expect(screen.getByText('Umum')).toBeInTheDocument()
    a.unmount()
    fetchPublicPost.mockResolvedValue({ title: 'B', author_name: 'cici' })
    const b = render(<PublicArticleDetail slug="b" />)
    expect(await screen.findByText(/Oleh cici/)).toBeInTheDocument()
    b.unmount()
    fetchPublicPost.mockResolvedValue({ title: 'C', author: {} })
    render(<PublicArticleDetail slug="c" />)
    await screen.findByText('C')
    expect(screen.queryByText(/Oleh/)).toBeNull()
  })
  it('galat dan memuat', async () => {
    fetchPublicPost.mockRejectedValue(new Error('Tidak ada'))
    render(<PublicArticleDetail slug="x" />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Tidak ada')
    await waitFor(() => expect(document.title).toBe('Artikel - Delcom Blog'))
  })
  it('mengabaikan respons setelah unmount', async () => {
    let ok, ko
    fetchPublicPost.mockReturnValueOnce(new Promise((r) => { ok = r }))
    render(<PublicArticleDetail slug="a" />).unmount()
    ok({ title: 'late' })
    fetchPublicPost.mockReturnValueOnce(new Promise((_, r) => { ko = r }))
    render(<PublicArticleDetail slug="b" />).unmount()
    ko(new Error('late'))
    await new Promise((r) => setTimeout(r, 10))
  })
})
