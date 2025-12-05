const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

describe('API integración', () => {
  it('GET /health responde 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status', 'ok')
  })

  it('GET /api/v1/health responde 200', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('version', 'v1')
  })

  it('GET /api/v1/auth/sync-profile sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/auth/sync-profile')
    expect(res.status).toBe(401)
  })

  it('GET /api/v1/admin/users con token sin rol responde 403', async () => {
    const token = jwt.sign({ sub: 'test-user' }, 'x')
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })
})
