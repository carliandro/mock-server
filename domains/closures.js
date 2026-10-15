const { json, readBody } = require('../lib/helpers');

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// Bloqueios de agenda: dia inteiro (startTime/endTime null) ou faixa de horário.
// doctorId null = clínica toda; doctorId preenchido = bloqueio daquele dentista.
const closures = [
  { id: 1, date: today(7), startTime: null, endTime: null, reason: 'Feriado municipal', doctorId: null, doctorName: null, dentalOfficeId: 1 },
  { id: 2, date: today(1), startTime: '14:00', endTime: '16:00', reason: 'Congresso de Endodontia', doctorId: 4, doctorName: 'Dr. Roberto Lima', dentalOfficeId: 1 },
];
let closureIdSeq = 10;

const routes = [
  { method: 'GET', pattern: '/api/v1/closures', async handler(req, res) {
    json(res, 200, { message: 'OK', data: closures });
  }},

  { method: 'POST', pattern: '/api/v1/closures', async handler(req, res) {
    const body = await readBody(req);
    const newClosure = {
      id: ++closureIdSeq,
      date: body.date,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      reason: body.reason ?? '',
      doctorId: body.doctorId ?? null,
      doctorName: body.doctorName ?? null,
      dentalOfficeId: body.dentalOfficeId ?? 1,
    };
    closures.push(newClosure);
    json(res, 201, { message: 'OK', data: newClosure });
  }},

  { method: 'DELETE', pattern: '/api/v1/closures/:id', async handler(req, res, params) {
    const idx = closures.findIndex(c => c.id === Number(params.id));
    if (idx === -1) { json(res, 404, { message: 'Not found', data: null }); return; }
    const removed = closures.splice(idx, 1)[0];
    json(res, 200, { message: 'Bloqueio removido', data: removed });
  }},
];

module.exports = { routes };
