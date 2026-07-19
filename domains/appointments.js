const { json, readBody } = require('../lib/helpers');
const { broadcastSSE } = require('../lib/sse');

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const appointments = [
  { id: 1, patientId: 1, patientName: "João Batista de Souza", patientPhone: "(11) 98765-4321", cpf: "123.456.789-00", doctorId: 1, doctorName: "Dra. Maria da Costa", doctor: "Dra. Maria da Costa", duration: 30, appointmentDate: today(0), startTime: "09:00:00", endTime: "09:30:00", status: "agendado", reason: "Consulta de rotina", notes: null, dentalOfficeId: 1 },
  { id: 2, patientId: 2, patientName: "Maria Aparecida Santos", patientPhone: "(11) 97654-3210", cpf: "987.654.321-00", doctorId: 2, doctorName: "Dr. Carlos Oliveira", doctor: "Dr. Carlos Oliveira", duration: 45, appointmentDate: today(0), startTime: "10:00:00", endTime: "10:45:00", status: "confirmado", reason: "Canal", notes: null, dentalOfficeId: 1 },
  { id: 3, patientId: 3, patientName: "Pedro Henrique Lima", patientPhone: "(11) 96543-2109", cpf: "456.789.123-00", doctorId: 3, doctorName: "Dra. Ana Silva", doctor: "Dra. Ana Silva", duration: 30, appointmentDate: today(0), startTime: "14:00:00", endTime: "14:30:00", status: "agendado", reason: "Limpeza", notes: null, dentalOfficeId: 1 },
  { id: 4, patientId: 4, patientName: "Ana Carolina Ferreira", patientPhone: "(11) 95432-1098", cpf: "789.123.456-00", doctorId: 4, doctorName: "Dr. Roberto Lima", doctor: "Dr. Roberto Lima", duration: 60, appointmentDate: today(0), startTime: "15:30:00", endTime: "16:30:00", status: "confirmado", reason: "Canal", notes: null, dentalOfficeId: 1 },
  { id: 5, patientId: 1, patientName: "João Batista de Souza", patientPhone: "(11) 98765-4321", cpf: "123.456.789-00", doctorId: 5, doctorName: "Dra. Juliana Mendes", doctor: "Dra. Juliana Mendes", duration: 30, appointmentDate: today(1), startTime: "08:00:00", endTime: "08:30:00", status: "agendado", reason: "Retorno", notes: null, dentalOfficeId: 1 },
  { id: 6, patientId: 2, patientName: "Maria Aparecida Santos", patientPhone: "(11) 97654-3210", cpf: "987.654.321-00", doctorId: 2, doctorName: "Dr. Carlos Oliveira", doctor: "Dr. Carlos Oliveira", duration: 30, appointmentDate: today(2), startTime: "10:30:00", endTime: "11:00:00", status: "agendado", reason: "Avaliação", notes: null, dentalOfficeId: 1 },
  { id: 7, patientId: 3, patientName: "Pedro Henrique Lima", patientPhone: "(11) 96543-2109", cpf: "456.789.123-00", doctorId: 1, doctorName: "Dra. Maria da Costa", doctor: "Dra. Maria da Costa", duration: 45, appointmentDate: today(3), startTime: "11:00:00", endTime: "11:45:00", status: "agendado", reason: "Clareamento", notes: null, dentalOfficeId: 1 },
];
let appointmentIdSeq = 100;

