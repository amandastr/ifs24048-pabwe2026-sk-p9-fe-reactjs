const pick = (s, ...keys) => {
  for (const k of keys) if (s && s[k] !== undefined) return s[k]
  return 0
}

export default function PostStats({ stats }) {
  const items = [
    ['Total Artikel', pick(stats, 'total', 'total_posts')],
    ['Terbit', pick(stats, 'total_published', 'published', 'total_selesai')],
    ['Draf', pick(stats, 'total_draft', 'draft', 'belum_selesai')],
  ]
  return (
    <section aria-label="Ringkasan statistik artikel" className="grid gap-4 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="card">
          <p className="muted font-semibold">{label}</p>
          <p className="text-3xl font-extrabold">{value}</p>
        </div>
      ))}
    </section>
  )
}
