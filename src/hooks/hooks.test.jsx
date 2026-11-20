import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useInput from './useInput.js'
import useTheme from './useTheme.js'
import useTitle from './useTitle.js'

describe('useInput', () => {
  it('mengikat nilai input', () => {
    const { result } = renderHook(() => useInput('a'))
    act(() => result.current[1]({ target: { value: 'b' } }))
    expect(result.current[0]).toBe('b')
    const { result: r2 } = renderHook(() => useInput())
    expect(r2.current[0]).toBe('')
  })
})

describe('useTheme', () => {
  it('toggle tema dan menyimpannya', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
  })
  it('membaca tema tersimpan', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })
})

describe('useTitle', () => {
  it('mengubah title dan meta description', () => {
    const meta = document.createElement('meta')
    meta.name = 'description'
    document.head.appendChild(meta)
    renderHook(() => useTitle('Judul', 'Deskripsi'))
    expect(document.title).toBe('Judul')
    expect(meta.getAttribute('content')).toBe('Deskripsi')
    renderHook(() => useTitle('Judul 2'))
    expect(document.title).toBe('Judul 2')
    meta.remove()
    renderHook(() => useTitle('Tanpa meta', 'x'))
    expect(document.title).toBe('Tanpa meta')
  })
})
