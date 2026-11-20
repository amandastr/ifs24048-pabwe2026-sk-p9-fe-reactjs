import { lazy, Suspense, useEffect, useState } from 'react'
import Link from '../../../components/Link.jsx'
import useTitle from '../../../hooks/useTitle.js'
import { formatDate } from '../../../helpers/toolsHelper.js'
import { fetchPublicPost } from '../api/blogApi.js'

const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer.jsx'))

export default function PublicArticleDetail({ slug }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  useTitle(post ? `${post.title} - Delcom Blog` : 'Artikel - Delcom Blog', post && post.excerpt)

  useEffect(() => {
    let active = true
    setPost(null)
    setError('')
    fetchPublicPost(slug)
      .then((d) => active && setPost(d))
      .catch((e) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [slug])

  const author = post && ((post.author && post.author.username) || (post.user && post.user.username) || post.author_name)

  return (
    <div className="mx-auto w-full px-4 py-8 md:px-10">
      <Link to="/" className="link">&larr; Kembali ke beranda</Link>
      {error && <p role="alert" className="err mt-6">{error}</p>}
      {!post && !error && <p className="muted mt-6">Memuat artikel...</p>}
      {post && (
        <article className="mt-4">
          <span className="badge badge-ok">{post.category || 'Umum'}</span>
          <h1 className="mt-2 text-3xl font-extrabold">{post.title}</h1>
          <p className="muted mt-1">
            {author ? `Oleh ${author} · ` : ''}
            {formatDate(post.published_at)}
            {post.reading_time ? ` · ${post.reading_time} menit baca` : ''}
          </p>
          <div className="card mt-6">
            <Suspense fallback={<p className="muted">Memuat konten...</p>}>
              <MarkdownViewer content={post.content} />
            </Suspense>
          </div>
        </article>
      )}
    </div>
  )
}
