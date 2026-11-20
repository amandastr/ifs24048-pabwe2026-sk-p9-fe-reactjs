import { lazy, Suspense, useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { createPost, updatePost } from '../api/blogApi.js'
import { DEFAULT_CATEGORIES } from '../components/PublicArticleList.jsx'

const MarkdownEditor = lazy(() => import('../../../components/MarkdownEditor.jsx'))

export default function PostModal({ post, onClose, onSaved }) {
  const [title, setTitle] = useState((post && post.title) || '')
  const [category, setCategory] = useState((post && post.category) || 'Umum')
  const [excerpt, setExcerpt] = useState((post && post.excerpt) || '')
  const [content, setContent] = useState((post && post.content) || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setError('')
    if (!title.trim()) return setError('Judul wajib diisi')
    setBusy(true)
    try {
      const body = { title, category, excerpt, content }
      if (post && post.id) await updatePost(post.id, body)
      else await createPost(body)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={post && post.id ? 'Ubah Artikel' : 'Tambah Artikel'}
      titleId="post-modal-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Batal</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <div className="grid gap-4">
        {error && <p role="alert" className="err">{error}</p>}
        <div>
          <label htmlFor="post-title" className="label">Judul</label>
          <input id="post-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor="post-category" className="label">Kategori</label>
          <select id="post-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {DEFAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="post-excerpt" className="label">Ringkasan</label>
          <textarea id="post-excerpt" rows={2} className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <p className="label">Isi artikel (Markdown)</p>
          <Suspense fallback={<p className="muted">Memuat editor...</p>}>
            <MarkdownEditor value={content} onChange={setContent} />
          </Suspense>
        </div>
      </div>
    </Modal>
  )
}
