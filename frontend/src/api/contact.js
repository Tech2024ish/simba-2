import client from './client.js'

export const createContactMessage = (payload) =>
  client.post('/api/contact', payload).then((r) => r.data)
