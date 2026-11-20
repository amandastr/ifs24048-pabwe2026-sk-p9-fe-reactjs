import { lazy, Suspense, useEffect, useState } from 'react'
import Link from './components/Link.jsx'
import useTheme from './hooks/useTheme.js'
import useTitle from './hooks/useTitle.js'
import { clearSession, getToken, getUser } from './helpers/apiHelper.js'
import { matchRoute, navigate } from './helpers/router.js'
import AuthPage from './features/auth/components/AuthPage.jsx'
import { logout } from './features/auth/api/authApi.js'
import PublicArticleList from './features/blog/components/PublicArticleList.jsx'
import StickyNavbar from './features/blog/components/StickyNavbar.jsx'

const PublicArticleDetail = lazy(() => import('./features/blog/components/PublicArticleDetail.jsx'))
const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard.jsx'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard.jsx'))

function NotFound() {
  useTitle('Halaman Tidak Ditemukan - Delcom Blog', 'Halaman yang Anda cari tidak ditemukan.')
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="muted mt-2">Alamat yang Anda buka tidak tersedia.</p>
      <Link to="/" className="link mt-4 inline-block">Kembali ke beranda</Link>
    </div>
  )
}

export function guard(route, user) {
  if (route.name === 'author' && !user) return '/login'
  if (route.name === 'admin') {
    if (!user) return '/login'
    if (user.role !== 'admin') return '/author'
  }
  return null
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(() => (getToken() ? getUser() : null))
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    const onExpired = () => setUser(null)
    window.addEventListener('popstate', onPop)
    window.addEventListener('session-expired', onExpired)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('session-expired', onExpired)
    }
  }, [])

  const route = matchRoute(path)
  const redirect = guard(route, user)

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  const onLogout = async () => {
    try {
      await logout()
    } catch {
      /* sesi tetap dihapus di sisi klien */
    }
    clearSession()
    setUser(null)
    navigate('/')
  }

  let page = null
  if (!redirect) {
    if (route.name === 'home') page = <PublicArticleList />
    else if (route.name === 'post') page = <PublicArticleDetail slug={route.slug} />
    else if (route.name === 'login' || route.name === 'register') page = <AuthPage key={route.name} mode={route.name} onAuth={setUser} />
    else if (route.name === 'author') page = <AuthorDashboard />
    else if (route.name === 'admin') page = <AdminDashboard />
    else page = <NotFound />
  }

  return (
    <>
      <a href="#main" className="sr-only-focusable">Lewati ke konten utama</a>
      <StickyNavbar user={user} theme={theme} onToggleTheme={toggle} onLogout={onLogout} />
      <main id="main" style={{ minHeight: '70vh' }}>
        <Suspense fallback={<p className="muted p-8">Memuat halaman...</p>}>{page}</Suspense>
      </main>
      <footer className="border-t px-4 py-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="muted">&copy; 2026 Delcom Blog</p>
      </footer>
    </>
  )
}
