import client from './client.js'

export const getProducts = (params = {}) =>
  client.get('/api/products', { params }).then(r => r.data)

export const getCategories = () =>
  client.get('/api/products/categories').then(r => r.data)

export const getProduct = (id) =>
  client.get(`/api/products/${id}`).then(r => r.data)
