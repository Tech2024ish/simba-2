import client from './client.js'

export const getProducts = (params = {}) =>
  client.get('/api/products', { params }).then(r => r.data)

export const getCategories = () =>
  client.get('/api/products/categories').then(r => r.data)

export const getProduct = (id) =>
  client.get(`/api/products/${id}`).then(r => r.data)

export const createProduct = (data, token) =>
  client.post('/api/products', data, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)

export const updateProduct = (id, data, token) =>
  client.put(`/api/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)

export const deleteProduct = (id, token) =>
  client.delete(`/api/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data)
