const { json, readBody } = require('../lib/helpers');

// Dentistas = FONTE ÚNICA (Equipe em Ajustes + agenda leem daqui).
// workSchedules: INTERVALOS de atendimento por dia (0=Domingo … 6=Sábado) — suporta turno partido.
const split = (days, s1, e1, s2, e2) => days.flatMap((d) => [{ day: d, start: s1, end: e1 }, { day: d, start: s2, end: e2 }]);
const cont = (days, s, e) => days.map((d) => ({ day: d, start: s, end: e }));

const doctors = [
  { id: 1, name: "Dra. Maria da Costa", phone: "(11) 91234-5678", specialty: "Cirurgiã-Dentista", cpf: "111.222.333-44", cro: "45678-CE", gender: "FEMALE", status: true, dentalOfficeId: 1, acceptedInsurances: [1, 2], workSchedules: split([1, 2, 3, 4, 5], "08:00", "12:00", "14:00", "17:00") },
  { id: 2, name: "Dr. Carlos Oliveira", phone: "(11) 92345-6789", specialty: "Ortodontista", cpf: "222.333.444-55", cro: "12345-SP", gender: "MALE", status: true, dentalOfficeId: 1, acceptedInsurances: [1, 3], workSchedules: split([1, 3, 5], "09:00", "12:00", "14:00", "18:00") },
  { id: 3, name: "Dra. Ana Silva", phone: "(11) 93456-7890", specialty: "Periodontista", cpf: "333.444.555-66", cro: "78901-RJ", gender: "FEMALE", status: true, dentalOfficeId: 1, acceptedInsurances: [2, 4], workSchedules: cont([2, 3, 4, 5, 6], "08:00", "12:00") },
  { id: 4, name: "Dr. Roberto Lima", phone: "(11) 94567-8901", specialty: "Endodontista", cpf: "444.555.666-77", cro: "23456-MG", gender: "MALE", status: true, dentalOfficeId: 1, acceptedInsurances: [3, 4], workSchedules: cont([1, 2, 3, 4, 5], "13:00", "18:00") },
  { id: 5, name: "Dra. Juliana Mendes", phone: "(11) 95678-9012", specialty: "Odontopediatra", cpf: "555.666.777-88", cro: "89012-SC", gender: "FEMALE", status: true, dentalOfficeId: 1, acceptedInsurances: [1, 2, 3, 4], workSchedules: cont([1, 2, 3, 4, 5, 6], "08:00", "17:00") },
];
let doctorIdSeq = 100;

const EDITABLE = ['name', 'phone', 'specialty', 'cpf', 'cro', 'gender', 'status', 'acceptedInsurances', 'workSchedules', 'averageConsultationTime'];

const routes = [
  { method: 'GET', pattern: '/api/v1/doctors', async handler(req, res) {
    json(res, 200, { data: doctors });
  }},

  { method: 'GET', pattern: '/api/v1/doctors/select', async handler(req, res) {
    json(res, 200, { message: 'OK', data: doctors.map(d => ({ id: d.id, name: d.name, acceptedInsurances: d.acceptedInsurances, workSchedules: d.workSchedules })) });
  }},

  { method: 'POST', pattern: '/api/v1/doctors', async handler(req, res) {
    const body = await readBody(req);
    const newDoctor = { id: ++doctorIdSeq, dentalOfficeId: body.dentalOfficeId ?? 1 };
    for (const k of EDITABLE) newDoctor[k] = body[k] ?? null;
    doctors.push(newDoctor);
    json(res, 201, { message: 'OK', data: newDoctor });
  }},

  { method: 'PUT', pattern: '/api/v1/doctors/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = doctors.findIndex(d => d.id === Number(params.id));
    if (idx === -1) { json(res, 404, { message: 'Not found', data: null }); return; }
    const updated = { ...doctors[idx] };
    for (const k of EDITABLE) {
      if (body[k] !== undefined) updated[k] = body[k];
    }
    doctors[idx] = updated;
    json(res, 200, { message: 'OK', data: updated });
  }},

  { method: 'DELETE', pattern: '/api/v1/doctors/:id', async handler(req, res, params) {
    const idx = doctors.findIndex(d => d.id === Number(params.id));
    if (idx === -1) { json(res, 404, { message: 'Not found', data: null }); return; }
    const removed = doctors.splice(idx, 1)[0];
    json(res, 200, { message: 'Dentista excluído', data: removed });
  }},
];

module.exports = { routes };
