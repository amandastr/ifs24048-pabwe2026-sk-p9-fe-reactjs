import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { aiGenerate } from '../api/blogApi.js'
import { DEFAULT_CATEGORIES } from '../components/PublicArticleList.jsx'

export default function AiPostGeneratorModal({ onClose, onApply }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [web, setWeb] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    setError('')
    if (!topic.trim()) return setError('Topik wajib diisi')
    setBusy(true)
    try {
      setResult(await aiGenerate({ topic, category, include_web_search: web }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const sources = (result && (result.sources || result.search_sources)) || []

  return (
    <Modal
      title="AI Blog Generator"
      titleId="ai-modal-title"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Batal</button>
          {result && <button type="button" className="btn btn-primary" onClick={() => onApply(result)}>Terapkan ke Editor</button>}
          <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>{busy ? 'Menghasilkan...' : 'Generate'}</button>
        </>
      }
    >
      <div className="grid gap-4">
        {error && <p role="alert" className="err">{error}</p>}
        <div>
          <label htmlFor="ai-topic" className="label">Topik artikel</label>
          <input id="ai-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <label htmlFor="ai-category" className="label">Kategori</label>
          <select id="ai-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {DEFAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" className="h-5 w-5" checked={web} onChange={(e) => setWeb(e.target.checked)} />
          Sertakan penelusuran search engine
        </label>
        {result && (
          <section aria-label="Pratinjau hasil" className="card">
            <h3 className="text-lg font-bold">{result.title}</h3>
            <p className="muted">{result.excerpt}</p>
            {sources.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {sources.map((s, i) => {
                  const url = typeof s === 'string' ? s : s.url
                  return <li key={url || i}>{typeof s === 'string' ? s : s.title || url}</li>
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </Modal>
  )
}
