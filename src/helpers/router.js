export function navigate(to, { replace = false } = {}) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function matchRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path === '/' || path === '/public') return { name: 'home' }
  const post = path.match(/^\/posts\/([^/]+)$/)
  if (post) return { name: 'post', slug: decodeURIComponent(post[1]) }
  if (['/login', '/register', '/author', '/admin'].includes(path)) return { name: path.slice(1) }
  return { name: 'notfound' }
}
