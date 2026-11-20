export const formatDate = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const swal = async () => (await import('sweetalert2')).default

export const showSuccessAlert = async (message) => {
  const Swal = await swal()
  return Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1600, showConfirmButton: false })
}

export const showErrorAlert = async (message) => {
  const Swal = await swal()
  return Swal.fire({ icon: 'error', title: 'Gagal', text: message })
}

export const showConfirmDialog = async (message) => {
  const Swal = await swal()
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Konfirmasi',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}
