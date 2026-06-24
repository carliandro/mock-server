const { json } = require('../lib/helpers');

const routes = [
  { method: 'POST', pattern: '/api/v1/auth/login', async handler(req, res) {
    json(res, 200, {
      user: { id: 1, name: 'Admin Dev', email: 'admin@mock.com' },
      dentalOffice: { id: 1, name: 'Sorriso Perfeito - Matriz', tradeName: 'Sorriso Perfeito Ltda' },
      token: 'eyJhbGciOiJIUzI1NiJ9.mock-dev-token',
      refreshToken: 'mock-refresh-token-123',
    });
  }},
];

module.exports = { routes };
