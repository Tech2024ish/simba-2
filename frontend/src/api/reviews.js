import client from './client.js'

export const getReviews = () =>
  client.get('/api/reviews').then((r) => r.data)

export const createReview = (payload) =>
  client.post('/api/reviews', payload).then((r) => r.data)
