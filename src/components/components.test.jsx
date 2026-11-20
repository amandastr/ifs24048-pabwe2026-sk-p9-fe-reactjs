import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Link from './Link.jsx'
import Modal from './Modal.jsx'

const editorInst = { getMarkdown: vi.fn(() => '# md'), destroy: vi.fn() }
let editorOpts
vi.mock('@toast-ui/editor', () => ({
  default: class { constructor(o) { editorOpts = o; Object.assign(this, editorInst) } },
}))
const viewerInst = { destroy: vi.fn() }
let viewerCreated = 0
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: class { constructor(o) { this.o = o; viewerCreated += 1; Object.assign(this, viewerInst) } },
}))
const MarkdownEditor = (await import('./MarkdownEditor.jsx')).default
const MarkdownViewer = (await import('./MarkdownViewer.jsx')).default

describe('Link', () => {
  it('navigasi SPA pada klik biasa', async () => {
    window.scrollTo = vi.fn()
    render(<Link to="/login">Masuk</Link>)
    await userEvent.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(window.location.pathname).toBe('/login')
  })
  it('tidak mencegat klik dengan modifier atau tombol non-utama', () => {
    window.history.pushState({}, '', '/x')
    const block = (e) => e.preventDefault()
    document.addEventListener('click', block)
    render(<Link to="/login">Masuk</Link>)
    const a = screen.getByRole('link')
    fireEvent.click(a, { ctrlKey: true })
    fireEvent.click(a, { metaKey: true })
    fireEvent.click(a, { shiftKey: true })
    fireEvent.click(a, { button: 1 })
    document.removeEventListener('click', block)
    expect(window.location.pathname).toBe('/x')
  })
})

describe('Modal', () => {
  it('fokus, Esc menutup, dan footer tampil', async () => {
    const onClose = vi.fn()
    render(<Modal title="T" titleId="t" onClose={onClose} footer={<button>Simpan</button>}><p>isi</p></Modal>)
    expect(screen.getByRole('dialog', { name: 'T' })).toHaveFocus()
    await userEvent.keyboard('{a}')
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByText('Simpan')).toBeInTheDocument()
  })
})

const settle = () => new Promise((r) => setTimeout(r, 300))

describe('MarkdownEditor', () => {
  it('membuat editor, meneruskan perubahan, dan menghancurkan', async () => {
    const onChange = vi.fn()
    const { unmount } = render(<MarkdownEditor value="abc" onChange={onChange} />)
    await waitFor(() => expect(editorOpts).toBeDefined())
    expect(editorOpts.initialValue).toBe('abc')
    editorOpts.events.change()
    expect(onChange).toHaveBeenCalledWith('# md')
    unmount()
    expect(editorInst.destroy).toHaveBeenCalled()
  })
  it('value kosong dan unmount sebelum selesai dimuat', async () => {
    editorOpts = undefined
    const { unmount } = render(<MarkdownEditor onChange={() => {}} />)
    unmount()
    await settle()
    expect(editorOpts).toBeUndefined()
    render(<MarkdownEditor onChange={() => {}} />)
    await waitFor(() => expect(editorOpts.initialValue).toBe(''))
  })
})

describe('MarkdownViewer', () => {
  it('membuat viewer dan menghancurkannya', async () => {
    viewerInst.destroy.mockClear()
    viewerCreated = 0
    const { unmount } = render(<MarkdownViewer content="halo" />)
    await waitFor(() => expect(viewerCreated).toBe(1))
    unmount()
    expect(viewerInst.destroy).toHaveBeenCalled()
  })
  it('konten kosong dan unmount sebelum dimuat', async () => {
    viewerCreated = 0
    const a = render(<MarkdownViewer />)
    a.unmount()
    await settle()
    expect(viewerCreated).toBe(0)
    const b = render(<MarkdownViewer />)
    await waitFor(() => expect(viewerCreated).toBe(1))
    b.unmount()
  })
})
