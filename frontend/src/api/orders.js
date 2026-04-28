import client from './client.js'

export const createOrder = (order, token) =>
  client.post('/api/orders', order, token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined
  ).then(r => r.data)

export const getOrders = (token) =>
  client.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)

export const updateOrder = (id, status, token) =>
  client.put(`/api/orders/${id}`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)
