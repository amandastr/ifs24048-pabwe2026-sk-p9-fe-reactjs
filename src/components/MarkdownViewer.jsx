import { useEffect, useRef } from 'react'

export default function MarkdownViewer({ content }) {
  const ref = useRef(null)
  useEffect(() => {
    let viewer
    let disposed = false
    ;(async () => {
      const [{ default: Viewer }] = await Promise.all([
        import('@toast-ui/editor/dist/toastui-editor-viewer'),
        import('@toast-ui/editor/dist/toastui-editor-viewer.css'),
      ])
      if (disposed) return
      viewer = new Viewer({ el: ref.current, initialValue: content || '' })
    })()
    return () => {
      disposed = true
      if (viewer) viewer.destroy()
    }
  }, [content])
  return <div ref={ref} data-testid="md-viewer" />
}
