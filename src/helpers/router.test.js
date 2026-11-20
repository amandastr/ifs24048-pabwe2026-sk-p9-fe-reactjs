import { describe, it, expect, vi } from 'vitest'
import { matchRoute, navigate } from './router.js'

describe('navigate', () => {
  it('push dan replace memicu popstate', () => {
    window.scrollTo = vi.fn()
    const spy = vi.fn()
    window.addEventListener('popstate', spy)
    navigate('/a')
    expect(window.location.pathname).toBe('/a')
    navigate('/b', { replace: true })
    expect(window.location.pathname).toBe('/b')
    expect(spy).toHaveBeenCalledTimes(2)
    window.removeEventListener('popstate', spy)
  })
})

describe('matchRoute', () => {
  it('mengenali rute', () => {
    expect(matchRoute('/')).toEqual({ name: 'home' })
    expect(matchRoute('/public')).toEqual({ name: 'home' })
    expect(matchRoute('/posts/halo%20dunia')).toEqual({ name: 'post', slug: 'halo dunia' })
    expect(matchRoute('/author/')).toEqual({ name: 'author' })
    expect(matchRoute('/admin')).toEqual({ name: 'admin' })
    expect(matchRoute('/login')).toEqual({ name: 'login' })
    expect(matchRoute('/register')).toEqual({ name: 'register' })
    expect(matchRoute('/zzz')).toEqual({ name: 'notfound' })
  })
})
