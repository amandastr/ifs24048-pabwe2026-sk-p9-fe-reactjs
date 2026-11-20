import { useEffect, useState } from 'react'
import useTitle from '../../../hooks/useTitle.js'
import { asList } from '../../../helpers/apiHelper.js'
import { formatDate } from '../../../helpers/toolsHelper.js'
import { fetchAllPosts, fetchUsers } from '../api/adminApi.js'

export default function AdminDashboard() {
  useTitle('Admin Panel - Delcom Blog', 'Pantau seluruh pengguna dan artikel di Delcom Blog.')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchUsers(), fetchAllPosts()])
      .then(([u, p]) => {
        setUsers(asList(u, 'users'))
        setPosts(asList(p))
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="mx-auto w-full px-4 py-8 md:px-10">
      <h1 className="text-3xl font-extrabold">Admin Panel</h1>
      {error && <p role="alert" className="err mt-4">{error}</p>}

      <h2 className="mt-6 text-xl font-bold">Direktori Pengguna</h2>
      <div className="card mt-2 overflow-x-auto">
        <table className="table">
          <caption className="sr-only">Daftar pengguna sistem</caption>
          <thead>
            <tr>
              <th scope="col">ID</th><th scope="col">Username</th><th scope="col">Email</th>
              <th scope="col">Role</th><th scope="col">Artikel</th><th scope="col">Terbit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td>
                <td>{u.total_posts ?? 0}</td><td>{u.total_published ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-xl font-bold">Semua Artikel</h2>
      <div className="card mt-2 overflow-x-auto">
        <table className="table">
          <caption className="sr-only">Daftar seluruh artikel</caption>
          <thead>
            <tr>
              <th scope="col">Judul</th><th scope="col">Penulis</th><th scope="col">Kategori</th>
              <th scope="col">Status</th><th scope="col">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.title}</td>
                <td>{(p.author && p.author.username) || (p.user && p.user.username) || '-'}</td>
                <td>{p.category}</td>
                <td><span className={`badge ${p.is_published ? 'badge-ok' : 'badge-warn'}`}>{p.is_published ? 'Terbit' : 'Draf'}</span></td>
                <td>{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
