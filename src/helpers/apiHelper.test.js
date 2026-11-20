import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiRequest, asList, clearSession, getToken, getUser, saveSession, ApiError } from './apiHelper.js'

const resp = (status, json, ok = status < 400) => ({ ok, status, json: async () => { if (json === undefined) throw new Error('x'); return json } })

describe('session', () => {
  it('menyimpan, membaca, dan menghapus sesi', () => {
    expect(getUser()).toBeNull()
    saveSession('t', { a: 1 })
    expect(getToken()).toBe('t')
    expect(getUser()).toEqual({ a: 1 })
    clearSession()
    expect(getToken()).toBeNull()
  })
  it('getUser aman terhadap JSON rusak', () => {
    localStorage.setItem('user', '{rusak')
    expect(getUser()).toBeNull()
  })
})

describe('asList', () => {
  it('menangani berbagai bentuk data', () => {
    expect(asList([1])).toEqual([1])
    expect(asList({ posts: [2] })).toEqual([2])
    expect(asList({ users: [3] }, 'users')).toEqual([3])
    expect(asList({ items: [4] })).toEqual([4])
    expect(asList({})).toEqual([])
    expect(asList(null)).toEqual([])
  })
})

describe('apiRequest', () => {
  beforeEach(() => { global.fetch = vi.fn() })
  afterEach(() => vi.restoreAllMocks())

  it('mengirim bearer token dan body', async () => {
    saveSession('abc', {})
    fetch.mockResolvedValue(resp(200, { status: 'success', data: { x: 1 } }))
    expect(await apiRequest('/p', { method: 'POST', body: { a: 1 } })).toEqual({ x: 1 })
    const [url, opt] = fetch.mock.calls[0]
    expect(url).toBe('/p')
    expect(opt.headers.Authorization).toBe('Bearer abc')
    expect(opt.headers['Content-Type']).toBe('application/json')
    expect(opt.body).toBe('{"a":1}')
  })
  it('tanpa token/body dan tanpa auth', async () => {
    fetch.mockResolvedValue(resp(200, { status: 'success', data: 1 }))
    await apiRequest('/p')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
    saveSession('abc', {})
    await apiRequest('/p', { auth: false })
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined()
  })
  it('respons non-JSON yang sukses menghasilkan undefined', async () => {
    fetch.mockResolvedValue(resp(204, undefined))
    expect(await apiRequest('/p')).toBeUndefined()
  })
  it('galat jaringan', async () => {
    fetch.mockRejectedValue(new Error('down'))
    await expect(apiRequest('/p')).rejects.toMatchObject({ message: 'Tidak dapat terhubung ke server', status: 0 })
  })
  it('galat server dengan pesan', async () => {
    fetch.mockResolvedValue(resp(400, { status: 'fail', message: 'salah' }))
    await expect(apiRequest('/p')).rejects.toBeInstanceOf(ApiError)
    await expect(apiRequest('/p')).rejects.toThrow('salah')
  })
  it('status fail walau http ok', async () => {
    fetch.mockResolvedValue(resp(200, { status: 'fail', message: 'gagal' }, true))
    await expect(apiRequest('/p')).rejects.toThrow('gagal')
  })
  it('galat tanpa pesan', async () => {
    fetch.mockResolvedValue(resp(500, undefined))
    await expect(apiRequest('/p')).rejects.toThrow('Permintaan gagal (500)')
  })
  it('401 dengan token menghapus sesi', async () => {
    saveSession('abc', {})
    const spy = vi.fn()
    window.addEventListener('session-expired', spy)
    fetch.mockResolvedValue(resp(401, { status: 'fail', message: 'expired' }))
    await expect(apiRequest('/p')).rejects.toThrow('expired')
    expect(getToken()).toBeNull()
    expect(spy).toHaveBeenCalled()
    window.removeEventListener('session-expired', spy)
  })
  it('401 tanpa token tidak memicu event', async () => {
    fetch.mockResolvedValue(resp(401, { status: 'fail', message: 'x' }))
    await expect(apiRequest('/p')).rejects.toThrow('x')
  })
  it('memakai VITE_API_URL bila diset', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test')
    vi.resetModules()
    const mod = await import('./apiHelper.js')
    fetch.mockResolvedValue(resp(200, { status: 'success', data: 1 }))
    await mod.apiRequest('/p')
    expect(fetch.mock.calls[0][0]).toBe('https://api.test/p')
    vi.unstubAllEnvs()
  })
})