const routes = [
  { method: 'GET', pattern: '/api/v1/appointments/stream', async handler(req, res) {
    const { addClient, removeClient } = require('../lib/sse');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, X-Dental-Office-Id',
    });
    res.write(`event: appointment\ndata: {"action":"CONNECTED","message":"Conectado ao servidor mock"}\n\n`);
    addClient(res);
    req.on('close', () => removeClient(res));
  }},

  { method: 'GET', pattern: '/api/v1/appointments/locks/stream', async handler(req, res) {
    const { addClient, removeClient } = require('../lib/sse');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, X-Dental-Office-Id',
    });
    res.write(`data: {"action":"CONNECTED","message":"Conectado ao servidor mock (locks)"}\n\n`);
    addClient(res);
    req.on('close', () => removeClient(res));
  }},

  { method: 'GET', pattern: '/api/v1/appointments/all', async handler(req, res) {
    json(res, 200, appointments);
  }},

  { method: 'GET', pattern: '/api/v1/appointments/range', async handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    
    const filtered = appointments.filter(app => {
      if (!start || !end) return true;
      return app.appointmentDate >= start && app.appointmentDate <= end;
    });
    
    json(res, 200, filtered);
  }},

  { method: 'GET', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const app = appointments.find(a => a.id === Number(params.id));
    if (!app) { json(res, 404, { error: 'Not found' }); return; }
    json(res, 200, app);
  }},

  { method: 'POST', pattern: '/api/v1/appointments', async handler(req, res) {
    const body = await readBody(req);
    const patient = body.patient || {};
    const doctor = body.doctor || {};

    const resolvedDoctorName = body.doctorName ?? doctor.name ?? '';
    const resolvedPatientName = body.patientName ?? patient.name ?? '';
    const resolvedCpf = body.cpf ?? patient.cpf ?? '';
    const resolvedPatientPhone = body.patientPhone ?? patient.phone ?? patient.mobile ?? '';

    const newApp = {
      id: ++appointmentIdSeq,
      patientId: body.patientId ?? patient.id ?? 0,
      patientName: resolvedPatientName,
      patientPhone: resolvedPatientPhone,
      cpf: resolvedCpf,
      doctorId: body.doctorId ?? doctor.id ?? 0,
      doctorName: resolvedDoctorName,
      doctor: resolvedDoctorName,
      duration: body.duration ?? 30,
      appointmentDate: body.appointmentDate ?? '',
      startTime: body.startTime ?? '',
      status: (body.status ?? 'agendado').toLowerCase(),
      reason: body.reason ?? '',
      notes: body.notes ?? null,
      dentalOfficeId: body.dentalOfficeId ?? 1,
    };
    appointments.push(newApp);
    json(res, 201, newApp);
    broadcastSSE({ action: 'CREATE', appointment: newApp });
  }},

  { method: 'PUT', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = appointments.findIndex(a => a.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }

    const patient = body.patient || {};
    const doctor = body.doctor || {};
    const prev = appointments[idx];

    const resolvedDoctorName = body.doctorName ?? doctor.name ?? prev.doctorName ?? '';
    const resolvedPatientName = body.patientName ?? patient.name ?? prev.patientName ?? '';

    appointments[idx] = {
      ...prev,
      id: Number(params.id),
      patientId: body.patientId ?? patient.id ?? prev.patientId,
      patientName: resolvedPatientName,
      patientPhone: body.patientPhone ?? patient.phone ?? patient.mobile ?? prev.patientPhone ?? '',
      cpf: body.cpf ?? patient.cpf ?? prev.cpf ?? '',
      doctorId: body.doctorId ?? doctor.id ?? prev.doctorId,
      doctorName: resolvedDoctorName,
      doctor: resolvedDoctorName,
      duration: body.duration ?? prev.duration,
      appointmentDate: body.appointmentDate ?? prev.appointmentDate,
      startTime: body.startTime ?? prev.startTime,
      status: (body.status ?? prev.status).toLowerCase(),
      reason: body.reason ?? prev.reason ?? '',
      notes: body.notes ?? prev.notes ?? null,
      dentalOfficeId: body.dentalOfficeId ?? prev.dentalOfficeId,
    };
    json(res, 200, appointments[idx]);
    broadcastSSE({ action: 'UPDATE', appointment: appointments[idx] });
  }},

  { method: 'PUT', pattern: '/api/v1/appointments/:id/situation', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = appointments.findIndex(a => a.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    appointments[idx] = { ...appointments[idx], status: (body.status ?? '').toLowerCase() };
    json(res, 200, appointments[idx]);
    broadcastSSE({ action: 'UPDATE', appointment: appointments[idx] });
  }},

  { method: 'DELETE', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const id = Number(params.id);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    const removed = appointments.splice(idx, 1)[0];
    json(res, 200, { message: 'Appointment deleted' });
    broadcastSSE({ action: 'DELETE', appointment: { id: removed.id } });
  }},
];

module.exports = { routes };