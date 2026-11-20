import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickyNavbar from './StickyNavbar.jsx'
import PostStats from './PostStats.jsx'

describe('StickyNavbar', () => {
  it('tamu melihat Masuk/Daftar dan tema gelap', async () => {
    const toggle = vi.fn()
    render(<StickyNavbar user={null} theme="light" onToggleTheme={toggle} onLogout={() => {}} />)
    expect(screen.getByRole('link', { name: 'Masuk' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Daftar' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ganti ke tema gelap' }))
    expect(toggle).toHaveBeenCalled()
  })
  it('admin melihat Admin Panel dan bisa keluar', async () => {
    const out = vi.fn()
    render(<StickyNavbar user={{ role: 'admin' }} theme="dark" onToggleTheme={() => {}} onLogout={out} />)
    expect(screen.getByRole('link', { name: 'Admin Panel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ganti ke tema terang' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(out).toHaveBeenCalled()
  })
  it('member tidak melihat Admin Panel', () => {
    render(<StickyNavbar user={{ role: 'member' }} theme="light" onToggleTheme={() => {}} onLogout={() => {}} />)
    expect(screen.queryByRole('link', { name: 'Admin Panel' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Workspace Penulis' })).toBeInTheDocument()
  })
})

describe('PostStats', () => {
  it('membaca berbagai nama kunci', () => {
    const { unmount } = render(<PostStats stats={{ total: 5, total_published: 3, total_draft: 2 }} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    unmount()
    const r = render(<PostStats stats={{ total_posts: 7, published: 4, draft: 3 }} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    r.unmount()
    const r2 = render(<PostStats stats={{ total_selesai: 1, belum_selesai: 2 }} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    r2.unmount()
    render(<PostStats stats={null} />)
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})
