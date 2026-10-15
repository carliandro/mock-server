const { json, readBody } = require('../lib/helpers');

// Cadeiras (salas de atendimento) — relacionadas ao CONSULTÓRIO (dentalOfficeId).
// Um consultório tem N cadeiras; o agendamento ocupa uma cadeira (chairId).
const chairs = [
  { id: 1, name: 'Cadeira 1', color: '#6366f1', active: true, dentalOfficeId: 1 },
  { id: 2, name: 'Cadeira 2', color: '#10b981', active: true, dentalOfficeId: 1 },
  { id: 3, name: 'Cadeira 3', color: '#f59e0b', active: true, dentalOfficeId: 1 },
  { id: 4, name: 'Cadeira 4', color: '#06b6d4', active: true, dentalOfficeId: 1 },
];
let chairIdSeq = 100;

const routes = [
  { method: 'GET', pattern: '/api/v1/chairs', async handler(req, res) {
    json(res, 200, { message: 'OK', data: chairs });
  }},

  { method: 'GET', pattern: '/api/v1/chairs/select', async handler(req, res) {
    json(res, 200, { message: 'OK', data: chairs.filter(c => c.active).map(c => ({ id: c.id, name: c.name })) });
  }},

  { method: 'POST', pattern: '/api/v1/chairs', async handler(req, res) {
    const body = await readBody(req);
    const newChair = {
      id: ++chairIdSeq,
      name: body.name ?? '',
      color: body.color ?? null,
      active: body.active ?? true,
      dentalOfficeId: body.dentalOfficeId ?? 1,
    };
    chairs.push(newChair);
    json(res, 201, { message: 'OK', data: newChair });
  }},

  { method: 'PUT', pattern: '/api/v1/chairs/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = chairs.findIndex(c => c.id === Number(params.id));
    if (idx === -1) { json(res, 404, { message: 'Not found', data: null }); return; }
    chairs[idx] = {
      ...chairs[idx],
      id: Number(params.id),
      name: body.name ?? chairs[idx].name,
      color: body.color ?? chairs[idx].color,
      active: body.active ?? chairs[idx].active,
      dentalOfficeId: body.dentalOfficeId ?? chairs[idx].dentalOfficeId,
    };
    json(res, 200, { message: 'OK', data: chairs[idx] });
  }},

  { method: 'DELETE', pattern: '/api/v1/chairs/:id', async handler(req, res, params) {
    const idx = chairs.findIndex(c => c.id === Number(params.id));
    if (idx === -1) { json(res, 404, { message: 'Not found', data: null }); return; }
    const removed = chairs.splice(idx, 1)[0];
    json(res, 200, { message: 'Cadeira excluída', data: removed });
  }},
];

module.exports = { routes };
