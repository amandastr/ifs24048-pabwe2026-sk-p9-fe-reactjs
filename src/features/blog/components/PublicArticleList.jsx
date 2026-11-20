import { useEffect, useState } from 'react'
import Link from '../../../components/Link.jsx'
import useTitle from '../../../hooks/useTitle.js'
import { asList } from '../../../helpers/apiHelper.js'
import { formatDate } from '../../../helpers/toolsHelper.js'
import { fetchCategories, fetchPublicPosts } from '../api/blogApi.js'

export const DEFAULT_CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export default function PublicArticleList() {
  useTitle('Delcom Blog - Artikel Teknologi, Pendidikan dan Bisnis', 'Baca artikel terbaru seputar teknologi, pendidikan, gaya hidup, bisnis, dan opini di Delcom Blog.')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
      .then((d) => {
        const list = asList(d, 'categories').map((c) => (typeof c === 'string' ? c : c.name))
        if (list.length) setCategories(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      fetchPublicPosts({ q, category })
        .then((d) => {
          if (!active) return
          setPosts(asList(d))
          setError('')
        })
        .catch((e) => active && setError(e.message))
        .finally(() => active && setLoading(false))
    }, 300)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [q, category])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Artikel Terbaru</h1>
      <p className="muted mt-1">Temukan tulisan menarik dari para penulis Delcom Blog.</p>

      <div className="mt-6">
        <label htmlFor="search" className="label">Cari artikel</label>
        <input id="search" type="search" className="input" placeholder="Ketik kata kunci..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div role="group" aria-label="Filter kategori" className="mt-4 flex flex-wrap gap-2">
        {['', ...categories].map((c) => (
          <button key={c || 'all'} type="button" className="pill" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c || 'Semua'}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {error && <p role="alert" className="err">{error}</p>}
        {loading && !error && <p className="muted">Memuat artikel...</p>}
        {!loading && !error && posts.length === 0 && <p className="muted">Belum ada artikel yang ditemukan.</p>}
      </div>

      <ul className="mt-2 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id || p.slug}>
            <article className="card h-full">
              <span className="badge badge-ok">{p.category || 'Umum'}</span>
              <h2 className="mt-2 text-lg font-bold">
                <Link to={`/posts/${p.slug}`} className="link">{p.title}</Link>
              </h2>
              <p className="mt-1">{p.excerpt}</p>
              <p className="muted mt-2 text-sm">
                {formatDate(p.published_at)}
                {p.reading_time ? ` · ${p.reading_time} menit baca` : ''}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
