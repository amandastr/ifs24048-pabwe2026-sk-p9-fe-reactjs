import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const api = { fetchMyPosts: vi.fn(), fetchStats: vi.fn(), togglePublish: vi.fn(), deletePost: vi.fn() }
vi.mock('../api/blogApi.js', () => ({
  fetchMyPosts: (...a) => api.fetchMyPosts(...a),
  fetchStats: (...a) => api.fetchStats(...a),
  togglePublish: (...a) => api.togglePublish(...a),
  deletePost: (...a) => api.deletePost(...a),
}))
const tools = { confirm: vi.fn(), ok: vi.fn(), err: vi.fn() }
vi.mock('../../../helpers/toolsHelper.js', () => ({
  formatDate: () => '1 Nov 2026',
  showConfirmDialog: (...a) => tools.confirm(...a),
  showSuccessAlert: (...a) => tools.ok(...a),
  showErrorAlert: (...a) => tools.err(...a),
}))
vi.mock('../modals/PostModal.jsx', () => ({
  default: ({ post, onClose, onSaved }) => (
    <div role="dialog" aria-label="post-modal">
      <span>{post ? `edit:${post.title}` : 'baru'}</span>
      <button onClick={onSaved}>simpan-mock</button>
      <button onClick={onClose}>tutup-mock</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal.jsx', () => ({
  default: ({ onClose, onApply }) => (
    <div role="dialog" aria-label="ai-modal">
      <button onClick={() => onApply({ title: 'Draf', category: 'Bisnis', excerpt: 'e', content: 'c' })}>apply-mock</button>
      <button onClick={onClose}>tutup-ai</button>
    </div>
  ),
}))
const AuthorDashboard = (await import('./AuthorDashboard.jsx')).default

const posts = [
  { id: 1, title: 'Satu', slug: 'satu', category: 'Bisnis', is_published: true, created_at: 'x' },
  { id: 2, title: 'Dua', slug: 'dua', category: 'Umum', is_published: false, created_at: 'x' },
]

beforeEach(() => {
  api.fetchMyPosts.mockReset().mockResolvedValue(posts)
  api.fetchStats.mockReset().mockResolvedValue({ total: 2, total_published: 1, total_draft: 1 })
  api.togglePublish.mockReset().mockResolvedValue({})
  api.deletePost.mockReset().mockResolvedValue({})
  tools.confirm.mockReset().mockResolvedValue(true)
  tools.ok.mockReset()
  tools.err.mockReset()
})

describe('AuthorDashboard', () => {
  it('menampilkan statistik dan tabel', async () => {
    render(<AuthorDashboard />)
    expect(await screen.findByText('Satu')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByText('Terbit').length).toBeGreaterThan(0)
  })
  it('tabel kosong', async () => {
    api.fetchMyPosts.mockResolvedValue([])
    render(<AuthorDashboard />)
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
  })
  it('galat memuat', async () => {
    api.fetchMyPosts.mockRejectedValue(new Error('gagal muat'))
    render(<AuthorDashboard />)
    expect(await screen.findByRole('alert')).toHaveTextContent('gagal muat')
  })
  it('toggle publikasi sukses dan gagal', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan artikel Dua' }))
    expect(api.togglePublish).toHaveBeenCalledWith(2)
    api.togglePublish.mockRejectedValueOnce(new Error('x'))
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan artikel Satu' }))
    await waitFor(() => expect(tools.err).toHaveBeenCalledWith('x'))
  })
  it('menu kebab: lihat hanya untuk artikel terbit, ubah membuka modal', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    const k1 = screen.getByRole('button', { name: 'Menu aksi untuk Satu' })
    await userEvent.click(k1)
    expect(k1).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'Lihat' })).toHaveAttribute('href', '/posts/satu')
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ubah' }))
    expect(screen.getByText('edit:Satu')).toBeInTheDocument()
    await userEvent.click(screen.getByText('tutup-mock'))
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi untuk Dua' }))
    expect(screen.queryByRole('menuitem', { name: 'Lihat' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi untuk Dua' }))
    expect(screen.queryByRole('menu')).toBeNull()
  })
  it('hapus: batal, sukses, dan gagal', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    tools.confirm.mockResolvedValueOnce(false)
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi untuk Satu' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    expect(api.deletePost).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi untuk Satu' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(api.deletePost).toHaveBeenCalledWith(1))
    expect(tools.ok).toHaveBeenCalled()
    api.deletePost.mockRejectedValueOnce(new Error('tidak bisa'))
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi untuk Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    await waitFor(() => expect(tools.err).toHaveBeenCalledWith('tidak bisa'))
  })
  it('tambah artikel lalu simpan menutup modal dan memuat ulang', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Artikel' }))
    expect(screen.getByText('baru')).toBeInTheDocument()
    await userEvent.click(screen.getByText('simpan-mock'))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(tools.ok).toHaveBeenCalled()
    expect(api.fetchMyPosts).toHaveBeenCalledTimes(2)
  })
  it('AI generator: terapkan membuka editor, tutup menutup', async () => {
    render(<AuthorDashboard />)
    await screen.findByText('Satu')
    await userEvent.click(screen.getByRole('button', { name: 'AI Generator' }))
    await userEvent.click(screen.getByText('tutup-ai'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'AI Generator' }))
    await userEvent.click(screen.getByText('apply-mock'))
    expect(within(screen.getByRole('dialog')).getByText('edit:Draf')).toBeInTheDocument()
  })
})
