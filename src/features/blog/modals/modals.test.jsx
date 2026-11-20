import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const createPost = vi.fn()
const updatePost = vi.fn()
const aiGenerate = vi.fn()
vi.mock('../api/blogApi.js', () => ({
  createPost: (...a) => createPost(...a),
  updatePost: (...a) => updatePost(...a),
  aiGenerate: (...a) => aiGenerate(...a),
}))
vi.mock('../../../components/MarkdownEditor.jsx', () => ({
  default: ({ value, onChange }) => <textarea aria-label="editor" defaultValue={value} onChange={(e) => onChange(e.target.value)} />,
}))
const PostModal = (await import('./PostModal.jsx')).default
const AiPostGeneratorModal = (await import('./AiPostGeneratorModal.jsx')).default

beforeEach(() => { createPost.mockReset(); updatePost.mockReset(); aiGenerate.mockReset() })

describe('PostModal', () => {
  it('membuat artikel baru', async () => {
    createPost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<PostModal post={null} onClose={() => {}} onSaved={onSaved} />)
    expect(screen.getByRole('heading', { name: 'Tambah Artikel' })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Judul'), 'Baru')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText('Ringkasan'), 'rr')
    await userEvent.type(await screen.findByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(createPost).toHaveBeenCalledWith({ title: 'Baru', category: 'Bisnis', excerpt: 'rr', content: 'isi' })
    expect(onSaved).toHaveBeenCalled()
  })
  it('validasi judul wajib', async () => {
    render(<PostModal post={null} onClose={() => {}} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul wajib diisi')
  })
  it('mengubah artikel yang ada', async () => {
    updatePost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<PostModal post={{ id: 4, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c' }} onClose={() => {}} onSaved={onSaved} />)
    expect(screen.getByRole('heading', { name: 'Ubah Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(updatePost).toHaveBeenCalledWith(4, { title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c' })
  })
  it('draf dari AI tanpa id dibuat sebagai artikel baru; galat ditampilkan', async () => {
    createPost.mockRejectedValue(new Error('gagal simpan'))
    render(<PostModal post={{ title: 'Draf AI' }} onClose={() => {}} onSaved={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Tambah Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('gagal simpan')
    expect(createPost).toHaveBeenCalled()
  })
  it('tombol Batal menutup', async () => {
    const onClose = vi.fn()
    render(<PostModal onClose={onClose} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('AiPostGeneratorModal', () => {
  it('topik wajib diisi', async () => {
    render(<AiPostGeneratorModal onClose={() => {}} onApply={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik wajib diisi')
  })
  it('generate lalu terapkan, sumber berupa string dan objek', async () => {
    aiGenerate.mockResolvedValue({ title: 'Hasil', excerpt: 'ex', sources: ['http://a', { url: 'http://b', title: 'B' }, { url: 'http://c' }] })
    const onApply = vi.fn()
    render(<AiPostGeneratorModal onClose={() => {}} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'AI')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.click(screen.getByLabelText('Sertakan penelusuran search engine'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'AI', category: 'Bisnis', include_web_search: false })
    expect(await screen.findByText('Hasil')).toBeInTheDocument()
    expect(screen.getByText('http://a')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('http://c')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(onApply).toHaveBeenCalled()
  })
  it('hasil tanpa sumber, search_sources, galat, dan Batal', async () => {
    aiGenerate.mockResolvedValueOnce({ title: 'T', search_sources: [{ title: 'S' }] })
    const onClose = vi.fn()
    render(<AiPostGeneratorModal onClose={onClose} onApply={() => {}} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('S')).toBeInTheDocument()
    aiGenerate.mockResolvedValueOnce({ title: 'U' })
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('U')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
    aiGenerate.mockRejectedValueOnce(new Error('AI mati'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI mati')
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})
