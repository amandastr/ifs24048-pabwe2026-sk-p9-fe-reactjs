import { apiRequest } from '../../../helpers/apiHelper.js'

export const fetchUsers = () => apiRequest('/api/admin/users')
export const fetchAllPosts = () => apiRequest('/api/admin/posts')
