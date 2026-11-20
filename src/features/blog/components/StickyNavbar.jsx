import Link from '../../../components/Link.jsx'

export default function StickyNavbar({ user, theme, onToggleTheme, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <Link to="/" className="mr-auto text-xl font-extrabold" style={{ color: 'var(--accent)' }}>Delcom Blog</Link>
        <Link to="/" className="link inline-flex min-h-[44px] items-center">Beranda</Link>
        {user ? (
          <>
            <Link to="/author" className="link inline-flex min-h-[44px] items-center">Workspace Penulis</Link>
            {user.role === 'admin' && <Link to="/admin" className="link inline-flex min-h-[44px] items-center">Admin Panel</Link>}
            <button type="button" className="btn" onClick={onLogout}>Keluar</button>
          </>
        ) : (
          <>
            <Link to="/login" className="link inline-flex min-h-[44px] items-center">Masuk</Link>
            <Link to="/register" className="link inline-flex min-h-[44px] items-center">Daftar</Link>
          </>
        )}
        <button type="button" className="btn" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}>
          {theme === 'dark' ? 'Terang' : 'Gelap'}
        </button>
      </nav>
    </header>
  )
}
