import { useState } from 'react'
import Link from '../../../components/Link.jsx'
import useInput from '../../../hooks/useInput.js'
import useTitle from '../../../hooks/useTitle.js'
import { saveSession } from '../../../helpers/apiHelper.js'
import { navigate } from '../../../helpers/router.js'
import { login, register } from '../api/authApi.js'

export default function AuthPage({ mode = 'login', onAuth }) {
  const isLogin = mode === 'login'
  useTitle(
    isLogin ? 'Masuk - Delcom Blog' : 'Daftar - Delcom Blog',
    isLogin ? 'Masuk ke Delcom Blog untuk mengelola artikel Anda.' : 'Daftar akun penulis baru di Delcom Blog.',
  )
  const [username, onUsername] = useInput('')
  const [email, onEmail] = useInput('')
  const [password, onPassword] = useInput('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) {
        const data = await login(username, password)
        saveSession(data.token, data.user)
        onAuth(data.user)
        navigate(data.user.role === 'admin' ? '/admin' : '/author')
      } else {
        await register(username, email, password)
        navigate('/login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card">
        <h1 className="mb-4 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-username" className="label">Username</label>
            <input id="login-username" name="username" className="input" autoComplete="username" value={username} onChange={onUsername} required />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="register-email" className="label">Email</label>
              <input id="register-email" name="email" type="email" className="input" autoComplete="email" value={email} onChange={onEmail} required />
            </div>
          )}
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input id="login-password" name="password" type="password" className="input" autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={onPassword} required />
          </div>
          {error && <p role="alert" className="err">{error}</p>}
          <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <p className="mt-4 muted">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link to={isLogin ? '/register' : '/login'} className="link">{isLogin ? 'Daftar sekarang' : 'Masuk di sini'}</Link>
        </p>
      </div>
    </div>
  )
}
