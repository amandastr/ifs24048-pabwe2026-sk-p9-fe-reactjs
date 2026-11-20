import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getToken } from '../../../helpers/apiHelper.js'

const login = vi.fn()
const register = vi.fn()
vi.mock('../api/authApi.js', () => ({ login: (...a) => login(...a), register: (...a) => register(...a) }))
const AuthPage = (await import('./AuthPage.jsx')).default

beforeEach(() => { window.scrollTo = vi.fn(); login.mockReset(); register.mockReset() })

describe('AuthPage login', () => {
  it('memiliki selector wajib untuk audit', () => {
    render(<AuthPage mode="login" onAuth={() => {}} />)
    expect(document.querySelector('#login-username')).toBeInTheDocument()
    expect(document.querySelector('#login-password')).toBeInTheDocument()
    expect(document.querySelector('#login-submit')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
  it('default mode adalah login', () => {
    render(<AuthPage onAuth={() => {}} />)
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toBeInTheDocument()
  })
  it('login admin diarahkan ke /admin', async () => {
    login.mockResolvedValue({ token: 't', user: { role: 'admin' } })
    const onAuth = vi.fn()
    render(<AuthPage mode="login" onAuth={onAuth} />)
    await userEvent.type(screen.getByLabelText('Username'), 'admin')
    await userEvent.type(screen.getByLabelText('Password'), 'admin')
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(getToken()).toBe('t')
    expect(onAuth).toHaveBeenCalledWith({ role: 'admin' })
    expect(window.location.pathname).toBe('/admin')
  })
  it('login member diarahkan ke /author', async () => {
    login.mockResolvedValue({ token: 't', user: { role: 'member' } })
    render(<AuthPage mode="login" onAuth={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(window.location.pathname).toBe('/author')
  })
  it('menampilkan galat login', async () => {
    login.mockRejectedValue(new Error('Kredensial salah'))
    render(<AuthPage mode="login" onAuth={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kredensial salah')
  })
})

describe('AuthPage register', () => {
  it('mendaftar lalu ke /login', async () => {
    register.mockResolvedValue({})
    render(<AuthPage mode="register" onAuth={() => {}} />)
    await userEvent.type(screen.getByLabelText('Username'), 'u')
    await userEvent.type(screen.getByLabelText('Email'), 'u@x.id')
    await userEvent.type(screen.getByLabelText('Password'), 'p')
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(register).toHaveBeenCalledWith('u', 'u@x.id', 'p')
    expect(window.location.pathname).toBe('/login')
    expect(screen.getByRole('link', { name: 'Masuk di sini' })).toBeInTheDocument()
  })
})
