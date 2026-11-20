import { useCallback, useEffect, useState } from 'react'
import Link from '../../../components/Link.jsx'
import useTitle from '../../../hooks/useTitle.js'
import { asList } from '../../../helpers/apiHelper.js'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper.js'
import { deletePost, fetchMyPosts, fetchStats, togglePublish } from '../api/blogApi.js'
import PostModal from '../modals/PostModal.jsx'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal.jsx'
import PostStats from './PostStats.jsx'

export default function AuthorDashboard() {
  useTitle('Workspace Penulis - Delcom Blog', 'Kelola artikel Anda: tulis, terbitkan, dan buat draf dengan AI.')
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [menu, setMenu] = useState(null)
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([fetchMyPosts(), fetchStats()])
      setPosts(asList(p))
      setStats(s)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (p) => {
    try {
      await togglePublish(p.id)
      await load()
    } catch (e) {
      showErrorAlert(e.message)
    }
  }

  const remove = async (p) => {
    setMenu(null)
    if (!(await showConfirmDialog(`Hapus artikel "${p.title}"?`))) return
    try {
      await deletePost(p.id)
      showSuccessAlert('Artikel dihapus')
      await load()
    } catch (e) {
      showErrorAlert(e.message)
    }
  }

  const saved = async () => {
    setModal(null)
    showSuccessAlert('Artikel disimpan')
    await load()
  }

  return (
    <div className="mx-auto w-full px-4 py-8 md:px-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-3xl font-extrabold">Workspace Penulis</h1>
        <button type="button" className="btn" onClick={() => setModal({ type: 'ai' })}>AI Generator</button>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'post', post: null })}>Tambah Artikel</button>
      </div>

      {error && <p role="alert" className="err mt-4">{error}</p>}
      <div className="mt-6"><PostStats stats={stats} /></div>

      <div className="card mt-6 overflow-x-auto">
        <table className="table">
          <caption className="sr-only">Daftar artikel Anda</caption>
          <thead>
            <tr>
              <th scope="col">Judul</th>
              <th scope="col">Kategori</th>
              <th scope="col">Dibuat</th>
              <th scope="col">Terbit</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={5} className="muted">Belum ada artikel.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.title}</td>
                <td>{p.category}</td>
                <td>{formatDate(p.created_at)}</td>
                <td>
                  <button type="button" role="switch" className="switch" aria-checked={!!p.is_published} aria-label={`Terbitkan artikel ${p.title}`} onClick={() => toggle(p)} />
                  <span className={`badge ml-2 ${p.is_published ? 'badge-ok' : 'badge-warn'}`}>{p.is_published ? 'Terbit' : 'Draf'}</span>
                </td>
                <td className="relative">
                  <button type="button" className="btn" aria-haspopup="menu" aria-expanded={menu === p.id} aria-label={`Menu aksi untuk ${p.title}`} onClick={() => setMenu(menu === p.id ? null : p.id)}>&#8942;</button>
                  {menu === p.id && (
                    <div role="menu" className="card absolute right-0 z-10 mt-1 flex w-44 flex-col gap-1 p-2">
                      {p.is_published && <Link to={`/posts/${p.slug}`} role="menuitem" className="link p-2">Lihat</Link>}
                      <button type="button" role="menuitem" className="btn" onClick={() => { setMenu(null); setModal({ type: 'post', post: p }) }}>Ubah</button>
                      <button type="button" role="menuitem" className="btn btn-danger" onClick={() => remove(p)}>Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && modal.type === 'post' && <PostModal post={modal.post} onClose={() => setModal(null)} onSaved={saved} />}
      {modal && modal.type === 'ai' && (
        <AiPostGeneratorModal
          onClose={() => setModal(null)}
          onApply={(draft) => setModal({ type: 'post', post: { title: draft.title, category: draft.category, excerpt: draft.excerpt, content: draft.content } })}
        />
      )}
    </div>
  )
}
