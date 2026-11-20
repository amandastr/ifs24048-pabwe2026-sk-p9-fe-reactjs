import { describe, it, expect, vi } from 'vitest'

const fire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...a) => fire(...a) } }))
const { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } = await import('./toolsHelper.js')

describe('formatDate', () => {
  it('memformat tanggal', () => {
    expect(formatDate('2026-11-20T00:00:00Z')).toMatch(/2026/)
    expect(formatDate(null)).toBe('-')
    expect(formatDate('bukan tanggal')).toBe('-')
  })
})

describe('alert', () => {
  it('sukses dan galat', async () => {
    await showSuccessAlert('ok')
    await showErrorAlert('gagal')
    expect(fire).toHaveBeenCalledTimes(2)
  })
  it('konfirmasi', async () => {
    fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await showConfirmDialog('?')).toBe(true)
    fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await showConfirmDialog('?')).toBe(false)
  })
})
