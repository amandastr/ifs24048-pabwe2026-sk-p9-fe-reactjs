import { navigate } from '../helpers/router.js'

export default function Link({ to, children, ...props }) {
  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={onClick} {...props}>
      {children}
    </a>
  )
}
