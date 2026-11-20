import { useEffect, useRef } from 'react'

export default function MarkdownEditor({ value, onChange }) {
  const ref = useRef(null)
  useEffect(() => {
    let editor
    let disposed = false
    ;(async () => {
      const [{ default: Editor }] = await Promise.all([
        import('@toast-ui/editor'),
        import('@toast-ui/editor/dist/toastui-editor.css'),
      ])
      if (disposed) return
      editor = new Editor({
        el: ref.current,
        initialValue: value || '',
        height: '55vh',
        initialEditType: 'markdown',
        previewStyle: 'tab',
        events: { change: () => onChange(editor.getMarkdown()) },
      })
    })()
    return () => {
      disposed = true
      if (editor) editor.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div ref={ref} data-testid="md-editor" />
}
