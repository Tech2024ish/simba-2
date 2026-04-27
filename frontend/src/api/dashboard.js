import client from './client.js'

export const getDashboardStats = (token) =>
  client.get('/api/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)
